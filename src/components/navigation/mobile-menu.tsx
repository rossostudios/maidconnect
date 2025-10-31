"use client";

import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "@/i18n/routing";

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
        className="flex h-11 w-11 items-center justify-center rounded-lg text-[#211f1a] transition hover:bg-[#ebe5d8] active:scale-95 md:hidden"
        onClick={toggleMenu}
        type="button"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Slide-in Menu */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-[280px] transform bg-white shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-[#ebe5d8] border-b p-5">
          <span className="font-semibold text-[#211f1a] text-lg">Menu</span>
          <button
            aria-label="Close menu"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[#211f1a] transition hover:bg-[#ebe5d8] active:scale-95"
            onClick={closeMenu}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col p-5">
          {links.map((link) => (
            <Link
              className="rounded-lg px-4 py-3 font-medium text-[#211f1a] text-base transition hover:bg-[#ebe5d8]"
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
          {isAuthenticated && <div className="my-4 border-[#ebe5d8] border-t" />}

          {/* Auth Actions */}
          {isAuthenticated ? (
            <>
              {dashboardHref && (
                <Link
                  className="rounded-lg bg-[#ff5d46] px-4 py-3 text-center font-semibold text-base text-white transition hover:bg-[#eb6c65]"
                  href={dashboardHref}
                  onClick={closeMenu}
                >
                  {t("dashboard")}
                </Link>
              )}
              <button
                className="mt-3 rounded-lg border-2 border-[#ebe5d8] px-4 py-3 text-center font-semibold text-[#211f1a] text-base transition hover:border-[#211f1a] active:scale-95"
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
                className="rounded-lg border-2 border-[#ebe5d8] px-4 py-3 text-center font-semibold text-[#211f1a] text-base transition hover:border-[#211f1a]"
                href="/auth/sign-in"
                onClick={closeMenu}
              >
                {t("login")}
              </Link>
              <Link
                className="rounded-lg bg-[#ff5d46] px-4 py-3 text-center font-semibold text-base text-white transition hover:bg-[#eb6c65]"
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
