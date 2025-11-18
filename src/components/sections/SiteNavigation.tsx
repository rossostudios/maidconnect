"use client";

import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

// Dynamic import for bottom sheet (lazy load on demand)
const ProductBottomSheet = dynamic(
  () => import("@/components/navigation/ProductBottom").then((mod) => mod.ProductBottomSheet),
  { ssr: false }
);

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

  // Removed "/professionals" link for concierge-only migration
  // Professional directory now redirects to /concierge via 301
  const links = [
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
      className="order-3 flex w-full justify-between gap-6 font-medium text-neutral-900 text-sm sm:order-none sm:w-auto sm:justify-end"
      data-tour="navigation"
    >
      <div className="flex w-full items-center justify-between gap-6 overflow-x-auto sm:w-auto sm:overflow-visible">
        {/* Product Dropdown/Button */}
        <div className="relative">
          <button
            aria-controls="site-product-menu"
            aria-expanded={isProductOpen}
            aria-haspopup="true"
            className={cn(
              "flex items-center gap-1 whitespace-nowrap text-neutral-900 transition hover:text-neutral-700",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral-900 focus-visible:outline-offset-2"
            )}
            id="site-product-toggle"
            onClick={handleProductClick}
            onFocus={handleMouseEnter}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            type="button"
          >
            {t("services")}
            <HugeiconsIcon
              className={cn("h-4 w-4 transition-transform", isProductOpen && "rotate-180")}
              icon={ArrowDown01Icon}
            />
          </button>

          {/* Desktop Dropdown - Hidden on mobile */}
          {isProductOpen && (
            <div
              aria-labelledby="site-product-toggle"
              className="absolute top-full left-0 z-50 hidden pt-2 md:block"
              id="site-product-menu"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              role="menu"
            >
              <div className="w-[640px] border border-neutral-200 bg-white p-3 shadow-lg">
                <div className="grid grid-cols-2 gap-2">
                  {productFeatures.map((feature) => (
                    <Link
                      className={cn(
                        "group flex flex-col gap-1 p-3 transition",
                        "hover:bg-neutral-50 hover:text-neutral-700",
                        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral-900 focus-visible:outline-offset-2"
                      )}
                      href={feature.href}
                      key={feature.name}
                      role="menuitem"
                    >
                      <span className="font-semibold text-neutral-900 text-sm transition group-hover:text-neutral-700">
                        {feature.name}
                      </span>
                      <span className="text-neutral-600 text-xs">{feature.description}</span>
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
            className={cn(
              "whitespace-nowrap text-neutral-900 transition hover:text-neutral-700",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral-900 focus-visible:outline-offset-2"
            )}
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
