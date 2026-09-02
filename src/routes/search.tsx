import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SiteFooter, SiteHeader } from "@/components/divhub/site-header";
import { SearchBox } from "@/components/divhub/search-box";
import {
  ResourceRow,
  type ResourceWithSubject,
} from "@/components/divhub/resource-row";
import { ResourceCard } from "@/components/divhub/resource-card";
import { ViewModeToggle } from "@/components/divhub/view-mode-toggle";
import {
  FilterDropdown,
  ActiveFilterChips,
  type ExamFilter,
  type YearFilter,
} from "@/components/divhub/filter-dropdown";
import {
  Breadcrumbs,
  EmptyState,
  ErrorState,
  SkeletonRows,
} from "@/components/divhub/ui-bits";
import { searchQuery, getExamType, getExamYear } from "@/lib/divhub";

type SearchParams = { q?: string };

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>): SearchParams =>
    typeof search['q'] === "string" && search['q'].length > 0
      ? { q: search['q'] }
      : {},
  head: () => ({
    meta: [
      { title: "Search resources — SPACE" },
      {
        name: "description",
        content:
          "Search across every subject for notes, files, previous year questions and syllabus.",
      },
      { property: "og:title", content: "Search resources — SPACE" },
      {
        property: "og:description",
        content: "Find any note, file, PYQ or syllabus across all subjects.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const term = q ?? "";
  const results = useQuery(searchQuery(term));

  const [selectedExam, setSelectedExam] = useState<ExamFilter>("all");
  const [selectedYear, setSelectedYear] = useState<YearFilter>("all");

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

  const rawResources = (results.data?.resources ?? []) as ResourceWithSubject[];

  const availableYears = rawResources.reduce<number[]>((acc, r) => {
    const yr = getExamYear(r);
    if (yr && !acc.includes(yr)) acc.push(yr);
    return acc;
  }, []).sort((a, b) => b - a);

  const filteredResources = rawResources.filter((r) => {
    if (selectedExam !== "all") {
      const et = getExamType(r);
      if (et !== selectedExam) return false;
    }
    if (selectedYear !== "all") {
      const yr = getExamYear(r);
      if (yr !== selectedYear) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container-page py-10">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Search" }]} />
        <p className="eyebrow">Search</p>
        <h1 className="heading-lg mt-1">Find material</h1>

        <div className="mt-5 max-w-2xl">
          <SearchBox initialValue={term} autoFocus large />
        </div>

        <div className="mt-8">
          {term.length === 0 ? (
            <EmptyState
              title="Start typing to search"
              description="Try “binary tree”, “DBMS unit 3”, “OOP PYQ” or “syllabus”."
            />
          ) : results.isPending ? (
            <SkeletonRows count={4} />
          ) : results.isError ? (
            <ErrorState onRetry={() => void results.refetch()} />
          ) : results.data.resources.length === 0 &&
            results.data.subjects.length === 0 ? (
            <EmptyState
              title={`No results for “${term}”`}
              description="Check the spelling, or browse subjects instead."
              action={
                <Link to="/subjects" className="btn-primary-sm">
                  Browse subjects
                </Link>
              }
            />
          ) : (
            <div className="space-y-10">
              {results.data.subjects.length > 0 ? (
                <section aria-labelledby="subject-results">
                  <h2 id="subject-results" className="heading-md">
                    Subjects
                  </h2>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {results.data.subjects.map((subject) => (
                      <Link
                        key={subject.id}
                        to="/subjects/$subjectId/$category"
                        params={{ subjectId: subject.id, category: "notes" }}
                        className="rounded-[64px] border border-hairline bg-card px-4 py-1.5 text-sm font-medium text-ink hover:bg-hairline-soft"
                      >
                        {subject.name}
                      </Link>
                    ))}
                  </div>
                </section>
              ) : null}

              {results.data.resources.length > 0 ? (
                <section aria-labelledby="resource-results">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 id="resource-results" className="heading-md">
                      {filteredResources.length} resource
                      {filteredResources.length === 1 ? "" : "s"}
                    </h2>

                    {/* Filter Option + View Mode Toggle */}
                    <div className="flex items-center gap-2">
                      <FilterDropdown
                        selectedExam={selectedExam}
                        onExamChange={setSelectedExam}
                        selectedYear={selectedYear}
                        onYearChange={setSelectedYear}
                        availableYears={availableYears}
                      />
                      <ViewModeToggle
                        viewMode={viewMode}
                        onChange={handleViewModeChange}
                      />
                    </div>
                  </div>

                  {/* Active Filter Chips */}
                  <ActiveFilterChips
                    selectedExam={selectedExam}
                    onExamClear={() => setSelectedExam("all")}
                    selectedYear={selectedYear}
                    onYearClear={() => setSelectedYear("all")}
                    onResetAll={() => {
                      setSelectedExam("all");
                      setSelectedYear("all");
                    }}
                    count={filteredResources.length}
                  />

                  <div className="mt-4">
                    {filteredResources.length === 0 ? (
                      <EmptyState
                        title="No resources match this filter"
                        description="Try clearing or adjusting your year and exam filters."
                        action={
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedExam("all");
                              setSelectedYear("all");
                            }}
                            className="btn-primary-sm"
                          >
                            Reset filters
                          </button>
                        }
                      />
                    ) : viewMode === "grid" ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
                        {filteredResources.map((resource) => (
                          <ResourceCard
                            key={resource.id}
                            resource={resource}
                            showSubject
                            showCategory
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {filteredResources.map((resource) => (
                          <ResourceRow
                            key={resource.id}
                            resource={resource}
                            showSubject
                            showCategory
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              ) : null}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
