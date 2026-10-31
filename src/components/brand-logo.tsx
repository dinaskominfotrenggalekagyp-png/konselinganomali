import Link from "next/link";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 44" className={cn("h-10 w-10", className)} aria-hidden>
      <defs>
        <linearGradient id="kt-mark" x1="6" y1="4" x2="38" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38bdf8" />
          <stop offset="1" stopColor="#0c4a6e" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="42" height="42" rx="14" fill="url(#kt-mark)" />
      <path
        d="M30.8 11.6c1.6 8.6-.6 15-5.3 18.3-2.2 1.5-4.6 1.9-6.6 1.2"
        stroke="#e0f2fe"
        strokeWidth="2.1"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M31 11.4c-7.9.5-13.4 4-15 9.8-.7 2.4-.1 4.8 1.3 6.4"
        stroke="#7dd3fc"
        strokeWidth="2.1"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M14 31.5c2.9-5.5 7-9.2 12.4-11.3"
        stroke="#e0f2fe"
        strokeWidth="1.7"
        strokeLinecap="round"
        fill="none"
        opacity=".85"
      />
      <circle cx="32" cy="32" r="2.4" fill="#7dd3fc" />
    </svg>
  );
}

export function BrandLogo({
  variant = "dark",
  withTagline = true,
  className,
  logo,
  siteName = "Konseling Trenggalek",
  tagline = "Psikologi & Kesehatan Mental",
}: {
  variant?: "dark" | "light";
  withTagline?: boolean;
  className?: string;
  logo?: string | null;
  siteName?: string;
  tagline?: string;
}) {
  const words = siteName.trim().split(/\s+/).filter(Boolean);
  const first = words[0] ?? "Konseling";
  const rest = words.slice(1).join(" ");

  return (
    <Link href="/" className={cn("group flex items-center gap-2.5", className)}>
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo}
          alt={siteName}
          className="h-10 w-10 shrink-0 rounded-xl object-contain transition-transform duration-300 group-hover:-rotate-3"
        />
      ) : (
        <BrandMark className="h-10 w-10 shrink-0 transition-transform duration-300 group-hover:-rotate-3" />
      )}
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-serif text-[16.5px] font-semibold leading-[1.05] tracking-tight",
            variant === "light" ? "text-white" : "text-brand-deep"
          )}
        >
          {first}
          {rest && (
            <>
              <br />
              <span className={variant === "light" ? "text-brand-accent" : "text-brand"}>
                {rest}
              </span>
            </>
          )}
        </span>
        {withTagline && (
          <span
            className={cn(
              "mt-1.5 text-[8.5px] font-semibold uppercase tracking-[0.18em]",
              variant === "light" ? "text-white/50" : "text-muted/70"
            )}
          >
            {tagline}
          </span>
        )}
      </span>
    </Link>
  );
}
