import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState, type FormEvent } from "react";

export function SearchBox({
  initialValue = "",
  autoFocus = false,
  large = false,
}: {
  initialValue?: string;
  autoFocus?: boolean;
  large?: boolean;
}) {
  const navigate = useNavigate();
  const [value, setValue] = useState(initialValue);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const q = value.trim();
    if (!q) return;
    void navigate({ to: "/search", search: { q } });
  }

  return (
    <form onSubmit={onSubmit} role="search" className="w-full">
      <label htmlFor="divhub-search" className="sr-only">
        Search notes, files, PYQs and syllabus
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint"
          aria-hidden="true"
        />
        <input
          id="divhub-search"
          name="q"
          type="search"
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search binary tree, DBMS unit 3, OOP PYQ…"
          className={`w-full rounded-sm border border-hairline bg-card pl-9 pr-24 text-ink placeholder:text-faint focus:border-link focus:outline-none ${
            large ? "h-12 text-[15px]" : "h-10 text-sm"
          }`}
        />
        <button
          type="submit"
          className="absolute right-1.5 top-1/2 h-8 -translate-y-1/2 rounded-sm bg-primary px-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Search
        </button>
      </div>
    </form>
  );
}
