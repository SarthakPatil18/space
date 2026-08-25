import { useEffect, useState } from "react";
import { Download, ExternalLink, Loader2, X, AlertCircle } from "lucide-react";
import { resolveResourceUrl, type Resource } from "@/lib/divhub";

export type ModalResource = {
  id: string;
  title: string;
  file_path?: string | null;
  file_url?: string | null;
  file_size?: number | null;
} | null;

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

  // Requirement 5 & 10: Lock background scroll & handle Escape key
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

  // Requirement 1, 5, 6 & 7: Fetch signed URL dynamically without caching
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
            err instanceof Error ? err.message : "Failed to load PDF preview.",
          );
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [resource]);

  if (!resource) return null;

  return (
    // Requirement 2 & 5: Dark semi-transparent backdrop covering viewport; click backdrop to close
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative flex h-full w-full max-w-6xl flex-col rounded-xl bg-card border border-hairline shadow-2xl overflow-hidden sm:h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Requirement 4: Modal header/toolbar with title, fallback link, download, and close button */}
        <div className="flex items-center justify-between border-b border-hairline px-4 py-3 sm:px-6 bg-background shrink-0">
          <div className="min-w-0 flex-1 pr-4">
            <h2 className="truncate text-base sm:text-lg font-semibold text-ink">
              {resource.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {url ? (
              <>
                {/* Requirement 4: Required fallback link for mobile browsers/webviews */}
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
                <a
                  href={url}
                  download={resource.title}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary-sm gap-1.5 text-xs sm:text-sm"
                >
                  <Download className="size-4" />
                  <span className="hidden sm:inline">Download</span>
                </a>
              </>
            ) : null}
            {/* Requirement 5: X close button */}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-mute hover:bg-hairline-soft hover:text-ink transition-colors"
              aria-label="Close PDF Preview"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Modal Body Container */}
        <div className="relative flex-1 bg-black/5 w-full h-full overflow-hidden flex items-center justify-center">
          {/* Requirement 6: Loading state spinner */}
          {loading ? (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-sm font-medium text-mute">Loading PDF preview...</p>
            </div>
          ) : error ? (
            /* Requirement 7: Clear error state with available close button */
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
            /* Requirement 3: Render in native browser <iframe> */
            <iframe
              src={url}
              title={resource.title}
              className="h-full w-full border-0"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
