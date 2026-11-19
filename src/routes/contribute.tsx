import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  Clock,
  FolderOpen,
  HeartHandshake,
  Mail,
  NotebookPen,
  ScrollText,
  ShieldCheck,
  FileQuestion,
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
    description: "Lecture notes, handwritten notes, cheat sheets and study material.",
  },
  {
    icon: FileQuestion,
    title: "PYQs",
    description: "Previous year question papers, with the exam year and type if you know them.",
  },
  {
    icon: ScrollText,
    title: "Syllabus",
    description: "Official syllabus documents for any subject or unit.",
  },
  {
    icon: FolderOpen,
    title: "Files",
    description: "Presentations, lab manuals, reference sheets and other subject material.",
  },
];

const guidelines = [
  "Include the subject name, semester and section so the file lands in the right place.",
  "Send clear, readable files. Scans should be straight, in focus and full-page.",
  "Use descriptive file names — for example, DBMS_Unit3_Notes.pdf instead of IMG_2041.pdf.",
  "Only share material you are allowed to pass on. No answer keys that are meant to stay private.",
  "Remove personal information like roll numbers, phone numbers and signatures.",
];

const steps = [
  {
    title: "Send your files",
    description: "Email the documents to us. A Drive link, a zip or a folder of PDFs all work.",
  },
  {
    title: "We review it",
    description:
      "We check the subject, category and readability, then file everything in the right place.",
  },
  {
    title: "Everyone gets it",
    description:
      "Your material goes live in seconds for every student in the division — no login needed.",
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
            Your notes can save someone a night.
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] sm:text-base leading-relaxed text-body">
            Space grows because students share. If you have notes, question papers, syllabus
            documents or any other useful subject material, send it over — it takes a minute and
            helps the whole division.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a href={mailtoHref} className="btn-primary-sm">
              <Mail className="size-4" aria-hidden="true" />
              Send your files
            </a>
            <Link to="/subjects" className="btn-ghost-sm">
              See what's missing
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <section aria-labelledby="categories-heading" className="mt-14">
          <div className="max-w-3xl">
            <p className="eyebrow">What to send</p>
            <h2 id="categories-heading" className="heading-lg mt-1">
              The four things every subject needs
            </h2>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {categories.map((category) => (
              <div key={category.title} className="hairline-card p-5">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-8 items-center justify-center rounded-lg border border-hairline bg-hairline-soft">
                    <category.icon className="size-4 text-ink" aria-hidden="true" />
                  </span>
                  <h3 className="text-[15px] font-semibold text-ink">{category.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-mute">{category.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="send-heading" className="mt-14">
          <div className="max-w-3xl">
            <p className="eyebrow">Before you send</p>
            <h2 id="send-heading" className="heading-lg mt-1">
              A few small things that help a lot
            </h2>
          </div>

          <ul className="mt-6 space-y-3">
            {guidelines.map((guideline) => (
              <li
                key={guideline}
                className="flex items-start gap-3 text-[15px] leading-relaxed text-body"
              >
                <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <span>{guideline}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="how-heading" className="mt-14">
          <div className="max-w-3xl">
            <p className="eyebrow">How it works</p>
            <h2 id="how-heading" className="heading-lg mt-1">
              From your inbox to the library
            </h2>
          </div>

          <ol className="mt-6 grid gap-4 sm:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title} className="hairline-card p-5">
                <span className="eyebrow">Step {index + 1}</span>
                <h3 className="mt-2 text-[15px] font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mute">{step.description}</p>
              </li>
            ))}
          </ol>

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-faint">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" aria-hidden="true" />
              Most files are live within a day
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              Reviewed before publishing
            </span>
            <span className="inline-flex items-center gap-1.5">
              <HeartHandshake className="size-3.5" aria-hidden="true" />
              Free for every student
            </span>
          </div>
        </section>

        <section
          aria-labelledby="contact-heading"
          className="mt-14 max-w-3xl hairline-card p-6 sm:p-8"
        >
          <h2 id="contact-heading" className="heading-md">
            Ready to send something?
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-body">
            Email your files to{" "}
            <a
              href="mailto:space.mitaoe@gmail.com"
              className="font-medium text-ink underline underline-offset-4 transition-opacity hover:opacity-80"
            >
              space.mitaoe@gmail.com
            </a>{" "}
            with the subject, semester and category. Want credit for your contribution? Say so and
            we'll add your name to the resource.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <a href={mailtoHref} className="btn-primary-sm">
              <Mail className="size-4" aria-hidden="true" />
              Email a contribution
            </a>
            <Link to="/terms" className="btn-ghost-sm">
              Read the contribution guidelines
            </Link>
          </div>

          <p className="mt-5 text-xs leading-relaxed text-faint">
            By sending material you confirm it is safe to share for educational use. If something
            needs to be corrected or removed, see the{" "}
            <Link to="/terms" className="text-mute underline underline-offset-4 hover:text-ink">
              Terms of Service
            </Link>
            .
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
