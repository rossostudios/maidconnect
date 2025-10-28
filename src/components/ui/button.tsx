import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = {
  href: string;
  label: string;
  variant?: ButtonVariant;
  icon?: boolean;
  className?: string;
};

const baseClasses =
  "inline-flex items-center justify-center rounded-full border text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-[#211f1a] bg-[#211f1a] px-6 py-[0.85rem] text-white shadow-[0_6px_18px_rgba(18,17,15,0.22)] hover:border-[#fd857f] hover:bg-[#2b2624] focus-visible:outline-[#fd857f]",
  secondary:
    "border-[#fd857f] bg-transparent px-6 py-[0.85rem] text-[#fd857f] hover:border-[#d7b59f] hover:text-[#d7b59f] focus-visible:outline-[#d7b59f]",
  ghost:
    "border-transparent text-[#2b2624] px-4 py-2 hover:text-[#d7b59f] focus-visible:outline-[#d7b59f]",
};

export function Button({
  href,
  label,
  variant = "primary",
  icon = false,
  className,
}: ButtonProps) {
  return (
    <Link href={href} className={cn(baseClasses, variantClasses[variant], className)}>
      <span>{label}</span>
      {icon && <ArrowRight className="ml-2 h-4 w-4" />}
    </Link>
  );
}
