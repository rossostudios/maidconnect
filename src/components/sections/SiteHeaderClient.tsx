"use client";

import {
  Award01Icon,
  Building06Icon,
  Calendar03Icon,
  CheckmarkBadge01Icon,
  HeadphonesIcon,
  HelpCircleIcon,
  Home09Icon,
  News01Icon,
  StarIcon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import { useTranslations } from "next-intl";
import { MobileMenu } from "@/components/navigation/mobile-menu";
import { NavDropdown, type NavDropdownItem } from "@/components/navigation/nav-dropdown";
import { GlobeButton } from "@/components/preferences";
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

  // Professionals dropdown - About hiring/working with professionals
  const professionalsItems: NavDropdownItem[] = [
    {
      name: t("dropdown.professionals.howItWorks"),
      href: "/how-it-works",
      description: t("dropdown.professionals.howItWorksDesc"),
      icon: Home09Icon,
    },
    {
      name: t("dropdown.professionals.vettingProcess"),
      href: "/how-it-works#vetting",
      description: t("dropdown.professionals.vettingProcessDesc"),
      icon: CheckmarkBadge01Icon,
    },
  ];

  // Customers dropdown - For homeowners looking to book
  const customersItems: NavDropdownItem[] = [
    {
      name: t("dropdown.customers.bookNow"),
      href: "/pros",
      description: t("dropdown.customers.bookNowDesc"),
      icon: Calendar03Icon,
    },
    {
      name: t("dropdown.customers.reviews"),
      href: "/pros#reviews",
      description: t("dropdown.customers.reviewsDesc"),
      icon: StarIcon,
    },
    {
      name: t("dropdown.customers.helpCenter"),
      href: "/help",
      description: t("dropdown.customers.helpCenterDesc"),
      icon: HelpCircleIcon,
    },
    {
      name: t("dropdown.customers.support"),
      href: "/contact",
      description: t("dropdown.customers.supportDesc"),
      icon: HeadphonesIcon,
    },
  ];

  // Company dropdown - About the company
  const companyItems: NavDropdownItem[] = [
    {
      name: t("dropdown.company.about"),
      href: "/about",
      description: t("dropdown.company.aboutDesc"),
      icon: Building06Icon,
    },
    {
      name: t("dropdown.company.blog"),
      href: "/blog",
      description: t("dropdown.company.blogDesc"),
      icon: News01Icon,
    },
    {
      name: t("dropdown.company.careers"),
      href: "/careers",
      description: t("dropdown.company.careersDesc"),
      icon: Award01Icon,
    },
  ];

  // Navigation links for mobile menu (flattened)
  const mobileLinks = [
    { href: "/how-it-works", label: t("dropdown.professionals.howItWorks") },
    { href: "/pros", label: t("dropdown.customers.reviews") },
    { href: "/help", label: t("dropdown.customers.helpCenter") },
    { href: "/about", label: t("dropdown.company.about") },
    { href: "/blog", label: t("dropdown.company.blog") },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <>
      {/* Desktop Navigation - Three Column Layout */}
      <div className="col-span-2 hidden items-center lg:flex">
        {/* Center: Navigation Links with Dropdowns */}
        <nav className="flex flex-1 items-center justify-center gap-2">
          {/* Professionals Dropdown */}
          <NavDropdown
            featured={{
              icon: UserMultiple02Icon,
              title: t("dropdown.professionals.title"),
              description: t("dropdown.professionals.featuredDesc"),
            }}
            items={professionalsItems}
            label={t("dropdown.professionals.title")}
            overlay={overlay}
          />

          {/* Customers Dropdown */}
          <NavDropdown
            featured={{
              icon: Home09Icon,
              title: t("dropdown.customers.title"),
              description: t("dropdown.customers.featuredDesc"),
            }}
            items={customersItems}
            label={t("dropdown.customers.title")}
            overlay={overlay}
          />

          {/* Company Dropdown */}
          <NavDropdown
            featured={{
              icon: Building06Icon,
              title: t("dropdown.company.title"),
              description: t("dropdown.company.featuredDesc"),
            }}
            items={companyItems}
            label={t("dropdown.company.title")}
            overlay={overlay}
          />

          {/* Resources - Simple Link */}
          <Link
            className={cn(
              "flex items-center gap-1 rounded-full px-4 py-2 font-medium text-sm",
              // Spring-like transition
              "transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]",
              // Consistent dark text (glass pill always visible)
              "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
            )}
            href="/help"
          >
            {t("resources")}
          </Link>
        </nav>

        {/* Divider */}
        <div className="mx-2 h-6 w-px bg-neutral-200" />

        {/* Right: Globe + CTA */}
        <div className="flex items-center gap-2">
          {/* Globe Button - Language/Region/Currency Preferences */}
          <GlobeButton />

          {isAuthenticated ? (
            <Link
              className={cn(
                "inline-flex items-center justify-center rounded-full px-6 py-2.5 font-semibold text-sm",
                // Spring transition for premium feel
                "transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]",
                // Consistent solid button (glass pill always visible)
                "bg-orange-500 text-white shadow-lg shadow-orange-500/20",
                "hover:bg-orange-600 hover:shadow-orange-600/25 hover:shadow-xl",
                "active:scale-[0.97]"
              )}
              href={dashboardHref || "/dashboard"}
            >
              {t("dashboard")}
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                className={cn(
                  "rounded-full px-4 py-2 font-medium text-sm",
                  // Spring transition
                  "transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]",
                  // Consistent dark text (glass pill always visible)
                  "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
                )}
                href="/auth/sign-in"
              >
                {t("login")}
              </Link>
              <Link
                className={cn(
                  "inline-flex items-center justify-center whitespace-nowrap rounded-full px-6 py-2.5 font-semibold text-sm",
                  // Spring transition for premium feel
                  "transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]",
                  // Consistent solid button (glass pill always visible)
                  "bg-orange-500 text-white shadow-lg shadow-orange-500/20",
                  "hover:bg-orange-600 hover:shadow-orange-600/25 hover:shadow-xl",
                  "active:scale-[0.97]"
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
          links={mobileLinks}
          onSignOut={onSignOut}
        />
      </div>
    </>
  );
}
