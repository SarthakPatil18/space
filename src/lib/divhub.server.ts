import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";
import type { Category } from "./divhub";

const getAdminClient = () => {
  const url =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    "https://jykszzfxpqmjsnepqwhd.supabase.co";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error("Server configuration error: SUPABASE_SERVICE_ROLE_KEY is missing");
  }
  return createClient(url, key);
};

function getAdminSecret(): string {
  return process.env.ADMIN_SECRET || "mitaoe@admin2026";
}

function createAdminToken(): string {
  const secret = getAdminSecret();
  return crypto.createHmac("sha256", secret).update("mitaoe_space_admin_session").digest("hex");
}

function verifyAdminToken(token?: string): boolean {
  if (!token) return false;
  try {
    const expected = createAdminToken();
    const tokenBuf = Buffer.from(token);
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
    if (!filePath || typeof filePath !== "string") {
      throw new Error("Invalid file path");
    }
    const adminSupabase = getAdminClient();
    const { data, error } = await adminSupabase.storage
      .from("resources")
      .createSignedUrl(filePath, 3600);

    if (error || !data?.signedUrl) {
      throw new Error(error?.message || "Failed to generate signed URL");
    }

    return data.signedUrl;
  });

/** Verifies admin passkey and issues an authorized session token. */
export const adminVerifySecretServer = createServerFn({ method: "POST" })
  .validator((passkey: string) => passkey)
  .handler(async ({ data: passkey }) => {
    const secret = getAdminSecret();
    if (!passkey || passkey !== secret) {
      return { success: false, token: null, error: "Invalid administrative passkey" };
    }
    return { success: true, token: createAdminToken(), error: null };
  });

/** Generates a single-use pre-signed upload URL so client can upload file directly to Storage. */
export const adminGetSignedUploadUrlServer = createServerFn({ method: "POST" })
  .validator((data: { authToken: string; filePath: string }) => data)
  .handler(async ({ data }) => {
    if (!verifyAdminToken(data.authToken)) {
      throw new Error("Unauthorized: Invalid administrative credentials");
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

    let { error } = await adminSupabase.from("resources").insert(cleanPayload);

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
      error = (await adminSupabase.from("resources").insert(cleanPayload)).error;
    }

    // Fallback if file_size exceeds constraint
    if (error && (error.message?.includes("file_size") || error.code === "23514")) {
      cleanPayload["file_size"] = null;
      error = (await adminSupabase.from("resources").insert(cleanPayload)).error;
    }

    if (error) {
      throw new Error(`Database insert failed: ${error.message}`);
    }

    return { success: true };
  });

/** Deletes a resource and its storage file securely. */
export const adminDeleteResourceServer = createServerFn({ method: "POST" })
  .validator((data: { authToken: string; id: string; filePath?: string | null }) => data)
  .handler(async ({ data }) => {
    if (!verifyAdminToken(data.authToken)) {
      throw new Error("Unauthorized: Invalid administrative credentials");
    }
    const adminSupabase = getAdminClient();

    const { error: dbError } = await adminSupabase
      .from("resources")
      .delete()
      .eq("id", data.id);

    if (dbError) {
      throw new Error(`Database delete failed: ${dbError.message}`);
    }

    if (data.filePath) {
      await adminSupabase.storage.from("resources").remove([data.filePath]);
    }

    return { success: true };
  });

