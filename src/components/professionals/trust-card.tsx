"use client";

import { InformationCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import {
  OnTimeRateBadge,
  RatingBadge,
  type VerificationLevel,
} from "./verification-badge";
import { VerificationBadgesGrid, type VerificationData } from "./verification-badges-grid";

type TrustCardProps = {
  verificationLevel: VerificationLevel;
  onTimeRate?: number;
  rating: number;
  reviewCount: number;
  // Enhanced verification data (optional for backward compatibility)
  verification?: VerificationData;
};

/**
 * Trust Card Component
 * Displays prominent trust signals for professional profiles
 * Part of UX improvements for Colombian market (Week 3-4)
 *
 * Updated to use Anthropic rounded corners and detailed verification badges
 */
export function TrustCard({
  verificationLevel,
  onTimeRate,
  rating,
  reviewCount,
  verification,
}: TrustCardProps) {
  const t = useTranslations("components.trustCard");

  // Use enhanced verification data if provided, otherwise fallback to simple level
  const verificationData: VerificationData = verification ?? {
    level: verificationLevel,
  };

  return (
    <div className="border-2 border-neutral-200 bg-neutral-50 p-6 shadow-sm rounded-lg">
      <h3 className="mb-4 font-semibold text-neutral-900 text-lg">{t("title")}</h3>

      {/* Enhanced Verification Badges Grid */}
      <div className="mb-4">
        <VerificationBadgesGrid verification={verificationData} />
      </div>

      {/* Additional Trust Badges */}
      <div className="space-y-3 mt-4">
        {onTimeRate && onTimeRate >= 75 && (
          <div className="flex items-center gap-2">
            <OnTimeRateBadge rate={onTimeRate} size="md" />
          </div>
        )}

        <div className="flex items-center gap-2">
          <RatingBadge rating={rating} reviewCount={reviewCount} size="md" />
        </div>
      </div>

      {/* Explainer Link */}
      <a
        className="mt-4 flex items-center gap-2 text-neutral-500 text-sm transition hover:text-neutral-700"
        href="/trust-safety"
      >
        <HugeiconsIcon className="h-4 w-4" icon={InformationCircleIcon} />
        {t("explainerLink")}
      </a>

      {/* Additional Trust Signals */}
      <div className="mt-6 space-y-2 border-neutral-200 border-t pt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-400">{t("backgroundCheck")}</span>
          <span className="font-semibold text-neutral-900">
            {verificationData.backgroundCheckPassed ? "✓" : "—"}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-400">{t("identityVerified")}</span>
          <span className="font-semibold text-neutral-900">
            {verificationLevel !== "none" ? "✓" : "—"}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-400">{t("responseTime")}</span>
          <span className="font-semibold text-neutral-900">{t("responseTimeValue")}</span>
        </div>
      </div>
    </div>
  );
}
