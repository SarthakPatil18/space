import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Upload, Trash2, FileText, CheckCircle2, Loader2, ExternalLink, X } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/divhub/site-header";
import { Breadcrumbs, EmptyState, SkeletonRows } from "@/components/divhub/ui-bits";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import {
  CATEGORIES,
  CATEGORY_META,
  subjectsQuery,
  allResourcesQuery,
  type Category,
  formatFileSize,
  formatDate,
  getExamType,
  getExamYear,
  resolveResourceUrl,
} from "@/lib/divhub";
import { PdfViewerModal, type ModalResource } from "@/components/divhub/pdf-viewer-modal";

const getAdminClient = () => {
  const url = import.meta.env['VITE_SUPABASE_URL'];
  const key = import.meta.env['VITE_SUPABASE_SERVICE_ROLE_KEY'];
  if (url && key) {
    return createClient(url, key);
  }
  return supabase;
};

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin Portal — Upload Resources — SPACE" }],
  }),
  component: AdminPage,
});

function AdminPage() {
  const queryClient = useQueryClient();
  const subjects = useQuery(subjectsQuery());
  const resources = useQuery(allResourcesQuery());

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<Category>("notes");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeAdminResource, setActiveAdminResource] = useState<ModalResource>(null);
  const [examType, setExamType] = useState<"mse" | "ese" | "">("");
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());

  // Bulk Upload State
  const [uploadMode, setUploadMode] = useState<"bulk" | "single">("bulk");
  const [bulkFiles, setBulkFiles] = useState<File[]>([]);
  const [bulkProgress, setBulkProgress] = useState<{ current: number; total: number; currentFileName: string } | null>(null);

function getFileExtType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(ext)) return "image";
  if (["ppt", "pptx", "key"].includes(ext)) return "ppt";
  return "pdf";
}

async function insertResourceSafely(
  client: ReturnType<typeof getAdminClient>,
  payload: {
    subject_id: string;
    title: string;
    category: Category;
    file_path: string;
    file_type: string;
    file_size: number | null;
    description?: string | null;
    exam_type?: string | null;
    year?: number | null;
  }
) {
  const cleanPayload: Record<string, any> = {
    subject_id: payload.subject_id,
    title: payload.title,
    category: payload.category,
    file_path: payload.file_path,
    file_type: payload.file_type,
    file_size: payload.file_size,
    description: payload.description || null,
  };

  if (payload.exam_type) cleanPayload["exam_type"] = payload.exam_type;
  if (payload.year) cleanPayload["year"] = payload.year;

  // First try: insert payload
  let { error } = await client.from("resources").insert(cleanPayload);

  // Fallback 1: If database schema does not have exam_type/year columns yet
  if (error && (error.message?.includes("exam_type") || error.message?.includes("year") || error.code === "PGRST204")) {
    delete cleanPayload["exam_type"];
    delete cleanPayload["year"];
    const retry = await client.from("resources").insert(cleanPayload);
    error = retry.error;
  }

  // Fallback 2: If database has a strict 20MB file size check constraint
  if (error && (error.message?.includes("file_size") || error.code === "23514")) {
    cleanPayload["file_size"] = null;
    const retry = await client.from("resources").insert(cleanPayload);
    error = retry.error;
  }

  if (error) {
    throw new Error(`Database insert failed: ${error.message}`);
  }
}

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSubjectId) {
      toast.error("Please select a subject.");
      return;
    }
    if (!title.trim()) {
      toast.error("Please enter a title.");
      return;
    }
    if (!file) {
      toast.error("Please choose a file to upload.");
      return;
    }

    setUploading(true);

    try {
      const client = getAdminClient();
      const subject = subjects.data?.find((s) => s.id === selectedSubjectId);
      const subjectCode = subject?.code.toLowerCase() ?? "general";
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filePath = `${subjectCode}/${Date.now()}_${sanitizedName}`;

      // 1. Upload to Supabase Storage Bucket
      const { error: storageError } = await client.storage
        .from("resources")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
          contentType: file.type || "application/octet-stream",
        });

      if (storageError) {
        throw new Error(`Storage upload failed: ${storageError.message}`);
      }

      // 2. Insert record into database table safely
      await insertResourceSafely(client, {
        subject_id: selectedSubjectId,
        title: title.trim(),
        category: selectedCategory,
        file_path: filePath,
        file_type: getFileExtType(file.name),
        file_size: file.size,
        description: description.trim() || null,
        exam_type: selectedCategory === "pyqs" && examType ? examType : null,
        year: selectedCategory === "pyqs" && year ? parseInt(year) : null,
      });

      toast.success("Resource uploaded successfully!");
      setTitle("");
      setDescription("");
      setFile(null);
      setExamType("");
      
      // Invalidate queries so UI refreshes everywhere
      await queryClient.invalidateQueries({ queryKey: ["resources"] });
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload resource.",
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleBulkUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSubjectId) {
      toast.error("Please select a subject.");
      return;
    }
    if (bulkFiles.length === 0) {
      toast.error("Please select at least one file.");
      return;
    }

    setUploading(true);
    const total = bulkFiles.length;
    let successCount = 0;
    let failCount = 0;

    const client = getAdminClient();
    const subject = subjects.data?.find((s) => s.id === selectedSubjectId);
    const subjectCode = subject?.code.toLowerCase() ?? "general";

    for (let i = 0; i < bulkFiles.length; i++) {
      const f = bulkFiles[i];
      if (!f) continue;
      setBulkProgress({ current: i + 1, total, currentFileName: f.name });

      const rawTitle = f.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ").trim();
      const derivedTitle = rawTitle ? rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1) : f.name;
      const sanitizedName = f.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filePath = `${subjectCode}/${Date.now()}_${i}_${sanitizedName}`;

      try {
        const { error: storageError } = await client.storage
          .from("resources")
          .upload(filePath, f, {
            cacheControl: "3600",
            upsert: true,
            contentType: f.type || "application/octet-stream",
          });

        if (storageError) throw storageError;

        let derivedExamType: "mse" | "ese" | null = null;
        let derivedYear: number | null = null;

        if (selectedCategory === "pyqs") {
          derivedExamType = getExamType({ title: f.name });
          derivedYear = getExamYear({ title: f.name });
        }

        await insertResourceSafely(client, {
          subject_id: selectedSubjectId,
          title: derivedTitle,
          category: selectedCategory,
          file_path: filePath,
          file_type: getFileExtType(f.name),
          file_size: f.size,
          exam_type: derivedExamType,
          year: derivedYear,
        });

        successCount++;
      } catch (err) {
        console.error(`Failed to upload ${f.name}:`, err);
        failCount++;
      }
    }

    setUploading(false);
    setBulkProgress(null);
    setBulkFiles([]);

    if (successCount > 0) {
      toast.success(`Successfully uploaded ${successCount} resource${successCount > 1 ? "s" : ""}!`);
      await queryClient.invalidateQueries({ queryKey: ["resources"] });
    }

    if (failCount > 0) {
      toast.error(`Failed to upload ${failCount} resource${failCount > 1 ? "s" : ""}.`);
    }
  }

  async function handleDelete(resourceId: string, filePath: string | null) {
    if (!confirm("Are you sure you want to delete this resource?")) return;

    setDeletingId(resourceId);
    try {
      const client = getAdminClient();
      // 1. Remove from database
      const { error: dbError } = await client
        .from("resources")
        .delete()
        .eq("id", resourceId);

      if (dbError) throw dbError;

      // 2. If storage path exists, remove file
      if (filePath) {
        await client.storage.from("resources").remove([filePath]);
      }

      toast.success("Resource deleted.");
      await queryClient.invalidateQueries({ queryKey: ["resources"] });
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete resource.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container-page py-10">
        <Breadcrumbs
          items={[
            { label: "Home", to: "/" },
            { label: "Admin Portal" },
          ]}
        />

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="heading-lg">Admin Portal</h1>
            <p className="mt-1 text-[14px] text-mute">
              Upload resources (Single or Bulk) and manage existing files for all subjects.
            </p>
          </div>
          <Link to="/" className="btn-ghost-sm self-start sm:self-auto">
            View Live Site
          </Link>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          {/* Upload Card */}
          <div className="lg:col-span-5">
            <div className="hairline-card p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-hairline pb-4">
                <h2 className="text-base font-semibold text-ink">Upload Material</h2>
                
                {/* Upload Mode Switcher */}
                <div className="flex items-center gap-1 bg-background border border-hairline rounded-lg p-0.5 text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setUploadMode("bulk")}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      uploadMode === "bulk"
                        ? "bg-card text-ink font-semibold shadow-xs"
                        : "text-mute hover:text-ink"
                    }`}
                  >
                    Bulk Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMode("single")}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      uploadMode === "single"
                        ? "bg-card text-ink font-semibold shadow-xs"
                        : "text-mute hover:text-ink"
                    }`}
                  >
                    Single File
                  </button>
                </div>
              </div>

              {/* Subject Selector */}
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  Subject *
                </label>
                {subjects.isPending ? (
                  <div className="h-10 animate-pulse rounded-md bg-hairline" />
                ) : (
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    required
                    className="w-full rounded-md border border-hairline bg-background px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select a subject...</option>
                    {subjects.data?.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name} ({subject.code})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  Category / Type *
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as Category)}
                  required
                  className="w-full rounded-md border border-hairline bg-background px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {CATEGORY_META[c].label} — {CATEGORY_META[c].blurb}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bulk Mode Form */}
              {uploadMode === "bulk" ? (
                <form onSubmit={handleBulkUpload} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1.5">
                      Select Files * (PDF, PPT, PPTX, Photos - Multi-selection allowed)
                    </label>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.ppt,.pptx,.jpg,.jpeg,.png,.webp,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,image/*"
                      onChange={(e) =>
                        setBulkFiles(Array.from(e.target.files ?? []))
                      }
                      disabled={uploading}
                      className="w-full text-sm text-mute file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                    />
                  </div>

                  {/* Selected Files Preview List */}
                  {bulkFiles.length > 0 ? (
                    <div className="rounded-lg border border-hairline p-3 bg-background space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-ink">
                        <span>Selected {bulkFiles.length} file{bulkFiles.length > 1 ? "s" : ""}</span>
                        <button
                          type="button"
                          onClick={() => setBulkFiles([])}
                          className="text-mute hover:text-destructive transition-colors"
                        >
                          Clear all
                        </button>
                      </div>
                      <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                        {bulkFiles.map((f, index) => {
                          const detectedType = getExamType({ title: f.name });
                          const detectedYear = getExamYear({ title: f.name });
                          return (
                            <div
                              key={index}
                              className="flex items-center justify-between text-xs text-mute py-1 border-b border-hairline/50 last:border-0"
                            >
                              <div className="flex items-center gap-1.5 min-w-0 pr-2">
                                <span className="truncate max-w-[160px] sm:max-w-[220px] font-medium text-ink">
                                  {f.name}
                                </span>
                                {selectedCategory === "pyqs" && detectedType ? (
                                  <span className="shrink-0 font-bold px-1.5 py-0.5 rounded text-[10px] bg-primary/10 text-primary uppercase">
                                    {detectedType.toUpperCase()}
                                  </span>
                                ) : null}
                                {selectedCategory === "pyqs" && detectedYear ? (
                                  <span className="shrink-0 font-semibold px-1.5 py-0.5 rounded text-[10px] bg-hairline text-ink">
                                    {detectedYear}
                                  </span>
                                ) : null}
                              </div>
                              <span className="shrink-0">{formatFileSize(f.size)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  {/* Progress Banner */}
                  {bulkProgress ? (
                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-ink space-y-1">
                      <div className="flex items-center justify-between font-semibold">
                        <span>Uploading file {bulkProgress.current} of {bulkProgress.total}...</span>
                        <span>{Math.round((bulkProgress.current / bulkProgress.total) * 100)}%</span>
                      </div>
                      <p className="truncate text-mute">{bulkProgress.currentFileName}</p>
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={uploading || bulkFiles.length === 0}
                    className="btn-primary-sm w-full justify-center py-2.5 text-sm"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Uploading {bulkProgress ? `${bulkProgress.current}/${bulkProgress.total}` : "..."}
                      </>
                    ) : (
                      <>
                        <Upload className="size-4" />
                        Upload {bulkFiles.length > 0 ? `${bulkFiles.length} File${bulkFiles.length > 1 ? "s" : ""}` : "Files"} in Bulk
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Single File Mode Form */
                <form onSubmit={handleUpload} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1.5">
                      Resource Title *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Unit 1 — Asymptotic Notation Notes or MSE 2019 Paper"
                      value={title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTitle(val);
                        if (selectedCategory === "pyqs") {
                          const dt = getExamType({ title: val });
                          if (dt && !examType) setExamType(dt);
                          const dy = getExamYear({ title: val });
                          if (dy) setYear(dy.toString());
                        }
                      }}
                      required
                      className="w-full rounded-md border border-hairline bg-background px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink mb-1.5">
                      Description (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Short description for students..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full rounded-md border border-hairline bg-background px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {selectedCategory === "pyqs" && (
                    <div className="space-y-3 rounded-lg border border-hairline p-3 bg-background/50">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
                            Exam Type *
                          </label>
                          <select
                            value={examType}
                            onChange={(e) => setExamType(e.target.value as "mse" | "ese" | "")}
                            required
                            className="w-full rounded-md border border-hairline bg-background px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="">Select exam type...</option>
                            <option value="mse">Mid Semester Exam (MSE)</option>
                            <option value="ese">End Semester Exam (ESE)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
                            Exam Year *
                          </label>
                          <input
                            type="number"
                            min="2010"
                            max="2035"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            required
                            className="w-full rounded-md border border-hairline bg-background px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>

                      {/* Quick Year Selection Pills */}
                      <div>
                        <span className="block text-[11px] font-medium text-mute mb-1.5">
                          Quick select year:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {[2027, 2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017].map((yr) => (
                            <button
                              key={yr}
                              type="button"
                              onClick={() => setYear(yr.toString())}
                              className={`rounded px-2 py-0.5 text-xs font-medium transition-all ${
                                year === yr.toString()
                                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                                  : "bg-card border border-hairline text-mute hover:text-ink hover:bg-hairline-soft"
                              }`}
                            >
                              {yr}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-ink mb-1.5">
                      File * (PDF, PPT, PPTX, Photo - Max 50MB)
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.ppt,.pptx,.jpg,.jpeg,.png,.webp,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0] ?? null;
                        setFile(f);
                        if (f) {
                          if (!title) {
                            const rawTitle = f.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ").trim();
                            setTitle(rawTitle ? rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1) : f.name);
                          }
                          if (selectedCategory === "pyqs") {
                            const dt = getExamType({ title: f.name });
                            if (dt) setExamType(dt);
                            const dy = getExamYear({ title: f.name });
                            if (dy) setYear(dy.toString());
                          }
                        }
                      }}
                      required
                      className="w-full text-sm text-mute file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={uploading}
                    className="btn-primary-sm w-full justify-center py-2.5 text-sm"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="size-4" />
                        Upload Resource
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Manage Existing Resources */}
          <div className="lg:col-span-7">
            <div className="hairline-card p-6 space-y-4 bg-card">
              <h2 className="heading-md flex items-center justify-between">
                <span>Uploaded Resources ({resources.data?.length ?? 0})</span>
              </h2>

              {resources.isPending ? (
                <SkeletonRows count={4} />
              ) : !resources.data || resources.data.length === 0 ? (
                <EmptyState
                  title="No uploaded resources yet"
                  description="Use the form on the left to upload your first note or PYQ."
                />
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {resources.data.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-hairline p-3 hover:bg-hairline-soft"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">
                          {r.title}
                        </p>
                        <p className="mt-0.5 text-xs text-mute flex items-center gap-2">
                          <span className="font-semibold text-body">
                            {r.subjects?.code ?? "General"}
                          </span>
                          <span>·</span>
                          <span>{CATEGORY_META[r.category]?.label}</span>
                          <span>·</span>
                          <span>{formatFileSize(r.file_size) ?? "PDF"}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setActiveAdminResource(r)}
                          className="btn-primary-sm py-1 px-2.5 text-xs"
                          title="Preview PDF"
                        >
                          <ExternalLink className="size-3.5" />
                          Open
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(r.id, r.file_path)}
                          disabled={deletingId === r.id}
                          className="rounded p-1.5 text-mute hover:bg-destructive/10 hover:text-destructive transition-colors"
                          title="Delete resource"
                        >
                          {deletingId === r.id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Trash2 className="size-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
      <PdfViewerModal
        resource={activeAdminResource}
        onClose={() => setActiveAdminResource(null)}
      />
    </div>
  );
}
