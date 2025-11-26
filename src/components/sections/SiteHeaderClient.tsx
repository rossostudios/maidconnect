"use client";

import {
  Building06Icon,
  Calendar03Icon,
  CheckmarkBadge01Icon,
  HeadphonesIcon,
  HelpCircleIcon,
  Home09Icon,
  News01Icon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import { useTranslations } from "next-intl";
import { DesktopMenu } from "@/components/navigation/desktop-menu";
import { MobileMenu } from "@/components/navigation/mobile-menu";
import { NavDropdown, type NavDropdownItem } from "@/components/navigation/nav-dropdown";
import { GlobeButton } from "@/components/preferences";

type Props = {
  isAuthenticated: boolean;
  dashboardHref?: string;
  onSignOut?: () => void;
  overlay?: boolean;
};

export function SiteHeaderClient({ isAuthenticated, dashboardHref, onSignOut, overlay }: Props) {
  const t = useTranslations("navigation");

  // "Find Help" dropdown - Customer-focused actions
  const findHelpItems: NavDropdownItem[] = [
    {
      name: t("dropdown.findHelp.browse"),
      href: "/professionals",
      description: t("dropdown.findHelp.browseDesc"),
      icon: Calendar03Icon,
    },
    {
      name: t("dropdown.findHelp.howItWorks"),
      href: "/how-it-works",
      description: t("dropdown.findHelp.howItWorksDesc"),
      icon: Home09Icon,
    },
  ];

  // "For Professionals" dropdown - Supply-side recruitment
  const forProfessionalsItems: NavDropdownItem[] = [
    {
      name: t("dropdown.forProfessionals.becomePro"),
      href: "/become-a-pro",
      description: t("dropdown.forProfessionals.becomeProDesc"),
      icon: CheckmarkBadge01Icon,
    },
    {
      name: t("dropdown.forProfessionals.ambassador"),
      href: "/ambassadors",
      description: t("dropdown.forProfessionals.ambassadorDesc"),
      icon: UserMultiple02Icon,
    },
  ];

  // "Company" dropdown - Corporate & support
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
      name: t("dropdown.company.help"),
      href: "/help",
      description: t("dropdown.company.helpDesc"),
      icon: HelpCircleIcon,
    },
    {
      name: t("dropdown.company.contact"),
      href: "/contact",
      description: t("dropdown.company.contactDesc"),
      icon: HeadphonesIcon,
    },
  ];

  // Navigation links for mobile menu (flattened)
  const mobileLinks = [
    // Customer actions
    { href: "/professionals", label: t("dropdown.findHelp.browse") },
    { href: "/how-it-works", label: t("dropdown.findHelp.howItWorks") },
    // Professional actions
    { href: "/become-a-pro", label: t("dropdown.forProfessionals.becomePro") },
    { href: "/ambassadors", label: t("dropdown.forProfessionals.ambassador") },
    // Company
    { href: "/about", label: t("dropdown.company.about") },
    { href: "/help", label: t("dropdown.company.help") },
    { href: "/contact", label: t("dropdown.company.contact") },
  ];

  return (
    <>
      {/* Desktop Navigation - Three Column Layout */}
      <div className="col-span-2 hidden items-center lg:flex">
        {/* Center: Navigation Links with Dropdowns */}
        <nav className="flex flex-1 items-center justify-center gap-2">
          {/* Find Help Dropdown - Customer-focused */}
          <NavDropdown
            featured={{
              icon: Home09Icon,
              title: t("dropdown.findHelp.title"),
              description: t("dropdown.findHelp.featuredDesc"),
            }}
            items={findHelpItems}
            label={t("dropdown.findHelp.title")}
            overlay={overlay}
          />

          {/* For Professionals Dropdown - Pro recruitment */}
          <NavDropdown
            featured={{
              icon: UserMultiple02Icon,
              title: t("dropdown.forProfessionals.title"),
              description: t("dropdown.forProfessionals.featuredDesc"),
            }}
            items={forProfessionalsItems}
            label={t("dropdown.forProfessionals.title")}
            overlay={overlay}
          />

          {/* Company Dropdown - Corporate & support */}
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
        </nav>

        {/* Divider */}
        <div className="mx-2 h-6 w-px bg-border" />

        {/* Right: Globe + Hamburger Menu (Airbnb-style) */}
        <div className="flex items-center gap-2">
          {/* Globe Button - Language/Region/Currency Preferences */}
          <GlobeButton />

          {/* Desktop Hamburger Menu - Contains auth, Become Pro, Ambassador, Help */}
          <DesktopMenu
            dashboardHref={dashboardHref}
            isAuthenticated={isAuthenticated}
            onSignOut={onSignOut}
          />
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
