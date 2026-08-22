import { Link } from "@tanstack/react-router";

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
          className="rounded-sm text-[17px] font-semibold tracking-[-0.6px] text-ink"
        >
          DIVHUB
        </Link>

        <nav aria-label="Main" className="flex items-center gap-1">
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
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-hairline">
      <div className="container-page flex flex-col gap-1 py-10 text-[13px] text-mute">
        <p className="font-medium text-ink">DIVHUB</p>
        <p>Notes, files, PYQs and syllabus for your division — nothing else.</p>
      </div>
    </footer>
  );
}
