import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface LogoProps extends HTMLAttributes<HTMLSpanElement> {
  className?: string;
}

export function Logo({ className = "h-8 sm:h-10 w-auto", ...props }: LogoProps) {
  return (
    <span
      className={cn("inline-flex items-center shrink-0 select-none", className)}
      role="img"
      aria-label="SPACE MITAOE"
      {...props}
    >
      <img
        src="/logo-light.png"
        alt="SPACE MITAOE"
        className="h-full w-auto block dark:hidden object-contain"
      />
      <img
        src="/logo-dark.png"
        alt="SPACE MITAOE"
        className="h-full w-auto hidden dark:block object-contain"
      />
    </span>
  );
}

export function LogoIcon({ className = "size-8", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="currentColor"
      role="img"
      aria-label="SPACE Icon"
      className={cn("shrink-0", className)}
      {...props}
    >
      <path
        d="M 50.0 15.0 L 14.0 83.57 L 47.14 63.0 L 49.54 39.0 Z M 50.0 15.0 L 50.46 39.0 L 52.86 63.0 L 86.0 83.57 Z"
        fillRule="evenodd"
      />
    </svg>
  );
}
