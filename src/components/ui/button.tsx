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
  "inline-flex items-center justify-center rounded-full text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[#fd857f] text-[#2f2624] px-6 py-[0.85rem] shadow-[0_6px_18px_rgba(253,133,127,0.18)] hover:bg-[#fc6f68] focus-visible:outline-[#fd857f]",
  secondary:
    "border border-[#dcd7ce] text-[#3f3a31] px-6 py-[0.85rem] hover:border-[#2b2624] hover:text-[#211f1a] bg-transparent focus-visible:outline-[#bdb7ab]",
  ghost:
    "text-[#3f3a31] px-4 py-2 hover:text-[#fd857f] focus-visible:outline-[#fd857f]",
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
