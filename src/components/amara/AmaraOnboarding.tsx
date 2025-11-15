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
        isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      {/* Tooltip Card */}
      <div className="border border-[neutral-500]/20 bg-[neutral-50] p-4 shadow-xl">
        {/* Header */}
        <div className="mb-3 flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center bg-[neutral-500]/10">
            <AmaraIcon className="text-[neutral-500]" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-[neutral-900] text-sm">{t("title")}</h3>
          </div>
          <button
            aria-label="Dismiss"
            className="flex h-8 w-8 items-center justify-center text-[neutral-400]/70 transition hover:bg-[neutral-200]/30 hover:text-[neutral-400]"
            onClick={handleDismiss}
            type="button"
          >
            <HugeiconsIcon className="h-4 w-4" icon={Cancel01Icon} />
          </button>
        </div>

        {/* Description */}
        <p className="mb-4 text-[neutral-400] text-sm leading-relaxed">{t("description")}</p>

        {/* Action Button */}
        <button
          className="w-full bg-[neutral-500] px-4 py-2.5 font-semibold text-[neutral-50] text-sm transition hover:bg-[neutral-500] active:scale-95"
          onClick={handleDismiss}
          type="button"
        >
          {t("dismiss")}
        </button>
      </div>

      {/* Pointer Arrow */}
      <div className="-bottom-2 absolute right-8 h-4 w-4 rotate-45 border-[neutral-500]/20 border-r border-b bg-[neutral-50]" />
    </div>
  );
}
