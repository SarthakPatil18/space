import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
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
  isCategory,
  subjectQuery,
  subjectResourcesQuery,
} from "@/lib/divhub";

export const Route = createFileRoute("/subjects/$subjectId/$category")({
  head: () => ({
    meta: [
      { title: "Subject material — DIVHUB" },
      {
        name: "description",
        content:
          "Open or download notes, files, previous year questions and syllabus for this subject.",
      },
      { property: "og:title", content: "Subject material — DIVHUB" },
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

  const valid = isCategory(category);
  const list = valid
    ? (resources.data ?? []).filter((r) => r.category === category)
    : [];

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
              to: "/subjects/$subjectId",
              params: { subjectId },
            },
            { label: valid ? CATEGORY_META[category].label : "Unknown" },
          ]}
        />

        {!valid ? (
          <EmptyState
            title="Unknown category"
            description="Pick one of Notes, Files, PYQs or Syllabus."
            action={
              <Link
                to="/subjects/$subjectId"
                params={{ subjectId }}
                className="btn-primary-sm"
              >
                Back to subject
              </Link>
            }
          />
        ) : (
          <>
            <p className="eyebrow">{subject.data?.name ?? "Subject"}</p>
            <h1 className="heading-lg mt-1">{CATEGORY_META[category].label}</h1>
            <p className="mt-1 text-[14px] text-mute">
              {CATEGORY_META[category].blurb}
            </p>

            <nav aria-label="Categories" className="mt-6 flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <Link
                  key={c}
                  to="/subjects/$subjectId/$category"
                  params={{ subjectId, category: c }}
                  className={`rounded-[64px] border px-4 py-1.5 text-sm font-medium transition-colors ${
                    c === category
                      ? "border-transparent bg-primary text-primary-foreground"
                      : "border-hairline bg-card text-ink hover:bg-hairline-soft"
                  }`}
                >
                  {CATEGORY_META[c].label}
                </Link>
              ))}
            </nav>

            <div className="mt-6 space-y-2">
              {resources.isPending ? (
                <SkeletonRows count={4} />
              ) : resources.isError ? (
                <ErrorState onRetry={() => void resources.refetch()} />
              ) : list.length === 0 ? (
                <EmptyState
                  title={`No ${CATEGORY_META[category].label.toLowerCase()} uploaded yet`}
                  description="Check back later — this section will fill up as material is added."
                />
              ) : (
                list.map((resource) => (
                  <ResourceRow key={resource.id} resource={resource} />
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
