import { Link } from "@tanstack/react-router";
import { Download, ExternalLink, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  CATEGORY_META,
  formatDate,
  formatFileSize,
  resolveResourceUrl,
  type Resource,
} from "@/lib/divhub";
import { FileIcon } from "./ui-bits";

export type ResourceWithSubject = Resource & {
  subjects?: { id: string; name: string; code: string } | null;
};

export function ResourceRow({
  resource,
  showSubject = false,
  showCategory = false,
}: {
  resource: ResourceWithSubject;
  showSubject?: boolean;
  showCategory?: boolean;
}) {
  const [busy, setBusy] = useState<"open" | "download" | null>(null);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [viewerError, setViewerError] = useState<string | null>(null);
  const size = formatFileSize(resource.file_size);

  async function handleOpen() {
    // Always regenerate the signed URL (it expires in 1 hour)
    setBusy("open");
    setViewerError(null);
    try {
      const url = await resolveResourceUrl(resource);
      setViewerUrl(url);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Could not load this file.";
      setViewerError(msg);
      toast.error(msg);
    } finally {
      setBusy(null);
    }
  }

  async function handleDownload() {
    setBusy("download");
    try {
      const url = await resolveResourceUrl(resource);
      const a = document.createElement("a");
      a.href = url;
      a.download = resource.title;
      a.rel = "noopener";
      a.target = "_blank";
      a.click();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not download this file.",
      );
    } finally {
      setBusy(null);
    }
  }

  function handleClose() {
    setViewerUrl(null);
    setViewerError(null);
  }

  return (
    <>
      <article className="hairline-card flex flex-col gap-3 p-4 transition-shadow hover:shadow-whisper sm:flex-row sm:items-center sm:gap-4">
        <FileIcon type={resource.file_type} />

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-medium text-ink">
            {resource.title}
          </h3>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-mute">
            {showSubject && resource.subjects ? (
              <>
                <Link
                  to="/subjects/$subjectId"
                  params={{ subjectId: resource.subjects.id }}
                  className="rounded-sm text-body hover:text-ink"
                >
                  {resource.subjects.name}
                </Link>
                <span aria-hidden="true">·</span>
              </>
            ) : null}
            {showCategory ? (
              <>
                <span>{CATEGORY_META[resource.category].label}</span>
                <span aria-hidden="true">·</span>
              </>
            ) : null}
            {size ? (
              <>
                <span>{size}</span>
                <span aria-hidden="true">·</span>
              </>
            ) : null}
            <span>{formatDate(resource.created_at)}</span>
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => void handleOpen()}
            disabled={busy !== null}
            className="btn-primary-sm"
          >
            <ExternalLink className="size-3.5" aria-hidden="true" />
            {busy === "open" ? "Loading…" : "Open"}
          </button>
          <button
            type="button"
            onClick={() => void handleDownload()}
            disabled={busy !== null}
            className="btn-ghost-sm"
            aria-label={`Download ${resource.title}`}
          >
            <Download className="size-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>
      </article>

      {/* Inline PDF Viewer */}
      {viewerUrl ? (
        <div className="mt-2 mb-4 rounded-lg border border-hairline overflow-hidden bg-background">
          <div className="flex items-center justify-between px-4 py-2 border-b border-hairline bg-card">
            <span className="text-sm font-medium text-ink truncate pr-4">
              {resource.title}
            </span>
            <div className="flex items-center gap-3 shrink-0">
              <a
                href={viewerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                <ExternalLink className="size-3.5" />
                Open in new tab
              </a>
              <button
                type="button"
                onClick={handleClose}
                className="rounded p-1 text-mute hover:text-ink hover:bg-hairline-soft transition-colors"
                aria-label="Close viewer"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
          <iframe
            src={viewerUrl}
            title={resource.title}
            style={{ width: "100%", height: "90vh", border: "none" }}
          />
        </div>
      ) : null}

      {/* Error state */}
      {viewerError ? (
        <div className="mt-2 mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {viewerError}
        </div>
      ) : null}
    </>
  );
}
