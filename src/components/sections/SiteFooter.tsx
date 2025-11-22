"use client";

import { Facebook02Icon, InstagramIcon, NewTwitterIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/navigation/language-switcher";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const socialLinks = [
  { label: "Facebook", href: "https://facebook.com/casaora", icon: Facebook02Icon },
  { label: "X (Twitter)", href: "https://twitter.com/casaora", icon: NewTwitterIcon },
  { label: "Instagram", href: "https://instagram.com/casaora", icon: InstagramIcon },
];

export function SiteFooter() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  const footerColumns = [
    {
      title: t("platform"),
      links: [
        { href: "/how-it-works", label: t("howItWorks") },
        { href: "/pricing", label: t("pricing") },
        { href: "/help", label: t("helpCenter") },
      ],
    },
    {
      title: t("company"),
      links: [
        { href: "/about", label: t("about") },
        { href: "/blog", label: "Blog" },
        { href: "/pros", label: "For Professionals" },
        { href: "/changelog", label: "What's New" },
      ],
    },
    {
      title: "Legal",
      links: [
        { href: "/terms", label: t("terms") },
        { href: "/privacy", label: t("privacy") },
        { href: "/legal/compliance", label: "Compliance" },
        { href: "/legal/security", label: "Security" },
      ],
    },
    {
      title: "Contact",
      links: [
        { href: "mailto:hello@casaora.co", label: "hello@casaora.co" },
        { href: "/contact", label: "Contact Sales" },
      ],
    },
  ];

  return (
    <footer className="relative flex min-h-[480px] flex-col overflow-hidden" id="footer">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          alt="Casaora - Home in Latin America"
          className="object-cover object-center"
          fill
          priority
          sizes="100vw"
          src="/casaorafooter.png"
        />
      </div>

      {/* Top gradient - blends page into sky */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24"
        style={{
          background: `linear-gradient(
            to bottom,
            white 0%,
            rgba(255, 255, 255, 0.9) 30%,
            rgba(255, 255, 255, 0.5) 60%,
            transparent 100%
          )`,
        }}
      />

      {/* Floating Card Container */}
      <div className="relative z-30 mx-auto w-full max-w-screen-xl px-4 pt-12 md:px-6 lg:px-8">
        {/* Floating Card */}
        <div className="rounded-2xl bg-white/95 px-6 py-6 shadow-xl md:px-8 md:py-8">
          {/* Main Footer Content */}
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            {/* Footer Links - left side */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4 md:gap-x-10">
              {footerColumns.map((column) => (
                <div className="flex flex-col gap-3" key={column.title}>
                  <h3
                    className={cn(
                      "font-[family-name:var(--font-geist-sans)] font-semibold text-xs uppercase tracking-wider",
                      "text-neutral-500"
                    )}
                  >
                    {column.title}
                  </h3>
                  <ul className="space-y-2">
                    {column.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          className={cn(
                            "font-[family-name:var(--font-geist-sans)] text-sm no-underline transition-colors duration-200",
                            "text-neutral-700",
                            "hover:text-orange-600"
                          )}
                          href={link.href}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Brand - right side */}
            <div className="flex flex-col gap-2 lg:max-w-xs lg:text-right">
              <span
                className={cn(
                  "font-[family-name:var(--font-geist-sans)] font-bold text-xl uppercase tracking-wider",
                  "text-neutral-900"
                )}
              >
                CASAORA®
              </span>
              <p className={cn("text-sm leading-relaxed", "text-neutral-600")}>
                Trusted home professionals in Latin America. Simple, safe, and fair.
              </p>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-6 flex flex-col gap-4 border-neutral-200 border-t pt-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {socialLinks.map(({ label, href, icon }) => (
                  <a
                    aria-label={label}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200",
                      "text-neutral-500 hover:bg-neutral-100",
                      "hover:text-orange-600"
                    )}
                    href={href}
                    key={label}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <HugeiconsIcon className="h-4 w-4" icon={icon} strokeWidth={1.5} />
                  </a>
                ))}
              </div>
              {/* Language Toggle */}
              <div className="border-neutral-200 border-l pl-4">
                <LanguageSwitcher />
              </div>
            </div>
            <p className="font-[family-name:var(--font-geist-sans)] text-neutral-500 text-xs">
              © {year} Casaora. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Spacer to show landscape below card */}
      <div className="flex-1" />
    </footer>
  );
}
