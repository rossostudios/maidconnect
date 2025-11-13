"use client";

import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/navigation/language-switcher";
import { MobileMenu } from "@/components/navigation/mobile-menu";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type Props = {
  isAuthenticated: boolean;
  dashboardHref?: string;
  onSignOut?: () => void;
};

export function SiteHeaderClient({ isAuthenticated, dashboardHref, onSignOut }: Props) {
  const t = useTranslations("navigation");

  // Navigation links (used for both desktop and mobile)
  const navLinks = [
    { href: "/professionals", label: t("professionals") },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/pricing", label: t("pricing") },
    { href: "/pros", label: "For Professionals" },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden items-center gap-8 lg:flex">
        {navLinks.map((link) => (
          <Link
            className="font-medium text-sm transition-colors hover:text-neutral-700"
            href={link.href}
            key={link.href}
          >
            {link.label}
          </Link>
        ))}

        <LanguageSwitcher />

        {isAuthenticated ? (
          <Link
            className={cn(
              "inline-flex items-center justify-center rounded-md bg-orange-500 px-6 py-2.5 font-semibold text-sm text-white shadow-sm",
              "transition-all hover:bg-orange-600 active:scale-95 active:bg-orange-700"
            )}
            href={dashboardHref || "/dashboard"}
          >
            {t("dashboard")}
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              className="font-medium text-sm transition-colors hover:text-neutral-700"
              href="/auth/sign-in"
            >
              {t("login")}
            </Link>
            <Link
              className={cn(
                "inline-flex items-center justify-center rounded-md bg-orange-500 px-6 py-2.5 font-semibold text-sm text-white shadow-sm",
                "transition-all hover:bg-orange-600 active:scale-95 active:bg-orange-700"
              )}
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
          links={navLinks}
          onSignOut={onSignOut}
        />
      </div>
    </>
  );
}
