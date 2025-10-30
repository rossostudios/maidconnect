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
    <div className="slide-in-from-bottom fixed right-0 bottom-0 left-0 z-50 animate-in p-4 duration-300">
      <div className="mx-auto max-w-screen-xl">
        <div className="rounded-[28px] border-2 border-[#ebe5d8] bg-white p-6 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.25)] backdrop-blur-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Icon and Text */}
            <div className="flex flex-1 items-start gap-4">
              <div className="flex-shrink-0">
                <div className="rounded-full bg-[#fbfaf9] p-3">
                  <Cookie className="h-6 w-6 text-[#ff5d46]" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="mb-1 font-semibold text-[#211f1a] text-lg">We use cookies</h3>
                <p className="text-[#7d7566] text-sm">
                  We use cookies to improve your experience, analyze site traffic, and provide
                  personalized content. By clicking "Accept", you consent to our use of cookies.{" "}
                  <Link className="font-semibold text-[#ff5d46] hover:underline" href="/privacy">
                    Learn more
                  </Link>
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                className="rounded-full border-2 border-[#ebe5d8] bg-white px-6 py-2.5 font-semibold text-[#211f1a] text-sm transition hover:border-[#ff5d46] hover:text-[#ff5d46]"
                onClick={declineCookies}
              >
                Decline
              </button>
              <button
                className="rounded-full bg-[#ff5d46] px-6 py-2.5 font-semibold text-sm text-white transition hover:bg-[#ff4529]"
                onClick={acceptCookies}
              >
                Accept Cookies
              </button>
            </div>

            {/* Close button */}
            <button
              aria-label="Close cookie banner"
              className="absolute top-4 right-4 rounded-full p-2 text-[#7d7566] transition hover:bg-[#fbfaf9] hover:text-[#211f1a] md:relative md:top-0 md:right-0"
              onClick={declineCookies}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
