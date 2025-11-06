import {
  Facebook02Icon,
  InstagramIcon,
  Mail01Icon,
  NewTwitterIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
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
      className="relative overflow-hidden bg-white/80 py-24 text-slate-900 shadow-sm backdrop-blur-sm"
      id="get-started"
    >
      <Container className="relative max-w-[1400px]">
        <div className="grid gap-16 lg:grid-cols-[1fr_auto]">
          <div className="flex max-w-md flex-col gap-8">
            <span className="font-semibold text-2xl uppercase tracking-wider">CASAORA</span>

            <p className="text-base text-slate-700 italic leading-relaxed">{t("description")}</p>

            <div className="flex flex-col gap-3">
              <a
                className="flex items-center gap-3 text-base transition hover:text-[#E85D48]"
                href="mailto:hello@casaora.com"
              >
                <HugeiconsIcon className="h-5 w-5" icon={Mail01Icon} strokeWidth={2} />
                <span>hello@casaora.com</span>
              </a>

              <div className="flex items-center gap-3">
                {socialLinks.map(({ label, href, icon }) => (
                  <a
                    aria-label={label}
                    className="rounded-full bg-white/60 p-3 text-slate-900 transition-all hover:bg-white hover:text-[#E85D48]"
                    href={href}
                    key={label}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <HugeiconsIcon className="h-5 w-5" icon={icon} strokeWidth={2} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 lg:gap-14">
            {footerColumns.map((column) => (
              <div className="flex flex-col gap-6" key={column.title}>
                <h3 className="font-medium text-slate-600 text-sm uppercase tracking-[0.3em]">
                  {column.title}
                </h3>

                <ul className="flex flex-col gap-4">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        className="inline-flex items-center gap-2 text-base transition hover:text-[#E85D48]"
                        data-tour={link.href === "/help" ? "help" : undefined}
                        href={link.href}
                      >
                        {link.label}
                        {link.badge && (
                          <span className="rounded-full bg-[#E85D48]/10 px-2.5 py-1 font-medium text-[#E85D48] text-xs uppercase tracking-wide">
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

        <div className="mt-12 h-px w-full bg-white/40 backdrop-blur-xs" />

        <div className="mt-8 flex flex-col gap-6 text-slate-600 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <p>
              © {year} Casaora. {t("allRightsReserved")}
            </p>
            <p>{t("remoteCompany")}</p>
          </div>

          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <Link className="transition hover:text-[#E85D48]" href="/terms">
                {t("terms")}
              </Link>
              <Link className="transition hover:text-[#E85D48]" href="/privacy">
                {t("privacy")}
              </Link>
              <Link className="transition hover:text-[#E85D48]" href="/support/account-suspended">
                {t("cookies")}
              </Link>
              <Link className="transition hover:text-[#E85D48]" href="/changelog">
                What's New
              </Link>
              <FeedbackLink>Feedback</FeedbackLink>
            </div>

            <SiteFooterActions />
          </div>
        </div>
      </Container>
    </footer>
  );
}
