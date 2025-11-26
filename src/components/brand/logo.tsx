import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoSize = "sm" | "md" | "lg";
type LogoVariant = "full" | "mark";

type LogoProps = {
  size?: LogoSize;
  variant?: LogoVariant;
  className?: string;
  /** Show full lockup on desktop, mark-only on mobile */
  responsive?: boolean;
};

const sizeConfig: Record<LogoSize, { mark: number; text: string; gap: string }> = {
  sm: { mark: 24, text: "text-lg", gap: "gap-2" },
  md: { mark: 32, text: "text-xl", gap: "gap-2.5" },
  lg: { mark: 36, text: "text-2xl", gap: "gap-3" },
};

/**
 * Logo - Casaora Brand Lockup
 *
 * Combines the isologo mark with the CASAORA wordmark.
 * - Full lockup: Mark + wordmark (desktop default)
 * - Mark only: Just the isologo (mobile nav, compact spaces)
 * - Responsive: Automatically switches based on viewport
 */
export function Logo({ size = "md", variant = "full", className, responsive = false }: LogoProps) {
  const config = sizeConfig[size];

  const Mark = (
    <Image
      alt=""
      aria-hidden="true"
      className="flex-shrink-0"
      height={config.mark}
      src="/isologo.svg"
      width={config.mark}
    />
  );

  const Wordmark = (
    <span
      className={cn(
        "font-[family-name:var(--font-geist-sans)] font-semibold uppercase tracking-tight",
        "text-foreground",
        config.text
      )}
    >
      CASAORA<span className="text-rausch-500">®</span>
    </span>
  );

  // Mark-only variant
  if (variant === "mark" && !responsive) {
    return (
      <div className={cn("flex items-center", className)}>
        {Mark}
        <span className="sr-only">Casaora</span>
      </div>
    );
  }

  // Responsive variant: mark on mobile, full on desktop
  if (responsive) {
    return (
      <div className={cn("flex items-center", config.gap, className)}>
        {Mark}
        <span
          className={cn(
            "hidden sm:inline",
            "font-[family-name:var(--font-geist-sans)] font-semibold uppercase tracking-tight",
            "text-foreground",
            config.text
          )}
        >
          CASAORA<span className="text-rausch-500">®</span>
        </span>
      </div>
    );
  }

  // Full lockup (default)
  return (
    <div className={cn("flex items-center", config.gap, className)}>
      {Mark}
      {Wordmark}
    </div>
  );
}

/**
 * LogoMark - Just the isologo mark
 * Convenience export for compact spaces
 */
export function LogoMark({ size = "md", className }: { size?: LogoSize; className?: string }) {
  return <Logo className={className} size={size} variant="mark" />;
}
