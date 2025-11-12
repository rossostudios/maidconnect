"use client";

/**
 * Amara Onboarding Tooltip
 *
 * Shows a dismissible tooltip for first-time users to introduce Amara.
 * Appears above the floating button with a pointer arrow.
 * Stores dismissal state in localStorage.
 */

import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { AmaraIcon } from "./AmaraIcon";

const STORAGE_KEY = "amara_onboarding_dismissed";

type AmaraOnboardingTooltipProps = {
  onDismiss?: () => void;
};

export function AmaraOnboardingTooltip({ onDismiss }: AmaraOnboardingTooltipProps) {
  const t = useTranslations("amara.onboarding");
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    // Check if user has already dismissed the tooltip
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      setIsDismissed(false);
      // Show tooltip after a short delay for better UX
      setTimeout(() => {
        setIsVisible(true);
      }, 800);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    // Store dismissal in localStorage
    localStorage.setItem(STORAGE_KEY, "true");

    // Call parent callback after animation
    setTimeout(() => {
      setIsDismissed(true);
      onDismiss?.();
    }, 300);
  };

  if (isDismissed) {
    return null;
  }

  return (
    <div
      className={`fixed right-4 bottom-[88px] z-40 w-[280px] transition-all duration-300 sm:right-6 sm:bottom-[104px] sm:w-[320px] ${
        isVisible ? "transtone-y-0 opacity-100" : "transtone-y-2 opacity-0"
      }`}
    >
      {/* Tooltip Card */}
      <div className="rounded-2xl border border-[#64748b]/20 bg-[#f8fafc] p-4 shadow-xl">
        {/* Header */}
        <div className="mb-3 flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#64748b]/10">
            <AmaraIcon className="text-[#64748b]" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-[#0f172a] text-sm">{t("title")}</h3>
          </div>
          <button
            aria-label="Dismiss"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#94a3b8]/70 transition hover:bg-[#e2e8f0]/30 hover:text-[#94a3b8]"
            onClick={handleDismiss}
            type="button"
          >
            <HugeiconsIcon className="h-4 w-4" icon={Cancel01Icon} />
          </button>
        </div>

        {/* Description */}
        <p className="mb-4 text-[#94a3b8] text-sm leading-relaxed">{t("description")}</p>

        {/* Action Button */}
        <button
          className="w-full rounded-lg bg-[#64748b] px-4 py-2.5 font-semibold text-[#f8fafc] text-sm transition hover:bg-[#64748b] active:scale-95"
          onClick={handleDismiss}
          type="button"
        >
          {t("dismiss")}
        </button>
      </div>

      {/* Pointer Arrow */}
      <div className="-bottom-2 absolute right-8 h-4 w-4 rotate-45 border-[#64748b]/20 border-r border-b bg-[#f8fafc]" />
    </div>
  );
}
