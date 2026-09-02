import { queryOptions } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { getSignedUrlServer } from "./divhub.server";

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

export function getExamType(resource?: {
  exam_type?: string | null;
  title?: string | null;
  description?: string | null;
  file_path?: string | null;
} | null): "mse" | "ese" | null {
  if (!resource) return null;
  if (resource.exam_type === "mse" || resource.exam_type === "ese") {
    return resource.exam_type;
  }
  const text = `${resource.title || ""} ${resource.description || ""} ${resource.file_path || ""}`;

  // 1. Explicit MSE indicators (Mid Semester Exams, In-Sem, Cycle Tests, Unit Tests, Aug/Sep/Oct/Feb/Mar exam sessions)
  if (
    /\b(mse|mid\s*sem(ester)?|insem|in-sem|cycle|cycle\s*[12]|test|unit\s*test|sep|sept|september|oct|october|aug|august|feb|february|mar|march)\b/i.test(
      text,
    )
  ) {
    return "mse";
  }

  // 2. Explicit ESE indicators (End Semester Exams, Regular Sem End, Jul/Nov/Dec/May/Apr/Jun sessions)
  if (
    /\b(ese|end\s*sem(ester)?|endsem|end-sem|jul|july|nov|november|dec|december|may|apr|april|jun|june)\b/i.test(
      text,
    )
  ) {
    return "ese";
  }

  return null;
}

export function getExamYear(resource?: {
  year?: number | null;
  title?: string | null;
  description?: string | null;
  file_path?: string | null;
} | null): number | null {
  if (!resource) return null;
  if (typeof resource.year === "number" && !isNaN(resource.year) && resource.year >= 2000 && resource.year <= 2099) {
    return resource.year;
  }
  const text = `${resource.title || ""} ${resource.description || ""} ${resource.file_path || ""}`;

  // 1. Check for 4-digit years like 2017, 2018, 2019, 2024, 2027
  const fullYearMatch = text.match(/\b(20[12][0-9])\b/);
  if (fullYearMatch && fullYearMatch[1]) {
    return parseInt(fullYearMatch[1], 10);
  }

  // 2. Check for academic year ranges like 2018-19, 18-19, 2019/20, 19/20
  const rangeMatch = text.match(/\b(?:20)?([12][0-9])\s*[-/]\s*(?:20)?([12][0-9])\b/);
  if (rangeMatch && rangeMatch[1]) {
    return 2000 + parseInt(rangeMatch[1], 10);
  }

  // 3. Check for 2-digit years combined with pyq/mse/ese/year/paper/sem, e.g. "pyq 18", "mse-19", "27 ese", "paper 20"
  const twoDigitMatch =
    text.match(/(?:pyq|mse|ese|paper|yr|year|exam|sem)[-_ ]*([12][0-9])\b/i) ||
    text.match(/\b([12][0-9])[-_ ]*(?:pyq|mse|ese|paper|yr|year|exam|sem)\b/i);
  if (twoDigitMatch && twoDigitMatch[1]) {
    return 2000 + parseInt(twoDigitMatch[1], 10);
  }

  return null;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const getClientFallback = () => {
  const url =
    (import.meta.env['VITE_SUPABASE_URL'] as string | undefined) ||
    "https://jykszzfxpqmjsnepqwhd.supabase.co";
  const key =
    (import.meta.env['VITE_SUPABASE_SERVICE_ROLE_KEY'] as string | undefined) ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5a3N6emZ4cHFtanNuZXBxd2hkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzY0ODc0MiwiZXhwIjoyMTAzMjI0NzQyfQ.2bk0pv72_wre7lIy3qL18ypT0UA1uzDYAyPq81u3cTg";
  return createClient(url, key);
};

/** Resolves the openable URL for a resource (signed URL or public URL for uploaded files). */
export async function resolveResourceUrl(
  resource: { file_path?: string | null; file_url?: string | null },
): Promise<string> {
  if (resource.file_path) {
    // 1. Try server function first
    try {
      const signedUrl = await getSignedUrlServer({ data: resource.file_path });
      if (signedUrl && (signedUrl.startsWith("http://") || signedUrl.startsWith("https://"))) {
        return signedUrl;
      }
      const baseUrl =
        (import.meta.env['VITE_SUPABASE_URL'] as string | undefined) ||
        "https://jykszzfxpqmjsnepqwhd.supabase.co";
      if (signedUrl) {
        return `${baseUrl}${signedUrl.startsWith("/") ? "" : "/"}${signedUrl}`;
      }
    } catch (serverErr) {
      console.warn("getSignedUrlServer error, falling back to direct client:", serverErr);
    }

    // 2. Direct fallback using client
    try {
      const client = getClientFallback();
      const { data, error } = await client.storage
        .from("resources")
        .createSignedUrl(resource.file_path, 3600);

      if (data?.signedUrl) {
        const signedUrl = data.signedUrl;
        if (signedUrl.startsWith("http://") || signedUrl.startsWith("https://")) {
          return signedUrl;
        }
        const baseUrl =
          (import.meta.env['VITE_SUPABASE_URL'] as string | undefined) ||
          "https://jykszzfxpqmjsnepqwhd.supabase.co";
        return `${baseUrl}${signedUrl.startsWith("/") ? "" : "/"}${signedUrl}`;
      }

      if (error) throw error;
    } catch (err) {
      console.error("Signed URL generation error:", err);
      throw new DivhubError("Could not generate a link for this file. Please try again.");
    }
  }

  if (resource.file_url && typeof resource.file_url === "string")
    return resource.file_url;
  throw new DivhubError("This resource has no file attached.");
}
