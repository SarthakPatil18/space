import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteFooter, SiteHeader } from "@/components/divhub/site-header";
import { SubjectCard } from "@/components/divhub/subject-card";
import {
  Breadcrumbs,
  EmptyState,
  ErrorState,
  SkeletonRows,
} from "@/components/divhub/ui-bits";
import { subjectsQuery } from "@/lib/divhub";

export const Route = createFileRoute("/subjects/")({
  head: () => ({
    meta: [
      { title: "All subjects — SPACE" },
      {
        name: "description",
        content:
          "Browse every subject in your division and jump straight to its notes, files, PYQs and syllabus.",
      },
      { property: "og:title", content: "All subjects — SPACE" },
      {
        property: "og:description",
        content: "Every subject in your division, one click from its resources.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SubjectsPage,
});

function SubjectsPage() {
  const subjects = useQuery(subjectsQuery());

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container-page py-10">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Subjects" }]} />
        <p className="eyebrow">Subjects</p>
        <h1 className="heading-lg mt-1">All subjects</h1>

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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {subjects.data.map((subject) => (
                <SubjectCard key={subject.id} subject={subject} />
              ))}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
