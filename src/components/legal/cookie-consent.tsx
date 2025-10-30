"use client";

import { Cookie, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const CONSENT_COOKIE_NAME = "maidconnect-cookie-consent";

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
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom duration-300">
      <div className="mx-auto max-w-screen-xl">
        <div className="rounded-[28px] bg-white p-6 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.25)] backdrop-blur-sm border-2 border-[#ebe5d8]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Icon and Text */}
            <div className="flex items-start gap-4 flex-1">
              <div className="flex-shrink-0">
                <div className="rounded-full bg-[#fbfaf9] p-3">
                  <Cookie className="h-6 w-6 text-[#ff5d46]" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="mb-1 text-lg font-semibold text-[#211f1a]">We use cookies</h3>
                <p className="text-sm text-[#7d7566]">
                  We use cookies to improve your experience, analyze site traffic, and provide
                  personalized content. By clicking "Accept", you consent to our use of cookies.{" "}
                  <Link href="/privacy" className="text-[#ff5d46] hover:underline font-semibold">
                    Learn more
                  </Link>
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                onClick={declineCookies}
                className="rounded-full border-2 border-[#ebe5d8] bg-white px-6 py-2.5 text-sm font-semibold text-[#211f1a] transition hover:border-[#ff5d46] hover:text-[#ff5d46]"
              >
                Decline
              </button>
              <button
                onClick={acceptCookies}
                className="rounded-full bg-[#ff5d46] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#ff4529]"
              >
                Accept Cookies
              </button>
            </div>

            {/* Close button */}
            <button
              onClick={declineCookies}
              className="absolute top-4 right-4 md:relative md:top-0 md:right-0 rounded-full p-2 text-[#7d7566] transition hover:bg-[#fbfaf9] hover:text-[#211f1a]"
              aria-label="Close cookie banner"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
