"use client";

/**
 * Amara Floating Button - Lia Design System
 *
 * A floating action button that opens the Amara chat interface.
 * Positioned in the bottom-right corner with onboarding tooltip for first-time users.
 *
 * Uses orange accent colors and smooth animations.
 */

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { cn } from "@/lib/utils";
import { AmaraIcon } from "./amara-icon";
import { AmaraOnboardingTooltip } from "./amara-onboarding-tooltip";

// Dynamically import the heavy chat interface component
const AmaraChatInterface = dynamic(
  () => import("./amara-chat-interface").then((mod) => mod.AmaraChatInterface),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50">
        <div className="h-12 w-12 animate-spin border-4 border-neutral-200 border-t-transparent" />
      </div>
    ),
  }
);

type AmaraFloatingButtonProps = {
  className?: string;
  locale?: string;
};

export function AmaraFloatingButton({ className, locale }: AmaraFloatingButtonProps) {
  const t = useTranslations("amara");
  const [isOpen, setIsOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check feature flag
  const isAmaraEnabled = isFeatureEnabled("show_amara_assistant");

  useEffect(() => {
    // Check if onboarding has been dismissed
    const dismissed = localStorage.getItem("amara_onboarding_dismissed");
    if (!dismissed) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingDismiss = () => {
    setShowOnboarding(false);
  };

  // Don't render if feature flag is disabled
  if (!isAmaraEnabled) {
    return null;
  }

  return (
    <>
      {/* Onboarding Tooltip */}
      {!isOpen && showOnboarding && <AmaraOnboardingTooltip onDismiss={handleOnboardingDismiss} />}

      {/* Floating Button with Pulse Ring */}
      {!isOpen && (
        <div className="fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6">
          {/* Pulse Ring Animation (only when onboarding is visible) */}
          {showOnboarding && <div className="amara-pulse-ring absolute inset-0 bg-orange-500" />}

          {/* Button */}
          <button
            aria-label={t("openChat")}
            className={cn(
              "relative inline-flex h-14 w-14 items-center justify-center bg-orange-500 text-white shadow-lg transition-all hover:bg-orange-600 hover:shadow-xl active:scale-95 sm:h-16 sm:w-16",
              className
            )}
            onClick={() => {
              setIsOpen(true);
              setShowOnboarding(false);
            }}
            type="button"
          >
            <AmaraIcon className="text-white" size={32} />
          </button>
        </div>
      )}

      {/* Chat Interface */}
      <AmaraChatInterface isOpen={isOpen} locale={locale} onClose={() => setIsOpen(false)} />
    </>
  );
}
