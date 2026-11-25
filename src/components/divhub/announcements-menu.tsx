import { useEffect, useId, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, X } from "lucide-react";
import { announcements, type Announcement } from "@/lib/announcements";

const STORAGE_KEY = "space.announcements.read";

function formatDay(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

function readStoredIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string");
  } catch {
    return [];
  }
}

function storeIds(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function AnnouncementsMenu() {
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[] | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const panelId = useId();

  useEffect(() => {
    setReadIds(readStoredIds());
  }, []);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const known = new Set(announcements.map((item) => item.id));
  const unreadCount =
    readIds === null
      ? 0
      : announcements.filter((item) => !readIds.includes(item.id)).length;

  function markRead(id: string) {
    setReadIds((current) => {
      const next = current ?? [];
      if (next.includes(id)) return next;
      const updated = [...next, id];
      storeIds(updated);
      return updated;
    });
  }

  function markAllRead() {
    const ids = announcements.map((item) => item.id);
    setReadIds(ids);
    storeIds(ids);
  }

  function toggleItem(item: Announcement) {
    setExpandedId((current) => (current === item.id ? null : item.id));
    markRead(item.id);
  }

  const label =
    unreadCount > 0
      ? `Announcements, ${unreadCount} unread`
      : "Announcements";

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative rounded-full p-2 text-mute transition-colors hover:bg-hairline-soft hover:text-ink"
        aria-label={label}
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="dialog"
        title="Announcements"
      >
        <Bell className="size-4" />
        {readIds !== null && unreadCount > 0 ? (
          <span className="absolute top-0.5 right-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-ink px-1 text-[9px] font-semibold leading-none text-background">
            {unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-labelledby={titleId}
          tabIndex={-1}
          className="absolute right-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-4.5rem))] origin-top-right rounded-2xl border border-hairline bg-card shadow-float outline-none animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between gap-3 border-b border-hairline px-4 py-3">
            <h2 id={titleId} className="text-sm font-semibold text-ink">
              Announcements
            </h2>
            <div className="flex items-center gap-2">
              {unreadCount > 0 ? (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-xs font-medium text-mute transition-colors hover:text-ink"
                >
                  Mark all read
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  buttonRef.current?.focus();
                }}
                className="rounded-full p-1 text-mute transition-colors hover:bg-hairline-soft hover:text-ink"
                aria-label="Close announcements"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>

          {announcements.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-mute">
              Nothing new right now.
            </p>
          ) : (
            <ul className="max-h-[min(24rem,70vh)] overflow-y-auto p-2">
              {announcements.map((item) => {
                const expanded = expandedId === item.id;
                const unread =
                  readIds !== null &&
                  known.has(item.id) &&
                  !readIds.includes(item.id);
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => toggleItem(item)}
                      aria-expanded={expanded}
                      className="w-full rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-hairline-soft"
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className={`size-1.5 shrink-0 rounded-full ${unread ? "bg-ink" : "bg-transparent"}`}
                          aria-hidden="true"
                        />
                        <span className="font-mono text-[11px] font-medium text-mute">
                          {formatDay(item.date)}
                        </span>
                      </span>
                      <span className="mt-1 block pl-3.5 text-sm font-medium text-ink">
                        {item.title}
                      </span>
                      {expanded ? null : (
                        <span className="mt-1 line-clamp-2 block pl-3.5 text-[13px] leading-5 text-body">
                          {item.body}
                        </span>
                      )}
                    </button>
                    {expanded ? (
                      <div className="px-3 pb-3 pl-[26px]">
                        <p className="text-[13px] leading-5 text-body">{item.body}</p>
                        {item.to && item.action ? (
                          <Link
                            to={item.to}
                            onClick={() => setOpen(false)}
                            className="mt-2 inline-flex text-[13px] font-medium text-link hover:text-link-deep"
                          >
                            {item.action}
                          </Link>
                        ) : null}
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
