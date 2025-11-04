"use client";

import { Cancel01Icon, Menu01Icon } from "hugeicons-react";
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
      {/* Hamburger Button - Shows on all screen sizes */}
      <button
        aria-label={isOpen ? "Close menu" : "Open menu"}
        className="flex h-11 w-11 items-center justify-center rounded-lg text-[var(--foreground)] transition hover:bg-[color-mix(in_srgb,var(--accent)_18%,transparent)] hover:text-[var(--surface-contrast)] active:scale-95"
        onClick={toggleMenu}
        type="button"
      >
        {isOpen ? <Cancel01Icon className="h-6 w-6" /> : <Menu01Icon className="h-6 w-6" />}
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
        className={`fixed top-0 right-0 z-[70] h-full w-[320px] transform bg-[var(--surface)] text-[var(--foreground)] shadow-[var(--shadow-elevated)] transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-[var(--border)] border-b p-5">
          <span className="font-semibold text-[var(--foreground)] text-lg">Menu</span>
          <button
            aria-label="Close menu"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--foreground)] transition hover:bg-[color-mix(in_srgb,var(--accent)_18%,transparent)] hover:text-[var(--surface-contrast)] active:scale-95"
            onClick={closeMenu}
            type="button"
          >
            <Cancel01Icon className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col p-5">
          {/* Language Switcher */}
          <div className="mb-4 flex justify-center">
            <LanguageSwitcher />
          </div>

          <div className="mb-4 border-[var(--border)] border-t" />
          {links.map((link) => (
            <Link
              className="rounded-lg px-4 py-3 font-medium text-[var(--foreground)] text-base transition hover:bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] hover:text-[var(--surface-contrast)]"
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
          {isAuthenticated && <div className="my-4 border-[var(--border)] border-t" />}

          {/* Auth Actions */}
          {isAuthenticated ? (
            <>
              {dashboardHref && (
                <Link
                  className="rounded-lg bg-[var(--accent)] px-4 py-3 text-center font-semibold text-[var(--surface-contrast)] text-base transition hover:bg-[color-mix(in_srgb,var(--accent)_85%,var(--accent-gold)_15%)]"
                  href={dashboardHref}
                  onClick={closeMenu}
                >
                  {t("dashboard")}
                </Link>
              )}
              <button
                className="mt-3 rounded-lg border-2 border-[var(--border)] px-4 py-3 text-center font-semibold text-[var(--foreground)] text-base transition hover:border-[var(--surface-contrast)] hover:text-[var(--surface-contrast)] active:scale-95"
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
                className="rounded-lg border-2 border-[var(--border)] px-4 py-3 text-center font-semibold text-[var(--foreground)] text-base transition hover:border-[var(--surface-contrast)] hover:text-[var(--surface-contrast)]"
                href="/auth/sign-in"
                onClick={closeMenu}
              >
                {t("login")}
              </Link>
              <Link
                className="rounded-lg bg-[var(--accent)] px-4 py-3 text-center font-semibold text-[var(--surface-contrast)] text-base transition hover:bg-[color-mix(in_srgb,var(--accent)_85%,var(--accent-gold)_15%)]"
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
