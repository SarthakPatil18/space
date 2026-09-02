import React from "react";

export function GridViewIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="18" height="18" x="3" y="3" rx="4" />
      <path d="M3 12h18" />
      <path d="M12 3v18" />
    </svg>
  );
}

export function ListViewIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="18" height="18" x="3" y="3" rx="4" />
      <path d="M7 8.5h10" />
      <path d="M7 12h10" />
      <path d="M7 15.5h10" />
    </svg>
  );
}

export function ViewModeToggle({
  viewMode,
  onChange,
  color,
}: {
  viewMode: "grid" | "list";
  onChange: (mode: "grid" | "list") => void;
  color?: string;
}) {
  const activeColor = color || "#3B82F6";

  return (
    <div className="inline-flex items-center rounded-xl border border-hairline bg-card/90 p-1 shadow-2xs backdrop-blur-xs">
      <button
        type="button"
        onClick={() => onChange("grid")}
        className={`flex size-9 items-center justify-center rounded-lg transition-all duration-150 cursor-pointer ${
          viewMode === "grid"
            ? "text-white shadow-xs"
            : "text-mute hover:text-ink hover:bg-hairline-soft/50"
        }`}
        style={
          viewMode === "grid"
            ? {
                backgroundColor: activeColor,
                boxShadow: `0 2px 8px -2px ${activeColor}80`,
              }
            : undefined
        }
        title="Grid View"
        aria-label="Switch to Grid View"
      >
        <GridViewIcon className="size-5" />
      </button>

      <button
        type="button"
        onClick={() => onChange("list")}
        className={`flex size-9 items-center justify-center rounded-lg transition-all duration-150 cursor-pointer ${
          viewMode === "list"
            ? "text-white shadow-xs"
            : "text-mute hover:text-ink hover:bg-hairline-soft/50"
        }`}
        style={
          viewMode === "list"
            ? {
                backgroundColor: activeColor,
                boxShadow: `0 2px 8px -2px ${activeColor}80`,
              }
            : undefined
        }
        title="List View"
        aria-label="Switch to List View"
      >
        <ListViewIcon className="size-5" />
      </button>
    </div>
  );
}
