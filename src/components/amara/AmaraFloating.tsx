"use client";

/**
 * Amara Floating Button - Lia Design
 *
 * A floating action button that opens the Amara chat interface.
 * Positioned in the bottom-right corner with onboarding tooltip for first-time users.
 * Uses orange accent color from Lia Design System.
 *
 * Feature Flag Integration:
 * - `show_amara_assistant` - Controls overall Amara visibility
 * - `enable-amara-v2` - Toggles between V1 (API route) and V2 (Server Actions/Generative UI)
 */

import { Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { isFeatureEnabled } from "@/lib/featureFlags";
import { cn } from "@/lib/utils";
import { isAmaraV2Enabled } from "@/lib/feature-flags/amara-flags";
import { trackAmaraV2Enabled } from "@/lib/analytics/amara-events";
import { AmaraOnboardingTooltip } from "./AmaraOnboarding";

// Dynamically import V1 chat interface (original API route version)
const AmaraChatInterface = dynamic(
  () => import("./AmaraChat").then((mod) => mod.AmaraChatInterface),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50">
        <HugeiconsIcon className="h-8 w-8 animate-spin text-orange-500" icon={Loading03Icon} />
      </div>
    ),
  }
);

// Dynamically import V2 chat interface (Generative UI version)
const AmaraChatInterfaceV2 = dynamic(
  () => import("./amara-chat-interface-v2").then((mod) => mod.AmaraChatInterfaceV2),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50">
        <HugeiconsIcon className="h-8 w-8 animate-spin text-orange-500" icon={Loading03Icon} />
      </div>
    ),
  }
);

type AmaraFloatingButtonProps = {
  className?: string;
  locale?: string;
  userId?: string;
};

export function AmaraFloatingButton({ className, locale, userId }: AmaraFloatingButtonProps) {
  const t = useTranslations("amara");
  const [isOpen, setIsOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [useV2, setUseV2] = useState(false);

  // Check feature flags
  const isAmaraEnabled = isFeatureEnabled("show_amara_assistant");

  useEffect(() => {
    // Check if onboarding has been dismissed
    const dismissed = localStorage.getItem("amara_onboarding_dismissed");
    if (!dismissed) {
      setShowOnboarding(true);
    }

    // Check if V2 is enabled via PostHog feature flag
    const v2Enabled = isAmaraV2Enabled();
    setUseV2(v2Enabled);

    // Track V2 enablement for analytics
    if (v2Enabled && userId) {
      trackAmaraV2Enabled(userId);
    }
  }, [userId]);

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
              "relative inline-flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg transition-all hover:bg-orange-600 hover:shadow-xl active:scale-95 sm:h-16 sm:w-16",
              className
            )}
            onClick={() => {
              setIsOpen(true);
              setShowOnboarding(false);
            }}
            type="button"
          >
            <Image
              alt="Amara AI Assistant"
              className="h-8 w-8 sm:h-9 sm:w-9"
              height={36}
              src="/amara-floating-chat.svg"
              width={36}
            />
          </button>
        </div>
      )}

      {/* Chat Interface - Toggle between V1 and V2 based on feature flag */}
      {useV2 ? (
        <AmaraChatInterfaceV2
          isOpen={isOpen}
          locale={locale}
          userId={userId}
          onClose={() => setIsOpen(false)}
        />
      ) : (
        <AmaraChatInterface isOpen={isOpen} locale={locale} onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}
