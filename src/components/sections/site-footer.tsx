import { Facebook02Icon, InstagramIcon, Mail01Icon, NewTwitterIcon } from "hugeicons-react";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { FeedbackLink } from "@/components/feedback/feedback-link";
import { SiteFooterActions } from "@/components/sections/site-footer-actions";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/routing";

const socialLinks = [
  { label: "Facebook", href: "https://facebook.com/casaora", icon: Facebook02Icon },
  { label: "X (Twitter)", href: "https://twitter.com/casaora", icon: NewTwitterIcon },
  { label: "Instagram", href: "https://instagram.com/casaora", icon: InstagramIcon },
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
        { href: "/how-it-works", label: t("howItWorks") },
        { href: "/pricing", label: t("pricing") },
        { href: "/roadmap", label: t("roadmap") },
        { href: "/help", label: t("helpCenter") },
        { href: "/contact", label: t("contact") },
        { href: "#services", label: t("services") },
      ],
    },
    {
      title: t("company"),
      links: [
        { href: "/about", label: t("about") },
        { href: "/auth/sign-in", label: t("loginSignup") },
        { href: "/auth/sign-up?role=professional", label: t("applyProfessional") },
        { href: "/careers", label: t("careers"), badge: "Hiring" },
        { href: "/aguaora", label: "AGUAORA", badge: "Coming Soon" },
        { href: "/support/account-suspended", label: t("support") },
      ],
    },
    {
      title: t("mobile"),
      links: [
        { href: "/mobile", label: t("iosApp"), badge: "Coming Soon" },
        { href: "/mobile", label: t("androidApp"), badge: "Coming Soon" },
      ],
    },
  ];

  return (
    <footer
      className="border-[var(--border)] border-t bg-[var(--background-alt)] py-24 text-[var(--foreground)] sm:py-28"
      id="get-started"
    >
      <Container className="max-w-[1400px]">
        <div className="grid gap-16 lg:grid-cols-[1fr_auto]">
          {/* Left: Brand & Description */}
          <div className="max-w-md space-y-7">
            <span className="type-serif-md text-[var(--foreground)] uppercase tracking-[0.08em]">
              CASAORA
            </span>
            <p className="text-[var(--muted-foreground)] text-base leading-relaxed">
              {t("description")}
            </p>
            <div className="space-y-3">
              <a
                className="flex items-center gap-3 text-[var(--foreground)] text-base transition hover:text-[var(--red)]"
                href="mailto:hello@casaora.com"
              >
                <Mail01Icon className="h-5 w-5" strokeWidth={2} />
                <span>hello@casaora.com</span>
              </a>
            </div>
            <div className="flex items-center gap-3 pt-4">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  aria-label={label}
                  className="rounded-full border border-[var(--border)] p-3 text-[var(--foreground)] transition-all hover:border-[var(--red)] hover:bg-[var(--red-light)] hover:text-[var(--red)]"
                  href={href}
                  key={label}
                  rel="noreferrer"
                  target="_blank"
                >
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </a>
              ))}
            </div>
          </div>

          {/* Right: Links */}
          <div className="grid gap-12 sm:grid-cols-2 md:grid-cols-3 lg:gap-20">
            {footerColumns.map((column) => (
              <div className="space-y-6" key={column.title}>
                <h3 className="font-medium text-[var(--muted-foreground)] text-sm uppercase tracking-[0.08em]">
                  {column.title}
                </h3>
                <ul className="space-y-4">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        className="inline-flex items-center gap-2 text-[var(--foreground)] text-base transition hover:text-[var(--red)]"
                        data-tour={link.href === "/help" ? "help" : undefined}
                        href={link.href}
                      >
                        {link.label}
                        {link.badge && (
                          <span className="rounded-full bg-[var(--red-light)] px-2.5 py-1 font-medium text-[var(--red)] text-xs uppercase tracking-wide">
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
        <div className="mt-20 border-[var(--border)] border-t pt-8">
          <div className="flex flex-col gap-6 text-[var(--muted-foreground)] text-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <p>
                © {year} Casaora. {t("allRightsReserved")}
              </p>
              <p>{t("remoteCompany")}</p>
            </div>
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
              <div className="flex items-center gap-6">
                <Link className="transition hover:text-[var(--red)]" href="/terms">
                  {t("terms")}
                </Link>
                <Link className="transition hover:text-[var(--red)]" href="/privacy">
                  {t("privacy")}
                </Link>
                <Link
                  className="transition hover:text-[var(--red)]"
                  href="/support/account-suspended"
                >
                  {t("cookies")}
                </Link>
                <Link className="transition hover:text-[var(--red)]" href="/changelog">
                  What's New
                </Link>
                <FeedbackLink>Feedback</FeedbackLink>
              </div>
              <SiteFooterActions />
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
