import crypto from "node:crypto";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const DRIVE_API = "https://www.googleapis.com/drive/v3";
const DRIVE_UPLOAD_API = "https://www.googleapis.com/upload/drive/v3";
const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive";
const FOLDER_MIME = "application/vnd.google-apps.folder";

export class DriveError extends Error {}

type DriveConfig = {
  email: string;
  privateKey: string;
  folderId: string;
};

let tokenCache: { token: string; expiresAt: number } | null = null;
const folderCache = new Map<string, string>();

function readConfig(): DriveConfig | null {
  const email = process.env["GOOGLE_SERVICE_ACCOUNT_EMAIL"]?.trim();
  const rawKey = process.env["GOOGLE_PRIVATE_KEY"]?.trim();
  const folderId = process.env["GOOGLE_DRIVE_FOLDER_ID"]?.trim();

  if (!email || !rawKey || !folderId) return null;

  return {
    email,
    // Vercel stores newlines as literal \n in env values.
    privateKey: rawKey.replace(/\\n/g, "\n"),
    folderId,
  };
}

export function isDriveConfigured(): boolean {
  return readConfig() !== null;
}

function requireConfig(): DriveConfig {
  const config = readConfig();
  if (!config) {
    throw new DriveError("Google Drive is not configured on this deployment.");
  }
  return config;
}

function base64url(value: Buffer | string): string {
  return Buffer.from(value).toString("base64url");
}

async function getAccessToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }

  const config = requireConfig();
  const now = Math.floor(Date.now() / 1000);

  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64url(
    JSON.stringify({
      iss: config.email,
      scope: DRIVE_SCOPE,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    }),
  );
  const signingInput = `${header}.${claims}`;

  let signature: string;
  try {
    signature = base64url(
      crypto.createSign("RSA-SHA256").update(signingInput).sign(config.privateKey),
    );
  } catch {
    throw new DriveError("Google service account key could not be parsed.");
  }

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${signingInput}.${signature}`,
    }),
  });

  const payload = (await response.json().catch(() => null)) as {
    access_token?: string;
    expires_in?: number;
    error_description?: string;
  } | null;

  if (!response.ok || !payload?.access_token) {
    throw new DriveError(
      `Google authentication failed${payload?.error_description ? `: ${payload.error_description}` : "."}`,
    );
  }

  tokenCache = {
    token: payload.access_token,
    expiresAt: Date.now() + Math.max((payload.expires_in ?? 3600) - 60, 60) * 1000,
  };
  return payload.access_token;
}

async function driveFetch(url: string, init: RequestInit, retry = true): Promise<Response> {
  const token = await getAccessToken();
  const headers = new Headers(init.headers);
  headers.set("authorization", `Bearer ${token}`);

  const response = await fetch(url, { ...init, headers });
  if (response.status === 401 && retry) {
    tokenCache = null;
    return driveFetch(url, init, false);
  }
  return response;
}

function escapeQuery(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

export function sanitizeFolderName(value: string): string {
  return (
    value
      .replace(/[/\\]/g, " ")
      .replace(/\p{Cc}/gu, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 60) || "General"
  );
}

async function findOrCreateFolder(name: string, parentId: string): Promise<string> {
  const cacheKey = `${parentId}/${name}`;
  const cached = folderCache.get(cacheKey);
  if (cached) return cached;

  const query = [
    `name = '${escapeQuery(name)}'`,
    `mimeType = '${FOLDER_MIME}'`,
    `'${escapeQuery(parentId)}' in parents`,
    "trashed = false",
  ].join(" and ");

  const searchUrl = `${DRIVE_API}/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(
    "files(id,name)",
  )}&supportsAllDrives=true&includeItemsFromAllDrives=true&pageSize=1`;

  const searchResponse = await driveFetch(searchUrl, { method: "GET" });
  if (!searchResponse.ok) {
    throw new DriveError("Could not look up Google Drive folders.");
  }
  const searchPayload = (await searchResponse.json()) as {
    files?: { id?: string }[];
  };
  const existing = searchPayload.files?.[0]?.id;
  if (existing) {
    folderCache.set(cacheKey, existing);
    return existing;
  }

  const createResponse = await driveFetch(`${DRIVE_API}/files?fields=id&supportsAllDrives=true`, {
    method: "POST",
    headers: { "content-type": "application/json; charset=UTF-8" },
    body: JSON.stringify({ name, mimeType: FOLDER_MIME, parents: [parentId] }),
  });

  if (!createResponse.ok) {
    throw new DriveError("Could not create the Google Drive folder.");
  }
  const created = (await createResponse.json()) as { id?: string };
  if (!created.id) {
    throw new DriveError("Google Drive returned no folder id.");
  }

  folderCache.set(cacheKey, created.id);
  return created.id;
}

/** Creates `SPACE/<subject>/<category>` if missing and returns the category folder id. */
export async function ensureDriveFolder(
  subjectCode: string,
  categoryFolder: string,
): Promise<string> {
  const config = requireConfig();
  const subject = sanitizeFolderName(subjectCode);
  const category = sanitizeFolderName(categoryFolder);

  const subjectId = await findOrCreateFolder(subject, config.folderId);
  return findOrCreateFolder(category, subjectId);
}

export type ResumableSession = {
  uploadUrl: string;
  folderId: string;
};

export async function createResumableSession(input: {
  name: string;
  mimeType: string;
  sizeBytes: number;
  folderId: string;
}): Promise<string> {
  const fields = encodeURIComponent("id,name,mimeType,size,webViewLink,webContentLink");
  const response = await driveFetch(
    `${DRIVE_UPLOAD_API}/files?uploadType=resumable&fields=${fields}&supportsAllDrives=true`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json; charset=UTF-8",
        "x-upload-content-type": input.mimeType,
        "x-upload-content-length": String(input.sizeBytes),
      },
      body: JSON.stringify({
        name: input.name,
        mimeType: input.mimeType,
        parents: [input.folderId],
      }),
    },
  );

  if (!response.ok) {
    throw new DriveError("Could not start the Google Drive upload.");
  }

  const uploadUrl = response.headers.get("location");
  if (!uploadUrl) {
    throw new DriveError("Google Drive did not return an upload URL.");
  }
  return uploadUrl;
}

export type DriveFile = {
  id: string;
  name?: string;
  mimeType?: string;
  size?: string;
  parents?: string[];
  webViewLink?: string;
  webContentLink?: string;
  trashed?: boolean;
};

export async function getDriveFile(fileId: string): Promise<DriveFile> {
  const fields = encodeURIComponent(
    "id,name,mimeType,size,parents,webViewLink,webContentLink,trashed",
  );
  const response = await driveFetch(
    `${DRIVE_API}/files/${encodeURIComponent(fileId)}?fields=${fields}&supportsAllDrives=true`,
    { method: "GET" },
  );

  if (!response.ok) {
    throw new DriveError("Could not verify the uploaded file on Google Drive.");
  }
  return (await response.json()) as DriveFile;
}

/** Link-only access: the file is not indexed and the URL stays unguessable. */
export async function shareDriveFile(fileId: string): Promise<void> {
  const response = await driveFetch(
    `${DRIVE_API}/files/${encodeURIComponent(fileId)}/permissions?supportsAllDrives=true&fields=id`,
    {
      method: "POST",
      headers: { "content-type": "application/json; charset=UTF-8" },
      body: JSON.stringify({
        role: "reader",
        type: "anyone",
        allowFileDiscovery: false,
      }),
    },
  );

  if (!response.ok && response.status !== 409) {
    throw new DriveError("Could not make the uploaded file readable.");
  }
}

export async function revokePublicPermission(fileId: string): Promise<void> {
  const listResponse = await driveFetch(
    `${DRIVE_API}/files/${encodeURIComponent(fileId)}/permissions?fields=${encodeURIComponent(
      "permissions(id,type)",
    )}&supportsAllDrives=true`,
    { method: "GET" },
  );

  if (!listResponse.ok) return;

  const payload = (await listResponse.json()) as {
    permissions?: { id?: string; type?: string }[];
  };

  for (const permission of payload.permissions ?? []) {
    if (permission.type !== "anyone" || !permission.id) continue;
    await driveFetch(
      `${DRIVE_API}/files/${encodeURIComponent(fileId)}/permissions/${encodeURIComponent(
        permission.id,
      )}?supportsAllDrives=true`,
      { method: "DELETE" },
    ).catch(() => undefined);
  }
}

export async function deleteDriveFile(fileId: string): Promise<void> {
  const response = await driveFetch(
    `${DRIVE_API}/files/${encodeURIComponent(fileId)}?supportsAllDrives=true`,
    { method: "DELETE" },
  );
  if (!response.ok && response.status !== 404) {
    throw new DriveError("Could not delete the file from Google Drive.");
  }
}
