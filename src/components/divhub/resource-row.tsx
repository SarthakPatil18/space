import { Link } from "@tanstack/react-router";
import { Download, ExternalLink } from "lucide-react";
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
  const size = formatFileSize(resource.file_size);

  async function withUrl(mode: "open" | "download") {
    setBusy(mode);
    try {
      const url = await resolveResourceUrl(resource);
      if (mode === "open") {
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        const a = document.createElement("a");
        a.href = url;
        a.download = resource.title;
        a.rel = "noopener";
        a.target = "_blank";
        a.click();
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not open this file.",
      );
    } finally {
      setBusy(null);
    }
  }

  return (
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
          {resource.is_sample ? (
            <span className="rounded-full border border-hairline px-1.5 py-px font-mono text-[10px] uppercase text-faint">
              sample
            </span>
          ) : null}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={() => void withUrl("open")}
          disabled={busy !== null}
          className="btn-primary-sm"
        >
          <ExternalLink className="size-3.5" aria-hidden="true" />
          {busy === "open" ? "Opening…" : "Open"}
        </button>
        <button
          type="button"
          onClick={() => void withUrl("download")}
          disabled={busy !== null}
          className="btn-ghost-sm"
          aria-label={`Download ${resource.title}`}
        >
          <Download className="size-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">Download</span>
        </button>
      </div>
    </article>
  );
}
