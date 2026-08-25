import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

const getAdminClient = () => {
  const url =
    (import.meta.env['VITE_SUPABASE_URL'] as string | undefined) ||
    "https://jykszzfxpqmjsnepqwhd.supabase.co";
  const key =
    (import.meta.env['VITE_SUPABASE_SERVICE_ROLE_KEY'] as string | undefined) ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5a3N6emZ4cHFtanNuZXBxd2hkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzY0ODc0MiwiZXhwIjoyMTAzMjI0NzQyfQ.2bk0pv72_wre7lIy3qL18ypT0UA1uzDYAyPq81u3cTg";
  return createClient(url, key);
};

export const getSignedUrlServer = createServerFn({ method: "GET" })
  .validator((filePath: string) => filePath)
  .handler(async ({ data: filePath }) => {
    const adminSupabase = getAdminClient();
    const { data, error } = await adminSupabase.storage
      .from("resources")
      .createSignedUrl(filePath, 3600);

    if (error || !data?.signedUrl) {
      throw new Error(error?.message || "Failed to generate signed URL");
    }

    return data.signedUrl;
  });
