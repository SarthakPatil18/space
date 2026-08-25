import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Subject = Database["public"]["Tables"]["subjects"]["Row"];
export type Resource = Database["public"]["Tables"]["resources"]["Row"];
export type Category = Database["public"]["Enums"]["resource_category"];

export const CATEGORIES: Category[] = ["notes", "syllabus", "pyqs", "files"];

export const CATEGORY_META: Record<
  Category,
  { label: string; blurb: string }
> = {
  notes: { label: "Notes", blurb: "Lecture and handwritten notes" },
  syllabus: { label: "Syllabus", blurb: "Official syllabus documents" },
  pyqs: { label: "PYQs", blurb: "Previous year question papers" },
  files: { label: "Files", blurb: "Other subject material" },
};

export const DEFAULT_SUBJECT_COLORS: Record<string, string> = {
  OS: "#3B82F6",
  DSA: "#10B981",
  CPP: "#8B5CF6",
  AM: "#F59E0B",
  AI: "#EC4899",
  PROTOTYPING: "#06B6D4",
  UHV: "#64748B",
};

export const DEFAULT_SECTION_COLORS: Record<string, string> = {
  CHEM: "#22D3EE",
  SOFTWARE: "#0891B2",
  MECH: "#0284C7",
  CIVIL: "#0369A1",
};

export function getSubjectColor(
  subject?: { code?: string; color?: string | null } | null,
): string {
  if (subject?.color) return subject.color;
  if (subject?.code) {
    const defaultColor = DEFAULT_SUBJECT_COLORS[subject.code.toUpperCase()];
    if (defaultColor) return defaultColor;
  }
  return "#64748B"; // Neutral default fallback
}

export function isCategory(value: string): value is Category {
  return (CATEGORIES as string[]).includes(value);
}

export class DivhubError extends Error {}

function unwrap<T>(data: T | null, error: { message: string } | null): T {
  if (error) {
    console.error(error);
    throw new DivhubError("We couldn't load this right now. Please try again.");
  }
  return data as T;
}

export const subjectsQuery = () =>
  queryOptions({
    queryKey: ["subjects"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .order("name");
      return unwrap(data, error);
    },
  });

export const subjectQuery = (subjectId: string) =>
  queryOptions({
    queryKey: ["subject", subjectId],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .eq("id", subjectId)
        .maybeSingle();
      return unwrap(data, error);
    },
  });

export const subjectResourcesQuery = (subjectId: string) =>
  queryOptions({
    queryKey: ["resources", "subject", subjectId],
    staleTime: 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .eq("subject_id", subjectId)
        .order("created_at", { ascending: false });
      return unwrap(data, error);
    },
  });

export const recentResourcesQuery = (limit = 6) =>
  queryOptions({
    queryKey: ["resources", "recent", limit],
    staleTime: 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resources")
        .select("*, subjects(id, name, code)")
        .order("created_at", { ascending: false })
        .limit(limit);
      return unwrap(data, error);
    },
  });

export const allResourcesQuery = () =>
  queryOptions({
    queryKey: ["resources", "all"],
    staleTime: 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resources")
        .select("*, subjects(id, name, code)")
        .order("created_at", { ascending: false });
      return unwrap(data, error);
    },
  });

export const searchQuery = (term: string) =>
  queryOptions({
    queryKey: ["search", term],
    enabled: term.trim().length > 0,
    staleTime: 30 * 1000,
    queryFn: async () => {
      const q = term.trim();
      const like = `%${q}%`;
      const category = CATEGORIES.find(
        (c) =>
          c.startsWith(q.toLowerCase()) ||
          CATEGORY_META[c].label.toLowerCase() === q.toLowerCase(),
      );

      const [resourcesRes, subjectsRes] = await Promise.all([
        supabase
          .from("resources")
          .select("*, subjects(id, name, code)")
          .or(`title.ilike.${like},description.ilike.${like}`)
          .limit(50),
        supabase
          .from("subjects")
          .select("*")
          .or(`name.ilike.${like},code.ilike.${like}`)
          .limit(20),
      ]);

      const subjects = unwrap(subjectsRes.data, subjectsRes.error);
      let resources = unwrap(resourcesRes.data, resourcesRes.error);

      // Also match resources belonging to a matched subject, or a matched category.
      const extraFilters: string[] = [];
      if (subjects.length > 0) {
        extraFilters.push(
          `subject_id.in.(${subjects.map((s) => s.id).join(",")})`,
        );
      }
      if (category) extraFilters.push(`category.eq.${category}`);

      if (extraFilters.length > 0) {
        const { data, error } = await supabase
          .from("resources")
          .select("*, subjects(id, name, code)")
          .or(extraFilters.join(","))
          .limit(50);
        const extra = unwrap(data, error);
        const seen = new Set(resources.map((r) => r.id));
        resources = [...resources, ...extra.filter((r) => !seen.has(r.id))];
      }

      return { resources, subjects };
    },
  });

export function formatFileSize(bytes: number | null): string | null {
  if (!bytes || bytes <= 0) return null;
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value < 10 && i > 0 ? value.toFixed(1) : Math.round(value)} ${units[i]}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Resolves the openable URL for a resource (signed URL or public URL for uploaded files). */
export async function resolveResourceUrl(
  resource: { file_path?: string | null; file_url?: string | null },
): Promise<string> {
  if (resource.file_path) {
    const { data: signedData, error: signedError } = await supabase.storage
      .from("resources")
      .createSignedUrl(resource.file_path, 3600);

    if (!signedError && signedData?.signedUrl) {
      const signedUrl = signedData.signedUrl;
      if (signedUrl.startsWith("http://") || signedUrl.startsWith("https://")) {
        return signedUrl;
      }
      const baseUrl =
        (import.meta.env['VITE_SUPABASE_URL'] as string | undefined) ||
        "https://jykszzfxpqmjsnepqwhd.supabase.co";
      return `${baseUrl}${signedUrl.startsWith("/") ? "" : "/"}${signedUrl}`;
    }

    throw new DivhubError("Could not generate a link for this file. Please try again.");
  }

  if (resource.file_url && typeof resource.file_url === "string")
    return resource.file_url;
  throw new DivhubError("This resource has no file attached.");
}
