import { Link } from "@tanstack/react-router";
import { FileText, Inbox, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("hairline-card", className)}>{children}</div>;
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="hairline-card flex flex-col items-center gap-2 px-6 py-14 text-center">
      <Inbox className="mb-1 size-5 text-faint" aria-hidden="true" />
      <p className="text-[15px] font-medium text-ink">{title}</p>
      <p className="max-w-sm text-sm text-mute">{description}</p>
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  message = "Something went wrong while loading this page.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="hairline-card flex flex-col items-center gap-2 px-6 py-14 text-center">
      <TriangleAlert className="mb-1 size-5 text-destructive" aria-hidden="true" />
      <p className="text-[15px] font-medium text-ink">Couldn't load content</p>
      <p className="max-w-sm text-sm text-mute">{message}</p>
      {onRetry ? (
        <button type="button" className="btn-ghost-sm mt-3" onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </div>
  );
}

export function SkeletonRows({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-2" aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="hairline-card h-[68px] animate-pulse bg-hairline-soft"
        />
      ))}
    </div>
  );
}

export function FileIcon({
  color = "#64748B",
}: {
  type?: string | null;
  color?: string | null;
}) {
  const accentColor = color || "#64748B";

  return (
    <span
      className="flex size-9 shrink-0 items-center justify-center rounded-lg border transition-colors"
      style={{
        backgroundColor: `${accentColor}15`,
        borderColor: `${accentColor}40`,
      }}
      aria-hidden="true"
    >
      <FileText className="size-4 shrink-0" style={{ color: accentColor }} />
    </span>
  );
}

export type Crumb = { label: string; to?: string; params?: Record<string, string> };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1.5 text-[13px] text-mute">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {item.to ? (
              item.params ? (
                <Link
                  to={item.to as any}
                  params={item.params as any}
                  className="rounded-sm hover:text-ink"
                >
                  {item.label}
                </Link>
              ) : (
                <Link
                  to={item.to as any}
                  className="rounded-sm hover:text-ink"
                >
                  {item.label}
                </Link>
              )
            ) : (
              <span className="text-body">{item.label}</span>
            )}
            {i < items.length - 1 ? (
              <span aria-hidden="true" className="text-faint">
                /
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}
