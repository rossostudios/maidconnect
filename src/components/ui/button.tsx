import { ArrowRight } from "lucide-react";
import { Kbd } from "@/components/ui/kbd";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "card" | "luxury";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
  href: string;
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: boolean;
  kbd?: string;
  className?: string;
};

const baseClasses =
  "group inline-flex items-center justify-center rounded-full border font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]";

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-5 py-[0.7rem] text-sm",
  md: "px-6 py-[0.85rem] text-sm",
  lg: "px-8 py-[1.1rem] text-base",
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-transparent bg-[var(--surface-contrast)] text-[var(--background)] shadow-[var(--shadow-card)] hover:bg-[color-mix(in_srgb,var(--surface-contrast)_88%,var(--accent)_12%)] hover:shadow-[var(--shadow-elevated)] active:translate-y-px",
  secondary:
    "border-[color:var(--accent)] bg-transparent text-[var(--accent)] hover:bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] hover:text-[var(--surface-contrast)] active:translate-y-px",
  ghost:
    "border-transparent text-[var(--foreground)] hover:text-[var(--accent)] hover:bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] active:translate-y-px",
  card: "w-full justify-between gap-3 border border-transparent bg-[var(--surface-contrast)] text-[var(--background)] shadow-[var(--shadow-elevated)] hover:bg-[color-mix(in_srgb,var(--surface-contrast)_88%,var(--accent)_12%)] hover:shadow-[var(--shadow-dramatic)] active:translate-y-px",
  luxury:
    "border-[color:var(--surface-contrast)] bg-[var(--background)] text-[var(--surface-contrast)] hover:bg-[var(--surface-contrast)] hover:text-[var(--background)] active:translate-y-px",
};

export function Button({
  href,
  label,
  variant = "primary",
  size = "md",
  icon = false,
  kbd,
  className,
}: ButtonProps) {
  const hasIconOrKbd = icon || kbd;

  return (
    <Link
      className={cn(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        hasIconOrKbd && "gap-3",
        className
      )}
      href={href}
    >
      <span>{label}</span>
      {(() => {
        if (kbd) {
          return (
            <Kbd
              className="border-[color:var(--border)] bg-[color-mix(in_srgb,var(--surface-contrast)_12%,transparent)] font-medium text-[var(--surface-contrast)] opacity-80 transition-opacity group-hover:opacity-100"
              size="lg"
              variant="outline"
            >
              {kbd}
            </Kbd>
          );
        }
        if (icon) {
          return (
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-current/20 text-current transition group-hover:bg-current/30">
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </span>
          );
        }
        return null;
      })()}
    </Link>
  );
}
