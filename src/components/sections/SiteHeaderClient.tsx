"use client";

import { useTranslations } from "next-intl";
import { MobileMenu } from "@/components/navigation/mobile-menu";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type Props = {
  isAuthenticated: boolean;
  dashboardHref?: string;
  onSignOut?: () => void;
  overlay?: boolean;
};

export function SiteHeaderClient({ isAuthenticated, dashboardHref, onSignOut, overlay }: Props) {
  const t = useTranslations("navigation");

  // Navigation links (used for both desktop and mobile)
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
              className={cn(
                "group relative font-medium text-sm no-underline transition-colors duration-200",
                overlay ? "text-white hover:text-white" : "text-neutral-700 hover:text-neutral-900"
              )}
              href={link.href}
              key={link.href}
            >
              {link.label}
              {/* Animated underline */}
              <span
                className={cn(
                  "-bottom-1 absolute left-0 h-[1.5px] w-0 transition-all duration-300 ease-out group-hover:w-full",
                  overlay ? "bg-white/70" : "bg-orange-500"
                )}
              />
            </Link>
          ))}
        </nav>

        {/* Right: CTA */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link
              className={cn(
                "inline-flex items-center justify-center rounded-lg px-6 py-2.5 font-semibold text-sm shadow-sm transition-all duration-200",
                overlay
                  ? "bg-white/20 text-white hover:bg-white/30 hover:shadow-md active:scale-[0.98]"
                  : "bg-orange-500 text-white hover:bg-orange-600 hover:shadow-md active:scale-[0.98]"
              )}
              href={dashboardHref || "/dashboard"}
            >
              {t("dashboard")}
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                className={cn(
                  "group relative font-medium text-sm no-underline transition-colors duration-200",
                  overlay
                    ? "text-white hover:text-white"
                    : "text-neutral-700 hover:text-neutral-900"
                )}
                href="/auth/sign-in"
              >
                {t("login")}
                {/* Animated underline */}
                <span
                  className={cn(
                    "-bottom-1 absolute left-0 h-[1.5px] w-0 transition-all duration-300 ease-out group-hover:w-full",
                    overlay ? "bg-white/70" : "bg-orange-500"
                  )}
                />
              </Link>
              <Link
                className={cn(
                  "inline-flex items-center justify-center rounded-lg px-6 py-2.5 font-semibold text-sm shadow-sm transition-all duration-200",
                  overlay
                    ? "bg-white/20 text-white hover:bg-white/30 hover:shadow-md active:scale-[0.98]"
                    : "bg-orange-500 text-white hover:bg-orange-600 hover:shadow-md active:scale-[0.98]"
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
