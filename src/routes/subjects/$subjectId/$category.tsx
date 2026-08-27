import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, X } from "lucide-react";
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

  const valid = isCategory(category);
  const allResources = resources.data ?? [];
  const subjectColor = getSubjectColor(subject.data);
  const categoryResources = valid
    ? allResources.filter((r) => r.category === category)
    : [];

  const query = searchQuery.trim().toLowerCase();
  const list = query
    ? allResources.filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          (r.file_path && r.file_path.toLowerCase().includes(query)) ||
          (r.description && r.description.toLowerCase().includes(query)),
      )
    : categoryResources;

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

            {/* Resources List */}
            <div className="mt-6 space-y-6">
              {resources.isPending ? (
                <SkeletonRows count={4} />
              ) : resources.isError ? (
                <ErrorState onRetry={() => void resources.refetch()} />
              ) : list.length === 0 ? (
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
              ) : category === "pyqs" ? (
                // Group PYQ resources by ESE/MSE/Other
                (() => {
                  const msePapers = list.filter((r) => r.exam_type === "mse");
                  const esePapers = list.filter((r) => r.exam_type === "ese");
                  const otherPapers = list.filter((r) => r.exam_type !== "mse" && r.exam_type !== "ese");

                  return (
                    <div className="space-y-8">
                      {msePapers.length > 0 && (
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

                      {esePapers.length > 0 && (
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

                      {otherPapers.length > 0 && (
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
                          description="Try clearing your search query."
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
