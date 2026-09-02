import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Filter, Search, X } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/divhub/site-header";
import { ResourceRow } from "@/components/divhub/resource-row";
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

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container-page py-10">
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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                {subject.data?.code ? (
                  <span
                    className="inline-block rounded px-2 py-0.5 text-xs font-semibold"
                    style={{ backgroundColor: `${subjectColor}15`, color: subjectColor }}
                  >
                    {subject.data.code}
                  </span>
                ) : null}
                <h1 className="heading-lg mt-1">{subject.data?.name ?? "Subject"}</h1>
                <p className="mt-1 text-[14px] text-mute">
                  {CATEGORY_META[category].blurb}
                </p>
              </div>

              {/* In-Subject Search Bar */}
              <div className="relative w-full sm:w-72 shrink-0">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-mute" />
                <input
                  type="text"
                  placeholder={`Search in ${subject.data?.code ?? "subject"}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border border-hairline bg-card py-2 pl-9 pr-8 text-sm text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-mute hover:text-ink"
                    aria-label="Clear search"
                  >
                    <X className="size-3.5" />
                  </button>
                ) : null}
              </div>
            </div>

            {/* Category Navigation Pills */}
            <nav aria-label="Categories" className="mt-6 flex flex-wrap gap-2">
              {CATEGORIES.map((c) => {
                const count = allResources.filter((r) => r.category === c).length;
                return (
                  <Link
                    key={c}
                    to="/subjects/$subjectId/$category"
                    params={{ subjectId, category: c }}
                    className="inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors hover:opacity-90"
                    style={
                      c === category
                        ? {
                            backgroundColor: subjectColor,
                            borderColor: "transparent",
                            color: "#ffffff",
                          }
                        : {
                            borderColor: "var(--border)",
                            backgroundColor: "var(--card)",
                            color: "var(--ink)",
                          }
                    }
                  >
                    <span>{CATEGORY_META[c].label}</span>
                    <span className="text-xs opacity-75">({count})</span>
                  </Link>
                );
              })}
            </nav>

            {/* PYQ Year and Exam Filter Bar */}
            {category === "pyqs" && availableYears.length > 0 ? (
              <div className="mt-6 rounded-xl border border-hairline bg-card/60 p-3.5 backdrop-blur-sm space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {/* Year Filter Pills */}
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
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        selectedExamTypeTab === "all"
                          ? "bg-card text-ink font-semibold shadow-xs"
                          : "text-mute hover:text-ink"
                      }`}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedExamTypeTab("mse")}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        selectedExamTypeTab === "mse"
                          ? "bg-card text-ink font-semibold shadow-xs"
                          : "text-mute hover:text-ink"
                      }`}
                    >
                      MSE
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedExamTypeTab("ese")}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        selectedExamTypeTab === "ese"
                          ? "bg-card text-ink font-semibold shadow-xs"
                          : "text-mute hover:text-ink"
                      }`}
                    >
                      ESE
                    </button>
                  </div>
                </div>

                {/* Active filter summary tag if filter applied */}
                {selectedYear !== "all" || selectedExamTypeTab !== "all" ? (
                  <div className="flex items-center justify-between text-xs text-mute pt-1 border-t border-hairline">
                    <span>
                      Showing {filteredList.length} paper{filteredList.length === 1 ? "" : "s"} for{" "}
                      <strong className="text-ink">
                        {selectedYear !== "all" ? `${selectedYear} ` : "All Years "}
                        {selectedExamTypeTab !== "all" ? selectedExamTypeTab.toUpperCase() : "Exams"}
                      </strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedYear("all");
                        setSelectedExamTypeTab("all");
                      }}
                      className="text-primary hover:underline font-medium"
                    >
                      Clear filters
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}

            {/* Resources List */}
            <div className="mt-6 space-y-6">
              {resources.isPending ? (
                <SkeletonRows count={4} />
              ) : resources.isError ? (
                <ErrorState onRetry={() => void resources.refetch()} />
              ) : filteredList.length === 0 ? (
                <EmptyState
                  title={
                    searchQuery
                      ? `No ${CATEGORY_META[category].label.toLowerCase()} matching "${searchQuery}"`
                      : selectedYear !== "all" || selectedExamTypeTab !== "all"
                        ? "No question papers found for selected filter"
                        : `No ${CATEGORY_META[category].label.toLowerCase()} uploaded yet`
                  }
                  description={
                    searchQuery || selectedYear !== "all" || selectedExamTypeTab !== "all"
                      ? "Try choosing a different year or clearing your filters."
                      : "Check back later — this section will fill up as material is added."
                  }
                  action={
                    selectedYear !== "all" || selectedExamTypeTab !== "all" ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedYear("all");
                          setSelectedExamTypeTab("all");
                          setSearchQuery("");
                        }}
                        className="btn-primary-sm"
                      >
                        Show all question papers
                      </button>
                    ) : undefined
                  }
                />
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

                  return (
                    <div className="space-y-8">
                      {msePapers.length > 0 && (selectedExamTypeTab === "all" || selectedExamTypeTab === "mse") && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 border-b border-hairline pb-2">
                            <span
                              className="size-2.5 rounded-full"
                              style={{ backgroundColor: subjectColor }}
                            />
                            <h2 className="text-base font-semibold text-ink">
                              Mid Semester Examinations (MSE)
                            </h2>
                            <span className="text-xs text-mute font-medium">({msePapers.length})</span>
                          </div>
                          <div className="space-y-2">
                            {msePapers.map((resource) => (
                              <ResourceRow
                                key={resource.id}
                                resource={resource}
                                showCategory={Boolean(query)}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {esePapers.length > 0 && (selectedExamTypeTab === "all" || selectedExamTypeTab === "ese") && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 border-b border-hairline pb-2">
                            <span
                              className="size-2.5 rounded-full"
                              style={{ backgroundColor: subjectColor }}
                            />
                            <h2 className="text-base font-semibold text-ink">
                              End Semester Examinations (ESE)
                            </h2>
                            <span className="text-xs text-mute font-medium">({esePapers.length})</span>
                          </div>
                          <div className="space-y-2">
                            {esePapers.map((resource) => (
                              <ResourceRow
                                key={resource.id}
                                resource={resource}
                                showCategory={Boolean(query)}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {otherPapers.length > 0 && selectedExamTypeTab === "all" && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 border-b border-hairline pb-2">
                            <span
                              className="size-2.5 rounded-full"
                              style={{ backgroundColor: "var(--mute)" }}
                            />
                            <h2 className="text-base font-semibold text-ink">
                              Other Question Papers
                            </h2>
                            <span className="text-xs text-mute font-medium">({otherPapers.length})</span>
                          </div>
                          <div className="space-y-2">
                            {otherPapers.map((resource) => (
                              <ResourceRow
                                key={resource.id}
                                resource={resource}
                                showCategory={Boolean(query)}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {msePapers.length === 0 && esePapers.length === 0 && otherPapers.length === 0 && (
                        <EmptyState
                          title="No question papers matching filters"
                          description="Try clearing your search query or filters."
                        />
                      )}
                    </div>
                  );
                })()
              ) : (
                list.map((resource) => (
                  <ResourceRow
                    key={resource.id}
                    resource={resource}
                    showCategory={Boolean(query)}
                  />
                ))
              )}
            </div>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
