"use client";

import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "@/i18n/routing";
import { LanguageSwitcher } from "./language-switcher";

type NavLink = {
  href: string;
  label: string;
  onClick?: () => void;
};

type Props = {
  links: NavLink[];
  isAuthenticated?: boolean;
  onSignOut?: () => void;
  dashboardHref?: string;
};

export function MobileMenu({ links, isAuthenticated, onSignOut, dashboardHref }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("navigation");

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Dual-Line Hamburger Button */}
      <button
        aria-label={isOpen ? "Close menu" : "Open menu"}
        className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-900 transition hover:bg-[#F5F5F5] active:scale-95"
        onClick={toggleMenu}
        type="button"
      >
        {isOpen ? (
          <HugeiconsIcon className="h-6 w-6" icon={Cancel01Icon} />
        ) : (
          <div className="flex flex-col gap-[6px]">
            <span className="h-[2px] w-6 bg-gray-900 transition-all" />
            <span className="h-[2px] w-6 bg-gray-900 transition-all" />
          </div>
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
          onClick={closeMenu}
        />
      )}

      {/* Slide-in Menu - Shows on all screen sizes */}
      <div
        className={`fixed top-0 right-0 z-[70] h-full w-[320px] transform border-gray-600 border-l-4 bg-white/100 text-gray-900 shadow-[0_25px_60px_rgba(0,0,0,0.4)] backdrop-filter-none transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ backgroundColor: "#ffffff" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-gray-300 border-b-2 bg-gray-50 p-5">
          <span className="font-semibold text-gray-900 text-lg">Menu</span>
          <button
            aria-label="Close menu"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-900 transition hover:bg-[#E85D48]/10 hover:text-gray-900 active:scale-95"
            onClick={closeMenu}
            type="button"
          >
            <HugeiconsIcon className="h-5 w-5" icon={Cancel01Icon} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col p-5">
          {/* Language Switcher */}
          <div className="mb-4 flex justify-center">
            <LanguageSwitcher />
          </div>

          <div className="mb-4 border-gray-300 border-t-2" />
          {links.map((link) => (
            <Link
              className="rounded-lg px-4 py-3 font-medium text-base text-gray-900 transition hover:bg-[#E85D48]/10 hover:text-gray-900"
              href={link.href}
              key={link.href}
              onClick={() => {
                link.onClick?.();
                closeMenu();
              }}
            >
              {link.label}
            </Link>
          ))}

          {/* Divider */}
          {isAuthenticated && <div className="my-4 border-gray-300 border-t-2" />}

          {/* Auth Actions */}
          {isAuthenticated ? (
            <>
              {dashboardHref && (
                <Link
                  className="rounded-lg bg-[#E85D48] px-4 py-3 text-center font-semibold text-base text-white transition hover:bg-[#D64A36]"
                  href={dashboardHref}
                  onClick={closeMenu}
                >
                  {t("dashboard")}
                </Link>
              )}
              <button
                className="mt-3 rounded-lg border-2 border-gray-200 px-4 py-3 text-center font-semibold text-base text-gray-900 transition hover:border-gray-900 hover:bg-gray-900 hover:text-white active:scale-95"
                onClick={() => {
                  onSignOut?.();
                  closeMenu();
                }}
                type="button"
              >
                {t("logout")}
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <Link
                className="rounded-lg border-2 border-gray-200 px-4 py-3 text-center font-semibold text-base text-gray-900 transition hover:border-gray-900 hover:bg-gray-900 hover:text-white"
                href="/auth/sign-in"
                onClick={closeMenu}
              >
                {t("login")}
              </Link>
              <Link
                className="rounded-lg bg-[#E85D48] px-4 py-3 text-center font-semibold text-base text-white transition hover:bg-[#D64A36]"
                href="/auth/sign-up"
                onClick={closeMenu}
              >
                {t("signUp")}
              </Link>
            </div>
          )}
        </nav>
      </div>
    </>
  );
}
