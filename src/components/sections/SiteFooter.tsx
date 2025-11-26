"use client";

import { Facebook02Icon, InstagramIcon, NewTwitterIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/brand/logo";
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
        { href: "/help", label: t("helpCenter") },
      ],
    },
    {
      title: t("company"),
      links: [
        { href: "/about", label: t("about") },
        { href: "/blog", label: "Blog" },
        { href: "/changelog", label: "What's New" },
      ],
    },
    {
      title: t("joinUs"),
      links: [
        { href: "/become-a-pro", label: t("becomePro") },
        { href: "/ambassadors", label: t("ambassador") },
        { href: "/professionals", label: t("browsePros") },
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
    <footer className="flex flex-col" id="footer">
      {/* Image Section - Hero-style container */}
      <div className="bg-background px-4 pt-12 pb-8 md:px-8 lg:px-12">
        <div className="mx-auto max-w-screen-2xl">
          <div className="relative overflow-hidden rounded-[28px] shadow-lg">
            <div className="relative aspect-[21/9] md:aspect-[3/1]">
              <Image
                alt="Casaora - Home in Latin America"
                className="object-cover object-center"
                fill
                priority
                sizes="100vw"
                src="/footer.png"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Section - Full width background */}
      <div className="w-full bg-background">
        <div className="mx-auto max-w-screen-2xl px-4 py-10 md:px-8 md:py-12 lg:px-12">
          {/* Main Footer Content */}
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            {/* Footer Links - left side */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4 md:gap-x-12">
              {footerColumns.map((column) => (
                <div className="flex flex-col gap-3" key={column.title}>
                  <h3
                    className={cn(
                      "font-[family-name:var(--font-geist-sans)] font-semibold text-xs uppercase tracking-wider",
                      "text-muted-foreground"
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
                            "text-foreground",
                            "hover:text-rausch-500"
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
            <div className="flex flex-col gap-3 lg:max-w-xs lg:items-end">
              <Logo size="lg" />
              <p className={cn("text-sm leading-relaxed lg:text-right", "text-muted-foreground")}>
                Trusted home professionals in Latin America. Simple, safe, and fair.
              </p>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 flex flex-col gap-4 border-border border-t pt-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {socialLinks.map(({ label, href, icon }) => (
                  <a
                    aria-label={label}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200",
                      "text-muted-foreground hover:bg-muted",
                      "hover:text-rausch-500"
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
            </div>
            <p className="font-[family-name:var(--font-geist-sans)] text-muted-foreground text-xs">
              © {year} Casaora. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
