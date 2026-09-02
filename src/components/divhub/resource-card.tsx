import { Link } from "@tanstack/react-router";
import { Download, ExternalLink, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  CATEGORY_META,
  getExamType,
  getExamYear,
  getSubjectColor,
  resolveResourceUrl,
} from "@/lib/divhub";
import { PdfViewerModal, type ModalResource } from "./pdf-viewer-modal";
import type { ResourceWithSubject } from "./resource-row";

export function ResourceCard({
  resource,
  showSubject = false,
  showCategory = false,
}: {
  resource: ResourceWithSubject;
  showSubject?: boolean;
  showCategory?: boolean;
}) {
  const [busy, setBusy] = useState<"download" | null>(null);
  const [activeModalResource, setActiveModalResource] =
    useState<ModalResource>(null);

  const subjectColor = getSubjectColor(resource.subjects);
  const examType = getExamType(resource);
  const examYear = getExamYear(resource);

  async function handleDownload() {
    try {
      setBusy("download");
      const url = await resolveResourceUrl(resource);
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch file");
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      const fileExt = resource.file_path?.split(".").pop() || "pdf";
      a.download = resource.title.toLowerCase().endsWith(`.${fileExt}`)
        ? resource.title
        : `${resource.title}.${fileExt}`;
      a.click();
      URL.revokeObjectURL(blobUrl);
      toast.success("Download started");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not download this file.",
      );
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <article
        className="hairline-card group relative flex flex-col justify-between h-full overflow-hidden p-4 sm:p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-float bg-card"
        style={{
          borderTopWidth: "3px",
          borderTopColor: subjectColor,
        }}
      >
        {/* Top Content Area */}
        <div className="flex flex-col flex-1">
          {/* Header Tag / Badge Strip */}
          <div className="flex items-center justify-between gap-2 min-h-[26px]">
            <div className="flex flex-wrap items-center gap-1.5">
              {examType ? (
                <span
                  className="rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider shadow-2xs"
                  style={{
                    backgroundColor: `${subjectColor}18`,
                    color: subjectColor,
                  }}
                >
                  {examType.toUpperCase()}
                </span>
              ) : null}

              {examYear ? (
                <span className="rounded-md border border-hairline bg-hairline-soft/60 px-2 py-0.5 text-[11px] font-semibold text-ink">
                  {examYear}
                </span>
              ) : null}

              {!examType && !examYear && resource.category ? (
                <span
                  className="rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide"
                  style={{
                    backgroundColor: `${subjectColor}15`,
                    color: subjectColor,
                  }}
                >
                  {CATEGORY_META[resource.category]?.label ?? resource.category}
                </span>
              ) : null}
            </div>

            {showCategory && resource.category && (examType || examYear) ? (
              <span className="text-[11px] font-medium text-mute">
                {CATEGORY_META[resource.category]?.label ?? resource.category}
              </span>
            ) : null}
          </div>

          {/* Subject Link (if enabled) */}
          {showSubject && resource.subjects ? (
            <div className="mt-2">
              <Link
                to="/subjects/$subjectId/$category"
                params={{ subjectId: resource.subjects.id, category: "notes" }}
                className="inline-block text-xs font-semibold hover:opacity-80 transition-opacity"
                style={{ color: subjectColor }}
              >
                {resource.subjects.name}
              </Link>
            </div>
          ) : null}

          {/* Resource Title */}
          <h3
            className="mt-2.5 text-[15px] font-semibold leading-snug tracking-tight text-ink line-clamp-2 min-h-[42px] group-hover:text-primary transition-colors cursor-pointer"
            onClick={() => setActiveModalResource(resource)}
            title={resource.title}
          >
            {resource.title}
          </h3>

          {/* Description snippet if present */}
          {resource.description ? (
            <p className="mt-1 text-xs text-mute line-clamp-1">
              {resource.description}
            </p>
          ) : null}
        </div>

        {/* Card Footer Actions (Pinned to bottom) */}
        <div className="mt-4 pt-3.5 border-t border-hairline">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setActiveModalResource(resource)}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-ink text-background px-3 py-2 text-xs font-semibold shadow-2xs hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
            >
              <ExternalLink className="size-3.5" aria-hidden="true" />
              Open
            </button>
            <button
              type="button"
              onClick={() => void handleDownload()}
              disabled={busy !== null}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-hairline bg-card hover:bg-hairline-soft text-ink px-3 py-2 text-xs font-medium shadow-2xs active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
              aria-label={`Download ${resource.title}`}
            >
              {busy ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Download className="size-3.5" aria-hidden="true" />
              )}
              <span>Download</span>
            </button>
          </div>
        </div>
      </article>

      {/* PDF / Document Modal Preview */}
      <PdfViewerModal
        resource={activeModalResource}
        onClose={() => setActiveModalResource(null)}
      />
    </>
  );
}
