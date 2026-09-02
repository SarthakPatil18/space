import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  Filter,
  Search,
  X,
  LayoutGrid,
  List,
  Sparkles,
  Layers,
  FileCheck,
} from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/divhub/site-header";
import { ResourceRow, type ResourceWithSubject } from "@/components/divhub/resource-row";
import { ResourceCard } from "@/components/divhub/resource-card";
import { ViewModeToggle } from "@/components/divhub/view-mode-toggle";
import {
  Breadcrumbs,
  EmptyState,
  ErrorState,
  SkeletonRows,
} from "@/components/divhub/ui-bits";
import {
  CATEGORIES,
  CATEGORY_META,
  getExamType,
  getExamYear,
  getSubjectColor,
  isCategory,
  subjectQuery,
  subjectResourcesQuery,
} from "@/lib/divhub";

export const Route = createFileRoute("/subjects/$subjectId/$category")({
  head: () => ({
    meta: [
      { title: "Subject material — SPACE" },
      {
        name: "description",
        content:
          "Open or download notes, files, previous year questions and syllabus for this subject.",
      },
      { property: "og:title", content: "Subject material — SPACE" },
      {
        property: "og:description",
        content: "Open or download material for this subject in one click.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CategoryPage,
});

function CategoryPage() {
  const { subjectId, category } = Route.useParams();
  const subject = useQuery(subjectQuery(subjectId));
  const resources = useQuery(subjectResourcesQuery(subjectId));
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");
  const [selectedExamTypeTab, setSelectedExamTypeTab] = useState<"all" | "mse" | "ese">("all");

  const [viewMode, setViewMode] = useState<"grid" | "list">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("divhub_view_mode");
      if (saved === "grid" || saved === "list") return saved;
    }
    return "grid";
  });

  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("divhub_view_mode", mode);
    }
  };

  const valid = isCategory(category);
  const allResources = resources.data ?? [];
  const subjectColor = getSubjectColor(subject.data);
  const categoryResources = valid
    ? allResources.filter((r) => r.category === category)
    : [];

  // Extract all unique years available in PYQs for this subject
  const availableYears = useMemo(() => {
    if (category !== "pyqs") return [];
    const years = new Set<number>();
    for (const r of categoryResources) {
      const y = getExamYear(r);
      if (y) years.add(y);
    }
    if (years.size === 0) {
      [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017].forEach((y) => years.add(y));
    }
    return Array.from(years).sort((a, b) => b - a);
  }, [category, categoryResources]);

  const query = searchQuery.trim().toLowerCase();
  const list = query
    ? allResources.filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          (r.file_path && r.file_path.toLowerCase().includes(query)) ||
          (r.description && r.description.toLowerCase().includes(query)),
      )
    : categoryResources;

  // Apply Year and Exam Type filters for PYQs
  const filteredList = list.filter((r) => {
    if (category !== "pyqs") return true;
    if (selectedYear !== "all") {
      const yr = getExamYear(r);
      if (yr !== selectedYear) return false;
    }
    if (selectedExamTypeTab !== "all") {
      const et = getExamType(r);
      if (et !== selectedExamTypeTab) return false;
    }
    return true;
  });

  function renderResourceList(items: ResourceWithSubject[]) {
    if (viewMode === "grid") {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
          {items.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              showCategory={Boolean(query)}
            />
          ))}
        </div>
      );
    }
    return (
      <div className="space-y-2.5">
        {items.map((resource) => (
          <ResourceRow
            key={resource.id}
            resource={resource}
            showCategory={Boolean(query)}
          />
        ))}
      </div>
    );
  }

  function renderLoadingSkeletons() {
    if (viewMode === "grid") {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="hairline-card h-[190px] animate-pulse bg-hairline-soft rounded-xl"
            />
          ))}
        </div>
      );
    }
    return <SkeletonRows count={4} />;
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container-page py-8 sm:py-10">
        <Breadcrumbs
          items={[
            { label: "Home", to: "/" },
            { label: "Subjects", to: "/subjects" },
            {
              label: subject.data?.code ?? "Subject",
              to: "/subjects/$subjectId/$category",
              params: { subjectId, category: "notes" },
            },
            { label: valid ? CATEGORY_META[category].label : "Unknown" },
          ]}
        />

        {!valid ? (
          <EmptyState
            title="Unknown category"
            description="Pick one of Notes, Syllabus, PYQs or Files."
            action={
              <Link
                to="/subjects/$subjectId/$category"
                params={{ subjectId, category: "notes" }}
                className="btn-primary-sm"
              >
                Back to subject
              </Link>
            }
          />
        ) : (
          <>
            {/* Header section with Subject Branding, Search, and View Toggle */}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  {subject.data?.code ? (
                    <span
                      className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-bold tracking-wider uppercase shadow-2xs"
                      style={{ backgroundColor: `${subjectColor}18`, color: subjectColor }}
                    >
                      {subject.data.code}
                    </span>
                  ) : null}
                  <span className="text-xs text-mute font-medium">
                    {categoryResources.length} {CATEGORY_META[category].label.toLowerCase()} available
                  </span>
                </div>
                <h1 className="heading-lg mt-1.5 text-ink tracking-tight">
                  {subject.data?.name ?? "Subject"}
                </h1>
                <p className="mt-1 text-sm text-mute">
                  {CATEGORY_META[category].blurb}
                </p>
              </div>

              {/* Toolbar: Search + View Switcher */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
                {/* Search in Subject Input */}
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-mute" />
                  <input
                    type="text"
                    placeholder={`Search ${CATEGORY_META[category].label.toLowerCase()}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-full border border-hairline bg-card py-2 pl-9 pr-8 text-sm text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs"
                  />
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-mute hover:text-ink transition-colors"
                      aria-label="Clear search"
                    >
                      <X className="size-3.5" />
                    </button>
                  ) : null}
                </div>

                {/* View Mode Toggle: Grid vs List (Segmented Capsule) */}
                <ViewModeToggle
                  viewMode={viewMode}
                  onChange={handleViewModeChange}
                  color={subjectColor}
                />
              </div>
            </div>

            {/* Category Tabs Navigation */}
            <nav aria-label="Categories" className="mt-6 flex flex-wrap gap-2">
              {CATEGORIES.map((c) => {
                const count = allResources.filter((r) => r.category === c).length;
                const isCurrent = c === category;
                return (
                  <Link
                    key={c}
                    to="/subjects/$subjectId/$category"
                    params={{ subjectId, category: c }}
                    className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-150 hover:opacity-90"
                    style={
                      isCurrent
                        ? {
                            backgroundColor: subjectColor,
                            borderColor: "transparent",
                            color: "#ffffff",
                            boxShadow: `0 2px 8px -2px ${subjectColor}60`,
                          }
                        : {
                            borderColor: "var(--border)",
                            backgroundColor: "var(--card)",
                            color: "var(--ink)",
                          }
                    }
                  >
                    <span>{CATEGORY_META[c].label}</span>
                    <span
                      className="rounded-full px-1.5 py-0.2 text-[11px] font-semibold"
                      style={{
                        backgroundColor: isCurrent ? "rgba(255,255,255,0.25)" : "var(--muted)",
                        color: isCurrent ? "#ffffff" : "var(--mute)",
                      }}
                    >
                      {count}
                    </span>
                  </Link>
                );
              })}
            </nav>

            {/* PYQ Year and Exam Filter Bar (Always visible on PYQ tab) */}
            {category === "pyqs" ? (
              <div className="mt-6 rounded-2xl border border-hairline bg-card/70 p-4 backdrop-blur-md space-y-3.5 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {/* Year Filter Chips */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-semibold text-mute uppercase tracking-wider mr-1 flex items-center gap-1">
                      <Filter className="size-3" />
                      Year:
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedYear("all")}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                        selectedYear === "all"
                          ? "bg-ink text-background font-semibold shadow-xs"
                          : "bg-background border border-hairline text-mute hover:text-ink hover:bg-hairline-soft"
                      }`}
                    >
                      All Years
                    </button>
                    {availableYears.map((yr) => (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => setSelectedYear(yr)}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                          selectedYear === yr
                            ? "text-white font-semibold shadow-xs"
                            : "bg-background border border-hairline text-mute hover:text-ink hover:bg-hairline-soft"
                        }`}
                        style={
                          selectedYear === yr
                            ? { backgroundColor: subjectColor, borderColor: "transparent" }
                            : undefined
                        }
                      >
                        {yr}
                      </button>
                    ))}
                  </div>

                  {/* Exam Type Tabs */}
                  <div className="flex items-center gap-1 bg-background border border-hairline rounded-lg p-0.5 text-xs font-medium">
                    <button
                      type="button"
                      onClick={() => setSelectedExamTypeTab("all")}
                      className={`px-3 py-1 rounded-md transition-colors ${
                        selectedExamTypeTab === "all"
                          ? "bg-card text-ink font-semibold shadow-xs"
                          : "text-mute hover:text-ink"
                      }`}
                    >
                      All Exams
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedExamTypeTab("mse")}
                      className={`px-3 py-1 rounded-md transition-colors ${
                        selectedExamTypeTab === "mse"
                          ? "bg-card text-ink font-semibold shadow-xs"
                          : "text-mute hover:text-ink"
                      }`}
                    >
                      MSE (Mid Sem)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedExamTypeTab("ese")}
                      className={`px-3 py-1 rounded-md transition-colors ${
                        selectedExamTypeTab === "ese"
                          ? "bg-card text-ink font-semibold shadow-xs"
                          : "text-mute hover:text-ink"
                      }`}
                    >
                      ESE (End Sem)
                    </button>
                  </div>
                </div>

                {/* Active filter summary tag if filter applied */}
                {selectedYear !== "all" || selectedExamTypeTab !== "all" ? (
                  <div className="flex items-center justify-between text-xs text-mute pt-2 border-t border-hairline">
                    <span className="flex items-center gap-1.5">
                      <FileCheck className="size-3.5 text-primary" />
                      Showing <strong className="text-ink font-semibold">{filteredList.length}</strong> paper
                      {filteredList.length === 1 ? "" : "s"} for{" "}
                      <strong className="text-ink">
                        {selectedYear !== "all" ? `Year ${selectedYear} ` : "All Years "}
                        {selectedExamTypeTab !== "all" ? selectedExamTypeTab.toUpperCase() : "Exams"}
                      </strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedYear("all");
                        setSelectedExamTypeTab("all");
                      }}
                      className="text-primary hover:underline font-semibold"
                    >
                      Reset filters
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}

            {/* Resources Content Area (Box vs Line View) */}
            <div className="mt-8">
              {resources.isPending ? (
                renderLoadingSkeletons()
              ) : resources.isError ? (
                <ErrorState onRetry={() => void resources.refetch()} />
              ) : category === "pyqs" ? (
                // Group PYQ resources by ESE/MSE/Other with smart title detection
                (() => {
                  const msePapers = filteredList
                    .filter((r) => getExamType(r) === "mse")
                    .sort((a, b) => (getExamYear(b) ?? 0) - (getExamYear(a) ?? 0));

                  const esePapers = filteredList
                    .filter((r) => getExamType(r) === "ese")
                    .sort((a, b) => (getExamYear(b) ?? 0) - (getExamYear(a) ?? 0));

                  const otherPapers = filteredList
                    .filter((r) => getExamType(r) !== "mse" && getExamType(r) !== "ese")
                    .sort((a, b) => (getExamYear(b) ?? 0) - (getExamYear(a) ?? 0));

                  const hasAnyPapers = msePapers.length > 0 || esePapers.length > 0 || otherPapers.length > 0;

                  if (!hasAnyPapers && (searchQuery || selectedYear !== "all" || selectedExamTypeTab !== "all")) {
                    return (
                      <EmptyState
                        title="No question papers found for selected filter"
                        description="Try choosing a different year or clearing your filters."
                        action={
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedYear("all");
                              setSelectedExamTypeTab("all");
                              setSearchQuery("");
                            }}
                            className="btn-primary-sm"
                          >
                            Reset filters
                          </button>
                        }
                      />
                    );
                  }

                  return (
                    <div className="space-y-10">
                      {/* Mid Semester Examination (MSE) Section */}
                      {(selectedExamTypeTab === "all" || selectedExamTypeTab === "mse") && (
                        <section className="space-y-3.5">
                          <div className="flex items-center justify-between border-b border-hairline pb-2.5">
                            <div className="flex items-center gap-2.5">
                              <span
                                className="size-2.5 rounded-full ring-4"
                                style={{
                                  backgroundColor: subjectColor,
                                  boxShadow: `0 0 0 3px ${subjectColor}25`,
                                }}
                              />
                              <h2 className="text-base font-semibold text-ink">
                                Mid Semester Examinations (MSE)
                              </h2>
                            </div>
                            <span className="rounded-full bg-hairline px-2.5 py-0.5 text-xs font-semibold text-mute">
                              {msePapers.length} paper{msePapers.length === 1 ? "" : "s"}
                            </span>
                          </div>
                          {msePapers.length > 0 ? (
                            renderResourceList(msePapers)
                          ) : (
                            <div className="rounded-xl border border-dashed border-hairline p-6 text-center text-xs text-mute bg-card/30">
                              No MSE question papers uploaded yet{selectedYear !== "all" ? ` for ${selectedYear}` : ""}.
                            </div>
                          )}
                        </section>
                      )}

                      {/* End Semester Examination (ESE) Section */}
                      {(selectedExamTypeTab === "all" || selectedExamTypeTab === "ese") && (
                        <section className="space-y-3.5">
                          <div className="flex items-center justify-between border-b border-hairline pb-2.5">
                            <div className="flex items-center gap-2.5">
                              <span
                                className="size-2.5 rounded-full ring-4"
                                style={{
                                  backgroundColor: subjectColor,
                                  boxShadow: `0 0 0 3px ${subjectColor}25`,
                                }}
                              />
                              <h2 className="text-base font-semibold text-ink">
                                End Semester Examinations (ESE)
                              </h2>
                            </div>
                            <span className="rounded-full bg-hairline px-2.5 py-0.5 text-xs font-semibold text-mute">
                              {esePapers.length} paper{esePapers.length === 1 ? "" : "s"}
                            </span>
                          </div>
                          {esePapers.length > 0 ? (
                            renderResourceList(esePapers)
                          ) : (
                            <div className="rounded-xl border border-dashed border-hairline p-6 text-center text-xs text-mute bg-card/30">
                              No ESE question papers uploaded yet{selectedYear !== "all" ? ` for ${selectedYear}` : ""}.
                            </div>
                          )}
                        </section>
                      )}

                      {/* Other Question Papers (if any) */}
                      {otherPapers.length > 0 && selectedExamTypeTab === "all" && (
                        <section className="space-y-3.5">
                          <div className="flex items-center justify-between border-b border-hairline pb-2.5">
                            <div className="flex items-center gap-2.5">
                              <span
                                className="size-2.5 rounded-full"
                                style={{ backgroundColor: "var(--mute)" }}
                              />
                              <h2 className="text-base font-semibold text-ink">
                                Other Question Papers
                              </h2>
                            </div>
                            <span className="rounded-full bg-hairline px-2.5 py-0.5 text-xs font-semibold text-mute">
                              {otherPapers.length} paper{otherPapers.length === 1 ? "" : "s"}
                            </span>
                          </div>
                          {renderResourceList(otherPapers)}
                        </section>
                      )}
                    </div>
                  );
                })()
              ) : filteredList.length === 0 ? (
                <EmptyState
                  title={
                    searchQuery
                      ? `No ${CATEGORY_META[category].label.toLowerCase()} matching "${searchQuery}"`
                      : `No ${CATEGORY_META[category].label.toLowerCase()} uploaded yet`
                  }
                  description={
                    searchQuery
                      ? "Try searching for a different keyword or clear the search filter."
                      : "Check back later — this section will fill up as material is added."
                  }
                />
              ) : (
                renderResourceList(list)
              )}
            </div>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
