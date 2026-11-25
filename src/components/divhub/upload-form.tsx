import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileText,
  Info,
  Loader2,
  ShieldCheck,
  UploadCloud,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { subjectsQuery, UPLOAD_CATEGORIES, CATEGORY_META } from "@/lib/divhub";
import {
  completeSubmissionServer,
  createSubmissionSessionServer,
  getSubmissionStatusServer,
  getUploadConfigServer,
} from "@/lib/submissions.server";

const RECEIPTS_KEY = "space_submission_receipts";

const ACCEPTED_EXTENSIONS = ["pdf", "doc", "docx", "ppt", "pptx"];

const MIME_BY_EXTENSION: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

type FileStatus = "queued" | "uploading" | "saving" | "done" | "error";

type QueuedFile = {
  key: string;
  file: File;
  status: FileStatus;
  progress: number;
  error?: string | undefined;
  submissionId?: string | undefined;
};

type Receipt = {
  id: string;
  title: string;
  createdAt: string;
};

function extensionOf(name: string): string {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function readReceipts(): Receipt[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECEIPTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is Receipt =>
        Boolean(entry) &&
        typeof (entry as Receipt).id === "string" &&
        typeof (entry as Receipt).title === "string",
    );
  } catch {
    return [];
  }
}

function writeReceipts(receipts: Receipt[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RECEIPTS_KEY, JSON.stringify(receipts.slice(0, 25)));
  } catch {
    // Storage may be unavailable in private browsing; history is a convenience only.
  }
}

async function sha256Hex(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function putToDrive(
  uploadUrl: string,
  file: File,
  mimeType: string,
  onProgress: (percent: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl, true);
    xhr.setRequestHeader("Content-Type", mimeType);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const payload = JSON.parse(xhr.responseText) as { id?: string };
          if (payload?.id) {
            resolve(payload.id);
            return;
          }
        } catch {
          // Fall through to the generic error below.
        }
        reject(new Error("Google Drive did not confirm the upload."));
        return;
      }
      reject(new Error("The upload was interrupted. Please try again."));
    };

    xhr.onerror = () =>
      reject(new Error("The upload failed. Check your connection and try again."));
    xhr.onabort = () => reject(new Error("The upload was cancelled."));

    xhr.send(file);
  });
}

export function UploadForm() {
  const subjects = useQuery(subjectsQuery());
  const config = useQuery({
    queryKey: ["upload-config"],
    queryFn: () => getUploadConfigServer(),
    staleTime: 5 * 60 * 1000,
  });

  const [files, setFiles] = useState<QueuedFile[]>([]);
  const [subjectId, setSubjectId] = useState("");
  const [category, setCategory] = useState("notes");
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());
  const [description, setDescription] = useState("");
  const [contributorName, setContributorName] = useState("");
  const [website, setWebsite] = useState("");
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setReceipts(readReceipts());
  }, []);

  const receiptIds = useMemo(() => receipts.map((entry) => entry.id), [receipts]);
  const statusQuery = useQuery({
    queryKey: ["submission-status", receiptIds],
    queryFn: () => getSubmissionStatusServer({ data: receiptIds }),
    enabled: receiptIds.length > 0,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });

  const maxFileMb = config.data?.maxFileSizeMb ?? 25;
  const maxFiles = config.data?.maxFiles ?? 5;
  const maxBytes = maxFileMb * 1024 * 1024;
  const uploadsEnabled = config.data?.enabled ?? false;

  const statusById = useMemo(() => {
    const map = new Map<string, { status: string; title: string }>();
    for (const row of statusQuery.data ?? []) {
      map.set(row.id, { status: row.status, title: row.title });
    }
    return map;
  }, [statusQuery.data]);

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const list = Array.from(incoming);
      if (list.length === 0) return;

      setFiles((current) => {
        const next = [...current];
        for (const file of list) {
          if (next.length >= maxFiles) {
            toast.error(`You can upload up to ${maxFiles} files at a time.`);
            break;
          }

          const extension = extensionOf(file.name);
          if (!ACCEPTED_EXTENSIONS.includes(extension)) {
            toast.error(`${file.name} is not a supported file type.`);
            continue;
          }
          if (file.size <= 0) {
            toast.error(`${file.name} appears to be empty.`);
            continue;
          }
          if (file.size > maxBytes) {
            toast.error(`${file.name} is larger than ${maxFileMb} MB.`);
            continue;
          }
          const duplicate = next.some(
            (entry) =>
              entry.file.name === file.name &&
              entry.file.size === file.size &&
              entry.file.lastModified === file.lastModified,
          );
          if (duplicate) continue;

          next.push({
            key: `${file.name}-${file.size}-${file.lastModified}-${Math.random()
              .toString(36)
              .slice(2, 8)}`,
            file,
            status: "queued",
            progress: 0,
          });
        }
        return next;
      });
    },
    [maxBytes, maxFileMb, maxFiles],
  );

  function removeFile(key: string) {
    setFiles((current) => current.filter((entry) => entry.key !== key));
  }

  function updateFile(key: string, patch: Partial<QueuedFile>) {
    setFiles((current) =>
      current.map((entry) => (entry.key === key ? { ...entry, ...patch } : entry)),
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!uploadsEnabled) {
      toast.error("Uploads are temporarily unavailable. Please use email instead.");
      return;
    }
    if (!subjectId) {
      toast.error("Choose a subject before uploading.");
      return;
    }
    const pending = files.filter((entry) => entry.status !== "done");
    if (pending.length === 0) {
      toast.error("Add at least one file to upload.");
      return;
    }
    const year = Number.parseInt(academicYear, 10);
    if (!Number.isInteger(year) || year < 2000 || year > new Date().getFullYear() + 1) {
      toast.error("Enter a valid academic year, like 2025.");
      return;
    }

    setSubmitting(true);
    let successCount = 0;
    const newReceipts: Receipt[] = [];

    for (const entry of pending) {
      updateFile(entry.key, { status: "uploading", progress: 0, error: undefined });
      try {
        const contentHash = await sha256Hex(entry.file);

        const session = await createSubmissionSessionServer({
          data: {
            fileName: entry.file.name,
            mimeType: entry.file.type || "",
            sizeBytes: entry.file.size,
            subjectId,
            category,
            academicYear: year,
            description: description.trim() || undefined,
            contributorName: contributorName.trim() || undefined,
            contentHash,
            website,
          },
        });

        if (!session.ok) {
          throw new Error(session.error);
        }

        const mimeType =
          entry.file.type && entry.file.type !== "application/octet-stream"
            ? entry.file.type
            : (MIME_BY_EXTENSION[extensionOf(entry.file.name)] ?? "application/octet-stream");

        const driveFileId = await putToDrive(session.uploadUrl, entry.file, mimeType, (percent) =>
          updateFile(entry.key, { progress: percent }),
        );

        updateFile(entry.key, { status: "saving", progress: 100 });

        const completed = await completeSubmissionServer({
          data: { intent: session.intent, driveFileId },
        });

        if (!completed.ok) {
          throw new Error(completed.error);
        }

        updateFile(entry.key, {
          status: "done",
          progress: 100,
          submissionId: completed.id,
        });
        newReceipts.push({
          id: completed.id,
          title: entry.file.name.replace(/\.[^.]+$/, ""),
          createdAt: new Date().toISOString(),
        });
        successCount += 1;
      } catch (error) {
        updateFile(entry.key, {
          status: "error",
          error: error instanceof Error ? error.message : "Upload failed.",
        });
      }
    }

    if (newReceipts.length > 0) {
      const merged = [...newReceipts, ...readReceipts()].slice(0, 25);
      writeReceipts(merged);
      setReceipts(merged);
      toast.success(`${successCount} file${successCount === 1 ? "" : "s"} submitted for review.`);
      setDescription("");
    }
    if (successCount < pending.length) {
      toast.error("Some files could not be uploaded. See the messages above.");
    }

    setSubmitting(false);
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="hairline-card overflow-hidden">
        <div className="border-b border-hairline bg-hairline-soft/40 px-5 py-4 sm:px-6">
          <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
            <UploadCloud className="size-4 text-primary" aria-hidden="true" />
            Upload your material
          </h2>
          <p className="mt-1 text-[13px] leading-relaxed text-mute">
            PDF, DOC, DOCX, PPT or PPTX · up to {maxFileMb} MB each · {maxFiles} files at a time.
            Every upload is reviewed before it appears in the library.
          </p>
        </div>

        <div className="space-y-5 px-5 py-5 sm:px-6">
          {!config.isLoading && !uploadsEnabled ? (
            <div className="flex items-start gap-2.5 rounded-lg border border-amber-300/60 bg-amber-50 px-3.5 py-3 text-[13px] leading-relaxed text-amber-900">
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>
                Direct uploads are not configured on this deployment yet. Please use the email
                option below; it reaches the same team.
              </span>
            </div>
          ) : null}

          <div>
            <label
              htmlFor="contribute-subject"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-mute"
            >
              Subject
            </label>
            <select
              id="contribute-subject"
              value={subjectId}
              onChange={(event) => setSubjectId(event.target.value)}
              required
              disabled={submitting}
              className="w-full rounded-lg border border-hairline bg-card px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-primary/60 focus:ring-2 focus:ring-primary/15 disabled:opacity-60"
            >
              <option value="">
                {subjects.isLoading ? "Loading subjects…" : "Select a subject"}
              </option>
              {(subjects.data ?? []).map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name} ({subject.code})
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="contribute-category"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-mute"
              >
                Category
              </label>
              <select
                id="contribute-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                disabled={submitting}
                className="w-full rounded-lg border border-hairline bg-card px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-primary/60 focus:ring-2 focus:ring-primary/15 disabled:opacity-60"
              >
                {UPLOAD_CATEGORIES.map((value) => (
                  <option key={value} value={value}>
                    {CATEGORY_META[value].label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="contribute-year"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-mute"
              >
                Academic year
              </label>
              <input
                id="contribute-year"
                type="number"
                inputMode="numeric"
                min={2000}
                max={new Date().getFullYear() + 1}
                step={1}
                value={academicYear}
                onChange={(event) => setAcademicYear(event.target.value)}
                disabled={submitting}
                placeholder="e.g. 2025"
                className="w-full rounded-lg border border-hairline bg-card px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-primary/60 focus:ring-2 focus:ring-primary/15 disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                if (!uploadsEnabled || submitting) return;
                inputRef.current?.click();
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  if (!uploadsEnabled || submitting) return;
                  inputRef.current?.click();
                }
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                if (!submitting && uploadsEnabled) addFiles(event.dataTransfer.files);
              }}
              className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-8 text-center transition-colors ${
                dragging
                  ? "border-primary bg-primary/5"
                  : "border-hairline bg-hairline-soft/30 hover:border-primary/50 hover:bg-hairline-soft/60"
              } ${submitting || !uploadsEnabled ? "pointer-events-none opacity-60" : ""}`}
            >
              <span className="flex size-10 items-center justify-center rounded-full bg-card shadow-whisper">
                <UploadCloud className="size-5 text-primary" aria-hidden="true" />
              </span>
              <span className="text-sm font-medium text-ink">
                Drag &amp; drop files here, or click to browse
              </span>
              <span className="text-xs text-mute">
                PDF, DOC, DOCX, PPT, PPTX · max {maxFileMb} MB per file
              </span>
              <input
                ref={inputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.ppt,.pptx"
                className="hidden"
                disabled={submitting}
                onChange={(event) => {
                  if (event.target.files) addFiles(event.target.files);
                  event.target.value = "";
                }}
              />
            </div>

            {files.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {files.map((entry) => (
                  <li
                    key={entry.key}
                    className="rounded-lg border border-hairline bg-card px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="size-4 shrink-0 text-mute" aria-hidden="true" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-ink">
                          {entry.file.name}
                        </p>
                        <p className="text-[11px] text-mute">
                          {formatBytes(entry.file.size)}
                          {entry.status === "uploading"
                            ? ` · uploading ${entry.progress}%`
                            : entry.status === "saving"
                              ? " · saving…"
                              : entry.status === "done"
                                ? " · submitted for review"
                                : entry.status === "error"
                                  ? " · failed"
                                  : ""}
                        </p>
                      </div>
                      {entry.status === "done" ? (
                        <CheckCircle2
                          className="size-4 shrink-0 text-emerald-600"
                          aria-label="Uploaded"
                        />
                      ) : entry.status === "uploading" || entry.status === "saving" ? (
                        <Loader2
                          className="size-4 shrink-0 animate-spin text-primary"
                          aria-label="Uploading"
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => removeFile(entry.key)}
                          disabled={submitting}
                          className="rounded p-1 text-mute transition-colors hover:bg-hairline-soft hover:text-ink disabled:opacity-40"
                          aria-label={`Remove ${entry.file.name}`}
                        >
                          <X className="size-4" />
                        </button>
                      )}
                    </div>

                    {entry.status === "uploading" ? (
                      <div className="mt-2 h-1 overflow-hidden rounded-full bg-hairline-soft">
                        <div
                          className="h-full rounded-full bg-primary transition-[width] duration-150"
                          style={{ width: `${entry.progress}%` }}
                        />
                      </div>
                    ) : null}

                    {entry.status === "error" && entry.error ? (
                      <p className="mt-1.5 flex items-start gap-1.5 text-[11px] leading-relaxed text-red-600">
                        <AlertCircle className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
                        {entry.error}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="contribute-name"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-mute"
              >
                Your name <span className="font-normal normal-case">(optional)</span>
              </label>
              <input
                id="contribute-name"
                type="text"
                maxLength={80}
                value={contributorName}
                onChange={(event) => setContributorName(event.target.value)}
                disabled={submitting}
                placeholder="For credit in the admin review"
                className="w-full rounded-lg border border-hairline bg-card px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-primary/60 focus:ring-2 focus:ring-primary/15 disabled:opacity-60"
              />
            </div>

            <div>
              <label
                htmlFor="contribute-description"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-mute"
              >
                Description <span className="font-normal normal-case">(optional)</span>
              </label>
              <input
                id="contribute-description"
                type="text"
                maxLength={1000}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                disabled={submitting}
                placeholder="Unit, exam type or anything helpful"
                className="w-full rounded-lg border border-hairline bg-card px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-primary/60 focus:ring-2 focus:ring-primary/15 disabled:opacity-60"
              />
            </div>
          </div>

          {/* Honeypot: hidden from real users, filled by bots. */}
          <div
            className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden"
            aria-hidden="true"
          >
            <label htmlFor="contribute-website">Website</label>
            <input
              id="contribute-website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-3 border-t border-hairline pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-1.5 text-[11px] leading-relaxed text-mute">
              <ShieldCheck className="size-3.5 shrink-0" aria-hidden="true" />
              Files go to a private Drive and stay hidden until an admin approves them.
            </p>
            <button
              type="submit"
              disabled={submitting || !uploadsEnabled || files.length === 0}
              className="btn-primary-sm justify-center py-2.5"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Uploading…
                </>
              ) : (
                <>
                  <UploadCloud className="size-4" aria-hidden="true" />
                  Submit for review
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {receipts.length > 0 ? (
        <div className="hairline-card overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-hairline bg-hairline-soft/40 px-5 py-3.5 sm:px-6">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Clock3 className="size-4 text-mute" aria-hidden="true" />
              Your recent submissions
            </h3>
            <span className="text-[11px] text-mute">Saved on this device</span>
          </div>
          <ul className="divide-y divide-hairline">
            {receipts.map((receipt) => {
              const live = statusById.get(receipt.id);
              const status = live?.status ?? "unknown";
              const badge =
                status === "approved"
                  ? { label: "Live", className: "bg-emerald-50 text-emerald-700" }
                  : status === "pending"
                    ? { label: "Pending review", className: "bg-amber-50 text-amber-700" }
                    : status === "rejected"
                      ? { label: "Not accepted", className: "bg-red-50 text-red-700" }
                      : { label: "Unavailable", className: "bg-hairline-soft text-mute" };
              return (
                <li key={receipt.id} className="flex items-center gap-3 px-5 py-3 sm:px-6">
                  <FileText className="size-4 shrink-0 text-mute" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-ink">
                      {live?.title || receipt.title}
                    </p>
                    <p className="text-[11px] text-mute">
                      Submitted{" "}
                      {new Date(receipt.createdAt).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="flex items-start gap-2 border-t border-hairline px-5 py-3 text-[11px] leading-relaxed text-mute sm:px-6">
            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            This history exists only in this browser. Approved files appear in the public library.
          </div>
        </div>
      ) : null}
    </div>
  );
}
