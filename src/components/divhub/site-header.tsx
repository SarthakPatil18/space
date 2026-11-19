import { Link } from "@tanstack/react-router";
import { ThemeToggle } from "./theme-toggle";
import { Logo } from "./logo";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/subjects", label: "Subjects" },
  { to: "/search", label: "Search" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-hairline bg-background/90 backdrop-blur-md">
      <div className="container-page flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-sm py-1 transition-opacity hover:opacity-85 shrink-0"
        >
          <Logo className="h-7 sm:h-8 md:h-10 w-auto text-ink" />
        </Link>

        <nav aria-label="Main" className="flex items-center gap-1 sm:gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeOptions={{ exact: link.to === "/" }}
              className="rounded-full px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-body transition-colors hover:bg-hairline-soft hover:text-ink data-[status=active]:text-ink"
            >
              {link.label}
            </Link>
          ))}
          <div className="ml-1 border-l border-hairline pl-2 sm:pl-3">
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 sm:mt-24 border-t border-hairline bg-card/40">
      <div className="container-page flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-8 sm:py-10 text-[13px] text-mute px-4 sm:px-6">
        <div className="space-y-1">
          <Link to="/" className="w-fit transition-opacity hover:opacity-85 block">
            <Logo className="h-5 sm:h-7 w-auto text-ink" />
          </Link>
          <p className="text-xs sm:text-[13px]">Every note. Every PYQ. Every file. One place.</p>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs font-medium">
          <a
            href="mailto:space.mitaoe@gmail.com"
            className="text-mute hover:text-ink transition-colors"
          >
            space.mitaoe@gmail.com
          </a>
          <Link to="/contribute" className="text-mute hover:text-ink transition-colors">
            Contribute
          </Link>
          <Link to="/privacy" className="text-mute hover:text-ink transition-colors">
            Privacy Policy
          </Link>
          <Link to="/terms" className="text-mute hover:text-ink transition-colors">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
