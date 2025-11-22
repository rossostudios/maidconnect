"use client";

import { Facebook02Icon, InstagramIcon, NewTwitterIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
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
    <footer className="bg-[#f7f2e9] text-neutral-900" id="footer">
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-12 px-4 py-14 md:px-10 md:py-20 lg:px-12">
        <div className="flex flex-col gap-3">
          <span className="font-[family-name:var(--font-geist-sans)] font-semibold text-xl uppercase tracking-tight md:text-2xl">
            CASAORA®
          </span>
          <p className="max-w-2xl text-neutral-700 text-sm leading-relaxed md:text-base">
            Trusted home professionals in Latin America. Simple, safe, and fair for families and
            professionals.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:grid-cols-4 md:gap-12">
          {footerColumns.map((column) => (
            <div className="flex flex-col gap-4" key={column.title}>
              <h3 className="font-[family-name:var(--font-geist-sans)] font-semibold text-neutral-600 text-xs uppercase tracking-wider">
                {column.title}
              </h3>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      className="font-[family-name:var(--font-geist-sans)] text-neutral-700 text-sm no-underline transition-colors hover:text-orange-600"
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

        <div className="flex flex-col gap-4 pt-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            {socialLinks.map(({ label, href, icon }) => (
              <a
                aria-label={label}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 text-neutral-700 transition-all",
                  "hover:border-orange-500 hover:bg-orange-50 hover:text-orange-600"
                )}
                href={href}
                key={label}
                rel="noreferrer"
                target="_blank"
              >
                <HugeiconsIcon className="h-5 w-5" icon={icon} strokeWidth={1.5} />
              </a>
            ))}
          </div>
          <p className="font-[family-name:var(--font-geist-sans)] text-neutral-600 text-sm">
            © {year} Casaora. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
