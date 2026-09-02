import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Upload,
  Trash2,
  Loader2,
  ExternalLink,
  Lock,
  LogOut,
} from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/divhub/site-header";
import { Breadcrumbs, EmptyState, SkeletonRows } from "@/components/divhub/ui-bits";
import { supabase } from "@/integrations/supabase/client";
import {
  CATEGORIES,
  CATEGORY_META,
  subjectsQuery,
  allResourcesQuery,
  type Category,
  getExamType,
  getExamYear,
  openResource,
} from "@/lib/divhub";
import {
  adminVerifySecretServer,
  adminGetSignedUploadUrlServer,
  adminInsertResourceServer,
  adminDeleteResourceServer,
} from "@/lib/divhub.server";
import { PdfViewerModal, type ModalResource } from "@/components/divhub/pdf-viewer-modal";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin Portal — SPACE" }],
  }),
  component: AdminPage,
});

function AdminPage() {
  const queryClient = useQueryClient();
  const subjects = useQuery(subjectsQuery());
  const resources = useQuery(allResourcesQuery());

  // Authentication State
  const [authToken, setAuthToken] = useState<string>("");
  const [passkeyInput, setPasskeyInput] = useState<string>("");
  const [verifying, setVerifying] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedToken = sessionStorage.getItem("space_admin_token");
      if (savedToken) setAuthToken(savedToken);
    }
  }, []);

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
  const [bulkProgress, setBulkProgress] = useState<{
    current: number;
    total: number;
    currentFileName: string;
  } | null>(null);

  function getFileExtType(filename: string): string {
    const ext = filename.split(".").pop()?.toLowerCase() ?? "";
    if (["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(ext)) return "image";
    if (["ppt", "pptx", "key"].includes(ext)) return "ppt";
    return "pdf";
  }

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    if (!passkeyInput.trim()) return;
    setVerifying(true);
    try {
      const res = await adminVerifySecretServer({ data: passkeyInput.trim() });
      if (res.success && res.token) {
        setAuthToken(res.token);
        if (typeof window !== "undefined") {
          sessionStorage.setItem("space_admin_token", res.token);
        }
        toast.success("Admin portal unlocked");
        setPasskeyInput("");
      } else {
        toast.error(res.error || "Invalid administrative passkey");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setVerifying(false);
    }
  }

  function handleLock() {
    setAuthToken("");
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("space_admin_token");
    }
    toast.info("Admin portal locked");
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
      const subject = subjects.data?.find((s) => s.id === selectedSubjectId);
      const subjectCode = subject?.code.toLowerCase() ?? "general";
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filePath = `${subjectCode}/${Date.now()}_${sanitizedName}`;

      // 1. Get signed upload URL from server using admin token
      const uploadSign = await adminGetSignedUploadUrlServer({
        data: { authToken, filePath },
      });

      // 2. Upload file directly to Supabase storage via signed upload token
      const { error: storageError } = await supabase.storage
        .from("resources")
        .uploadToSignedUrl(filePath, uploadSign.token, file, {
          cacheControl: "3600",
          upsert: true,
          contentType: file.type || "application/octet-stream",
        });

      if (storageError) {
        throw new Error(`Storage upload failed: ${storageError.message}`);
      }

      // 3. Insert record securely via server function
      await adminInsertResourceServer({
        data: {
          authToken,
          payload: {
            subject_id: selectedSubjectId,
            title: title.trim(),
            category: selectedCategory,
            file_path: filePath,
            file_type: getFileExtType(file.name),
            file_size: file.size,
            description: description.trim() || null,
            exam_type: selectedCategory === "pyqs" && examType ? examType : null,
            year: selectedCategory === "pyqs" && year ? parseInt(year, 10) : null,
          },
        },
      });

      toast.success("Resource uploaded successfully!");
      setTitle("");
      setDescription("");
      setFile(null);
      setExamType("");
      await queryClient.invalidateQueries({ queryKey: ["resources"] });
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to upload resource.");
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
    let errorCount = 0;

    const subject = subjects.data?.find((s) => s.id === selectedSubjectId);
    const subjectCode = subject?.code.toLowerCase() ?? "general";

    for (let i = 0; i < bulkFiles.length; i++) {
      const f = bulkFiles[i];
      if (!f) continue;

      setBulkProgress({
        current: i + 1,
        total,
        currentFileName: f.name,
      });

      const rawTitle = f.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ").trim();
      const autoTitle = rawTitle ? rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1) : f.name;

      const sanitizedName = f.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filePath = `${subjectCode}/${Date.now()}_${i}_${sanitizedName}`;

      try {
        const uploadSign = await adminGetSignedUploadUrlServer({
          data: { authToken, filePath },
        });

        const { error: uploadError } = await supabase.storage
          .from("resources")
          .uploadToSignedUrl(filePath, uploadSign.token, f, {
            cacheControl: "3600",
            upsert: true,
            contentType: f.type || "application/octet-stream",
          });

        if (uploadError) throw uploadError;

        let autoExamType: "mse" | "ese" | null = null;
        let autoExamYear: number | null = null;

        if (selectedCategory === "pyqs") {
          autoExamType = examType || getExamType({ title: f.name });
          autoExamYear =
            (year && year !== new Date().getFullYear().toString() ? parseInt(year, 10) : null) ||
            getExamYear({ title: f.name }) ||
            (year ? parseInt(year, 10) : null);
        }

        await adminInsertResourceServer({
          data: {
            authToken,
            payload: {
              subject_id: selectedSubjectId,
              title: autoTitle,
              category: selectedCategory,
              file_path: filePath,
              file_type: getFileExtType(f.name),
              file_size: f.size,
              exam_type: autoExamType,
              year: autoExamYear,
            },
          },
        });

        successCount++;
      } catch (err) {
        console.error(`Failed to upload ${f.name}:`, err);
        errorCount++;
      }
    }

    setUploading(false);
    setBulkProgress(null);
    setBulkFiles([]);

    if (successCount > 0) {
      toast.success(
        `Successfully uploaded ${successCount} resource${successCount > 1 ? "s" : ""}!`,
      );
      await queryClient.invalidateQueries({ queryKey: ["resources"] });
    }
    if (errorCount > 0) {
      toast.error(`Failed to upload ${errorCount} resource${errorCount > 1 ? "s" : ""}.`);
    }
  }

  async function handleDelete(id: string, filePath?: string | null) {
    if (!confirm("Are you sure you want to delete this resource?")) return;

    setDeletingId(id);
    try {
      await adminDeleteResourceServer({
        data: { authToken, id, filePath },
      });
      toast.success("Resource deleted.");
      await queryClient.invalidateQueries({ queryKey: ["resources"] });
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to delete resource.");
    } finally {
      setDeletingId(null);
    }
  }

  // Admin Passkey Gate View if unauthenticated
  if (!authToken) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <SiteHeader />
        <main className="container-page py-16 sm:py-24 flex-1 flex items-center justify-center px-4">
          <div className="hairline-card p-6 sm:p-8 max-w-md w-full space-y-6 bg-card shadow-lg border border-hairline">
            <div className="text-center space-y-2">
              <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <Lock className="size-6" />
              </div>
              <h1 className="heading-md text-ink">Admin Portal Access</h1>
              <p className="text-xs text-mute">
                This area is restricted to administrators. Enter your administrative passkey to manage resources.
              </p>
            </div>

            <form onSubmit={handleUnlock} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                  Administrative Passkey
                </label>
                <input
                  type="password"
                  value={passkeyInput}
                  onChange={(e) => setPasskeyInput(e.target.value)}
                  placeholder="Enter passkey..."
                  required
                  autoFocus
                  className="w-full rounded-md border border-hairline bg-background px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <button
                type="submit"
                disabled={verifying || !passkeyInput.trim()}
                className="btn-primary-sm w-full justify-center py-2.5 text-sm cursor-pointer disabled:opacity-50"
              >
                {verifying ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Unlock Portal"
                )}
              </button>
            </form>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  // Authenticated Admin Portal
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container-page py-10">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Admin Portal" }]} />

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="heading-lg text-ink">Admin Portal</h1>
            <p className="mt-1 text-[14px] text-mute">
              Upload resources (Single or Bulk) and manage existing files for all subjects.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="btn-ghost-sm self-start sm:self-auto">
              View Live Site
            </Link>
            <button
              type="button"
              onClick={handleLock}
              className="btn-ghost-sm text-destructive hover:text-destructive flex items-center gap-1.5"
            >
              <LogOut className="size-3.5" />
              Lock
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          {/* Upload Form (Single & Bulk) */}
          <div className="lg:col-span-5">
            <div className="hairline-card p-6 space-y-6 bg-card">
              {/* Header with Mode Switcher */}
              <div className="flex items-center justify-between border-b border-hairline pb-4">
                <h2 className="text-base font-semibold text-ink">Upload Material</h2>
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
                    {subjects.data?.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Category Selector */}
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  Category / Material Type *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat);
                        if (cat !== "pyqs") {
                          setExamType("");
                          setYear("");
                        }
                      }}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all ${
                        selectedCategory === cat
                          ? "bg-primary text-primary-foreground border-transparent font-semibold shadow-xs"
                          : "bg-card border-hairline text-ink hover:bg-hairline-soft"
                      }`}
                    >
                      <span className="text-xs font-semibold">
                        {CATEGORY_META[cat].label}
                      </span>
                      <span
                        className={`text-[10px] mt-0.5 line-clamp-1 ${
                          selectedCategory === cat
                            ? "text-primary-foreground/80"
                            : "text-mute"
                        }`}
                      >
                        {cat === "pyqs" ? "MSE & ESE Papers" : CATEGORY_META[cat].blurb}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* PYQ-Specific Configuration */}
              {selectedCategory === "pyqs" && (
                <div className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">
                      🎓 PYQ Exam Settings (Optional)
                    </span>
                    {examType || year ? (
                      <button
                        type="button"
                        onClick={() => {
                          setExamType("");
                          setYear("");
                        }}
                        className="text-[11px] font-medium text-destructive hover:underline"
                      >
                        ✕ Clear / Reset Selection
                      </button>
                    ) : (
                      <span className="text-[11px] text-mute">
                        Auto-detects from filename if unselected
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
                        Exam Type
                      </label>
                      <div className="grid grid-cols-3 gap-1">
                        <button
                          type="button"
                          onClick={() => setExamType("")}
                          className={`py-1.5 px-2 rounded-md text-[11px] font-semibold border transition-all ${
                            !examType
                              ? "bg-ink text-background border-transparent shadow-xs"
                              : "bg-card border-hairline text-mute hover:text-ink hover:bg-hairline-soft"
                          }`}
                        >
                          Auto / None
                        </button>
                        <button
                          type="button"
                          onClick={() => setExamType(examType === "mse" ? "" : "mse")}
                          className={`py-1.5 px-2 rounded-md text-[11px] font-semibold border transition-all ${
                            examType === "mse"
                              ? "bg-primary text-primary-foreground border-transparent shadow-xs"
                              : "bg-card border-hairline text-ink hover:bg-hairline-soft"
                          }`}
                        >
                          MSE
                        </button>
                        <button
                          type="button"
                          onClick={() => setExamType(examType === "ese" ? "" : "ese")}
                          className={`py-1.5 px-2 rounded-md text-[11px] font-semibold border transition-all ${
                            examType === "ese"
                              ? "bg-primary text-primary-foreground border-transparent shadow-xs"
                              : "bg-card border-hairline text-ink hover:bg-hairline-soft"
                          }`}
                        >
                          ESE
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-ink uppercase tracking-wider">
                          Paper Year
                        </label>
                        {year ? (
                          <button
                            type="button"
                            onClick={() => setYear("")}
                            className="text-[10px] text-mute hover:text-destructive"
                          >
                            Clear
                          </button>
                        ) : null}
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          min="2010"
                          max="2035"
                          value={year}
                          onChange={(e) => setYear(e.target.value)}
                          placeholder="Auto / e.g. 2019"
                          className="w-full rounded-md border border-hairline bg-card px-3 py-1.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                        />
                        {year ? (
                          <button
                            type="button"
                            onClick={() => setYear("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-mute hover:text-ink text-xs"
                            aria-label="Clear year"
                          >
                            ✕
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="block text-[11px] font-medium text-mute mb-1.5">
                      Quick select year (click active to deselect):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => setYear("")}
                        className={`rounded px-2 py-0.5 text-xs font-medium transition-all ${
                          !year
                            ? "bg-ink text-background font-semibold shadow-xs"
                            : "bg-card border border-hairline text-mute hover:text-ink hover:bg-hairline-soft"
                        }`}
                      >
                        Auto / None
                      </button>
                      {[2027, 2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017].map(
                        (yr) => (
                          <button
                            key={yr}
                            type="button"
                            onClick={() => setYear(year === yr.toString() ? "" : yr.toString())}
                            className={`rounded px-2 py-0.5 text-xs font-medium transition-all ${
                              year === yr.toString()
                                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                                : "bg-card border border-hairline text-mute hover:text-ink hover:bg-hairline-soft"
                            }`}
                          >
                            {yr}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              )}

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
                      onChange={(e) => setBulkFiles(Array.from(e.target.files ?? []))}
                      disabled={uploading}
                      className="w-full text-sm text-mute file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                    />
                  </div>

                  {bulkFiles.length > 0 ? (
                    <div className="rounded-lg border border-hairline p-3 bg-background space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-ink">
                        <span>
                          Selected {bulkFiles.length} file{bulkFiles.length > 1 ? "s" : ""}
                        </span>
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
                          const detectedType = examType || getExamType({ title: f.name });
                          const detectedYear =
                            (year && year !== new Date().getFullYear().toString() ? year : null) ||
                            getExamYear({ title: f.name }) ||
                            year;
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
                              <span className="shrink-0">{Math.round(f.size / 1024)} KB</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  {bulkProgress ? (
                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-ink space-y-1">
                      <div className="flex items-center justify-between font-semibold">
                        <span>
                          Uploading file {bulkProgress.current} of {bulkProgress.total}...
                        </span>
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
              <h2 className="heading-md flex items-center justify-between text-ink">
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
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => void openResource(r, setActiveAdminResource)}
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
