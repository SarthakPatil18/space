import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, Loader2, FileText, X } from "lucide-react";
import { useState, useRef, useEffect, type FormEvent } from "react";
import { searchQuery, CATEGORY_META, openResource } from "@/lib/divhub";
import { PdfViewerModal, type ModalResource } from "./pdf-viewer-modal";

export function SearchBox({
  initialValue = "",
  autoFocus = false,
  large = false,
}: {
  initialValue?: string;
  autoFocus?: boolean;
  large?: boolean;
}) {
  const navigate = useNavigate();
  const [value, setValue] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(false);
  const [activePdf, setActivePdf] = useState<ModalResource>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Live search query fetching matching subjects and resources as user types
  const search = useQuery(searchQuery(value));

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const q = value.trim();
    if (!q) return;
    setIsOpen(false);
    void navigate({ to: "/search", search: { q } });
  }

  function handleClear() {
    setValue("");
    setIsOpen(false);
  }

  return (
    <>
      <div ref={containerRef} className="relative w-full">
        <form onSubmit={onSubmit} role="search" className="w-full">
          <label htmlFor="divhub-search" className="sr-only">
            Search notes, files, PYQs and syllabus
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-mute"
              aria-hidden="true"
            />
            <input
              id="divhub-search"
              name="q"
              type="text"
              autoFocus={autoFocus}
              value={value}
              onFocus={() => setIsOpen(true)}
              onChange={(e) => {
                setValue(e.target.value);
                setIsOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") setIsOpen(false);
              }}
              placeholder="Search subjects, notes, linear algebra, PYQs..."
              className={`w-full rounded-xl border border-hairline bg-card pl-10 pr-24 text-ink placeholder:text-mute focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                large ? "h-12 text-[15px]" : "h-10 text-sm"
              }`}
            />

            {value ? (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-20 top-1/2 -translate-y-1/2 rounded-full p-1 text-mute hover:text-ink transition-colors"
                aria-label="Clear search query"
              >
                <X className="size-3.5" />
              </button>
            ) : null}

            <button
              type="submit"
              className="absolute right-1.5 top-1/2 h-8 -translate-y-1/2 rounded-lg bg-primary px-3 text-xs sm:text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Search
            </button>
          </div>
        </form>

        {/* As-You-Type Live Suggestions Dropdown */}
        {isOpen && value.trim().length > 0 ? (
          <div className="absolute left-0 right-0 top-full z-40 mt-2 max-h-[70vh] overflow-y-auto rounded-xl border border-hairline bg-card p-2 shadow-2xl animate-in fade-in duration-150">
            {search.isPending ? (
              <div className="p-4 text-center text-xs text-mute flex items-center justify-center gap-2">
                <Loader2 className="size-4 animate-spin text-primary" />
                <span>Searching matching subjects & files...</span>
              </div>
            ) : !search.data ||
              (search.data.subjects.length === 0 &&
                search.data.resources.length === 0) ? (
              <div className="p-4 text-center text-xs text-mute">
                No matching subjects or resources for "{value}"
              </div>
            ) : (
              <div className="space-y-3">
                {/* Matching Subjects Section */}
                {search.data.subjects.length > 0 ? (
                  <div>
                    <p className="eyebrow px-3 py-1.5 text-[11px] font-semibold text-mute">
                      Subjects
                    </p>
                    <div className="space-y-0.5">
                      {search.data.subjects.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setIsOpen(false);
                            void navigate({
                              to: "/subjects/$subjectId/$category",
                              params: { subjectId: s.id, category: "notes" },
                            });
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 text-left text-sm rounded-lg hover:bg-hairline-soft transition-colors"
                        >
                          <span className="font-semibold text-ink">
                            {s.name}
                          </span>
                          <span className="eyebrow text-[10px] bg-hairline-soft px-2 py-0.5 rounded">
                            {s.code}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Matching Resources Section */}
                {search.data.resources.length > 0 ? (
                  <div>
                    <p className="eyebrow px-3 py-1.5 text-[11px] font-semibold text-mute">
                      Resources & Files
                    </p>
                    <div className="space-y-0.5">
                      {search.data.resources.map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => {
                            setIsOpen(false);
                            void openResource(r, setActivePdf);
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 text-left text-sm rounded-lg hover:bg-hairline-soft transition-colors group"
                        >
                          <div className="min-w-0 flex-1 pr-3">
                            <p className="font-medium text-ink truncate group-hover:text-primary">
                              {r.title}
                            </p>
                            <p className="text-xs text-mute truncate flex items-center gap-1.5">
                              <span>{r.subjects?.name ?? "Resource"}</span>
                              <span>·</span>
                              <span>
                                {CATEGORY_META[r.category]?.label ?? r.category}
                              </span>
                            </p>
                          </div>
                          <FileText className="size-4 text-mute shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Full-Screen PDF Viewer Overlay when selecting a file directly from suggestions */}
      <PdfViewerModal
        resource={activePdf}
        onClose={() => setActivePdf(null)}
      />
    </>
  );
}
