import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
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
  subjectQuery,
  subjectResourcesQuery,
} from "@/lib/divhub";

export const Route = createFileRoute("/subjects/$subjectId/")({
  head: () => ({
    meta: [
      { title: "Subject resources — DIVHUB" },
      {
        name: "description",
        content:
          "Notes, files, previous year questions and syllabus for this subject.",
      },
      { property: "og:title", content: "Subject resources — DIVHUB" },
      {
        property: "og:description",
        content: "All notes, files, PYQs and syllabus for this subject.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SubjectPage,
});

function SubjectPage() {
  const { subjectId } = Route.useParams();
  const subject = useQuery(subjectQuery(subjectId));
  const resources = useQuery(subjectResourcesQuery(subjectId));

  if (subject.isError || resources.isError) {
    return (
      <Shell>
        <ErrorState onRetry={() => void subject.refetch()} />
      </Shell>
    );
  }

  if (subject.isPending) {
    return (
      <Shell>
        <SkeletonRows count={3} />
      </Shell>
    );
  }

  if (!subject.data) {
    return (
      <Shell>
        <EmptyState
          title="Subject not found"
          description="This subject may have been removed."
          action={
            <Link to="/subjects" className="btn-primary-sm">
              Browse subjects
            </Link>
          }
        />
      </Shell>
    );
  }

  const list = resources.data ?? [];
  const countFor = (category: string) =>
    list.filter((r) => r.category === category).length;

  return (
    <Shell
      crumbs={[
        { label: "Home", to: "/" },
        { label: "Subjects", to: "/subjects" },
        { label: subject.data.code },
      ]}
    >
      <p className="eyebrow">
        {subject.data.code} · Semester {subject.data.semester}
      </p>
      <h1 className="heading-lg mt-1">{subject.data.name}</h1>
      {subject.data.description ? (
        <p className="mt-2 max-w-2xl text-[15px] text-body">
          {subject.data.description}
        </p>
      ) : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORIES.map((category) => (
          <Link
            key={category}
            to="/subjects/$subjectId/$category"
            params={{ subjectId, category }}
            className="hairline-card group flex flex-col p-5 transition-shadow hover:shadow-whisper"
          >
            <span className="heading-md">{CATEGORY_META[category].label}</span>
            <span className="mt-1 text-[13px] text-mute">
              {CATEGORY_META[category].blurb}
            </span>
            <span className="mt-4 flex items-center gap-1 text-[13px] font-medium text-ink">
              {resources.isPending
                ? "Loading…"
                : `${countFor(category)} item${countFor(category) === 1 ? "" : "s"}`}
              <ArrowRight
                className="size-3.5 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </span>
          </Link>
        ))}
      </div>

      <section aria-labelledby="latest" className="mt-14">
        <p className="eyebrow">Latest in this subject</p>
        <h2 id="latest" className="heading-md mt-1">
          Recently added
        </h2>
        <div className="mt-5 space-y-2">
          {resources.isPending ? (
            <SkeletonRows count={3} />
          ) : list.length === 0 ? (
            <EmptyState
              title="No resources uploaded yet"
              description="Check back later — material for this subject will appear here."
            />
          ) : (
            list
              .slice(0, 5)
              .map((resource) => (
                <ResourceRow key={resource.id} resource={resource} showCategory />
              ))
          )}
        </div>
      </section>
    </Shell>
  );
}

function Shell({
  children,
  crumbs,
}: {
  children: React.ReactNode;
  crumbs?: { label: string; to?: string }[];
}) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container-page py-10">
        <Breadcrumbs
          items={
            crumbs ?? [
              { label: "Home", to: "/" },
              { label: "Subjects", to: "/subjects" },
            ]
          }
        />
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
