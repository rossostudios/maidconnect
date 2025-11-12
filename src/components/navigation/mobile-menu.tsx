"use client";

import { Menu, X } from "lucide-react";
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
      {/* Hamburger Button */}
      <button
        aria-label={isOpen ? "Close menu" : "Open menu"}
        className="flex h-11 w-11 items-center justify-center rounded-lg text-neutral-900 transition hover:bg-neutral-100 active:scale-95"
        onClick={toggleMenu}
        type="button"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-[60] bg-neutral-900/40 backdrop-blur-sm"
          onClick={closeMenu}
        />
      )}

      {/* Slide-in Menu */}
      <div
        className={`fixed top-0 right-0 z-[70] h-full w-[320px] transform border-neutral-900 border-l-4 bg-white text-neutral-900 shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "tranneutral-x-0" : "tranneutral-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-neutral-200 border-b-2 bg-white p-5">
          <span className="font-semibold text-lg text-neutral-900">Menu</span>
          <button
            aria-label="Close menu"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-neutral-900 transition hover:bg-neutral-100 active:scale-95"
            onClick={closeMenu}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col p-5">
          {/* Language Switcher */}
          <div className="mb-4 flex justify-center">
            <LanguageSwitcher />
          </div>

          <div className="mb-4 border-neutral-200 border-t-2" />
          {links.map((link) => (
            <Link
              className="rounded-lg px-4 py-3 font-medium text-base text-neutral-900 transition hover:bg-neutral-100"
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
          {isAuthenticated && <div className="my-4 border-neutral-200 border-t-2" />}

          {/* Auth Actions */}
          {isAuthenticated ? (
            <>
              {dashboardHref && (
                <Link
                  className="rounded-lg bg-neutral-900 px-4 py-3 text-center font-semibold text-base text-white transition hover:bg-neutral-800"
                  href={dashboardHref}
                  onClick={closeMenu}
                >
                  {t("dashboard")}
                </Link>
              )}
              <button
                className="mt-3 rounded-lg border-2 border-neutral-200 px-4 py-3 text-center font-semibold text-base text-neutral-900 transition hover:border-neutral-900 hover:bg-neutral-900 hover:text-white active:scale-95"
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
                className="rounded-lg border-2 border-neutral-200 px-4 py-3 text-center font-semibold text-base text-neutral-900 transition hover:border-neutral-900 hover:bg-neutral-900 hover:text-white"
                href="/auth/sign-in"
                onClick={closeMenu}
              >
                {t("login")}
              </Link>
              <Link
                className="rounded-lg bg-neutral-900 px-4 py-3 text-center font-semibold text-base text-white transition hover:bg-neutral-800"
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
