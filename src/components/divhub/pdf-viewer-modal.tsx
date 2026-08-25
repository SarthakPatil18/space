import { useEffect, useState } from "react";
import { Download, ExternalLink, Loader2, X, AlertCircle, FileText, Image as ImageIcon, Presentation } from "lucide-react";
import { toast } from "sonner";
import { resolveResourceUrl, type Resource } from "@/lib/divhub";

export type ModalResource = {
  id: string;
  title: string;
  file_path?: string | null;
  file_url?: string | null;
  file_size?: number | null;
} | null;

function getFileType(fileOrPath: string): "image" | "ppt" | "pdf" {
  const ext = fileOrPath.split(".").pop()?.toLowerCase() ?? "";
  if (["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(ext)) return "image";
  if (["ppt", "pptx", "key"].includes(ext)) return "ppt";
  return "pdf";
}

export function PdfViewerModal({
  resource,
  onClose,
}: {
  resource: ModalResource;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    if (!url || !resource) return;
    try {
      setDownloading(true);
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
      setDownloading(false);
    }
  }

  // Lock background scroll & handle Escape key
  useEffect(() => {
    if (!resource) return;

    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [resource, onClose]);

  // Fetch signed URL / public URL dynamically
  useEffect(() => {
    if (!resource) {
      setUrl(null);
      setError(null);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);
    setUrl(null);

    resolveResourceUrl(resource)
      .then((resolvedUrl) => {
        if (isMounted) {
          setUrl(resolvedUrl);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load document preview.",
          );
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [resource]);

  if (!resource) return null;

  const fileType = getFileType(resource.file_path || resource.title);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative flex h-screen w-screen flex-col bg-card overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-hairline px-4 py-3 sm:px-6 bg-background shrink-0">
          <div className="min-w-0 flex-1 pr-4">
            <h2 className="truncate text-base sm:text-lg font-semibold text-ink flex items-center gap-2">
              {fileType === "image" ? (
                <ImageIcon className="size-5 text-primary shrink-0" />
              ) : fileType === "ppt" ? (
                <Presentation className="size-5 text-primary shrink-0" />
              ) : (
                <FileText className="size-5 text-primary shrink-0" />
              )}
              <span className="truncate">{resource.title}</span>
            </h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {url ? (
              <>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost-sm gap-1.5 text-xs sm:text-sm"
                  title="Open in new tab"
                >
                  <ExternalLink className="size-4" />
                  <span className="hidden sm:inline">Open in new tab</span>
                </a>
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={downloading}
                  className="btn-primary-sm gap-1.5 text-xs sm:text-sm"
                >
                  {downloading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Download className="size-4" />
                  )}
                  <span className="hidden sm:inline">
                    {downloading ? "Downloading..." : "Download"}
                  </span>
                </button>
              </>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-mute hover:bg-hairline-soft hover:text-ink transition-colors"
              aria-label="Close Preview"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Modal Body Container */}
        <div className="relative flex-1 bg-black/10 w-full h-full overflow-hidden flex items-center justify-center p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-sm font-medium text-mute">Loading document preview...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center p-8 text-center max-w-md space-y-3">
              <AlertCircle className="size-10 text-destructive" />
              <h3 className="text-base font-semibold text-ink">
                Failed to load preview
              </h3>
              <p className="text-sm text-mute">{error}</p>
              <button
                type="button"
                onClick={onClose}
                className="btn-ghost-sm mt-2"
              >
                Close Preview
              </button>
            </div>
          ) : url ? (
            fileType === "image" ? (
              <div className="flex items-center justify-center h-full w-full overflow-auto">
                <img
                  src={url}
                  alt={resource.title}
                  className="max-h-full max-w-full object-contain rounded-lg shadow-2xl border border-hairline"
                />
              </div>
            ) : fileType === "ppt" ? (
              <iframe
                src={`https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`}
                title={resource.title}
                className="h-full w-full border-0 rounded"
              />
            ) : (
              <iframe
                src={url}
                title={resource.title}
                className="h-full w-full border-0"
              />
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}
