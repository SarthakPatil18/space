import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Copy, Search, X } from "lucide-react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { SiteFooter, SiteHeader } from "@/components/divhub/site-header";
import { Breadcrumbs } from "@/components/divhub/ui-bits";
import {
  blockText,
  practicals,
  programText,
  type Block,
  type Practical,
  type Program,
} from "@/lib/practicals";

export const Route = createFileRoute("/practicals")({
  head: () => ({
    meta: [
      { title: "Practicals — SPACE" },
      {
        name: "description",
        content:
          "Lab programs for linear algebra, probability, hypothesis testing, Markov chains, correlation, regression, and numerical methods.",
      },
      { property: "og:title", content: "Practicals — SPACE" },
      {
        property: "og:description",
        content: "Each practical program, with its name, formula, and code.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: PracticalsPage,
});

function Formula({ tex }: { tex: string }) {
  const html = katex.renderToString(tex, {
    throwOnError: false,
    displayMode: true,
    output: "html",
  });

  return (
    <div
      className="mt-4 overflow-x-auto rounded-xl border border-hairline bg-card px-4 py-5 text-center text-ink [&_.katex]:text-ink"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function CodeBox({ code, label }: { code: string; label: string }) {
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
          Python
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
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto px-3 py-4 sm:px-5 sm:py-5">
        <code className="block font-mono text-[12.5px] leading-6 text-ink sm:text-[13px]">{code}</code>
      </pre>
    </div>
  );
}

function SampleBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-hairline bg-hairline-soft/50">
      <p className="border-b border-hairline px-4 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-mute">
        {title}
      </p>
      <pre className="overflow-x-auto px-4 py-3 font-mono text-[12.5px] leading-6 text-ink whitespace-pre-wrap">
        {text}
      </pre>
    </div>
  );
}

function Points({ title, items }: { title?: string; items: string[] }) {
  return (
    <div className="mt-4">
      {title ? <h4 className="text-sm font-semibold text-ink">{title}</h4> : null}
      <ul className={`space-y-1.5 ${title ? "mt-2" : ""}`}>
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-relaxed text-body">
            <span className="mt-[7px] size-1 shrink-0 rounded-full bg-mute" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function InfoTable({
  title,
  headers,
  rows,
}: {
  title?: string;
  headers: [string, string];
  rows: [string, string][];
}) {
  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-hairline bg-card">
      {title ? (
        <p className="border-b border-hairline px-4 py-2.5 text-sm font-semibold text-ink">{title}</p>
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[28rem] text-left text-sm">
          <thead>
            <tr className="border-b border-hairline bg-hairline-soft/70">
              {headers.map((header) => (
                <th key={header} className="px-4 py-2.5 font-medium text-mute">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.join("|")} className="border-b border-hairline last:border-0">
                <th scope="row" className="px-4 py-2.5 align-top font-medium text-ink">
                  {row[0]}
                </th>
                <td className="px-4 py-2.5 align-top text-body">{row[1]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Blocks({ blocks, label }: { blocks: Block[]; label: string }) {
  return (
    <>
      {blocks.map((block, index) => {
        const key = `${label}-${index}`;
        switch (block.type) {
          case "text":
            return (
              <p key={key} className="mt-3 text-sm leading-relaxed text-body">
                {block.text}
              </p>
            );
          case "formula":
            return <Formula key={key} tex={block.tex} />;
          case "code":
            return <CodeBox key={key} code={block.code} label={label} />;
          case "points":
            return <Points key={key} title={block.title} items={block.items} />;
          case "table":
            return (
              <InfoTable key={key} title={block.title} headers={block.headers} rows={block.rows} />
            );
          case "sample":
            return <SampleBlock key={key} title={block.title} text={block.text} />;
        }
      })}
    </>
  );
}

function matchesQuery(value: string, query: string) {
  return value.toLowerCase().includes(query);
}

function titleHit(practical: Practical, query: string) {
  if (matchesQuery(practical.title, query)) return true;
  const compact = query.replace(/^practical\s+/, "").trim();
  const padded = practical.number.toLowerCase();
  const plain = String(Number(practical.number));
  return compact === padded || compact === plain;
}

function visiblePracticals(query: string): Practical[] {
  const q = query.trim().toLowerCase();
  if (!q) return practicals;

  return practicals.flatMap((practical) => {
    if (titleHit(practical, q)) return [practical];

    const programs = practical.programs.filter((program) => matchesQuery(programText(program), q));
    const after = (practical.after ?? []).filter((block) => matchesQuery(blockText(block), q));
    const summaryHit = matchesQuery(practical.summary, q);

    if (programs.length === 0 && after.length === 0) {
      return summaryHit ? [practical] : [];
    }

    return [
      {
        ...practical,
        programs,
        after: after.length > 0 ? after : undefined,
      },
    ];
  });
}

function PracticalSection({ practical }: { practical: Practical }) {
  return (
    <section aria-labelledby={`practical-${practical.number}`} className="scroll-mt-28">
      <p className="eyebrow">Practical {practical.number}</p>
      <h2
        id={`practical-${practical.number}`}
        className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-ink"
      >
        {practical.title}
      </h2>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-body">{practical.summary}</p>

      <div className="mt-8 space-y-10">
        {practical.programs.map((program, index) => (
          <ProgramArticle
            key={program.name}
            practicalNumber={practical.number}
            index={index}
            program={program}
          />
        ))}
      </div>

      {practical.after?.length ? (
        <div className="mt-10">
          <Blocks blocks={practical.after} label={`Practical ${practical.number} notes`} />
        </div>
      ) : null}
    </section>
  );
}

function ProgramArticle({
  practicalNumber,
  index,
  program,
}: {
  practicalNumber: string;
  index: number;
  program: Program;
}) {
  const number = String(index + 1).padStart(2, "0");
  const title = `Program ${index + 1}: ${program.name}`;
  const id = `program-${practicalNumber}-${number}`;

  return (
    <article aria-labelledby={id} className="scroll-mt-28">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-[12px] font-medium tabular-nums text-mute">{number}</span>
        <h3 id={id} className="text-lg sm:text-xl font-semibold tracking-tight text-ink">
          {title}
        </h3>
      </div>
      <Blocks blocks={program.blocks} label={title} />
    </article>
  );
}

function PracticalsPage() {
  const [query, setQuery] = useState("");
  const results = useMemo(() => visiblePracticals(query), [query]);
  const shown = results.reduce((count, practical) => count + practical.programs.length, 0);
  const total = practicals.reduce((count, practical) => count + practical.programs.length, 0);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="container-page flex-1 py-10 sm:py-14 px-4 sm:px-6">
        <div className="max-w-3xl">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Practicals" }]} />

          <p className="eyebrow">Lab programs</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-ink">Practicals</h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-body">
            Six practicals. Each program is listed on its own, with the formula and the code.
          </p>

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
                className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-mute"
                aria-hidden="true"
              />
              <input
                id="practical-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search practicals, binomial, Markov, regression..."
                className="h-11 w-full rounded-xl border border-hairline bg-card pl-10 pr-10 text-sm text-ink placeholder:text-mute focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-mute transition-colors hover:text-ink"
                  aria-label="Clear search"
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              ) : null}
            </div>
            {query.trim() ? (
              <p className="mt-2 text-xs text-mute" aria-live="polite">
                {shown === 0
                  ? "No programs match that search."
                  : `${shown} of ${total} programs`}
              </p>
            ) : null}
          </form>
        </div>

        {results.length === 0 ? (
          <p className="mt-8 max-w-3xl text-sm text-body">
            Nothing matched “{query.trim()}”. Try a practical number, a program name, or a word from the code.
          </p>
        ) : (
          <div className="mt-8 max-w-3xl space-y-16">
            {results.map((practical) => (
              <PracticalSection key={practical.number} practical={practical} />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
