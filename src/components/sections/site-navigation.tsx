"use client";

import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { ProductBottomSheet } from "@/components/navigation/product-bottom-sheet";
import { Link } from "@/i18n/routing";

export function SiteNavigation() {
  const t = useTranslations("navigation");
  const tp = useTranslations("product");
  const [isProductOpen, setIsProductOpen] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
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
    { href: "/professionals", label: t("hireProfessional") },
    { href: "/pricing", label: t("pricing") },
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

  const handleProductClick = () => {
    // On mobile, open bottom sheet
    if (window.innerWidth < 768) {
      setIsBottomSheetOpen(true);
    } else {
      // On desktop, toggle dropdown
      setIsProductOpen(!isProductOpen);
    }
  };

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
    []
  );

  return (
    <nav
      className="order-3 flex w-full justify-between gap-6 font-medium text-[#211f1a] text-sm sm:order-none sm:w-auto sm:justify-end"
      data-tour="navigation"
    >
      <div className="flex w-full items-center justify-between gap-6 overflow-x-auto sm:w-auto sm:overflow-visible">
        {/* Product Dropdown/Button */}
        <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          <button
            className="flex items-center gap-1 whitespace-nowrap text-[#211f1a] transition hover:text-[#5d574b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff5d46] focus-visible:outline-offset-2"
            onClick={handleProductClick}
            type="button"
          >
            {t("services")}
            <ChevronDown
              className={`h-4 w-4 transition-transform ${isProductOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Desktop Dropdown - Hidden on mobile */}
          {isProductOpen && (
            <div className="absolute top-full left-0 z-50 hidden pt-2 md:block">
              <div className="w-[640px] rounded-2xl border border-[#e5dfd4] bg-white p-3 shadow-[0_24px_55px_rgba(15,15,15,0.15)]">
                <div className="grid grid-cols-2 gap-2">
                  {productFeatures.map((feature) => (
                    <Link
                      className="group flex flex-col gap-1 rounded-xl p-3 transition hover:bg-[#fbfafa]"
                      href={feature.href}
                      key={feature.name}
                    >
                      <span className="font-semibold text-[#211f1a] text-sm group-hover:text-[#ff5d46]">
                        {feature.name}
                      </span>
                      <span className="text-[#7a6d62] text-xs">{feature.description}</span>
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
            className="whitespace-nowrap text-[#211f1a] transition hover:text-[#5d574b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff5d46] focus-visible:outline-offset-2"
            href={link.href}
            key={link.href}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Mobile Bottom Sheet */}
      <ProductBottomSheet
        features={productFeatures}
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
      />
    </nav>
  );
}
