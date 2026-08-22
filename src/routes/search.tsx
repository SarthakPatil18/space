import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteFooter, SiteHeader } from "@/components/divhub/site-header";
import { SearchBox } from "@/components/divhub/search-box";
import {
  ResourceRow,
  type ResourceWithSubject,
} from "@/components/divhub/resource-row";
import {
  Breadcrumbs,
  EmptyState,
  ErrorState,
  SkeletonRows,
} from "@/components/divhub/ui-bits";
import { searchQuery } from "@/lib/divhub";

type SearchParams = { q?: string };

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>): SearchParams =>
    typeof search['q'] === "string" && search['q'].length > 0
      ? { q: search['q'] }
      : {},
  head: () => ({
    meta: [
      { title: "Search resources — DIVHUB" },
      {
        name: "description",
        content:
          "Search across every subject for notes, files, previous year questions and syllabus.",
      },
      { property: "og:title", content: "Search resources — DIVHUB" },
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
                        to="/subjects/$subjectId"
                        params={{ subjectId: subject.id }}
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
                  <h2 id="resource-results" className="heading-md">
                    {results.data.resources.length} resource
                    {results.data.resources.length === 1 ? "" : "s"}
                  </h2>
                  <div className="mt-4 space-y-2">
                    {results.data.resources.map((resource) => (
                      <ResourceRow
                        key={resource.id}
                        resource={resource as ResourceWithSubject}
                        showSubject
                        showCategory
                      />
                    ))}
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
