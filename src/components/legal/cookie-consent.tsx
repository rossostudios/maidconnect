"use client";

/**
 * CookieConsent - Lia Design System
 *
 * A refined, minimal cookie consent banner that slides up from the bottom.
 * Uses warm neutrals and orange accent from Lia palette.
 */

import { Cancel01Icon, CookieIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const CONSENT_COOKIE_NAME = "casaora-cookie-consent";

export function CookieConsent() {
  const t = useTranslations("cookieConsent");
  const [showBanner, setShowBanner] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_COOKIE_NAME);
    if (!consent) {
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = (accepted: boolean) => {
    setIsExiting(true);
    setTimeout(() => {
      localStorage.setItem(CONSENT_COOKIE_NAME, accepted ? "accepted" : "declined");
      setShowBanner(false);
    }, 200);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed right-0 bottom-0 left-0 z-50 p-4 sm:p-6",
        "transition-all duration-300 ease-out",
        isExiting
          ? "translate-y-full opacity-0"
          : "slide-in-from-bottom-4 translate-y-0 animate-in opacity-100"
      )}
    >
      <div className="mx-auto max-w-2xl">
        {/* Card with subtle shadow and warm background */}
        <div
          className={cn(
            "relative overflow-hidden rounded-xl",
            "border border-neutral-200 bg-white",
            "shadow-lg shadow-neutral-900/5"
          )}
        >
          {/* Warm gradient accent bar at top */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-rausch-400 via-rausch-500 to-rausch-400" />

          <div className="p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
              {/* Icon */}
              <div className="hidden flex-shrink-0 sm:block">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rausch-50">
                  <HugeiconsIcon className="h-5 w-5 text-rausch-500" icon={CookieIcon} />
                </div>
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-center gap-2 sm:hidden">
                  <HugeiconsIcon className="h-4 w-4 text-rausch-500" icon={CookieIcon} />
                  <h3 className="font-semibold text-neutral-900">{t("title")}</h3>
                </div>
                <h3 className="mb-1 hidden font-semibold text-neutral-900 sm:block">
                  {t("title")}
                </h3>
                <p className="text-neutral-600 text-sm leading-relaxed">
                  {t("message")}{" "}
                  <Link
                    className="font-medium text-rausch-600 underline decoration-rausch-200 underline-offset-2 transition-colors hover:text-rausch-700 hover:decoration-rausch-400"
                    href="/privacy"
                  >
                    {t("learnMore")}
                  </Link>
                </p>
              </div>

              {/* Close button - desktop */}
              <button
                aria-label="Close"
                className="hidden h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 sm:flex"
                onClick={() => handleClose(false)}
                type="button"
              >
                <HugeiconsIcon className="h-4 w-4" icon={Cancel01Icon} />
              </button>
            </div>

            {/* Actions */}
            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <button
                className={cn(
                  "rounded-lg px-4 py-2 font-medium text-sm transition-all",
                  "text-neutral-600 hover:text-neutral-900",
                  "border border-neutral-200 hover:border-neutral-300",
                  "bg-white hover:bg-neutral-50",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch-500 focus-visible:ring-offset-2"
                )}
                onClick={() => handleClose(false)}
                type="button"
              >
                {t("decline")}
              </button>
              <button
                className={cn(
                  "rounded-lg px-4 py-2 font-medium text-sm transition-all",
                  "text-white",
                  "bg-rausch-500 hover:bg-rausch-600",
                  "shadow-sm hover:shadow",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch-500 focus-visible:ring-offset-2"
                )}
                onClick={() => handleClose(true)}
                type="button"
              >
                {t("accept")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
