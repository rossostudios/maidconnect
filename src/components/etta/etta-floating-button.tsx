"use client";

/**
 * Etta Floating Button
 *
 * A floating action button that opens the Etta chat interface.
 * Positioned in the bottom-right corner with onboarding tooltip for first-time users.
 */

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { cn } from "@/lib/utils";
import { EttaChatInterface } from "./etta-chat-interface";
import { EttaIcon } from "./etta-icon";
import { EttaOnboardingTooltip } from "./etta-onboarding-tooltip";
import "./etta-animations.css";

interface EttaFloatingButtonProps {
  className?: string;
  locale?: string;
}

export function EttaFloatingButton({ className, locale }: EttaFloatingButtonProps) {
  const t = useTranslations("etta");
  const [isOpen, setIsOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check feature flag
  const isEttaEnabled = isFeatureEnabled("show_etta_assistant");

  useEffect(() => {
    // Check if onboarding has been dismissed
    const dismissed = localStorage.getItem("etta_onboarding_dismissed");
    if (!dismissed) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingDismiss = () => {
    setShowOnboarding(false);
  };

  // Don't render if feature flag is disabled
  if (!isEttaEnabled) {
    return null;
  }

  return (
    <>
      {/* Onboarding Tooltip */}
      {!isOpen && showOnboarding && <EttaOnboardingTooltip onDismiss={handleOnboardingDismiss} />}

      {/* Floating Button with Pulse Ring */}
      {!isOpen && (
        <div className="fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6">
          {/* Pulse Ring Animation (only when onboarding is visible) */}
          {showOnboarding && (
            <div className="etta-pulse-ring absolute inset-0 rounded-full bg-[#ff5d46]" />
          )}

          {/* Button */}
          <button
            aria-label={t("openChat")}
            className={cn(
              "relative flex h-14 w-14 items-center justify-center rounded-full bg-[#ff5d46] text-white shadow-lg transition-all hover:shadow-xl active:scale-95 sm:h-16 sm:w-16",
              className
            )}
            onClick={() => {
              setIsOpen(true);
              setShowOnboarding(false);
            }}
            type="button"
          >
            <EttaIcon className="text-white" size={32} />
          </button>
        </div>
      )}

      {/* Chat Interface */}
      <EttaChatInterface isOpen={isOpen} locale={locale} onClose={() => setIsOpen(false)} />
    </>
  );
}
