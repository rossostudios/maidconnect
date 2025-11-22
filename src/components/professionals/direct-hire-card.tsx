"use client";

import { ArrowRight, Briefcase01Icon, CheckmarkCircle01Icon } from "hugeicons-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { cn } from "@/lib/utils/core";
import { type Currency, formatCurrency } from "@/lib/utils/format";

export interface DirectHireCardProps {
  professionalName: string;
  professionalId: string;
  feeCOP: number;
  feeUSD: number;
  currency?: Currency; // Currency for local price display (defaults to COP for backward compatibility)
  onRequestContact: () => void;
  className?: string;
}

/**
 * Direct Hire Card Component
 *
 * Displays the option for customers to hire a professional directly off-platform
 * for full-time employment via a one-time finder's fee.
 *
 * Follows Lia Design System:
 * - Anthropic rounded corners (rounded-lg for cards, rounded-full for badges)
 * - Orange primary accent for CTA
 * - Solid backgrounds (no glass morphism)
 * - 4px grid spacing
 */
export function DirectHireCard({
  professionalName,
  professionalId,
  feeCOP,
  feeUSD,
  currency = "COP", // Default to COP for backward compatibility
  onRequestContact,
  className,
}: DirectHireCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const t = useTranslations("directHireCard");

  return (
    <div
      className={cn(
        "rounded-lg border border-neutral-200 bg-white p-6 shadow-sm",
        "transition-all duration-200 hover:border-orange-200 hover:shadow-md",
        className
      )}
    >
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-2 shadow-sm">
            <Briefcase01Icon className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h3 className="font-[family-name:var(--font-geist-sans)] font-semibold text-lg text-neutral-900">
              {t("title")}
            </h3>
            <p className="mt-1 text-neutral-700 text-sm leading-relaxed">{t("description")}</p>
          </div>
        </div>
        <div className="text-right">
          <div>
            <div className="font-[family-name:var(--font-geist-sans)] font-bold text-2xl text-neutral-900">
              ${feeUSD}
            </div>
            <div className="mt-1 text-neutral-500 text-xs">
              {formatCurrency(feeCOP, { currency })}
            </div>
          </div>
        </div>
      </div>

      {/* Benefits List */}
      <div className="mb-4 space-y-2">
        <BenefitItem text={t("benefit1")} />
        <BenefitItem text={t("benefit2")} />
        <BenefitItem text={t("benefit3")} />
        <BenefitItem text={t("benefit4")} />
      </div>

      {/* Expandable Details */}
      <button
        className="mb-4 flex items-center gap-1 font-medium text-orange-600 text-sm transition-colors hover:text-orange-700"
        onClick={() => setIsExpanded(!isExpanded)}
        type="button"
      >
        {isExpanded ? "Show less" : "Learn more"}
        <ArrowRight
          className={cn("h-4 w-4 transition-transform duration-200", isExpanded && "rotate-90")}
        />
      </button>

      {isExpanded && (
        <div className="mb-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4 shadow-sm">
          <h4 className="mb-3 font-[family-name:var(--font-geist-sans)] font-semibold text-neutral-900">
            What's included:
          </h4>
          <ul className="space-y-2 text-neutral-700 text-sm leading-relaxed">
            <li>
              • <strong>Direct Contact:</strong> Phone number and email address
            </li>
            <li>
              • <strong>Background Check:</strong> Access to full verification report
            </li>
            <li>
              • <strong>Interview Notes:</strong> Summary from our vetting process
            </li>
            <li>
              • <strong>Reference Contacts:</strong> Verified professional references
            </li>
          </ul>
          <p className="mt-3 text-neutral-500 text-xs leading-relaxed">
            Note: This fee is for the introduction and vetting information only. Employment terms
            are negotiated directly between you and the professional.
          </p>
        </div>
      )}

      {/* CTA Button */}
      <button
        className={cn(
          "w-full rounded-lg px-6 py-3 font-[family-name:var(--font-geist-sans)] font-semibold",
          "bg-orange-500 text-white shadow-sm",
          "hover:bg-orange-600 hover:shadow-md active:bg-orange-700",
          "transition-all duration-200",
          "flex items-center justify-center gap-2"
        )}
        onClick={onRequestContact}
        type="button"
      >
        {t("ctaButton")}
        <ArrowRight className="h-4 w-4" />
      </button>

      {/* Trust Badge */}
      <div className="mt-4 flex items-center justify-center gap-2 text-neutral-500 text-xs">
        <CheckmarkCircle01Icon className="h-4 w-4 text-green-600" />
        <span className="leading-relaxed">{t("trustBadge")}</span>
      </div>
    </div>
  );
}

/**
 * Benefit Item Component
 * Small checkmark list item following Lia design patterns
 */
function BenefitItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-neutral-700 text-sm leading-relaxed">
      <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-green-200 bg-green-50">
        <CheckmarkCircle01Icon className="h-4 w-4 text-green-600" />
      </div>
      <span>{text}</span>
    </div>
  );
}
