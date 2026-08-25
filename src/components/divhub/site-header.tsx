import { Link } from "@tanstack/react-router";
import { ThemeToggle } from "./theme-toggle";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/subjects", label: "Subjects" },
  { to: "/search", label: "Search" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-hairline bg-background/85 backdrop-blur">
      <div className="container-page flex h-14 items-center justify-between gap-4">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-sm transition-opacity hover:opacity-90"
        >
          <img
            src="/logo.png"
            alt="SPACE MITAOE"
            className="h-8 w-auto object-contain mix-blend-multiply dark:invert dark:mix-blend-screen"
          />
        </Link>

        <nav aria-label="Main" className="flex items-center gap-1 sm:gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeOptions={{ exact: link.to === "/" }}
              className="rounded-full px-3 py-1.5 text-sm text-body transition-colors hover:bg-hairline-soft hover:text-ink data-[status=active]:text-ink"
            >
              {link.label}
            </Link>
          ))}
          <Link to="/admin" className="btn-ghost-sm ml-1">
            Admin
          </Link>
          <div className="ml-1 border-l border-hairline pl-2">
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-hairline">
      <div className="container-page flex flex-col gap-2 py-10 text-[13px] text-mute">
        <Link to="/" className="w-fit">
          <img
            src="/logo.png"
            alt="SPACE MITAOE"
            className="h-7 w-auto object-contain mix-blend-multiply dark:invert dark:mix-blend-screen"
          />
        </Link>
        <p>Every note. Every PYQ. Every file. One place.</p>
      </div>
    </footer>
  );
}
