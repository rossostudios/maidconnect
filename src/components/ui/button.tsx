import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "card";

type ButtonProps = {
  href: string;
  label: string;
  variant?: ButtonVariant;
  icon?: boolean;
  className?: string;
};

const baseClasses =
  "group inline-flex items-center justify-center rounded-full border font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-[#211f1a] bg-[#211f1a] px-6 py-[0.85rem] text-sm text-white shadow-[0_6px_18px_rgba(18,17,15,0.22)] hover:border-[#fd857f] hover:bg-[#2b2624] focus-visible:outline-[#fd857f]",
  secondary:
    "border-[#fd857f] bg-transparent px-6 py-[0.85rem] text-sm text-[#fd857f] hover:border-[#211f1a] hover:text-[#211f1a] focus-visible:outline-[#fd857f]",
  ghost:
    "border-transparent px-4 py-2 text-sm text-[#2b2624] hover:text-[#d7b59f] focus-visible:outline-[#d7b59f]",
  card:
    "w-full justify-between gap-3 border border-transparent bg-[#211f1a] px-6 py-3 text-sm text-white shadow-[0_12px_36px_rgba(17,16,14,0.22)] hover:bg-[#2b2624] focus-visible:outline-[#fd857f]",
};

export function Button({
  href,
  label,
  variant = "primary",
  icon = false,
  className,
}: ButtonProps) {
  return (
    <Link
      href={href}
      className={cn(baseClasses, variantClasses[variant], icon && "gap-3", className)}
    >
      <span>{label}</span>
      {icon ? (
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-current/20 text-current transition group-hover:bg-current/30">
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </span>
      ) : null}
    </Link>
  );
}
