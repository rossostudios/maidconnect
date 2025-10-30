"use client";

import { useTranslations } from "next-intl";
import { Link } from '@/i18n/routing';
import { Facebook, Instagram, Linkedin, Mail, Twitter } from "lucide-react";
import { Container } from "@/components/ui/container";
import { LanguageSwitcher } from "@/components/navigation/language-switcher";

const socialLinks = [
  { label: "Facebook", href: "https://facebook.com/maidconnect", icon: Facebook },
  { label: "Twitter", href: "https://twitter.com/maidconnect", icon: Twitter },
  { label: "Instagram", href: "https://instagram.com/maidconnect", icon: Instagram },
  { label: "LinkedIn", href: "https://linkedin.com/company/maidconnect", icon: Linkedin },
];

export function SiteFooter() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  const footerColumns = [
    {
      title: t("platform"),
      links: [
        { href: "/professionals", label: t("findProfessional") },
        { href: "/contact", label: t("contact") },
        { href: "#services", label: t("services") },
      ],
    },
    {
      title: t("company"),
      links: [
        { href: "/auth/sign-in", label: t("loginSignup") },
        { href: "/auth/sign-up?role=professional", label: t("applyProfessional") },
        { href: "/support/account-suspended", label: t("support") },
      ],
    },
  ];

  return (
    <footer id="get-started" className="bg-[#11100e] py-20 text-[#f3ece1] sm:py-24">
      <Container className="max-w-[1400px]">
        <div className="grid gap-12 lg:grid-cols-[1fr_auto]">
          {/* Left: Brand & Description */}
          <div className="max-w-md space-y-6">
            <h2 className="text-3xl font-semibold text-white">MaidConnect</h2>
            <p className="text-base leading-relaxed text-[#cfc8be]">
              {t("description")}
            </p>
            <div className="space-y-3">
              <a
                href="mailto:support@maidconnect.co"
                className="flex items-center gap-3 text-base text-[#cfc8be] transition hover:text-[#ff5d46]"
              >
                <Mail className="h-5 w-5" />
                <span>support@maidconnect.co</span>
              </a>
            </div>
            <div className="flex items-center gap-4 pt-4">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="rounded-full border border-[#26231f] p-3 text-[#f3ece1] transition hover:border-[#ff5d46] hover:text-[#ff5d46]"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Right: Links */}
          <div className="grid gap-12 sm:grid-cols-2 lg:gap-16">
            {footerColumns.map((column) => (
              <div key={column.title} className="space-y-6">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#b1aca5]">
                  {column.title}
                </h3>
                <ul className="space-y-4">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-base text-[#f3ece1] transition hover:text-[#ff5d46]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 border-t border-[#26231f] pt-8">
          <div className="flex flex-col gap-6 text-sm text-[#a8a095] sm:flex-row sm:items-center sm:justify-between">
            <p>© {year} MaidConnect. {t("allRightsReserved")}</p>
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
              <div className="flex items-center gap-6">
                <Link href="/terms" className="transition hover:text-[#ff5d46]">
                  {t("terms")}
                </Link>
                <Link href="/privacy" className="transition hover:text-[#ff5d46]">
                  {t("privacy")}
                </Link>
                <Link href="/support/account-suspended" className="transition hover:text-[#ff5d46]">
                  {t("cookies")}
                </Link>
              </div>
              <div className="footer-language-switcher">
                <LanguageSwitcher variant="dark" />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
