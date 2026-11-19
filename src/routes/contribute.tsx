import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  FileQuestion,
  FolderOpen,
  Mail,
  NotebookPen,
  ScrollText,
} from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/divhub/site-header";
import { Breadcrumbs } from "@/components/divhub/ui-bits";

export const Route = createFileRoute("/contribute")({
  head: () => ({
    meta: [
      { title: "Contribute — SPACE" },
      {
        name: "description",
        content:
          "Share notes, PYQs, syllabus documents and study files with every student in your division.",
      },
      { property: "og:title", content: "Contribute to SPACE" },
      {
        property: "og:description",
        content:
          "Your notes can save someone an entire night. Help build the shared resource library.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContributePage,
});

const categories = [
  {
    icon: NotebookPen,
    title: "Notes",
    description: "Lecture, handwritten and revision notes.",
  },
  {
    icon: FileQuestion,
    title: "PYQs",
    description: "Previous year papers, with year and exam type if known.",
  },
  {
    icon: ScrollText,
    title: "Syllabus",
    description: "Official syllabus documents for any subject.",
  },
  {
    icon: FolderOpen,
    title: "Files",
    description: "Slides, lab manuals, reference sheets and more.",
  },
];

const guidelines = [
  "Include the subject, semester and section.",
  "Send readable full-page scans or original PDFs.",
  "Name files clearly, like DBMS_Unit3_Notes.pdf.",
  "Remove personal details such as roll numbers and signatures.",
];

const steps = [
  {
    title: "Send",
    description: "Email your files or a Drive link.",
  },
  {
    title: "Review",
    description: "We check the subject and readability.",
  },
  {
    title: "Publish",
    description: "It goes live for everyone, no login needed.",
  },
];

const mailtoHref =
  "mailto:space.mitaoe@gmail.com" +
  "?subject=" +
  encodeURIComponent("Contribution for SPACE") +
  "&body=" +
  encodeURIComponent(
    "Subject:\nSemester:\nSection:\nCategory (Notes / PYQs / Syllabus / Files):\n\nWhat am I sharing:\n",
  );

function ContributePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="container-page flex-1 py-10 sm:py-14 px-4 sm:px-6">
        <div className="max-w-3xl">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Contribute" }]} />

          <p className="eyebrow">Contribute</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-ink">
            Help keep Space complete.
          </h1>
          <p className="mt-4 max-w-xl text-[15px] sm:text-base leading-relaxed text-body">
            Share notes, PYQs or files from your semester. One upload can save someone an entire
            night.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a href={mailtoHref} className="btn-primary-sm">
              <Mail className="size-4" aria-hidden="true" />
              Send your files
            </a>
            <Link to="/subjects" className="btn-ghost-sm">
              Browse subjects
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <section aria-labelledby="what-heading" className="mt-12 max-w-3xl">
          <h2 id="what-heading" className="heading-md">
            What to send
          </h2>

          <div className="mt-4 hairline-card divide-y divide-hairline">
            {categories.map((category) => (
              <div key={category.title} className="flex items-center gap-3.5 px-5 py-3.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-hairline-soft">
                  <category.icon className="size-4 text-ink" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">{category.title}</p>
                  <p className="text-[13px] text-mute">{category.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="how-heading" className="mt-12 max-w-3xl">
          <h2 id="how-heading" className="heading-md">
            How it works
          </h2>

          <ol className="mt-4 grid gap-4 sm:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title} className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-ink text-[11px] font-semibold text-background">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{step.title}</p>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-mute">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="before-heading" className="mt-12 max-w-3xl">
          <h2 id="before-heading" className="heading-md">
            Before you send
          </h2>

          <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {guidelines.map((guideline) => (
              <li
                key={guideline}
                className="flex items-start gap-2.5 text-sm leading-relaxed text-body"
              >
                <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <span>{guideline}</span>
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="contact-heading"
          className="mt-12 max-w-3xl hairline-card p-6 sm:p-7"
        >
          <h2 id="contact-heading" className="heading-md">
            Ready to contribute?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-body">
            Email{" "}
            <a
              href="mailto:space.mitaoe@gmail.com"
              className="font-medium text-ink underline underline-offset-4 transition-opacity hover:opacity-80"
            >
              space.mitaoe@gmail.com
            </a>{" "}
            with your files and subject details. Want credit? Just say so.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <a href={mailtoHref} className="btn-primary-sm">
              <Mail className="size-4" aria-hidden="true" />
              Email a contribution
            </a>
            <Link
              to="/terms"
              className="text-xs text-mute underline underline-offset-4 transition-colors hover:text-ink"
            >
              Contribution guidelines
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
