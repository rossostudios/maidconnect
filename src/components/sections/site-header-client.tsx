"use client";

import { useTranslations } from "next-intl";
import { MobileMenu } from "@/components/navigation/mobile-menu";

type Props = {
  isAuthenticated: boolean;
  dashboardHref?: string;
  onSignOut?: () => void;
};

export function SiteHeaderClient({ isAuthenticated, dashboardHref, onSignOut }: Props) {
  const t = useTranslations("navigation");
  const tp = useTranslations("product");

  // Navigation links for hamburger menu (all screen sizes)
  const menuLinks = [
    { href: "/professionals", label: t("professionals") },
    { href: "/pricing", label: t("pricing") },
    { href: "/contact", label: "Contact" },
    // Product features
    { href: "/product/booking-platform", label: tp("bookingPlatform.title") },
    { href: "/product/professional-profiles", label: tp("professionalProfiles.title") },
    { href: "/product/secure-messaging", label: tp("secureMessaging.title") },
    { href: "/product/payment-processing", label: tp("paymentProcessing.title") },
    { href: "/product/reviews-ratings", label: tp("reviewsRatings.title") },
    { href: "/product/admin-dashboard", label: tp("adminDashboard.title") },
  ];

  return (
    <MobileMenu
      dashboardHref={dashboardHref}
      isAuthenticated={isAuthenticated}
      links={menuLinks}
      onSignOut={onSignOut}
    />
  );
}
