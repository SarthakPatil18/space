import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { Category } from "./divhub";

let cachedEnv: Record<string, string> | null = null;

function getEnvValue(name: string): string | undefined {
  if (process.env[name]) return process.env[name];
  if (!cachedEnv && typeof window === "undefined") {
    try {
      const envPath = path.resolve(process.cwd(), ".env");
      if (fs.existsSync(envPath)) {
        cachedEnv = {};
        const content = fs.readFileSync(envPath, "utf-8");
        for (const line of content.split("\n")) {
          const match = line.match(/^\s*([\w_]+)\s*=\s*(?:["']?)(.*?)(?:["']?)\s*$/);
          if (match && match[1] && match[2]) {
            cachedEnv[match[1]] = match[2];
            if (!process.env[match[1]]) {
              process.env[match[1]] = match[2];
            }
          }
        }
      }
    } catch {}
  }
  return cachedEnv?.[name];
}

function isNewSupabaseApiKey(value: string): boolean {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

function createSupabaseFetch(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );

    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }

    if (
      isNewSupabaseApiKey(supabaseKey) &&
      headers.get("Authorization") === `Bearer ${supabaseKey}`
    ) {
      headers.delete("Authorization");
    }

    headers.set("apikey", supabaseKey);
    return fetch(input, { ...init, headers });
  };
}

let _adminClient: ReturnType<typeof createClient> | null = null;

const getAdminClient = () => {
  if (_adminClient) return _adminClient;
  const url =
    getEnvValue("SUPABASE_URL") ||
    getEnvValue("VITE_SUPABASE_URL") ||
    "https://jykszzfxpqmjsnepqwhd.supabase.co";
  const key = getEnvValue("SUPABASE_SERVICE_ROLE_KEY");
  if (!key) {
    throw new Error("Server configuration error: SUPABASE_SERVICE_ROLE_KEY is missing");
  }
  _adminClient = createClient(url, key, {
    global: {
      fetch: createSupabaseFetch(key),
    },
  });
  return _adminClient;
};

// In-memory signed URL cache — avoids repeated Supabase Storage API calls.
// TTL is 50 minutes (URLs expire in 60 min, so 10 min safety margin).
const signedUrlCache = new Map<string, { url: string; expiresAt: number }>();
const SIGNED_URL_TTL_MS = 50 * 60 * 1000; // 50 minutes
const SIGNED_URL_EXPIRY_S = 3600; // 1 hour
const MAX_CACHED_SIGNED_URLS = 500;

function getCachedSignedUrl(filePath: string): string | null {
  const entry = signedUrlCache.get(filePath);
  if (entry && Date.now() < entry.expiresAt) return entry.url;
  if (entry) signedUrlCache.delete(filePath);
  return null;
}

function setCachedSignedUrl(filePath: string, url: string): void {
  signedUrlCache.set(filePath, { url, expiresAt: Date.now() + SIGNED_URL_TTL_MS });
  // Keep the cache bounded even when every entry is still fresh.
  if (signedUrlCache.size >= MAX_CACHED_SIGNED_URLS) {
    const now = Date.now();
    for (const [key, val] of signedUrlCache) {
      if (now >= val.expiresAt) signedUrlCache.delete(key);
    }
    while (signedUrlCache.size >= MAX_CACHED_SIGNED_URLS) {
      const oldest = signedUrlCache.keys().next().value;
      if (oldest === undefined) break;
      signedUrlCache.delete(oldest);
    }
  }
}

/** Rejects paths that could escape the bucket prefix or exhaust the cache. */
function isValidStoragePath(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= 512 &&
    !value.startsWith("/") &&
    !value.includes("..") &&
    !value.includes("\\") &&
    [...value].every((char) => char.charCodeAt(0) >= 32)
  );
}

function getAdminSecret(): string | undefined {
  const secret = getEnvValue("ADMIN_SECRET");
  return secret && secret.trim() ? secret : undefined;
}

const ADMIN_TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function createAdminToken(secret: string): string {
  const issuedAt = Date.now().toString(36);
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`mitaoe_space_admin_session:${issuedAt}`)
    .digest("hex");
  return `${issuedAt}.${signature}`;
}

function verifyAdminToken(token?: string): boolean {
  const secret = getAdminSecret();
  if (!secret || !token) return false;
  try {
    const [issuedAt, signature] = token.split(".");
    if (!issuedAt || !signature) return false;

    const issuedAtMs = parseInt(issuedAt, 36);
    if (!Number.isFinite(issuedAtMs)) return false;

    const age = Date.now() - issuedAtMs;
    if (age < 0 || age > ADMIN_TOKEN_TTL_MS) return false;

    const expected = crypto
      .createHmac("sha256", secret)
      .update(`mitaoe_space_admin_session:${issuedAt}`)
      .digest("hex");
    const tokenBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expected);
    if (tokenBuf.length !== expectedBuf.length) return false;
    return crypto.timingSafeEqual(tokenBuf, expectedBuf);
  } catch {
    return false;
  }
}

/** Resolves temporary signed read URL for a student opening a resource. */
export const getSignedUrlServer = createServerFn({ method: "POST" })
  .validator((filePath: string) => filePath)
  .handler(async ({ data: filePath }) => {
    if (!isValidStoragePath(filePath)) {
      throw new Error("Invalid file path");
    }

    // Return cached URL if still valid
    const cached = getCachedSignedUrl(filePath);
    if (cached) return cached;

    const adminSupabase = getAdminClient();
    const { data, error } = await adminSupabase.storage
      .from("resources")
      .createSignedUrl(filePath, SIGNED_URL_EXPIRY_S);

    if (error || !data?.signedUrl) {
      throw new Error(error?.message || "Failed to generate signed URL");
    }

    setCachedSignedUrl(filePath, data.signedUrl);
    return data.signedUrl;
  });

/** Verifies admin passkey and issues an authorized session token. */
export const adminVerifySecretServer = createServerFn({ method: "POST" })
  .validator((passkey: string) => passkey)
  .handler(async ({ data: passkey }) => {
    const secret = getAdminSecret();
    if (!secret) {
      return {
        success: false,
        token: null,
        error: "Admin access is not configured on this deployment.",
      };
    }

    const passkeyBuf = Buffer.from(passkey || "");
    const secretBuf = Buffer.from(secret);
    const matches =
      passkeyBuf.length === secretBuf.length && crypto.timingSafeEqual(passkeyBuf, secretBuf);

    if (!matches) {
      return { success: false, token: null, error: "Invalid administrative passkey" };
    }
    return { success: true, token: createAdminToken(secret), error: null };
  });

/** Generates a single-use pre-signed upload URL so client can upload file directly to Storage. */
export const adminGetSignedUploadUrlServer = createServerFn({ method: "POST" })
  .validator((data: { authToken: string; filePath: string }) => data)
  .handler(async ({ data }) => {
    if (!verifyAdminToken(data.authToken)) {
      throw new Error("Unauthorized: Invalid administrative credentials");
    }
    if (!isValidStoragePath(data.filePath)) {
      throw new Error("Invalid file path");
    }
    const adminSupabase = getAdminClient();
    const { data: uploadData, error } = await adminSupabase.storage
      .from("resources")
      .createSignedUploadUrl(data.filePath, { upsert: true });

    if (error || !uploadData?.signedUrl) {
      throw new Error(error?.message || "Failed to generate signed upload URL");
    }

    return {
      signedUrl: uploadData.signedUrl,
      token: uploadData.token,
      path: uploadData.path,
    };
  });

export type AdminInsertPayload = {
  subject_id: string;
  title: string;
  category: Category;
  file_path: string;
  file_type: string;
  file_size: number | null;
  description?: string | null;
  exam_type?: string | null;
  year?: number | null;
};

/** Inserts a resource securely into the database. */
export const adminInsertResourceServer = createServerFn({ method: "POST" })
  .validator((data: { authToken: string; payload: AdminInsertPayload }) => data)
  .handler(async ({ data }) => {
    if (!verifyAdminToken(data.authToken)) {
      throw new Error("Unauthorized: Invalid administrative credentials");
    }
    const adminSupabase = getAdminClient();
    const p = data.payload;

    const cleanPayload: Record<string, any> = {
      subject_id: p.subject_id,
      title: p.title,
      category: p.category,
      file_path: p.file_path,
      file_type: p.file_type,
      file_size: p.file_size,
      description: p.description || null,
    };

    if (p.exam_type) cleanPayload["exam_type"] = p.exam_type;
    if (p.year) cleanPayload["year"] = p.year;

    let { error } = await adminSupabase.from("resources").insert(cleanPayload as any);

    // Fallback if schema does not have exam_type or year
    if (
      error &&
      (error.message?.includes("exam_type") ||
        error.message?.includes("year") ||
        error.code === "PGRST204" ||
        error.code === "42703")
    ) {
      delete cleanPayload["exam_type"];
      delete cleanPayload["year"];
      error = (await adminSupabase.from("resources").insert(cleanPayload as any)).error;
    }

    // Fallback if file_size exceeds constraint
    if (error && (error.message?.includes("file_size") || error.code === "23514")) {
      cleanPayload["file_size"] = null;
      error = (await adminSupabase.from("resources").insert(cleanPayload as any)).error;
    }

    if (error) {
      throw new Error(`Database insert failed: ${error.message}`);
    }

    return { success: true };
  });

/** Deletes a resource and its storage file securely. */
export const adminDeleteResourceServer = createServerFn({ method: "POST" })
  .validator(
    (data: { authToken: string; id: string; filePath?: string | null | undefined }) => data,
  )
  .handler(async ({ data }) => {
    if (!verifyAdminToken(data.authToken)) {
      throw new Error("Unauthorized: Invalid administrative credentials");
    }
    const adminSupabase = getAdminClient();

    const { error: dbError } = await adminSupabase.from("resources").delete().eq("id", data.id);

    if (dbError) {
      throw new Error(`Database delete failed: ${dbError.message}`);
    }

    if (data.filePath && isValidStoragePath(data.filePath)) {
      await adminSupabase.storage.from("resources").remove([data.filePath]);
    }

    return { success: true };
  });
