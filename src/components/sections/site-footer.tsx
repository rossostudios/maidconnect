import { headers } from "next/headers";
import { Facebook, Instagram, Linkedin, Mail, Twitter } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { KeyboardShortcutsButton } from "@/components/keyboard-shortcuts/keyboard-shortcuts-button";
import { LanguageSwitcher } from "@/components/navigation/language-switcher";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/routing";

const socialLinks = [
  { label: "Facebook", href: "https://facebook.com/maidconnect", icon: Facebook },
  { label: "Twitter", href: "https://twitter.com/maidconnect", icon: Twitter },
  { label: "Instagram", href: "https://instagram.com/maidconnect", icon: Instagram },
  { label: "LinkedIn", href: "https://linkedin.com/company/maidconnect", icon: Linkedin },
];

export async function SiteFooter() {
  // Access dynamic data first to prevent prerendering issues with Date
  await headers();
  const t = await getTranslations("footer");
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
        { href: "/careers", label: t("careers"), badge: "Hiring" },
        { href: "/support/account-suspended", label: t("support") },
      ],
    },
  ];

  return (
    <footer className="bg-[#11100e] py-20 text-[#f3ece1] sm:py-24" id="get-started">
      <Container className="max-w-[1400px]">
        <div className="grid gap-12 lg:grid-cols-[1fr_auto]">
          {/* Left: Brand & Description */}
          <div className="max-w-md space-y-6">
            <h2 className="font-semibold text-3xl text-white">MaidConnect</h2>
            <p className="text-[#cfc8be] text-base leading-relaxed">{t("description")}</p>
            <div className="space-y-3">
              <a
                className="flex items-center gap-3 text-[#cfc8be] text-base transition hover:text-[#ff5d46]"
                href="mailto:support@maidconnect.co"
              >
                <Mail className="h-5 w-5" />
                <span>support@maidconnect.co</span>
              </a>
            </div>
            <div className="flex items-center gap-4 pt-4">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  aria-label={label}
                  className="rounded-full border border-[#26231f] p-3 text-[#f3ece1] transition hover:border-[#ff5d46] hover:text-[#ff5d46]"
                  href={href}
                  key={label}
                  rel="noreferrer"
                  target="_blank"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Right: Links */}
          <div className="grid gap-12 sm:grid-cols-2 lg:gap-16">
            {footerColumns.map((column) => (
              <div className="space-y-6" key={column.title}>
                <h3 className="font-semibold text-[#b1aca5] text-sm uppercase tracking-[0.2em]">
                  {column.title}
                </h3>
                <ul className="space-y-4">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        className="inline-flex items-center gap-2 text-[#f3ece1] text-base transition hover:text-[#ff5d46]"
                        href={link.href}
                      >
                        {link.label}
                        {link.badge && (
                          <span className="rounded-full bg-[#ff5d46]/10 px-2 py-0.5 font-medium text-[#ff5d46] text-xs uppercase tracking-wider">
                            {link.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 border-[#26231f] border-t pt-8">
          <div className="flex flex-col gap-6 text-[#a8a095] text-sm sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {year} MaidConnect. {t("allRightsReserved")}
            </p>
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
              <div className="flex items-center gap-6">
                <Link className="transition hover:text-[#ff5d46]" href="/terms">
                  {t("terms")}
                </Link>
                <Link className="transition hover:text-[#ff5d46]" href="/privacy">
                  {t("privacy")}
                </Link>
                <Link className="transition hover:text-[#ff5d46]" href="/support/account-suspended">
                  {t("cookies")}
                </Link>
                <Link className="transition hover:text-[#ff5d46]" href="/changelog">
                  What's New
                </Link>
              </div>
              <div className="flex items-center gap-4">
                <KeyboardShortcutsButton variant="dark" />
                <div className="footer-language-switcher">
                  <LanguageSwitcher variant="dark" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
