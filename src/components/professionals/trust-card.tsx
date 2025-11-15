"use client";

import { InformationCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import {
  OnTimeRateBadge,
  RatingBadge,
  VerificationBadge,
  type VerificationLevel,
} from "./verification-badge";

type TrustCardProps = {
  verificationLevel: VerificationLevel;
  onTimeRate?: number;
  rating: number;
  reviewCount: number;
};

/**
 * Trust Card Component
 * Displays prominent trust signals for professional profiles
 * Part of UX improvements for Colombian market (Week 3-4)
 */
export function TrustCard({ verificationLevel, onTimeRate, rating, reviewCount }: TrustCardProps) {
  const t = useTranslations("components.trustCard");

  return (
    <div className="rounded-[24px] border-2 border-[neutral-200] bg-[neutral-50] p-6 shadow-sm">
      <h3 className="mb-4 font-semibold text-[neutral-900] text-lg">{t("title")}</h3>

      {/* Trust Badges */}
      <div className="space-y-3">
        {verificationLevel !== "none" && (
          <div className="flex items-center gap-2">
            <VerificationBadge level={verificationLevel} size="md" />
          </div>
        )}

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
        className="mt-4 flex items-center gap-2 text-[neutral-500] text-sm transition"
        href="/trust-safety"
      >
        <HugeiconsIcon className="h-4 w-4" icon={InformationCircleIcon} />
        {t("explainerLink")}
      </a>

      {/* Additional Trust Signals */}
      <div className="mt-6 space-y-2 border-[neutral-200] border-t pt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[neutral-400]">{t("backgroundCheck")}</span>
          <span className="font-semibold text-[neutral-900]">
            {verificationLevel === "background-check" ? "✓" : "—"}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[neutral-400]">{t("identityVerified")}</span>
          <span className="font-semibold text-[neutral-900]">
            {verificationLevel !== "none" ? "✓" : "—"}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[neutral-400]">{t("responseTime")}</span>
          <span className="font-semibold text-[neutral-900]">{t("responseTimeValue")}</span>
        </div>
      </div>
    </div>
  );
}
