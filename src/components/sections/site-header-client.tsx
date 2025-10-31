"use client";

import { useTranslations } from "next-intl";
import { MobileMenu } from "@/components/navigation/mobile-menu";
import { SiteNavigation } from "./site-navigation";

type Props = {
  isAuthenticated: boolean;
  dashboardHref?: string;
  onSignOut?: () => void;
};

export function SiteHeaderClient({ isAuthenticated, dashboardHref, onSignOut }: Props) {
  const t = useTranslations("navigation");
  const tp = useTranslations("product");

  // Navigation links for mobile menu
  const mobileLinks = [
    { href: "/professionals", label: t("professionals") },
    { href: "/contact", label: "Contact" },
    // Product features as flat links on mobile
    { href: "/product/booking-platform", label: tp("bookingPlatform.title") },
    { href: "/product/professional-profiles", label: tp("professionalProfiles.title") },
    { href: "/product/secure-messaging", label: tp("secureMessaging.title") },
    { href: "/product/payment-processing", label: tp("paymentProcessing.title") },
    { href: "/product/reviews-ratings", label: tp("reviewsRatings.title") },
    { href: "/product/admin-dashboard", label: tp("adminDashboard.title") },
  ];

  return (
    <>
      {/* Desktop Navigation - Hidden on mobile */}
      <div className="hidden md:block">
        <SiteNavigation />
      </div>

      {/* Mobile Menu - Shown only on mobile */}
      <div className="md:hidden">
        <MobileMenu
          dashboardHref={dashboardHref}
          isAuthenticated={isAuthenticated}
          links={mobileLinks}
          onSignOut={onSignOut}
        />
      </div>
    </>
  );
}
