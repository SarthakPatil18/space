import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { Subject } from "@/lib/divhub";

export function SubjectCard({
  subject,
  count,
}: {
  subject: Subject;
  count?: number;
}) {
  return (
    <Link
      to="/subjects/$subjectId"
      params={{ subjectId: subject.id }}
      className="hairline-card group flex flex-col p-5 transition-shadow hover:shadow-whisper"
    >
      <div className="flex items-center justify-between">
        <span className="eyebrow">{subject.code}</span>
        <span className="text-[12px] text-faint">Sem {subject.semester}</span>
      </div>
      <h3 className="mt-3 text-[17px] font-semibold leading-6 tracking-[-0.4px] text-ink">
        {subject.name}
      </h3>
      {subject.description ? (
        <p className="mt-1.5 line-clamp-2 text-[13px] text-mute">
          {subject.description}
        </p>
      ) : null}
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
