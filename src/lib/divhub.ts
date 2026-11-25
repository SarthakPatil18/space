import { queryOptions } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { getSignedUrlServer } from "./divhub.server";

export type Subject = Database["public"]["Tables"]["subjects"]["Row"];
export type Resource = Database["public"]["Tables"]["resources"]["Row"];
export type Category = Database["public"]["Enums"]["resource_category"];

export const CATEGORIES: Category[] = [
  "notes",
  "pyqs",
  "practicals",
  "assignments",
  "syllabus",
  "reference",
  "files",
  "other",
];

export const CATEGORY_META: Record<
  Category,
  { label: string; blurb: string }
> = {
  notes: { label: "Notes", blurb: "Lecture and handwritten notes" },
  pyqs: { label: "PYQs", blurb: "Previous year question papers" },
  practicals: { label: "Practicals", blurb: "Lab manuals and practical files" },
  assignments: { label: "Assignments", blurb: "Assignment sheets and solutions" },
  syllabus: { label: "Syllabus", blurb: "Official syllabus documents" },
  reference: { label: "Reference", blurb: "Reference books and extra material" },
  files: { label: "Files", blurb: "Other subject material" },
  other: { label: "Other", blurb: "Anything that does not fit elsewhere" },
};

export const UPLOAD_CATEGORIES: Category[] = [
  "pyqs",
  "notes",
  "practicals",
  "assignments",
  "syllabus",
  "reference",
  "other",
];

export function getDrivePreviewUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${encodeURIComponent(fileId)}/preview`;
}

export function getDriveDownloadUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${encodeURIComponent(fileId)}`;
}

export function getDriveViewUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${encodeURIComponent(fileId)}/view`;
}

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
      const q = term.trim().slice(0, 100);
      // Sanitize special PostgREST & SQL wildcard characters
      const sanitized = q.replace(/[%_\\(),]/g, " ").trim();
      if (!sanitized) {
        return { resources: [], subjects: [] };
      }
      const like = `%${sanitized}%`;
      const category = CATEGORIES.find(
        (c) =>
          c.startsWith(sanitized.toLowerCase()) ||
          CATEGORY_META[c].label.toLowerCase() === sanitized.toLowerCase(),
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

/** Client-side signed URL cache to avoid redundant server round-trips. */
const clientUrlCache = new Map<string, { url: string; expiresAt: number }>();
const CLIENT_CACHE_TTL = 45 * 60 * 1000; // 45 minutes

function getClientCachedUrl(key: string): string | null {
  const entry = clientUrlCache.get(key);
  if (entry && Date.now() < entry.expiresAt) return entry.url;
  if (entry) clientUrlCache.delete(key);
  return null;
}

function setClientCachedUrl(key: string, url: string): void {
  clientUrlCache.set(key, { url, expiresAt: Date.now() + CLIENT_CACHE_TTL });
}

/** Resolves the openable temporary signed URL for a resource via secure server function. */
export async function resolveResourceUrl(
  resource: { file_path?: string | null; file_url?: string | null },
): Promise<string> {
  if (resource.file_path) {
    // Check client-side cache first
    const cached = getClientCachedUrl(resource.file_path);
    if (cached) return cached;

    try {
      const signedUrl = await getSignedUrlServer({ data: resource.file_path });
      if (signedUrl && (signedUrl.startsWith("http://") || signedUrl.startsWith("https://"))) {
        setClientCachedUrl(resource.file_path, signedUrl);
        return signedUrl;
      }
      const baseUrl =
        (import.meta.env['VITE_SUPABASE_URL'] as string | undefined) ||
        "https://jykszzfxpqmjsnepqwhd.supabase.co";
      if (signedUrl) {
        const fullUrl = `${baseUrl}${signedUrl.startsWith("/") ? "" : "/"}${signedUrl}`;
        setClientCachedUrl(resource.file_path, fullUrl);
        return fullUrl;
      }
    } catch (serverErr) {
      console.error("Could not sign URL for resource:", serverErr);
      throw new DivhubError("Could not load the file preview right now. Please try again.");
    }
  }

  if (resource.file_url && typeof resource.file_url === "string") {
    return resource.file_url;
  }
  throw new DivhubError("This resource has no file attached.");
}

// In-flight prefetch tracking to avoid duplicate requests
const prefetchInFlight = new Map<string, Promise<string>>();

/** Pre-fetches the signed URL for a resource in the background (e.g. on hover).
 *  Safe to call multiple times — deduplicates and never throws. */
export function prefetchResourceUrl(
  resource: { file_path?: string | null; file_url?: string | null } | null | undefined,
): void {
  if (!resource) return;
  const key = resource.file_path || resource.file_url;
  if (!key) return;

  // Already cached
  if (getClientCachedUrl(key)) return;
  // Already in-flight
  if (prefetchInFlight.has(key)) return;

  const promise = resolveResourceUrl(resource)
    .catch(() => "") // silently swallow — prefetch is best-effort
    .finally(() => prefetchInFlight.delete(key));

  prefetchInFlight.set(key, promise);
}

