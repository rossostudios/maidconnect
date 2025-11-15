import {
  Facebook02Icon,
  InstagramIcon,
  Mail01Icon,
  NewTwitterIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { headers } from "next/headers";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { FeedbackLink } from "@/components/feedback/feedback-link";
import { SiteFooterActions } from "@/components/sections/SiteFooterActions";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/**
 * SiteFooter - Swiss Design System
 *
 * Minimalist footer following Swiss principles:
 * - Clean typography with Satoshi
 * - Sharp corners (no rounded elements)
 * - Minimal social buttons
 * - Orange accent color
 * - Grid-based layout
 */

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
        { href: "/help", label: t("helpCenter") },
      ],
    },
    {
      title: t("company"),
      links: [
        { href: "/about", label: t("about") },
        { href: "/blog", label: "Blog" },
        { href: "/pros", label: "For Professionals" },
        { href: "/careers", label: t("careers"), badge: "Hiring" },
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
  ];

  return (
    <footer
      className="relative border-neutral-800 border-t bg-neutral-900 py-24 text-white"
      id="get-started"
    >
      <Container className="relative max-w-7xl px-4">
        <div className="grid gap-16 lg:grid-cols-[1fr_auto]">
          {/* Brand Section */}
          <div className="flex max-w-md flex-col gap-8">
            {/* Logo - Swiss Typography */}
            <div className="flex items-center gap-3">
              <Image
                alt="Casaora logo"
                className="h-10 w-auto"
                height={40}
                src="/isologo.svg"
                width={40}
              />
              <span
                className="font-bold text-3xl text-white tracking-tight"
                style={{ fontFamily: "var(--font-satoshi), sans-serif" }}
              >
                CASAORA
              </span>
            </div>

            <p className="text-base text-neutral-300 leading-relaxed">{t("description")}</p>

            {/* Contact & Social */}
            <div className="flex flex-col gap-4">
              <a
                className="flex items-center gap-3 text-base text-neutral-200 transition hover:text-orange-600"
                href="mailto:hello@casaora.com"
              >
                <HugeiconsIcon className="h-5 w-5" icon={Mail01Icon} strokeWidth={1.5} />
                <span>hello@casaora.com</span>
              </a>

              {/* Social Links - Minimal Square Buttons */}
              <div className="flex items-center gap-2">
                {socialLinks.map(({ label, href, icon }) => (
                  <a
                    aria-label={label}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center border border-neutral-700 bg-neutral-800 text-neutral-200 transition-all",
                      "hover:border-orange-500 hover:bg-orange-500 hover:text-white"
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
            </div>
          </div>

          {/* Footer Columns */}
          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 lg:gap-14">
            {footerColumns.map((column) => (
              <div className="flex flex-col gap-6" key={column.title}>
                <h3 className="font-mono text-neutral-500 text-xs uppercase tracking-widest">
                  {column.title}
                </h3>

                <ul className="flex flex-col gap-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        className="inline-flex items-center gap-2 text-base text-neutral-400 transition hover:text-white"
                        data-tour={link.href === "/help" ? "help" : undefined}
                        href={link.href}
                      >
                        {link.label}
                        {link.badge && (
                          <Badge
                            className="bg-orange-500 px-2 py-0.5 font-medium text-white text-xs uppercase tracking-wide"
                            variant="secondary"
                          >
                            {link.badge}
                          </Badge>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Separator - Clean Line */}
        <Separator className="my-12 bg-neutral-800" />

        {/* Compliance Badges */}
        <div className="mb-12 flex flex-col items-center gap-6">
          <h3 className="font-mono text-neutral-500 text-xs uppercase tracking-widest">
            Security & Compliance
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-12 w-12 items-center justify-center border border-neutral-700 bg-neutral-800">
                <span className="font-bold font-mono text-neutral-300 text-xs">PCI</span>
              </div>
              <span className="text-neutral-400 text-xs">PCI DSS</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-12 w-12 items-center justify-center border border-neutral-700 bg-neutral-800">
                <span className="font-bold font-mono text-neutral-300 text-xs">SOC 2</span>
              </div>
              <span className="text-neutral-400 text-xs">Type II</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-12 w-12 items-center justify-center border border-neutral-700 bg-neutral-800">
                <span className="font-bold font-mono text-neutral-300 text-xs">GDPR</span>
              </div>
              <span className="text-neutral-400 text-xs">Compliant</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-12 w-12 items-center justify-center border border-neutral-700 bg-neutral-800">
                <span className="font-bold font-mono text-neutral-300 text-xs">ISO</span>
              </div>
              <span className="text-neutral-400 text-xs">27001</span>
            </div>
          </div>
          <p className="text-center text-neutral-500 text-xs">
            Payments secured by Stripe. Infrastructure certified by Supabase & Vercel.
          </p>
        </div>

        <Separator className="mb-12 bg-neutral-800" />

        {/* Bottom Section */}
        <div className="flex flex-col gap-6 text-neutral-400 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <p>
              © {year} Casaora. {t("allRightsReserved")}
            </p>
            <p>{t("remoteCompany")}</p>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <FeedbackLink>Feedback</FeedbackLink>
            <SiteFooterActions />
          </div>
        </div>
      </Container>
    </footer>
  );
}
