import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Upload, Trash2, FileText, CheckCircle2, Loader2 } from "lucide-react";
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
} from "@/lib/divhub";

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
          contentType: file.type || "application/pdf",
        });

      if (storageError) {
        throw new Error(`Storage upload failed: ${storageError.message}`);
      }

      // 2. Insert record into database table
      const { error: dbError } = await client.from("resources").insert({
        subject_id: selectedSubjectId,
        title: title.trim(),
        category: selectedCategory,
        file_path: filePath,
        file_type: "pdf",
        file_size: file.size,
        description: description.trim() || null,
      });

      if (dbError) {
        throw new Error(`Database insert failed: ${dbError.message}`);
      }

      toast.success("Resource uploaded successfully!");
      setTitle("");
      setDescription("");
      setFile(null);
      
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
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Admin Portal" }]} />
        
        <div className="flex flex-col gap-1">
          <p className="eyebrow">Admin Dashboard</p>
          <h1 className="heading-lg">Upload Academic Resources</h1>
          <p className="text-[15px] text-body max-w-xl">
            Select a subject, choose a PDF file, and upload. Files will instantly appear for students across the website.
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          {/* Upload Form */}
          <div className="lg:col-span-5">
            <form
              onSubmit={handleUpload}
              className="hairline-card p-6 space-y-5 bg-card"
            >
              <h2 className="heading-md flex items-center gap-2">
                <Upload className="size-5 text-primary" />
                Upload New PDF
              </h2>

              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  Subject *
                </label>
                {subjects.isPending ? (
                  <div className="h-10 animate-pulse rounded-md bg-hairline-soft" />
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
                  Category *
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

              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  Resource Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Unit 1 — Asymptotic Notation Notes"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
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
                  PDF File * (Max 20MB)
                </label>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
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
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
