"use client";

import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/routing";

export function SiteNavigation() {
  const t = useTranslations("navigation");
  const tp = useTranslations("product");
  const [isProductOpen, setIsProductOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const productFeatures = [
    {
      name: tp("bookingPlatform.title"),
      href: "/product/booking-platform",
      description: tp("bookingPlatform.description"),
    },
    {
      name: tp("professionalProfiles.title"),
      href: "/product/professional-profiles",
      description: tp("professionalProfiles.description"),
    },
    {
      name: tp("secureMessaging.title"),
      href: "/product/secure-messaging",
      description: tp("secureMessaging.description"),
    },
    {
      name: tp("paymentProcessing.title"),
      href: "/product/payment-processing",
      description: tp("paymentProcessing.description"),
    },
    {
      name: tp("reviewsRatings.title"),
      href: "/product/reviews-ratings",
      description: tp("reviewsRatings.description"),
    },
    {
      name: tp("adminDashboard.title"),
      href: "/product/admin-dashboard",
      description: tp("adminDashboard.description"),
    },
  ];

  const links = [
    { href: "/professionals", label: t("professionals") },
    { href: "/contact", label: "Contact" },
  ];

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsProductOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsProductOpen(false);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <nav className="order-3 flex w-full justify-between gap-6 text-sm font-medium text-[#211f1a] sm:order-none sm:w-auto sm:justify-end">
      <div className="flex w-full items-center justify-between gap-6 overflow-x-auto sm:w-auto sm:overflow-visible">
        {/* Product Dropdown */}
        <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          <button
            className="flex items-center gap-1 whitespace-nowrap text-[#211f1a] transition hover:text-[#5d574b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff5d46]"
            onClick={() => setIsProductOpen(!isProductOpen)}
          >
            {t("product")}
            <ChevronDown
              className={`h-4 w-4 transition-transform ${isProductOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isProductOpen && (
            <div className="absolute left-0 top-full z-50 pt-2">
              <div className="w-[640px] rounded-2xl border border-[#e5dfd4] bg-white p-3 shadow-[0_24px_55px_rgba(15,15,15,0.15)]">
                <div className="grid grid-cols-2 gap-2">
                  {productFeatures.map((feature) => (
                    <Link
                      key={feature.name}
                      href={feature.href}
                      className="group flex flex-col gap-1 rounded-xl p-3 transition hover:bg-[#fbfafa]"
                    >
                      <span className="text-sm font-semibold text-[#211f1a] group-hover:text-[#ff5d46]">
                        {feature.name}
                      </span>
                      <span className="text-xs text-[#7a6d62]">{feature.description}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Regular Links */}
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="whitespace-nowrap text-[#211f1a] transition hover:text-[#5d574b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff5d46]"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
