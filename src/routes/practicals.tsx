import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Copy, Search, X } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/divhub/site-header";
import { Breadcrumbs } from "@/components/divhub/ui-bits";
import { morePrograms, moreProgramsCode } from "@/lib/more-programs";
import { practicals, programText, type Practical, type Program } from "@/lib/practicals";

export const Route = createFileRoute("/practicals")({
  head: () => ({
    meta: [
      { title: "Practicals — SPACE" },
      {
        name: "description",
        content:
          "DSA lab programs for arrays, hashing, sorting, linked lists, stacks, queues, trees, and graphs.",
      },
      { property: "og:title", content: "Practicals — SPACE" },
      {
        property: "og:description",
        content: "Each practical, with its title and the code.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: PracticalsPage,
});

function combinedCode() {
  return practicals
    .map((practical) => {
      const heading =
        practical.number === "A"
          ? `Additional — ${practical.title}`
          : `Practical ${practical.number} — ${practical.title}`;

      return practical.programs
        .map((item, index) => {
          const name = practical.programs.length > 1 ? `${index + 1}. ${item.name}` : item.name;
          return `/* ${heading}\n   ${name} */\n\n${item.code}`;
        })
        .join("\n\n");
    })
    .join("\n\n");
}

const everyProgram = combinedCode();
const everyMoreProgram = moreProgramsCode();

function CodeBox({
  code,
  label,
  copyLabel = "Copy",
  tall = false,
}: {
  code: string;
  label: string;
  copyLabel?: string;
  tall?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-hairline bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-hairline bg-hairline-soft/70 px-3 py-2 sm:px-4">
        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-mute">
          C++
        </span>
        <button
          type="button"
          onClick={() => void copyCode()}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] font-medium text-mute transition-colors hover:bg-background hover:text-ink"
          aria-label={copied ? `${label} copied` : `Copy ${label}`}
        >
          {copied ? (
            <Check className="size-3.5" aria-hidden="true" />
          ) : (
            <Copy className="size-3.5" aria-hidden="true" />
          )}
          {copied ? "Copied" : copyLabel}
        </button>
      </div>
      <pre
        className={`overflow-x-auto px-3 py-4 sm:px-5 sm:py-5 ${tall ? "max-h-[70vh] overflow-y-auto" : ""}`}
      >
        <code className="block font-mono text-[12.5px] leading-6 text-ink sm:text-[13px]">
          {code}
        </code>
      </pre>
    </div>
  );
}

function matchesQuery(value: string, query: string) {
  return value.toLowerCase().includes(query);
}

function titleHit(practical: Practical, query: string) {
  if (matchesQuery(practical.title, query)) return true;
  const compact = query.replace(/^practical\s+/, "").trim();
  return compact === practical.number.toLowerCase();
}

function visiblePracticals(query: string): Practical[] {
  const q = query.trim().toLowerCase();
  if (!q) return practicals;

  return practicals.flatMap((practical) => {
    if (
      titleHit(practical, q) ||
      matchesQuery(practical.summary, q) ||
      matchesQuery(practical.note ?? "", q)
    ) {
      return [practical];
    }

    const programs = practical.programs.filter((item) => matchesQuery(programText(item), q));
    return programs.length > 0 ? [{ ...practical, programs }] : [];
  });
}

function PracticalSection({ practical }: { practical: Practical }) {
  const label = practical.number === "A" ? "Additional" : `Practical ${practical.number}`;

  return (
    <section aria-labelledby={`practical-${practical.number}`} className="scroll-mt-28">
      <p className="eyebrow">{label}</p>
      <h2
        id={`practical-${practical.number}`}
        className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl"
      >
        {practical.title}
      </h2>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-body">{practical.summary}</p>
      {practical.note ? (
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-body">{practical.note}</p>
      ) : null}

      <div className="mt-8 space-y-10">
        {practical.programs.map((item, index) => (
          <ProgramArticle
            key={item.name}
            practicalNumber={practical.number}
            index={index}
            program={item}
            showHeading={practical.programs.length > 1 || item.name !== practical.title}
          />
        ))}
      </div>
    </section>
  );
}

function ProgramArticle({
  practicalNumber,
  index,
  program,
  showHeading,
}: {
  practicalNumber: string;
  index: number;
  program: Program;
  showHeading: boolean;
}) {
  const id = `program-${practicalNumber}-${index + 1}`;

  return (
    <article aria-labelledby={showHeading ? id : undefined} className="scroll-mt-28">
      {showHeading ? (
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[12px] font-medium tabular-nums text-mute">
            {index + 1}.
          </span>
          <h3 id={id} className="text-lg font-semibold tracking-tight text-ink sm:text-xl">
            {program.name}
          </h3>
        </div>
      ) : null}
      {program.note ? (
        <p className="mt-2 text-sm leading-relaxed text-body">{program.note}</p>
      ) : null}
      <CodeBox code={program.code} label={program.name} />
    </article>
  );
}

function PracticalsPage() {
  const [query, setQuery] = useState("");
  const results = useMemo(() => visiblePracticals(query), [query]);
  const shown = results.reduce((count, practical) => count + practical.programs.length, 0);
  const total = practicals.reduce((count, practical) => count + practical.programs.length, 0);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="container-page flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <div className="max-w-3xl">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Practicals" }]} />

          <p className="eyebrow">Lab programs</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Practicals
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-body">
            Nine practicals, plus three extra programs. Each one is listed with its title and the
            code.
          </p>

          <nav aria-label="Practicals" className="mt-6">
            <ol className="flex flex-wrap gap-2">
              {practicals.map((practical) => (
                <li key={practical.number}>
                  <a
                    href={`#practical-${practical.number}`}
                    className="inline-flex rounded-full border border-hairline px-3 py-1 text-[12px] font-medium text-body transition-colors hover:bg-hairline-soft hover:text-ink"
                  >
                    {practical.number === "A" ? "Additional" : practical.number}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <form
            role="search"
            className="sticky top-14 z-20 mt-6 bg-background/95 py-3 backdrop-blur-md sm:top-16"
            onSubmit={(event) => event.preventDefault()}
          >
            <label htmlFor="practical-search" className="sr-only">
              Search practicals
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-mute"
                aria-hidden="true"
              />
              <input
                id="practical-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search practicals, hashing, queue, BST..."
                className="h-11 w-full rounded-xl border border-hairline bg-card pr-10 pl-10 text-sm text-ink placeholder:text-mute focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1.5 text-mute transition-colors hover:text-ink"
                  aria-label="Clear search"
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              ) : null}
            </div>
            {query.trim() ? (
              <p className="mt-2 text-xs text-mute" aria-live="polite">
                {shown === 0 ? "No programs match that search." : `${shown} of ${total} programs`}
              </p>
            ) : null}
          </form>
        </div>

        {results.length === 0 ? (
          <p className="mt-8 max-w-3xl text-sm text-body">
            Nothing matched “{query.trim()}”. Try a practical number, a program name, or a word from
            the code.
          </p>
        ) : (
          <div className="mt-8 max-w-3xl space-y-16">
            {results.map((practical) => (
              <PracticalSection key={practical.number} practical={practical} />
            ))}
          </div>
        )}

        <section aria-labelledby="all-codes" className="mt-16 max-w-3xl scroll-mt-28">
          <p className="eyebrow">All programs</p>
          <h2
            id="all-codes"
            className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl"
          >
            Every program
          </h2>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-body">
            All {total} programs in one place. Copy takes the whole file.
          </p>
          <CodeBox code={everyProgram} label="all programs" copyLabel="Copy all" tall />
        </section>

        <section aria-labelledby="more-codes" className="mt-16 max-w-3xl scroll-mt-28">
          <p className="eyebrow">More programs</p>
          <h2
            id="more-codes"
            className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl"
          >
            Every program
          </h2>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-body">
            Hashing, linked lists, and the student record tree. Copy takes this whole set.
          </p>
          <ol className="mt-4 flex flex-wrap gap-2">
            {morePrograms.map((item) => (
              <li
                key={item.id}
                className="rounded-full border border-hairline px-3 py-1 font-mono text-[12px] text-body"
              >
                {item.id}. {item.name}
              </li>
            ))}
          </ol>
          <CodeBox code={everyMoreProgram} label="more programs" copyLabel="Copy all" tall />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
