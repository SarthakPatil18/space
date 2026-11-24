import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock3,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  Search,
  ShieldCheck,
  Trash2,
  User,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { CATEGORIES, CATEGORY_META, getDriveDownloadUrl, getDriveViewUrl } from "@/lib/divhub";
import {
  adminApproveSubmissionServer,
  adminDeleteSubmissionServer,
  adminListSubmissionsServer,
  adminRejectSubmissionServer,
} from "@/lib/submissions.server";
import { PdfViewerModal, type ModalResource } from "./pdf-viewer-modal";

type StatusFilter = "pending" | "approved" | "rejected" | "all";

type SubmissionRow = {
  id: string;
  title: string;
  category: string;
  academic_year: number | null;
  description: string | null;
  file_name: string | null;
  file_type: string | null;
  file_size: number | null;
  drive_file_id: string | null;
  drive_web_view_link: string | null;
  contributor_name: string | null;
  status: string;
  created_at: string;
  subjects?: { id: string; name: string; code: string; color?: string | null } | null;
};

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
];

function formatBytes(bytes?: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AdminSubmissions({
  authToken,
  subjects,
  onChanged,
}: {
  authToken: string;
  subjects: { id: string; name: string; code: string }[];
  onChanged?: () => void;
}) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<StatusFilter>("pending");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [category, setCategory] = useState("");
  const [year, setYear] = useState("");
  const [busy, setBusy] = useState<{ id: string; action: "approve" | "reject" | "delete" } | null>(
    null,
  );
  const [preview, setPreview] = useState<ModalResource>(null);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const submissions = useQuery({
    queryKey: ["admin-submissions", status, search, subjectId, category, year],
    queryFn: () =>
      adminListSubmissionsServer({
        data: {
          authToken,
          status,
          search: search || undefined,
          subjectId: subjectId || undefined,
          category: category || undefined,
          academicYear: year ? Number.parseInt(year, 10) : undefined,
        },
      }) as Promise<SubmissionRow[]>,
    enabled: Boolean(authToken),
    staleTime: 15 * 1000,
  });

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ["admin-submissions"] });
    onChanged?.();
  }

  async function runAction(id: string, action: "approve" | "reject" | "delete") {
    if (action === "delete" && !confirm("Delete this submission and its Drive file?")) {
      return;
    }
    setBusy({ id, action });
    try {
      const data = { authToken, id };
      if (action === "approve") {
        await adminApproveSubmissionServer({ data });
        toast.success("Submission approved and published.");
      } else if (action === "reject") {
        await adminRejectSubmissionServer({ data });
        toast.info("Submission rejected and hidden from the public library.");
      } else {
        await adminDeleteSubmissionServer({ data });
        toast.success("Submission and Drive file deleted.");
      }
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed.");
    } finally {
      setBusy(null);
    }
  }

  const rows = submissions.data ?? [];
  const hasFilters = Boolean(search || subjectId || category || year);

  return (
    <div className="hairline-card space-y-4 bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline pb-3">
        <h2 className="heading-md flex items-center gap-2 text-ink">
          <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
          Student Submissions
        </h2>
        <span className="text-[11px] text-mute">
          {submissions.isFetching ? "Refreshing…" : `${rows.length} shown`}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1 rounded-lg border border-hairline bg-background p-0.5 text-xs font-medium">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setStatus(tab.value)}
            className={`rounded-md px-3 py-1.5 transition-colors ${
              status === tab.value
                ? "bg-card font-semibold text-ink shadow-xs"
                : "text-mute hover:text-ink"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="relative sm:col-span-2">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-mute"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search title, file name or contributor"
            className="w-full rounded-md border border-hairline bg-background py-2 pl-8 pr-3 text-sm text-ink outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <select
          value={subjectId}
          onChange={(event) => setSubjectId(event.target.value)}
          aria-label="Filter by subject"
          className="rounded-md border border-hairline bg-background px-2.5 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">All subjects</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.code} — {subject.name}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-2">
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Filter by category"
            className="rounded-md border border-hairline bg-background px-2.5 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {CATEGORY_META[value].label}
              </option>
            ))}
          </select>
          <input
            type="number"
            inputMode="numeric"
            min={2000}
            max={new Date().getFullYear() + 1}
            value={year}
            onChange={(event) => setYear(event.target.value)}
            placeholder="Year"
            aria-label="Filter by academic year"
            className="rounded-md border border-hairline bg-background px-2.5 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {hasFilters ? (
        <button
          type="button"
          onClick={() => {
            setSearchInput("");
            setSearch("");
            setSubjectId("");
            setCategory("");
            setYear("");
          }}
          className="inline-flex items-center gap-1 text-[11px] text-mute underline underline-offset-4 hover:text-ink"
        >
          <X className="size-3" aria-hidden="true" />
          Clear filters
        </button>
      ) : null}

      {submissions.isPending ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-20 animate-pulse rounded-lg bg-hairline-soft" />
          ))}
        </div>
      ) : submissions.isError ? (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3.5 py-3 text-[13px] text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Could not load submissions. Try refreshing or unlocking again.
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-hairline px-4 py-10 text-center">
          <Clock3 className="size-5 text-mute" aria-hidden="true" />
          <p className="text-sm font-medium text-ink">
            {status === "pending" ? "No submissions waiting for review" : "Nothing here yet"}
          </p>
          <p className="max-w-xs text-[12px] leading-relaxed text-mute">
            {status === "pending"
              ? "New student uploads will appear here for approval."
              : "Adjust the filters or switch tabs to see other submissions."}
          </p>
        </div>
      ) : (
        <div className="max-h-[720px] space-y-2.5 overflow-y-auto pr-1">
          {rows.map((row) => {
            const rowBusy = busy?.id === row.id;
            const pending = row.status === "pending";
            const approved = row.status === "approved";
            const rejected = row.status === "rejected";
            return (
              <article key={row.id} className="rounded-lg border border-hairline bg-card p-3">
                <div className="flex items-start gap-3">
                  <FileText className="mt-0.5 size-4 shrink-0 text-mute" aria-hidden="true" />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="min-w-0 truncate text-sm font-medium text-ink">{row.title}</p>
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                          pending
                            ? "bg-amber-50 text-amber-700"
                            : approved
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                        }`}
                      >
                        {row.status}
                      </span>
                    </div>

                    <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-mute">
                      <span className="font-semibold text-body">
                        {row.subjects?.code ?? "General"}
                      </span>
                      <span>·</span>
                      <span>
                        {CATEGORY_META[row.category as keyof typeof CATEGORY_META]?.label ??
                          row.category}
                      </span>
                      {row.academic_year ? (
                        <>
                          <span>·</span>
                          <span>{row.academic_year}</span>
                        </>
                      ) : null}
                      {row.file_name ? (
                        <>
                          <span>·</span>
                          <span className="truncate">{row.file_name}</span>
                        </>
                      ) : null}
                      {row.file_size ? <span>· {formatBytes(row.file_size)}</span> : null}
                    </p>

                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-mute">
                      <span className="inline-flex items-center gap-1">
                        <User className="size-3" aria-hidden="true" />
                        {row.contributor_name || "Anonymous"}
                      </span>
                      <span>
                        {new Date(row.created_at).toLocaleDateString(undefined, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </p>

                    {row.description ? (
                      <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-body">
                        {row.description}
                      </p>
                    ) : null}

                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {row.drive_file_id ? (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              setPreview({
                                id: row.id,
                                title: row.title,
                                drive_file_id: row.drive_file_id,
                                file_size: row.file_size,
                                year: row.academic_year,
                              })
                            }
                            className="btn-primary-sm px-2.5 py-1 text-[11px]"
                          >
                            <ExternalLink className="size-3" aria-hidden="true" />
                            Preview
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              window.open(
                                row.drive_web_view_link ||
                                  getDriveViewUrl(row.drive_file_id as string),
                                "_blank",
                                "noopener,noreferrer",
                              )
                            }
                            className="btn-ghost-sm px-2 py-1 text-[11px]"
                          >
                            Drive
                          </button>
                          <a
                            href={getDriveDownloadUrl(row.drive_file_id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-ghost-sm px-2 py-1 text-[11px]"
                          >
                            <Download className="size-3" aria-hidden="true" />
                            Download
                          </a>
                        </>
                      ) : null}

                      {!approved ? (
                        <button
                          type="button"
                          onClick={() => void runAction(row.id, "approve")}
                          disabled={rowBusy}
                          className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 text-[11px] font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {rowBusy && busy?.action === "approve" ? (
                            <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                          ) : (
                            <Check className="size-3" aria-hidden="true" />
                          )}
                          Approve
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                          <CheckCircle2 className="size-3" aria-hidden="true" />
                          Live in library
                        </span>
                      )}

                      {!rejected ? (
                        <button
                          type="button"
                          onClick={() => void runAction(row.id, "reject")}
                          disabled={rowBusy}
                          className="inline-flex items-center gap-1 rounded-md border border-hairline px-2.5 py-1 text-[11px] font-medium text-body transition-colors hover:bg-hairline-soft disabled:opacity-50"
                        >
                          <XCircle className="size-3" aria-hidden="true" />
                          Reject
                        </button>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => void runAction(row.id, "delete")}
                        disabled={rowBusy}
                        className="ml-auto inline-flex items-center gap-1 rounded-md p-1.5 text-mute transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                        title="Delete submission and Drive file"
                      >
                        {rowBusy && busy?.action === "delete" ? (
                          <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                        ) : (
                          <Trash2 className="size-3.5" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <PdfViewerModal resource={preview} onClose={() => setPreview(null)} />
    </div>
  );
}
