"use client";

import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/navigation/language-switcher";
import { MobileMenu } from "@/components/navigation/mobile-menu";
import { Link } from "@/i18n/routing";

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

  const mainLinks = [
    { href: "/professionals", label: t("professionals") },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/pricing", label: t("pricing") },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden items-center gap-8 lg:flex">
        {mainLinks.map((link) => (
          <Link
            className="font-medium text-sm transition-colors hover:text-[#E85D48]"
            href={link.href}
            key={link.href}
          >
            {link.label}
          </Link>
        ))}

        <LanguageSwitcher />

        {isAuthenticated ? (
          <Link
            className="rounded-full bg-[#E85D48] px-6 py-2.5 font-semibold text-sm text-white shadow-sm transition-all hover:bg-[#D64A36] active:scale-95"
            href={dashboardHref || "/dashboard"}
          >
            {t("dashboard")}
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              className="font-medium text-sm transition-colors hover:text-[#E85D48]"
              href="/auth/sign-in"
            >
              {t("login")}
            </Link>
            <Link
              className="rounded-full bg-[#E85D48] px-6 py-2.5 font-semibold text-sm text-white shadow-sm transition-all hover:bg-[#D64A36] active:scale-95"
              href="/auth/sign-up"
            >
              {t("signUp")}
            </Link>
          </div>
        )}
      </nav>

      {/* Mobile Menu */}
      <div className="lg:hidden">
        <MobileMenu
          dashboardHref={dashboardHref}
          isAuthenticated={isAuthenticated}
          links={menuLinks}
          onSignOut={onSignOut}
        />
      </div>
    </>
  );
}
