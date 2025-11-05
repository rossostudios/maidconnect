import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
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
  "group inline-flex items-center justify-center rounded-full border font-medium transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]";

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-6 py-[0.75rem] text-sm",
  md: "px-8 py-[0.9rem] text-sm",
  lg: "px-10 py-[1.15rem] text-base",
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-transparent bg-[var(--red)] text-white shadow-[var(--shadow-card)] hover:bg-[var(--red-hover)] hover:shadow-[var(--shadow-elevated)] active:scale-[0.98]",
  secondary:
    "border-[var(--red)] bg-transparent text-[var(--red)] hover:bg-[var(--red)] hover:text-white active:scale-[0.98]",
  ghost:
    "border-transparent text-[var(--foreground)] hover:text-[var(--red)] hover:bg-[var(--red-light)] active:scale-[0.98]",
  card: "w-full justify-between gap-3 border border-transparent bg-[var(--red)] text-white shadow-[var(--shadow-elevated)] hover:bg-[var(--red-hover)] hover:shadow-[var(--shadow-dramatic)] active:scale-[0.98]",
  luxury:
    "border-[var(--red)] bg-white text-[var(--red)] hover:bg-[var(--red)] hover:text-white active:scale-[0.98]",
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
              className="border-[var(--border)] bg-white/10 font-medium text-current opacity-80 transition-opacity group-hover:opacity-100"
              size="lg"
              variant="outline"
            >
              {kbd}
            </Kbd>
          );
        }
        if (icon) {
          return (
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-current/15 text-current transition-all group-hover:scale-110 group-hover:bg-current/25">
              <HugeiconsIcon
                aria-hidden="true"
                className="h-4 w-4"
                icon={ArrowRight01Icon}
                strokeWidth={2}
              />
            </span>
          );
        }
        return null;
      })()}
    </Link>
  );
}
