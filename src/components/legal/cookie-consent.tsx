"use client";

import { Cancel01Icon, CookieIcon } from "hugeicons-react";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";

const CONSENT_COOKIE_NAME = "casaora-cookie-consent";

export function CookieConsent() {
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
        <div className="rounded-[28px] border-2 border-[#ebe5d8] bg-white p-6 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.25)] backdrop-blur-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Icon and Text */}
            <div className="flex flex-1 items-start gap-4">
              <div className="flex-shrink-0">
                <div className="rounded-full bg-[var(--background)] p-3">
                  <CookieIcon className="h-6 w-6 text-[var(--red)]" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="mb-1 font-semibold text-[var(--foreground)] text-lg">
                  We use cookies
                </h3>
                <p className="text-[#7d7566] text-sm">
                  We use cookies to improve your experience, analyze site traffic, and provide
                  personalized content. By clicking "Accept", you consent to our use of cookies.{" "}
                  <Link className="font-semibold text-[var(--red)] hover:underline" href="/privacy">
                    Learn more
                  </Link>
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                className="rounded-full border-2 border-[#ebe5d8] bg-white px-6 py-2.5 font-semibold text-[var(--foreground)] text-sm transition hover:border-[var(--red)] hover:text-[var(--red)]"
                onClick={declineCookies}
                type="button"
              >
                Decline
              </button>
              <button
                className="rounded-full bg-[var(--red)] px-6 py-2.5 font-semibold text-sm text-white transition hover:bg-[#ff4529]"
                onClick={acceptCookies}
                type="button"
              >
                Accept Cookies
              </button>
            </div>

            {/* Close button */}
            <button
              aria-label="Close cookie banner"
              className="absolute top-4 right-4 rounded-full p-2 text-[#7d7566] transition hover:bg-[var(--background)] hover:text-[var(--foreground)] md:relative md:top-0 md:right-0"
              onClick={declineCookies}
              type="button"
            >
              <Cancel01Icon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
