import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface LogoProps extends HTMLAttributes<HTMLSpanElement> {
  className?: string;
}

export function Logo({ className = "h-6 sm:h-8 md:h-10 w-auto", ...props }: LogoProps) {
  return (
    <span
      className={cn("inline-flex items-center shrink-0 select-none aspect-[886/229] max-w-full", className)}
      role="img"
      aria-label="SPACE MITAOE"
      {...props}
    >
      <img
        src="/logo-light.png"
        alt="SPACE MITAOE"
        width={886}
        height={229}
        className="logo-light-img h-full w-auto max-w-full object-contain"
        loading="eager"
        decoding="async"
      />
      <img
        src="/logo-dark.png"
        alt="SPACE MITAOE"
        width={886}
        height={229}
        className="logo-dark-img h-full w-auto max-w-full object-contain"
        loading="eager"
        decoding="async"
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
