import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { getSubjectColor, type Subject } from "@/lib/divhub";

export function SubjectCard({
  subject,
  count,
}: {
  subject: Subject;
  count?: number;
}) {
  const color = getSubjectColor(subject);

  return (
    <Link
      to="/subjects/$subjectId/$category"
      params={{ subjectId: subject.id, category: "notes" }}
      className="hairline-card group relative flex flex-col p-5 overflow-hidden transition-all hover:shadow-whisper border-l-4"
      style={{ borderLeftColor: color }}
    >
      <div className="flex items-center justify-between">
        <span
          className="eyebrow rounded px-2 py-0.5 font-semibold text-[11px]"
          style={{ backgroundColor: `${color}15`, color: color }}
        >
          {subject.code}
        </span>
      </div>
      <h3 className="mt-3 text-[17px] font-semibold leading-6 tracking-[-0.4px] text-ink">
        {subject.name}
      </h3>
      <span className="mt-4 flex items-center gap-1 text-[13px] font-medium text-ink">
        {typeof count === "number"
          ? `${count} resource${count === 1 ? "" : "s"}`
          : "Open subject"}
        <ArrowRight
          className="size-3.5 transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </span>
    </Link>
  );
}
