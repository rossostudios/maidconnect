"use client";

import {
  ArrowRight01Icon,
  CheckmarkBadge01Icon,
  Clock01Icon,
  Shield01Icon,
  Tick01Icon,
  UserCheck01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion, type Variants } from "motion/react";
import { useTranslations } from "next-intl";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/routing";

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

export function PricingPageClient() {
  const _t = useTranslations("pricing");

  return (
    <div className="flex flex-col">
      <HeroSection />
      <FeeCardsSection />
      <WhatsIncludedSection />
      <FAQSection />
      <CTASection />
    </div>
  );
}

function HeroSection() {
  const t = useTranslations("pricing.hero");

  return (
    <section className="bg-white py-16 md:py-24 lg:py-32">
      <Container className="max-w-4xl">
        <motion.div animate="visible" className="text-center" initial="hidden" variants={stagger}>
          {/* Pill Badge */}
          <motion.div className="mb-8" variants={fadeIn}>
            <span className="inline-flex rounded-full bg-neutral-100 px-4 py-1.5 font-medium text-neutral-600 text-sm">
              {t("badge")}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="font-[family-name:var(--font-geist-sans)] font-medium text-4xl text-neutral-900 leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl"
            variants={fadeIn}
          >
            {t("title")}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600 leading-relaxed"
            variants={fadeIn}
          >
            {t("subtitle")}
          </motion.p>
        </motion.div>
      </Container>
    </section>
  );
}

function FeeCardsSection() {
  const t = useTranslations("pricing.fees");

  return (
    <section className="bg-neutral-50 py-16 md:py-24">
      <Container className="max-w-3xl">
        <motion.div
          animate="visible"
          className="flex justify-center"
          initial="hidden"
          variants={stagger}
        >
          {/* Simple, Transparent Pricing Card */}
          <motion.div
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm"
            variants={fadeIn}
          >
            <div className="mb-6">
              <span className="inline-flex rounded-full bg-rausch-50 px-3 py-1 font-medium text-rausch-600 text-sm">
                {t("instantBook.badge")}
              </span>
            </div>
            <h3 className="mb-2 font-medium text-2xl text-neutral-900">{t("instantBook.title")}</h3>
            <div className="mb-4 flex items-baseline gap-1">
              <span className="font-medium text-5xl text-neutral-900">15%</span>
              <span className="text-neutral-500">{t("instantBook.feeLabel")}</span>
            </div>
            <p className="mb-6 text-neutral-600">{t("instantBook.description")}</p>

            <ul className="space-y-3">
              {["feature1", "feature2", "feature3"].map((key) => (
                <li className="flex items-start gap-3" key={key}>
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-500">
                    <HugeiconsIcon
                      className="h-3 w-3 text-white"
                      icon={Tick01Icon}
                      strokeWidth={3}
                    />
                  </span>
                  <span className="text-neutral-700">{t(`instantBook.${key}`)}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        {/* Pro Earnings Note */}
        <motion.div
          animate="visible"
          className="mt-8 text-center"
          initial="hidden"
          variants={fadeIn}
        >
          <p className="text-neutral-600">
            <span className="font-semibold text-neutral-900">{t("proNote.highlight")}</span>{" "}
            {t("proNote.text")}
          </p>
        </motion.div>
      </Container>
    </section>
  );
}

function WhatsIncludedSection() {
  const t = useTranslations("pricing.included");

  const items = [
    { icon: Shield01Icon, key: "vetting" },
    { icon: CheckmarkBadge01Icon, key: "backgroundChecks" },
    { icon: UserCheck01Icon, key: "insurance" },
    { icon: Clock01Icon, key: "support" },
  ];

  return (
    <section className="bg-white py-16 md:py-24">
      <Container className="max-w-5xl">
        <motion.div
          animate="visible"
          className="mb-12 text-center"
          initial="hidden"
          variants={fadeIn}
        >
          <h2 className="font-medium text-3xl text-neutral-900 tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-neutral-600">{t("subtitle")}</p>
        </motion.div>

        <motion.div
          animate="visible"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          initial="hidden"
          variants={stagger}
        >
          {items.map((item) => (
            <motion.div
              className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 text-center"
              key={item.key}
              variants={fadeIn}
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-100">
                <HugeiconsIcon className="h-6 w-6 text-neutral-600" icon={item.icon} />
              </div>
              <h3 className="mb-2 font-medium text-neutral-900">{t(`${item.key}.title`)}</h3>
              <p className="text-neutral-600 text-sm">{t(`${item.key}.description`)}</p>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}

function FAQSection() {
  const t = useTranslations("pricing.faq");

  const faqs = [{ key: "q1" }, { key: "q2" }, { key: "q3" }, { key: "q4" }];

  return (
    <section className="bg-neutral-50 py-16 md:py-24">
      <Container className="max-w-3xl">
        <div className="mb-12 text-center">
          <h2 className="font-medium text-3xl text-neutral-900 tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-neutral-600">{t("subtitle")}</p>
        </div>

        <Accordion allowMultiple={false} variant="default">
          {faqs.map((faq) => (
            <AccordionItem key={faq.key} value={faq.key}>
              <AccordionTrigger>{t(`${faq.key}.question`)}</AccordionTrigger>
              <AccordionContent>{t(`${faq.key}.answer`)}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </section>
  );
}

function CTASection() {
  const t = useTranslations("pricing.cta");

  return (
    <section className="bg-neutral-900 py-16 md:py-24">
      <Container className="max-w-3xl">
        <div className="text-center">
          <h2 className="font-medium text-3xl text-white tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-white/80">{t("subtitle")}</p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 font-semibold text-neutral-900 transition hover:bg-neutral-100"
              href="/pros"
            >
              {t("browseButton")}
            </Link>
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-8 py-3.5 font-semibold text-white transition hover:bg-white/10"
              href="/professionals"
            >
              {t("signUpButton")}
              <HugeiconsIcon className="h-5 w-5" icon={ArrowRight01Icon} />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
