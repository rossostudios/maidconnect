"use client";

import { useState } from "react";
import { ArrowRight, Briefcase01Icon, CheckmarkCircle01Icon } from "hugeicons-react";
import { useTranslations } from "next-intl";
import { formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils/core";

export interface DirectHireCardProps {
  professionalName: string;
  professionalId: string;
  feeCOP: number;
  feeUSD: number;
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
  onRequestContact,
  className,
}: DirectHireCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const t = useTranslations("directHireCard");

  return (
    <div
      className={cn(
        "border border-neutral-200 bg-white p-6 rounded-lg shadow-sm",
        "hover:border-orange-200 hover:shadow-md transition-all duration-200",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-orange-50 border border-orange-200 rounded-lg shadow-sm">
            <Briefcase01Icon className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="font-[family-name:var(--font-geist-sans)] text-lg font-semibold text-neutral-900">
              {t("title")}
            </h3>
            <p className="text-sm text-neutral-700 mt-1 leading-relaxed">
              {t("description")}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="font-[family-name:var(--font-geist-sans)] text-2xl font-bold text-neutral-900">
            ${feeUSD}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            {formatCurrency(feeCOP, "COP")}
          </div>
        </div>
      </div>

      {/* Benefits List */}
      <div className="space-y-2 mb-4">
        <BenefitItem text={t("benefit1")} />
        <BenefitItem text={t("benefit2")} />
        <BenefitItem text={t("benefit3")} />
        <BenefitItem text={t("benefit4")} />
      </div>

      {/* Expandable Details */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1 mb-4 transition-colors"
      >
        {isExpanded ? "Show less" : "Learn more"}
        <ArrowRight
          className={cn(
            "w-4 h-4 transition-transform duration-200",
            isExpanded && "rotate-90"
          )}
        />
      </button>

      {isExpanded && (
        <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg mb-4 shadow-sm">
          <h4 className="font-[family-name:var(--font-geist-sans)] font-semibold text-neutral-900 mb-3">
            What's included:
          </h4>
          <ul className="text-sm text-neutral-700 space-y-2 leading-relaxed">
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
          <p className="text-xs text-neutral-500 mt-3 leading-relaxed">
            Note: This fee is for the introduction and vetting information only.
            Employment terms are negotiated directly between you and the professional.
          </p>
        </div>
      )}

      {/* CTA Button */}
      <button
        type="button"
        onClick={onRequestContact}
        className={cn(
          "w-full px-6 py-3 rounded-lg font-[family-name:var(--font-geist-sans)] font-semibold",
          "bg-orange-500 text-white shadow-sm",
          "hover:bg-orange-600 hover:shadow-md active:bg-orange-700",
          "transition-all duration-200",
          "flex items-center justify-center gap-2"
        )}
      >
        {t("ctaButton")}
        <ArrowRight className="w-4 h-4" />
      </button>

      {/* Trust Badge */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-neutral-500">
        <CheckmarkCircle01Icon className="w-4 h-4 text-green-600" />
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
    <div className="flex items-center gap-2 text-sm text-neutral-700 leading-relaxed">
      <div className="w-5 h-5 rounded-full bg-green-50 border border-green-200 flex items-center justify-center flex-shrink-0">
        <CheckmarkCircle01Icon className="w-4 h-4 text-green-600" />
      </div>
      <span>{text}</span>
    </div>
  );
}
