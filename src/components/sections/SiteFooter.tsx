"use client";

import {
  Facebook02Icon,
  InstagramIcon,
  Mail01Icon,
  NewTwitterIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { FeedbackLink } from "@/components/feedback/feedback-link";
import { SiteFooterActions } from "@/components/sections/SiteFooterActions";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/**
 * SiteFooter - Editorial Grid Design
 *
 * Lia Design System:
 * - Clean editorial grid layout
 * - Sharp rectangular geometry
 * - Geist Sans (UI) + Geist Mono (data)
 * - Orange accent on neutral palette
 * - Micro-interactions and hover states
 */

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
      className="relative border-neutral-200 border-t bg-neutral-900 text-white"
      data-section="get-started"
      id="footer"
      tabIndex={-1}
    >
      <Container className="relative max-w-7xl px-4 py-24">
        {/* Main Grid - Editorial Layout */}
        <div className="grid gap-16 lg:grid-cols-[300px_1fr]">
          {/* Left Column: Brand */}
          <div className="flex flex-col gap-8">
            {/* Logo */}
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <Image
                alt="Casaora logo"
                className="h-10 w-auto"
                height={40}
                src="/isologo.svg"
                width={40}
              />
              <span className="font-[family-name:var(--font-geist-sans)] font-bold text-3xl text-white uppercase tracking-tight">
                CASAORA
              </span>
            </motion.div>

            {/* Contact */}
            <motion.div
              className="flex flex-col gap-6"
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              {/* Email */}
              <a
                className="group flex items-center gap-3 font-[family-name:var(--font-geist-sans)] text-base text-neutral-200 transition-colors hover:text-orange-500"
                href="mailto:hello@casaora.com"
              >
                <div className="flex h-10 w-10 items-center justify-center border border-neutral-700 bg-neutral-800 transition-colors group-hover:border-orange-500 group-hover:bg-orange-500">
                  <HugeiconsIcon
                    className="h-5 w-5 transition-colors group-hover:text-white"
                    icon={Mail01Icon}
                    strokeWidth={1.5}
                  />
                </div>
                <span>hello@casaora.com</span>
              </a>

              {/* Social Links */}
              <div className="flex flex-col gap-3">
                <h4 className="font-[family-name:var(--font-geist-sans)] text-neutral-500 text-xs uppercase tracking-widest">
                  Follow Us
                </h4>
                <div className="flex items-center gap-2">
                  {socialLinks.map(({ label, href, icon }) => (
                    <motion.a
                      aria-label={label}
                      className={cn(
                        "flex h-10 w-10 items-center justify-center border border-neutral-700 bg-neutral-800 text-neutral-200 transition-all",
                        "hover:border-orange-500 hover:bg-orange-500 hover:text-white"
                      )}
                      href={href}
                      key={label}
                      rel="noreferrer"
                      target="_blank"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <HugeiconsIcon className="h-5 w-5" icon={icon} strokeWidth={1.5} />
                    </motion.a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Side: Navigation Grid */}
          <div className="flex flex-col gap-12">
            {/* Navigation Grid */}
            <motion.div
              className="grid gap-12 sm:grid-cols-2 md:grid-cols-3"
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              {footerColumns.map((column, _idx) => (
                <div className="flex flex-col gap-6" key={column.title}>
                  <h3 className="font-[family-name:var(--font-geist-sans)] text-neutral-500 text-xs uppercase tracking-widest">
                    {column.title}
                  </h3>

                  <ul className="flex flex-col gap-3">
                    {column.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          className="group inline-flex items-center gap-2 font-[family-name:var(--font-geist-sans)] text-base text-neutral-400 transition-colors hover:text-orange-500"
                          data-tour={link.href === "/help" ? "help" : undefined}
                          href={link.href}
                        >
                          <span className="relative">
                            {link.label}
                            <span className="absolute bottom-0 left-0 h-px w-0 bg-orange-500 transition-all duration-300 group-hover:w-full" />
                          </span>
                          {link.badge && (
                            <Badge
                              className="bg-orange-500 px-2 py-0.5 font-[family-name:var(--font-geist-sans)] font-medium text-white text-xs uppercase tracking-wide"
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
            </motion.div>
          </div>
        </div>

        {/* Separator */}
        <Separator className="my-16 bg-neutral-800" />

        {/* Trust Signals - Compliance Badges */}
        <motion.div
          className="mb-16 flex flex-col gap-8"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-center font-[family-name:var(--font-geist-sans)] text-neutral-500 text-xs uppercase tracking-widest">
            Security & Compliance
          </h3>

          {/* Compliance Grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "PCI DSS", sublabel: "Level 1" },
              { label: "SOC 2", sublabel: "Type II" },
              { label: "GDPR", sublabel: "Compliant" },
              { label: "ISO", sublabel: "27001" },
            ].map((badge, idx) => (
              <motion.div
                className="group flex flex-col items-center gap-3 border border-neutral-800 bg-neutral-950/30 p-6 transition-colors hover:border-orange-500/50"
                initial={{ opacity: 0, y: 20 }}
                key={badge.label}
                transition={{ duration: 0.4, delay: 0.35 + idx * 0.05 }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <div className="flex h-12 w-12 items-center justify-center border border-neutral-700 bg-neutral-800 transition-colors group-hover:border-orange-500 group-hover:bg-orange-500/10">
                  <span className="font-[family-name:var(--font-geist-mono)] font-bold text-neutral-300 text-xs transition-colors group-hover:text-orange-500">
                    {badge.label}
                  </span>
                </div>
                <span className="text-center font-[family-name:var(--font-geist-sans)] text-neutral-500 text-xs">
                  {badge.sublabel}
                </span>
              </motion.div>
            ))}
          </div>

          <p className="text-center font-[family-name:var(--font-geist-sans)] text-neutral-500 text-xs">
            Payments secured by Stripe. Infrastructure certified by Supabase & Vercel.
          </p>
        </motion.div>

        <Separator className="my-12 bg-neutral-800" />

        {/* Bottom Section */}
        <motion.div
          className="flex flex-col gap-6 font-[family-name:var(--font-geist-sans)] text-neutral-400 text-sm sm:flex-row sm:items-center sm:justify-between"
          initial={{ opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1 }}
        >
          <div className="flex flex-col gap-2">
            <p>
              © {year} Casaora. {t("allRightsReserved")}
            </p>
            <p className="font-[family-name:var(--font-geist-mono)] text-neutral-500 text-xs">
              {t("remoteCompany")}
            </p>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <FeedbackLink>Feedback</FeedbackLink>
            <SiteFooterActions />
          </div>
        </motion.div>
      </Container>
    </footer>
  );
}
