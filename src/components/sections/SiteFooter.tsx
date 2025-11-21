"use client";

import {
  Facebook02Icon,
  InstagramIcon,
  Mail01Icon,
  NewTwitterIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { FeedbackLink } from "@/components/feedback/feedback-link";
import { SiteFooterActions } from "@/components/sections/SiteFooterActions";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/**
 * SiteFooter - Anthropic-Inspired Lia Design
 *
 * Refined footer with exceptional typography and spatial balance:
 * - Geist Sans for all text, Geist Mono for technical data
 * - Light theme with elevated white cards on neutral-50 background
 * - Anthropic rounded corners (rounded-lg for cards, rounded-full for buttons)
 * - 4px spacing grid with generous breathing room
 * - Strategic orange accents on warm neutral base
 * - Strict 24px baseline alignment
 */

// Anthropic-Inspired Animation - Refined and Purposeful
const fadeIn: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (custom = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: custom * 0.1,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

const socialLinks = [
  { label: "Facebook", href: "https://facebook.com/casaora", icon: Facebook02Icon },
  { label: "X (Twitter)", href: "https://twitter.com/casaora", icon: NewTwitterIcon },
  { label: "Instagram", href: "https://instagram.com/casaora", icon: InstagramIcon },
];

export function SiteFooter() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();
  const shouldReduceMotion = useReducedMotion();

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
  ];

  return (
    <footer
      className="relative overflow-hidden bg-neutral-50"
      data-section="get-started"
      id="footer"
      tabIndex={-1}
    >
      {/* Main Footer Content */}
      {/* LIA: py-12 (48px = 2 baselines) mobile, py-24 (96px = 4 baselines) desktop */}
      <div className="py-12 md:py-24">
        <Container className="relative max-w-screen-2xl px-4 md:px-12 lg:px-16">
          {/* Elevated Card - Main Content */}
          <motion.div
            animate={shouldReduceMotion ? undefined : "visible"}
            className="rounded-lg border border-neutral-200 bg-white p-8 shadow-sm md:p-12 lg:p-16"
            initial={shouldReduceMotion ? undefined : "hidden"}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
            }}
          >
            {/* Main Grid - Editorial Layout */}
            <div className="grid gap-12 lg:grid-cols-[320px_1fr] lg:gap-20">
              {/* Left Column: Brand + Contact */}
              <motion.div className="flex flex-col gap-8" custom={0} variants={fadeIn}>
                {/* Logo */}
                <div className="flex items-center gap-3">
                  <Image
                    alt="Casaora logo"
                    className="h-10 w-auto"
                    height={40}
                    src="/isologo.svg"
                    width={40}
                  />
                  <span className="font-[family-name:var(--font-geist-sans)] font-medium text-3xl text-neutral-900 uppercase tracking-tight">
                    CASAORA®
                  </span>
                </div>

                {/* Tagline */}
                <p className="max-w-xs text-base text-neutral-600 leading-relaxed">
                  Boutique household staffing across Latin America. Colombia, Paraguay, Uruguay, and Argentina.
                </p>

                {/* Contact */}
                <div className="flex flex-col gap-6">
                  {/* Email */}
                  <a
                    className="group flex items-center gap-3 font-[family-name:var(--font-geist-sans)] text-base text-neutral-700 transition-colors hover:text-orange-600"
                    href="mailto:hello@casaora.com"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 transition-all group-hover:border-orange-500 group-hover:bg-orange-50">
                      <HugeiconsIcon
                        className="h-5 w-5 text-neutral-600 transition-colors group-hover:text-orange-600"
                        icon={Mail01Icon}
                        strokeWidth={1.5}
                      />
                    </div>
                    <span>hello@casaora.com</span>
                  </a>

                  {/* Social Links */}
                  <div className="flex flex-col gap-3">
                    <h4 className="font-[family-name:var(--font-geist-sans)] font-medium text-neutral-600 text-xs uppercase tracking-wider">
                      Follow Us
                    </h4>
                    <div className="flex items-center gap-2">
                      {socialLinks.map(({ label, href, icon }) => (
                        <motion.a
                          aria-label={label}
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 transition-all",
                            "hover:border-orange-500 hover:bg-orange-500 hover:text-white hover:shadow-md"
                          )}
                          href={href}
                          key={label}
                          rel="noreferrer"
                          target="_blank"
                          whileHover={shouldReduceMotion ? undefined : { scale: 1.05 }}
                          whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
                        >
                          <HugeiconsIcon className="h-5 w-5" icon={icon} strokeWidth={1.5} />
                        </motion.a>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right Side: Navigation Grid */}
              <motion.div
                className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 md:gap-12"
                custom={1}
                variants={fadeIn}
              >
                {footerColumns.map((column) => (
                  <div className="flex flex-col gap-5" key={column.title}>
                    <h3 className="font-[family-name:var(--font-geist-sans)] font-medium text-neutral-900 text-sm uppercase tracking-wider">
                      {column.title}
                    </h3>

                    <ul className="flex flex-col gap-3">
                      {column.links.map((link) => (
                        <li key={link.label}>
                          <Link
                            className="group inline-flex items-center gap-2 font-[family-name:var(--font-geist-sans)] text-base text-neutral-600 transition-colors hover:text-orange-600"
                            data-tour={link.href === "/help" ? "help" : undefined}
                            href={link.href}
                          >
                            <span className="relative">
                              {link.label}
                              <span className="absolute bottom-0 left-0 h-px w-0 bg-orange-500 transition-all duration-300 group-hover:w-full" />
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </motion.div>
            </div>
          </motion.div>

          {/* Trust Signals - Security & Compliance */}
          <motion.div
            animate={shouldReduceMotion ? undefined : "visible"}
            className="mt-8 rounded-lg border border-neutral-200 bg-white p-8 shadow-sm md:p-10"
            initial={shouldReduceMotion ? undefined : "hidden"}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.05, delayChildren: 0.3 } },
            }}
          >
            <motion.h3
              className="mb-8 text-center font-[family-name:var(--font-geist-sans)] font-medium text-neutral-600 text-xs uppercase tracking-wider"
              custom={0}
              variants={fadeIn}
            >
              Security & Compliance
            </motion.h3>

            {/* Compliance Grid */}
            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: "PCI DSS", sublabel: "Level 1" },
                { label: "SOC 2", sublabel: "Type II" },
                { label: "GDPR", sublabel: "Compliant" },
                { label: "ISO", sublabel: "27001" },
              ].map((badge, idx) => (
                <motion.div
                  className="group flex flex-col items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-5 transition-all hover:border-orange-200 hover:bg-orange-50 hover:shadow-sm"
                  custom={idx + 1}
                  key={badge.label}
                  variants={fadeIn}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-neutral-200 bg-white transition-all group-hover:border-orange-500 group-hover:bg-orange-500">
                    <span className="text-center font-[family-name:var(--font-geist-mono)] font-bold text-[0.625rem] text-neutral-600 leading-tight transition-colors group-hover:text-white">
                      {badge.label}
                    </span>
                  </div>
                  <span className="text-center font-[family-name:var(--font-geist-sans)] text-neutral-600 text-xs">
                    {badge.sublabel}
                  </span>
                </motion.div>
              ))}
            </div>

            <motion.p
              className="text-center font-[family-name:var(--font-geist-sans)] text-neutral-600 text-sm"
              custom={5}
              variants={fadeIn}
            >
              Payments secured by Stripe. Infrastructure certified by Supabase & Vercel.
            </motion.p>
          </motion.div>

          {/* Bottom Section - Copyright & Actions */}
          <motion.div
            animate={shouldReduceMotion ? undefined : "visible"}
            className="flex flex-col gap-6 font-[family-name:var(--font-geist-sans)] text-neutral-600 text-sm sm:flex-row sm:items-center sm:justify-between"
            initial={shouldReduceMotion ? undefined : "hidden"}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.05, delayChildren: 0.5 } },
            }}
          >
            <motion.div className="flex flex-col gap-2" custom={0} variants={fadeIn}>
              <p className="text-neutral-700">
                © {year} Casaora. {t("allRightsReserved")}
              </p>
              <p className="font-[family-name:var(--font-geist-mono)] text-neutral-600 text-xs">
                {t("remoteCompany")}
              </p>
            </motion.div>

            <motion.div className="flex items-center gap-4 sm:gap-6" custom={1} variants={fadeIn}>
              <FeedbackLink>Feedback</FeedbackLink>
              <SiteFooterActions />
            </motion.div>
          </motion.div>
        </Container>
      </div>
    </footer>
  );
}
