import crypto from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { getRequestIP } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { verifyAdminToken } from "./divhub.server";
import type { Category } from "./divhub";
import {
  DriveError,
  createResumableSession,
  deleteDriveFile,
  ensureDriveFolder,
  getDriveFile,
  isDriveConfigured,
  revokePublicPermission,
  shareDriveFile,
} from "./drive.server";

const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx", "ppt", "pptx"] as const;
type AllowedExtension = (typeof ALLOWED_EXTENSIONS)[number];

const EXTENSION_MIME: Record<AllowedExtension, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

const CATEGORY_FOLDERS: Record<string, string> = {
  pyqs: "PYQs",
  notes: "Notes",
  practicals: "Practicals",
  assignments: "Assignments",
  syllabus: "Syllabus",
  reference: "Reference",
  files: "Files",
  other: "Other",
};

const SUBMISSION_CATEGORIES: Category[] = [
  "pyqs",
  "notes",
  "practicals",
  "assignments",
  "syllabus",
  "reference",
  "other",
];

function envInt(name: string, fallback: number, min: number, max: number): number {
  const parsed = Number.parseInt(process.env[name] ?? "", 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

const MAX_FILE_SIZE_MB = envInt("UPLOAD_MAX_FILE_MB", 25, 1, 100);
const MAX_FILES_PER_SUBMISSION = envInt("UPLOAD_MAX_FILES", 5, 1, 20);
const UPLOAD_RATE_LIMIT_PER_HOUR = envInt("UPLOAD_RATE_LIMIT_PER_HOUR", 10, 1, 100);
const MAX_FILE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const INTENT_TTL_MS = 30 * 60 * 1000;
const rateBuckets = new Map<string, number[]>();

function getSigningSecret(): string | undefined {
  const secret =
    process.env["UPLOAD_SIGNING_SECRET"]?.trim() || process.env["ADMIN_SECRET"]?.trim();
  return secret || undefined;
}

function base64url(value: Buffer | string): string {
  return Buffer.from(value).toString("base64url");
}

function signIntent(payload: UploadIntentPayload): string {
  const secret = getSigningSecret();
  if (!secret) throw new Error("Uploads are not configured on this deployment.");

  const body = base64url(JSON.stringify(payload));
  const signature = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${signature}`;
}

function verifyIntent(token: string): UploadIntentPayload | null {
  const secret = getSigningSecret();
  if (!secret || typeof token !== "string") return null;

  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  try {
    const expected = crypto.createHmac("sha256", secret).update(body).digest("base64url");
    const signatureBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expected);
    if (signatureBuf.length !== expectedBuf.length) return null;
    if (!crypto.timingSafeEqual(signatureBuf, expectedBuf)) return null;

    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as UploadIntentPayload;

    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

function getClientKey(): string {
  try {
    const ip = getRequestIP({ xForwardedFor: true });
    return ip || "unknown";
  } catch {
    return "unknown";
  }
}

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const windowStart = now - 60 * 60 * 1000;

  const bucket = (rateBuckets.get(key) ?? []).filter((ts) => ts > windowStart);
  if (bucket.length >= UPLOAD_RATE_LIMIT_PER_HOUR) {
    rateBuckets.set(key, bucket);
    return false;
  }

  bucket.push(now);
  rateBuckets.set(key, bucket);

  if (rateBuckets.size > 5000) {
    for (const [entry, timestamps] of rateBuckets) {
      if (timestamps.every((ts) => ts <= windowStart)) rateBuckets.delete(entry);
    }
  }
  return true;
}

function sanitizeFileName(raw: string): string | null {
  if (typeof raw !== "string") return null;

  const base = raw
    .split(/[/\\]/)
    .pop()
    ?.replace(/[<>:"|?*]/g, "_")
    .replace(/\p{Cc}/gu, " ")
    .trim();
  if (!base) return null;

  const dot = base.lastIndexOf(".");
  if (dot < 1) return null;

  const extension = base.slice(dot + 1).toLowerCase();
  if (!(ALLOWED_EXTENSIONS as readonly string[]).includes(extension)) return null;

  const stem = base.slice(0, dot).replace(/\s+/g, " ").trim().slice(0, 100);
  if (!stem) return null;

  return `${stem}.${extension}`;
}

function deriveTitle(fileName: string): string {
  return fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
}

function cleanText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const cleaned = value
    .replace(/\p{Cc}/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned ? cleaned.slice(0, maxLength) : null;
}

function isSha256Hex(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{64}$/i.test(value);
}

function isValidYear(value: number): boolean {
  return Number.isInteger(value) && value >= 2000 && value <= new Date().getFullYear() + 1;
}

type UploadIntentPayload = {
  v: 1;
  exp: number;
  folderId: string;
  subjectId: string;
  subjectCode: string;
  category: Category;
  title: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  academicYear: number;
  description: string | null;
  contributorName: string | null;
  contentHash: string;
};

export const getUploadConfigServer = createServerFn({ method: "GET" }).handler(async () => ({
  enabled: isDriveConfigured(),
  maxFileSizeMb: MAX_FILE_SIZE_MB,
  maxFiles: MAX_FILES_PER_SUBMISSION,
  maxPerHour: UPLOAD_RATE_LIMIT_PER_HOUR,
  allowedExtensions: [...ALLOWED_EXTENSIONS],
}));

export type CreateSubmissionInput = {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  subjectId: string;
  category: string;
  academicYear: number;
  description?: string | undefined;
  contributorName?: string | undefined;
  contentHash: string;
  website?: string | undefined;
};

export const createSubmissionSessionServer = createServerFn({ method: "POST" })
  .validator((data: CreateSubmissionInput) => data)
  .handler(async ({ data }) => {
    if (!isDriveConfigured()) {
      return {
        ok: false as const,
        error: "Uploads are temporarily unavailable. Please try again later.",
      };
    }

    // Honeypot: real users never fill this field.
    if (data.website && data.website.trim()) {
      return { ok: false as const, error: "Submission could not be processed." };
    }

    if (!checkRateLimit(getClientKey())) {
      return {
        ok: false as const,
        error: "Too many uploads from this connection. Please try again in an hour.",
      };
    }

    const fileName = sanitizeFileName(data.fileName);
    if (!fileName) {
      return {
        ok: false as const,
        error: "Unsupported file type. Upload a PDF, DOC, DOCX, PPT or PPTX file.",
      };
    }

    const extension = fileName.split(".").pop()!.toLowerCase() as AllowedExtension;
    const canonicalMime = EXTENSION_MIME[extension];

    if (data.mimeType && data.mimeType !== "application/octet-stream") {
      if (data.mimeType !== canonicalMime) {
        return { ok: false as const, error: "The file type does not match its extension." };
      }
    }

    const sizeBytes = Number(data.sizeBytes);
    if (!Number.isFinite(sizeBytes) || sizeBytes <= 0) {
      return { ok: false as const, error: "The file appears to be empty." };
    }
    if (sizeBytes > MAX_FILE_BYTES) {
      return {
        ok: false as const,
        error: `Each file must be ${MAX_FILE_SIZE_MB} MB or smaller.`,
      };
    }

    if (!SUBMISSION_CATEGORIES.includes(data.category as Category)) {
      return { ok: false as const, error: "Choose a valid category." };
    }
    const category = data.category as Category;

    if (!isValidYear(Number(data.academicYear))) {
      return { ok: false as const, error: "Enter a valid academic year." };
    }

    if (!isSha256Hex(data.contentHash)) {
      return { ok: false as const, error: "The file could not be verified." };
    }

    if (typeof data.subjectId !== "string" || !data.subjectId) {
      return { ok: false as const, error: "Choose a subject." };
    }

    const { data: subject, error: subjectError } = await supabaseAdmin
      .from("subjects")
      .select("id,code,name")
      .eq("id", data.subjectId)
      .maybeSingle();

    if (subjectError || !subject) {
      return { ok: false as const, error: "That subject could not be found." };
    }

    const { data: duplicate } = await supabaseAdmin
      .from("resources")
      .select("id")
      .eq("content_hash", data.contentHash.toLowerCase())
      .neq("status", "rejected")
      .limit(1)
      .maybeSingle();

    if (duplicate) {
      return {
        ok: false as const,
        error: "This file has already been submitted. It may still be under review.",
      };
    }

    try {
      const folderId = await ensureDriveFolder(
        subject.code || subject.name,
        CATEGORY_FOLDERS[category] ?? "Other",
      );

      const uploadUrl = await createResumableSession({
        name: fileName,
        mimeType: canonicalMime,
        sizeBytes,
        folderId,
      });

      const payload: UploadIntentPayload = {
        v: 1,
        exp: Date.now() + INTENT_TTL_MS,
        folderId,
        subjectId: subject.id,
        subjectCode: subject.code || subject.name,
        category,
        title: deriveTitle(fileName),
        fileName,
        mimeType: canonicalMime,
        sizeBytes,
        academicYear: Number(data.academicYear),
        description: cleanText(data.description, 1000),
        contributorName: cleanText(data.contributorName, 80),
        contentHash: data.contentHash.toLowerCase(),
      };

      return { ok: true as const, uploadUrl, intent: signIntent(payload) };
    } catch (error) {
      console.error("[submissions] Could not start upload", error);
      return {
        ok: false as const,
        error:
          error instanceof DriveError
            ? error.message
            : "Could not start the upload. Please try again.",
      };
    }
  });

export type CompleteSubmissionInput = {
  intent: string;
  driveFileId: string;
};

export const completeSubmissionServer = createServerFn({ method: "POST" })
  .validator((data: CompleteSubmissionInput) => data)
  .handler(async ({ data }) => {
    const payload = verifyIntent(data.intent);
    if (!payload) {
      return {
        ok: false as const,
        error: "The upload session expired. Please start the upload again.",
      };
    }

    if (typeof data.driveFileId !== "string" || !/^[A-Za-z0-9_-]{10,100}$/.test(data.driveFileId)) {
      return { ok: false as const, error: "The uploaded file could not be verified." };
    }

    try {
      const file = await getDriveFile(data.driveFileId);

      const parents = file.parents ?? [];
      const sizeMatches = Number(file.size) === payload.sizeBytes;
      const parentMatches = parents.includes(payload.folderId);
      const mimeMatches = file.mimeType === payload.mimeType;

      if (file.trashed || !sizeMatches || !parentMatches || !mimeMatches) {
        await deleteDriveFile(data.driveFileId).catch(() => undefined);
        return {
          ok: false as const,
          error: "The uploaded file did not pass verification. Please try again.",
        };
      }

      await shareDriveFile(data.driveFileId);

      const { data: inserted, error } = await supabaseAdmin
        .from("resources")
        .insert({
          subject_id: payload.subjectId,
          title: payload.title,
          category: payload.category,
          description: payload.description,
          file_name: payload.fileName,
          file_type: payload.fileName.split(".").pop()!.toLowerCase(),
          file_size: payload.sizeBytes,
          drive_file_id: data.driveFileId,
          drive_web_view_link: file.webViewLink ?? null,
          contributor_name: payload.contributorName,
          academic_year: payload.academicYear,
          content_hash: payload.contentHash,
          status: "pending",
        })
        .select("id")
        .single();

      if (error) {
        await deleteDriveFile(data.driveFileId).catch(() => undefined);
        if (error.code === "23505") {
          return {
            ok: false as const,
            error: "This file has already been submitted. It may still be under review.",
          };
        }
        console.error("[submissions] Could not save submission", error);
        return {
          ok: false as const,
          error: "The file uploaded, but we could not save it. Please try again.",
        };
      }

      return { ok: true as const, id: inserted.id, status: "pending" as const };
    } catch (error) {
      console.error("[submissions] Could not complete upload", error);
      await deleteDriveFile(data.driveFileId).catch(() => undefined);
      return {
        ok: false as const,
        error:
          error instanceof DriveError
            ? error.message
            : "Could not finish the upload. Please try again.",
      };
    }
  });

export const getSubmissionStatusServer = createServerFn({ method: "POST" })
  .validator((ids: string[]) => ids)
  .handler(async ({ data: ids }) => {
    const safeIds = (Array.isArray(ids) ? ids : [])
      .filter(
        (id): id is string =>
          typeof id === "string" &&
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id),
      )
      .slice(0, 20);

    if (safeIds.length === 0) return [];

    const { data, error } = await supabaseAdmin
      .from("resources")
      .select("id,title,status,created_at")
      .in("id", safeIds);

    if (error) return [];
    return data ?? [];
  });

export type AdminListSubmissionsInput = {
  authToken: string;
  status?: "pending" | "approved" | "rejected" | "all" | undefined;
  search?: string | undefined;
  subjectId?: string | undefined;
  category?: string | undefined;
  academicYear?: number | undefined;
};

export const adminListSubmissionsServer = createServerFn({ method: "POST" })
  .validator((data: AdminListSubmissionsInput) => data)
  .handler(async ({ data }) => {
    if (!verifyAdminToken(data.authToken)) {
      throw new Error("Unauthorized: Invalid administrative credentials");
    }

    let query = supabaseAdmin
      .from("resources")
      .select("*, subjects(id,name,code,color)")
      .order("created_at", { ascending: false })
      .limit(200);

    if (data.status && data.status !== "all") {
      query = query.eq("status", data.status);
    }
    if (data.subjectId) {
      query = query.eq("subject_id", data.subjectId);
    }
    if (data.category && SUBMISSION_CATEGORIES.includes(data.category as Category)) {
      query = query.eq("category", data.category as Category);
    }
    if (data.academicYear && Number.isInteger(data.academicYear)) {
      query = query.eq("academic_year", data.academicYear);
    }

    const search = cleanText(data.search, 80);
    if (search) {
      const sanitized = search.replace(/[^\p{L}\p{N}\s.-]/gu, " ").trim();
      if (sanitized) {
        query = query.or(
          `title.ilike.%${sanitized}%,contributor_name.ilike.%${sanitized}%,file_name.ilike.%${sanitized}%`,
        );
      }
    }

    const { data: rows, error } = await query;
    if (error) {
      console.error("[submissions] Could not list submissions", error);
      throw new Error("Could not load submissions.");
    }
    return rows ?? [];
  });

export const adminApproveSubmissionServer = createServerFn({ method: "POST" })
  .validator((data: { authToken: string; id: string }) => data)
  .handler(async ({ data }) => {
    if (!verifyAdminToken(data.authToken)) {
      throw new Error("Unauthorized: Invalid administrative credentials");
    }

    const { data: row, error: rowError } = await supabaseAdmin
      .from("resources")
      .select("id,drive_file_id,status")
      .eq("id", data.id)
      .maybeSingle();

    if (rowError || !row) throw new Error("Submission not found.");

    if (row.drive_file_id) {
      await shareDriveFile(row.drive_file_id);
    }

    const { error } = await supabaseAdmin
      .from("resources")
      .update({ status: "approved", approved_at: new Date().toISOString() })
      .eq("id", data.id);

    if (error) throw new Error("Could not approve this submission.");
    return { success: true };
  });

export const adminRejectSubmissionServer = createServerFn({ method: "POST" })
  .validator((data: { authToken: string; id: string }) => data)
  .handler(async ({ data }) => {
    if (!verifyAdminToken(data.authToken)) {
      throw new Error("Unauthorized: Invalid administrative credentials");
    }

    const { data: row } = await supabaseAdmin
      .from("resources")
      .select("id,drive_file_id")
      .eq("id", data.id)
      .maybeSingle();

    if (!row) throw new Error("Submission not found.");

    const { error } = await supabaseAdmin
      .from("resources")
      .update({ status: "rejected", approved_at: null })
      .eq("id", data.id);

    if (error) throw new Error("Could not reject this submission.");

    if (row.drive_file_id) {
      await revokePublicPermission(row.drive_file_id).catch(() => undefined);
    }

    return { success: true };
  });

export const adminDeleteSubmissionServer = createServerFn({ method: "POST" })
  .validator((data: { authToken: string; id: string }) => data)
  .handler(async ({ data }) => {
    if (!verifyAdminToken(data.authToken)) {
      throw new Error("Unauthorized: Invalid administrative credentials");
    }

    const { data: row } = await supabaseAdmin
      .from("resources")
      .select("id,drive_file_id")
      .eq("id", data.id)
      .maybeSingle();

    if (!row) throw new Error("Submission not found.");

    if (row.drive_file_id) {
      await deleteDriveFile(row.drive_file_id).catch((error) =>
        console.error("[submissions] Could not delete Drive file", error),
      );
    }

    const { error } = await supabaseAdmin.from("resources").delete().eq("id", data.id);
    if (error) throw new Error("Could not delete this submission.");

    return { success: true };
  });

export const uploadLimits = {
  maxFileSizeMb: MAX_FILE_SIZE_MB,
  maxFiles: MAX_FILES_PER_SUBMISSION,
  maxPerHour: UPLOAD_RATE_LIMIT_PER_HOUR,
  allowedExtensions: ALLOWED_EXTENSIONS,
} as const;
