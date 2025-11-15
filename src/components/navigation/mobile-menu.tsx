"use client";

import { Cancel01Icon, Menu01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
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

  // Handle Escape key to close menu
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        closeMenu();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const menuVariants = {
    hidden: {
      x: "100%",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
      },
    },
    visible: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <>
      {/* Hamburger Button */}
      <motion.button
        aria-controls="mobile-menu"
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        className="flex h-11 w-11 items-center justify-center rounded-lg text-neutral-900 transition-colors hover:bg-neutral-100"
        onClick={toggleMenu}
        type="button"
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence initial={false} mode="wait">
          {isOpen ? (
            <motion.div
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              initial={{ rotate: 90, opacity: 0 }}
              key="close"
              transition={{ duration: 0.2 }}
            >
              <HugeiconsIcon className="h-6 w-6" icon={Cancel01Icon} />
            </motion.div>
          ) : (
            <motion.div
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              initial={{ rotate: -90, opacity: 0 }}
              key="menu"
              transition={{ duration: 0.2 }}
            >
              <HugeiconsIcon className="h-6 w-6" icon={Menu01Icon} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            animate="visible"
            className="fixed inset-0 z-[60] bg-neutral-900/50 backdrop-blur-sm"
            exit="exit"
            initial="hidden"
            onClick={closeMenu}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                closeMenu();
              }
            }}
            role="button"
            tabIndex={0}
            variants={backdropVariants}
          />
        )}
      </AnimatePresence>

      {/* Slide-in Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            animate="visible"
            aria-label="Mobile navigation menu"
            aria-modal="true"
            className="fixed top-0 right-0 z-[70] h-full w-[340px] border-neutral-200 border-l bg-white shadow-2xl"
            exit="hidden"
            id="mobile-menu"
            initial="hidden"
            role="dialog"
            variants={menuVariants}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-neutral-200 border-b bg-neutral-50/50 px-6 py-5">
              <span className="font-[family-name:var(--font-satoshi)] font-semibold text-neutral-900 text-xl tracking-tight">
                Menu
              </span>
              <motion.button
                aria-label="Close menu"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-neutral-600 transition-colors hover:bg-white hover:text-neutral-900"
                onClick={closeMenu}
                type="button"
                whileTap={{ scale: 0.95 }}
              >
                <HugeiconsIcon className="h-5 w-5" icon={Cancel01Icon} />
              </motion.button>
            </div>

            {/* Navigation Links */}
            <nav className="flex h-[calc(100%-73px)] flex-col justify-between overflow-y-auto p-6">
              <motion.div
                animate="visible"
                className="space-y-1"
                initial="hidden"
                variants={containerVariants}
              >
                {/* Language Switcher */}
                <motion.div className="mb-6 flex justify-between" variants={itemVariants}>
                  <span className="text-neutral-500 text-xs uppercase tracking-wider">
                    Language
                  </span>
                  <LanguageSwitcher />
                </motion.div>

                {/* Divider */}
                <motion.div
                  className="mb-6 h-px bg-neutral-200"
                  variants={itemVariants}
                />

                {/* Nav Links */}
                {links.map((link) => (
                  <motion.div key={link.href} variants={itemVariants}>
                    <Link
                      className="group block rounded-xl px-4 py-3 font-[family-name:var(--font-manrope)] font-medium text-neutral-700 text-base transition-all hover:bg-orange-50 hover:pl-5 hover:text-orange-600"
                      href={link.href}
                      onClick={() => {
                        link.onClick?.();
                        closeMenu();
                      }}
                    >
                      <span className="inline-flex items-center gap-2">
                        {link.label}
                        <span className="opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100">
                          →
                        </span>
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>

              {/* Auth Actions */}
              <motion.div
                animate="visible"
                className="space-y-3 border-neutral-200 border-t pt-6"
                initial="hidden"
                variants={containerVariants}
              >
                {isAuthenticated ? (
                  <>
                    {dashboardHref && (
                      <motion.div variants={itemVariants}>
                        <Link
                          className="block rounded-full bg-orange-500 px-6 py-3 text-center font-[family-name:var(--font-manrope)] font-semibold text-base text-white shadow-sm transition-all hover:bg-orange-600 hover:shadow-md active:scale-[0.98]"
                          href={dashboardHref}
                          onClick={closeMenu}
                        >
                          {t("dashboard")}
                        </Link>
                      </motion.div>
                    )}
                    <motion.button
                      className="w-full rounded-full border border-neutral-200 bg-white px-6 py-3 text-center font-[family-name:var(--font-manrope)] font-semibold text-base text-neutral-900 transition-all hover:border-neutral-300 hover:bg-neutral-50 active:scale-[0.98]"
                      onClick={() => {
                        onSignOut?.();
                        closeMenu();
                      }}
                      type="button"
                      variants={itemVariants}
                      whileTap={{ scale: 0.98 }}
                    >
                      {t("logout")}
                    </motion.button>
                  </>
                ) : (
                  <>
                    <motion.div variants={itemVariants}>
                      <Link
                        className="block rounded-full border border-neutral-200 bg-white px-6 py-3 text-center font-[family-name:var(--font-manrope)] font-semibold text-base text-neutral-900 transition-all hover:border-neutral-300 hover:bg-neutral-50 active:scale-[0.98]"
                        href="/auth/sign-in"
                        onClick={closeMenu}
                      >
                        {t("login")}
                      </Link>
                    </motion.div>
                    <motion.div variants={itemVariants}>
                      <Link
                        className="block rounded-full bg-orange-500 px-6 py-3 text-center font-[family-name:var(--font-manrope)] font-semibold text-base text-white shadow-sm transition-all hover:bg-orange-600 hover:shadow-md active:scale-[0.98]"
                        href="/auth/sign-up"
                        onClick={closeMenu}
                      >
                        {t("signUp")}
                      </Link>
                    </motion.div>
                  </>
                )}
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
