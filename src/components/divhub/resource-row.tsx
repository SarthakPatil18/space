import { Link } from "@tanstack/react-router";
import { Download, ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  CATEGORY_META,
  formatDate,
  formatFileSize,
  getSubjectColor,
  resolveResourceUrl,
  type Resource,
} from "@/lib/divhub";
import { FileIcon } from "./ui-bits";
import { PdfViewerModal, type ModalResource } from "./pdf-viewer-modal";

export type ResourceWithSubject = Resource & {
  subjects?: { id: string; name: string; code: string; color?: string | null } | null;
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
  const [busy, setBusy] = useState<"download" | null>(null);
  const [activeModalResource, setActiveModalResource] =
    useState<ModalResource>(null);

  const size = formatFileSize(resource.file_size);
  const subjectColor = getSubjectColor(resource.subjects);

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
      const ext = resource.file_path?.split(".").pop() || "pdf";
      a.download = resource.title.toLowerCase().endsWith(`.${ext}`)
        ? resource.title
        : `${resource.title}.${ext}`;
      a.click();
      URL.revokeObjectURL(blobUrl);
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
      <article className="hairline-card flex flex-col gap-3 p-4 transition-shadow hover:shadow-whisper sm:flex-row sm:items-center sm:gap-4">
        <FileIcon type={resource.file_type} color={subjectColor} />

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-medium text-ink">
            {resource.title}
          </h3>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-mute">
            {showSubject && resource.subjects ? (
              <>
                <Link
                  to="/subjects/$subjectId/$category"
                  params={{ subjectId: resource.subjects.id, category: "notes" }}
                  className="rounded px-1.5 py-0.5 text-xs font-semibold hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: `${subjectColor}15`, color: subjectColor }}
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
            onClick={() => setActiveModalResource(resource)}
            className="btn-primary-sm"
          >
            <ExternalLink className="size-3.5" aria-hidden="true" />
            Open
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

      {/* Google Drive-Style Modal PDF Overlay */}
      <PdfViewerModal
        resource={activeModalResource}
        onClose={() => setActiveModalResource(null)}
      />
    </>
  );
}
