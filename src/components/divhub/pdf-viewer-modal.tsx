import { Download, ExternalLink, X } from "lucide-react";
import { useEffect } from "react";
import { formatFileSize } from "@/lib/divhub";

export type ActivePdf = {
  title: string;
  url: string;
  file_size?: number | null | undefined;
} | null;

export function PdfViewerModal({
  pdf,
  onClose,
}: {
  pdf: ActivePdf;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (pdf) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [pdf, onClose]);

  if (!pdf) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex h-[92vh] w-full max-w-5xl flex-col rounded-xl bg-card border border-hairline shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-hairline px-4 py-3 sm:px-6 bg-background shrink-0">
          <div className="min-w-0 flex-1 pr-3">
            <h2 className="truncate text-base sm:text-lg font-semibold text-ink">
              {pdf.title}
            </h2>
            {pdf.file_size ? (
              <p className="text-xs text-mute mt-0.5">
                {formatFileSize(pdf.file_size)} PDF Document
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <a
              href={pdf.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost-sm gap-1.5 text-xs sm:text-sm"
              title="Open full page PDF"
            >
              <ExternalLink className="size-4" />
              <span className="hidden sm:inline">Full Page</span>
            </a>
            <a
              href={pdf.url}
              download={pdf.title}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary-sm gap-1.5 text-xs sm:text-sm"
            >
              <Download className="size-4" />
              <span className="hidden sm:inline">Download</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-mute hover:bg-hairline-soft hover:text-ink transition-colors"
              aria-label="Close PDF Viewer"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* PDF Render Container */}
        <div className="relative flex-1 bg-black/5 w-full h-full overflow-hidden">
          <object
            data={pdf.url}
            type="application/pdf"
            className="h-full w-full border-0"
          >
            <iframe
              src={pdf.url}
              title={pdf.title}
              className="h-full w-full border-0"
            >
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <p className="text-sm text-mute mb-4">
                  Your browser does not support inline PDF viewing.
                </p>
                <a
                  href={pdf.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary-sm"
                >
                  <ExternalLink className="size-4 mr-2" />
                  Open PDF Directly
                </a>
              </div>
            </iframe>
          </object>
        </div>
      </div>
    </div>
  );
}
