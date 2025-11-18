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
  // Note: "Professionals" directory link removed - concierge-only model means customers
  // submit briefs via /brief or /concierge, not browse professionals directly
  const navLinks = [
    { href: "/how-it-works", label: "How It Works" },
    { href: "/pricing", label: t("pricing") },
    { href: "/blog", label: "Blog" },
    { href: "/pros", label: "For Professionals" },
  ];

  return (
    <>
      {/* Desktop Navigation - Three Column Layout */}
      <div className="col-span-2 hidden items-center lg:flex">
        {/* Center: Navigation Links */}
        <nav className="flex flex-1 items-center justify-center gap-8">
          {navLinks.map((link) => (
            <Link
              className="font-medium text-sm no-underline transition-colors hover:text-neutral-700"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: Language Switcher + CTA */}
        <div className="flex items-center gap-4">
          <LanguageSwitcher />

          {isAuthenticated ? (
            <Link
              className={cn(
                "inline-flex items-center justify-center rounded-lg bg-orange-500 px-6 py-2.5 font-semibold text-sm text-white shadow-sm",
                "transition-all hover:bg-orange-600 active:scale-95 active:bg-orange-700"
              )}
              href={dashboardHref || "/dashboard"}
            >
              {t("dashboard")}
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                className="font-medium text-sm no-underline transition-colors hover:text-neutral-700"
                href="/auth/sign-in"
              >
                {t("login")}
              </Link>
              <Link
                className={cn(
                  "inline-flex items-center justify-center rounded-lg bg-orange-500 px-6 py-2.5 font-semibold text-sm text-white shadow-sm",
                  "transition-all hover:bg-orange-600 active:scale-95 active:bg-orange-700"
                )}
                href="/auth/sign-up"
              >
                {t("signUp")}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu - Positioned on the right */}
      <div className="col-start-3 flex justify-end lg:hidden">
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
