"use client";

/**
 * Amara Onboarding Tooltip - Lia Design System
 *
 * Shows a dismissible tooltip for first-time users to introduce Amara.
 * Appears above the floating button with a pointer arrow.
 * Stores dismissal state in localStorage.
 *
 * Uses Geist Sans typography and orange accent colors.
 */

import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { AmaraIcon } from "./amara-icon";

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
      <div className="border border-neutral-200 bg-white p-4 font-[family-name:var(--font-geist-sans)] shadow-xl">
        {/* Header */}
        <div className="mb-3 flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center bg-orange-50">
            <AmaraIcon className="text-orange-600" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-neutral-900 text-sm">{t("title")}</h3>
          </div>
          <button
            aria-label="Dismiss"
            className="flex h-8 w-8 items-center justify-center text-neutral-600 transition-all hover:bg-orange-50 hover:text-orange-600"
            onClick={handleDismiss}
            type="button"
          >
            <HugeiconsIcon className="h-4 w-4" icon={Cancel01Icon} />
          </button>
        </div>

        {/* Description */}
        <p className="mb-4 text-neutral-700 text-sm leading-relaxed">{t("description")}</p>

        {/* Action Button */}
        <button
          className="w-full bg-orange-500 px-4 py-2.5 font-semibold text-sm text-white transition-all hover:bg-orange-600 active:scale-95"
          onClick={handleDismiss}
          type="button"
        >
          {t("dismiss")}
        </button>
      </div>

      {/* Pointer Arrow */}
      <div className="-bottom-2 absolute right-8 h-4 w-4 rotate-45 border-neutral-200 border-r border-b bg-white" />
    </div>
  );
}
