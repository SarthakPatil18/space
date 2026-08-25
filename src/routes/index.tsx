import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteFooter, SiteHeader } from "@/components/divhub/site-header";
import { SearchBox } from "@/components/divhub/search-box";
import { SubjectCard } from "@/components/divhub/subject-card";
import {
  ResourceRow,
  type ResourceWithSubject,
} from "@/components/divhub/resource-row";
import { EmptyState, ErrorState, SkeletonRows } from "@/components/divhub/ui-bits";
import { recentResourcesQuery, subjectsQuery } from "@/lib/divhub";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SPACE — Every note. Every PYQ. Every file. One place." },
      {
        name: "description",
        content:
          "Find what you need for your semester - fast, simple, and without the clutter.",
      },
      { property: "og:title", content: "SPACE — Your semester's resource hub" },
      {
        property: "og:description",
        content:
          "Find what you need for your semester - fast, simple, and without the clutter.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const subjects = useQuery(subjectsQuery());
  const recent = useQuery(recentResourcesQuery(5));

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="mesh-gradient border-b border-hairline">
        <div className="container-page py-16 md:py-24">
          <p className="eyebrow">AI/ML · Computer Engineering</p>
          <h1 className="display-xl mt-3 max-w-2xl">
            Every note. Every PYQ. Every file. One place.
          </h1>
          <p className="mt-4 max-w-xl text-[16px] leading-6 text-body">
            Find what you need for your semester - fast, simple, and without the clutter.
          </p>
          <div className="mt-7 max-w-xl">
            <SearchBox large />
          </div>
        </div>
      </section>

      <main className="container-page py-12">
        <section aria-labelledby="subjects-heading">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Subjects</p>
              <h2 id="subjects-heading" className="heading-lg mt-1">
                Pick a subject
              </h2>
            </div>
            <Link to="/subjects" className="btn-ghost-sm">
              View all
            </Link>
          </div>

          <div className="mt-6">
            {subjects.isPending ? (
              <SkeletonRows count={4} />
            ) : subjects.isError ? (
              <ErrorState onRetry={() => void subjects.refetch()} />
            ) : subjects.data.length === 0 ? (
              <EmptyState
                title="No subjects yet"
                description="Subjects will appear here once an admin adds them."
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {subjects.data.map((subject) => (
                  <SubjectCard key={subject.id} subject={subject} />
                ))}
              </div>
            )}
          </div>
        </section>

        <section aria-labelledby="recent-heading" className="mt-16">
          <p className="eyebrow">Recently added</p>
          <h2 id="recent-heading" className="heading-lg mt-1">
            Latest uploads
          </h2>

          <div className="mt-6 space-y-2">
            {recent.isPending ? (
              <SkeletonRows count={3} />
            ) : recent.isError ? (
              <ErrorState onRetry={() => void recent.refetch()} />
            ) : recent.data.length === 0 ? (
              <EmptyState
                title="Nothing uploaded yet"
                description="New notes, files, PYQs and syllabus will show up here."
              />
            ) : (
              recent.data.map((resource) => (
                <ResourceRow
                  key={resource.id}
                  resource={resource as ResourceWithSubject}
                  showSubject
                  showCategory
                />
              ))
            )}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
