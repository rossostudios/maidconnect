"use client";

import { Cancel01Icon, CookieIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";

const CONSENT_COOKIE_NAME = "casaora-cookie-consent";

export function CookieConsent() {
  const t = useTranslations("cookieConsent");
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem(CONSENT_COOKIE_NAME);
    if (!consent) {
      // Small delay to avoid flash on page load
      setTimeout(() => setShowBanner(true), 1000);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem(CONSENT_COOKIE_NAME, "accepted");
    setShowBanner(false);
  };

  const declineCookies = () => {
    localStorage.setItem(CONSENT_COOKIE_NAME, "declined");
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="slide-in-from-bottom fixed right-0 bottom-0 left-0 z-50 animate-in p-4 duration-300">
      <div className="mx-auto max-w-screen-xl">
        <div className="rounded-[28px] border-2 border-[#e2e8f0] bg-[#f8fafc] p-6 shadow-[0_20px_60px_-15px_rgba(22,22,22,0.25)] backdrop-blur-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Icon and Text */}
            <div className="flex flex-1 items-start gap-4">
              <div className="flex-shrink-0">
                <div className="rounded-full bg-[#f8fafc] p-3">
                  <HugeiconsIcon className="h-6 w-6 text-[#64748b]" icon={CookieIcon} />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="mb-1 font-semibold text-[#0f172a] text-lg">{t("title")}</h3>
                <p className="text-[#94a3b8] text-sm">
                  {t("message")}{" "}
                  <Link className="font-semibold text-[#64748b] hover:underline" href="/privacy">
                    {t("learnMore")}
                  </Link>
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                className="rounded-full border-2 border-[#e2e8f0] bg-[#f8fafc] px-6 py-2.5 font-semibold text-[#0f172a] text-sm transition hover:border-[#64748b] hover:text-[#64748b]"
                onClick={declineCookies}
                type="button"
              >
                {t("decline")}
              </button>
              <button
                className="rounded-full bg-[#64748b] px-6 py-2.5 font-semibold text-[#f8fafc] text-sm transition hover:bg-[#64748b]"
                onClick={acceptCookies}
                type="button"
              >
                {t("accept")}
              </button>
            </div>

            {/* Close button */}
            <button
              aria-label="Close cookie banner"
              className="absolute top-4 right-4 rounded-full p-2 text-[#94a3b8] transition hover:bg-[#f8fafc] hover:text-[#0f172a] md:relative md:top-0 md:right-0"
              onClick={declineCookies}
              type="button"
            >
              <HugeiconsIcon className="h-5 w-5" icon={Cancel01Icon} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
