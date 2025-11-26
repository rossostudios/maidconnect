import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";

export type BenefitCardProps = {
  /**
   * Icon to display (HugeIcons core icon component)
   */
  icon: any;
  /**
   * Benefit title
   */
  title: string;
  /**
   * Benefit description
   */
  description: string;
  /**
   * Optional additional class names
   */
  className?: string;
};

/**
 * BenefitCard Component
 *
 * Minimalist benefit card with Anthropic-inspired rounded icon container,
 * following Lia design patterns. Features left-aligned text and
 * clean typography hierarchy.
 *
 * @example
 * ```tsx
 * import { Shield01Icon } from '@hugeicons/core-free-icons';
 * import { HugeiconsIcon } from '@hugeicons/react';
 *
 * <BenefitCard
 *   icon={<HugeiconsIcon icon={Shield01Icon} />}
 *   title="Full Insurance"
 *   description="Comprehensive coverage and protection for your peace of mind"
 * />
 * ```
 */
export function BenefitCard({ icon, title, description, className = "" }: BenefitCardProps) {
  return (
    <div
      className={cn("flex flex-col gap-4 text-left sm:flex-row sm:items-start sm:gap-6", className)}
    >
      {/* Icon column */}
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 shadow-inner">
        <HugeiconsIcon className="h-7 w-7 text-rausch-600" icon={icon} />
      </div>

      {/* Copy column */}
      <div className="space-y-2">
        <h3 className="font-semibold text-neutral-900 text-xl tracking-tight">{title}</h3>
        <p className="text-neutral-600 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
