import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  Clock3,
  FileCheck2,
  Mail,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/divhub/site-header";
import { Breadcrumbs } from "@/components/divhub/ui-bits";
import { UploadForm } from "@/components/divhub/upload-form";

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

const steps = [
  {
    icon: UploadCloud,
    title: "Upload",
    description: "Pick a subject, category and year, then drop your files.",
  },
  {
    icon: Clock3,
    title: "Review",
    description: "Every file waits in a pending queue until an admin checks it.",
  },
  {
    icon: FileCheck2,
    title: "Publish",
    description: "Approved files go live in the public library, no login needed.",
  },
];

const guidelines = [
  "Include the subject, semester and section.",
  "Send readable full-page scans or original PDFs.",
  "Name files clearly, like DBMS_Unit3_Notes.pdf.",
  "Remove personal details such as roll numbers and signatures.",
];

const mailtoHref =
  "mailto:space.mitaoe@gmail.com" +
  "?subject=" +
  encodeURIComponent("Contribution for SPACE") +
  "&body=" +
  encodeURIComponent(
    "Subject:\nSemester:\nSection:\nCategory (Notes / PYQs / Practicals / Assignments / Syllabus / Reference / Other):\n\nWhat am I sharing:\n",
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
            Share notes, PYQs or files from your semester. Upload them here and they go to the
            review queue. One upload can save someone an entire night.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-mute">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-primary" aria-hidden="true" />
              Admin reviewed before publishing
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="size-3.5 text-primary" aria-hidden="true" />
              PDF · DOC · DOCX · PPT · PPTX
            </span>
          </div>
        </div>

        <section aria-labelledby="upload-heading" className="mt-8 max-w-3xl">
          <h2 id="upload-heading" className="sr-only">
            Upload a resource
          </h2>
          <UploadForm />
        </section>

        <section aria-labelledby="how-heading" className="mt-12 max-w-3xl">
          <h2 id="how-heading" className="heading-md">
            How it works
          </h2>

          <ol className="mt-4 grid gap-4 sm:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title} className="hairline-card px-4 py-4">
                <span className="flex size-8 items-center justify-center rounded-lg bg-hairline-soft">
                  <step.icon className="size-4 text-ink" aria-hidden="true" />
                </span>
                <p className="mt-3 text-sm font-semibold text-ink">
                  {index + 1}. {step.title}
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-mute">{step.description}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="before-heading" className="mt-12 max-w-3xl">
          <h2 id="before-heading" className="heading-md">
            Before you upload
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
            Upload not working?
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
            <Link to="/subjects" className="btn-ghost-sm">
              Browse subjects
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
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
