"use client";

import { ArrowRight02Icon, Menu01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { ThemeSelector } from "@/components/ui/theme-toggle";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type Props = {
  isAuthenticated?: boolean;
  onSignOut?: () => void;
  dashboardHref?: string;
};

type MenuItem = {
  href: string;
  label: string;
  description?: string;
  featured?: boolean;
};

export function DesktopMenu({ isAuthenticated, onSignOut, dashboardHref }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const t = useTranslations("navigation");

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        closeMenu();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, closeMenu]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        closeMenu();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeMenu]);

  const menuItems: MenuItem[] = [
    {
      href: "/help",
      label: t("desktopMenu.helpCenter"),
    },
    {
      href: "/become-a-pro",
      label: t("desktopMenu.becomePro"),
      description: t("desktopMenu.becomeProDesc"),
      featured: true,
    },
    {
      href: "/ambassadors",
      label: t("desktopMenu.ambassador"),
      description: t("desktopMenu.ambassadorDesc"),
    },
  ];

  const dropdownVariants = {
    hidden: {
      opacity: 0,
      y: -8,
      scale: 0.96,
      transition: {
        duration: 0.15,
        ease: [0.22, 1, 0.36, 1],
      },
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -8 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.2,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.05,
      },
    },
  };

  return (
    <div className="relative">
      {/* Hamburger Button - Simple menu icon */}
      <motion.button
        aria-controls="desktop-menu"
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card transition-all duration-200",
          isOpen ? "shadow-lg" : "hover:shadow-md"
        )}
        onClick={toggleMenu}
        ref={buttonRef}
        type="button"
        whileTap={{ scale: 0.97 }}
      >
        <HugeiconsIcon className="h-5 w-5 text-foreground" icon={Menu01Icon} />
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            animate="visible"
            className="absolute top-full right-0 z-50 mt-3 w-72 origin-top-right overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
            exit="hidden"
            id="desktop-menu"
            initial="hidden"
            ref={menuRef}
            role="menu"
            variants={dropdownVariants}
          >
            <motion.div
              animate="visible"
              className="py-2"
              initial="hidden"
              variants={containerVariants}
            >
              {/* Menu Items */}
              {menuItems.map((item, index) => (
                <motion.div key={item.href} variants={itemVariants}>
                  {index === 1 && <div className="my-2 border-border border-t" />}
                  <Link
                    className={cn(
                      "group flex items-center justify-between px-4 py-3 no-underline transition-colors",
                      item.featured
                        ? "bg-rausch-50/50 hover:bg-rausch-50 dark:bg-rausch-500/10 dark:hover:bg-rausch-500/20"
                        : "hover:bg-muted"
                    )}
                    href={item.href}
                    onClick={closeMenu}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "font-medium text-sm",
                            item.featured ? "text-foreground" : "text-card-foreground"
                          )}
                        >
                          {item.label}
                        </span>
                        {item.featured && (
                          <span className="rounded-full bg-rausch-500 px-2 py-0.5 font-medium text-[10px] text-white uppercase tracking-wide">
                            Join
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="mt-0.5 text-muted-foreground text-xs">{item.description}</p>
                      )}
                    </div>
                    <HugeiconsIcon
                      className="h-4 w-4 text-neutral-400 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                      icon={ArrowRight02Icon}
                    />
                  </Link>
                  {index === 2 && <div className="my-2 border-border border-t" />}
                </motion.div>
              ))}

              {/* Theme Selector */}
              <motion.div className="px-3 py-2" variants={itemVariants}>
                <ThemeSelector />
              </motion.div>

              <div className="my-2 border-border border-t" />

              {/* Auth Section */}
              <motion.div variants={itemVariants}>
                {isAuthenticated ? (
                  <div className="space-y-1 px-3 pb-2">
                    {dashboardHref && (
                      <Link
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-rausch-500 px-4 py-2.5 font-semibold text-sm text-white transition-colors hover:bg-rausch-600"
                        href={dashboardHref}
                        onClick={closeMenu}
                      >
                        {t("dashboard")}
                      </Link>
                    )}
                    <button
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 font-medium text-foreground text-sm transition-colors hover:bg-muted"
                      onClick={() => {
                        onSignOut?.();
                        closeMenu();
                      }}
                      type="button"
                    >
                      {t("logout")}
                    </button>
                  </div>
                ) : (
                  <Link
                    className="group flex items-center justify-between px-4 py-3 no-underline transition-colors hover:bg-muted"
                    href="/auth/sign-in"
                    onClick={closeMenu}
                  >
                    <span className="font-medium text-foreground text-sm">
                      {t("desktopMenu.loginSignup")}
                    </span>
                    <HugeiconsIcon
                      className="h-4 w-4 text-neutral-400 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                      icon={ArrowRight02Icon}
                    />
                  </Link>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
