"use client";

import {
  Certificate02Icon,
  CustomerService02Icon,
  Shield01Icon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { BenefitCard } from "@/components/ui/benefit-card";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

// Framer Motion animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as any },
  },
};

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

type Benefit = {
  icon: typeof Shield01Icon;
  titleKey: string;
  descriptionKey: string;
};

const benefits: Benefit[] = [
  {
    icon: UserMultiple02Icon,
    titleKey: "englishSupport.title",
    descriptionKey: "englishSupport.description",
  },
  {
    icon: Certificate02Icon,
    titleKey: "verifiedProfessionals.title",
    descriptionKey: "verifiedProfessionals.description",
  },
  {
    icon: Shield01Icon,
    titleKey: "fullInsurance.title",
    descriptionKey: "fullInsurance.description",
  },
  {
    icon: CustomerService02Icon,
    titleKey: "dedicatedSupport.title",
    descriptionKey: "dedicatedSupport.description",
  },
];

type TagMarqueeProps = {
  items: string[];
  direction: "ltr" | "rtl";
  label: string;
  speed?: number;
};

const TagMarquee = ({ items, direction, label, speed = 28 }: TagMarqueeProps) => {
  if (items.length === 0) {
    return null;
  }

  const repeatedItems = [...items, ...items];

  return (
    <div aria-label={label} className="relative overflow-hidden" role="list">
      <div
        className={cn(
          "marquee-row flex gap-3 py-1",
          direction === "rtl" ? "marquee-rtl" : "marquee-ltr"
        )}
        style={{ animationDuration: `${speed}s` }}
      >
        {repeatedItems.map((item, index) => (
          <span
            aria-hidden={index >= items.length}
            className="flex-none whitespace-nowrap border border-neutral-200 bg-[#f4ede6] px-5 py-2 font-medium text-neutral-700 text-sm shadow-[0_1px_0_rgba(15,23,42,0.08)] sm:text-base"
            key={`${item}-${index}`}
            role={index < items.length ? "listitem" : undefined}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

/**
 * BenefitsSection Component
 *
 * Editorial-style benefits board inspired by Aurius.
 * Includes a headline row, a table-grid with four value props,
 * and dual horizontal scrollers for quick-read service chips.
 *
 * @example
 * ```tsx
 * <BenefitsSection />
 * ```
 */
export function BenefitsSection() {
  const t = useTranslations("benefits");
  const tagRows = (["tags.primary", "tags.secondary"] as const)
    .map((key, index) => {
      const value = t.raw(key);
      return {
        items: Array.isArray(value) ? (value as string[]) : [],
        direction: (index === 0 ? "rtl" : "ltr") as "rtl" | "ltr",
      };
    })
    .filter((row) => row.items.length > 0);

  return (
    <section className="bg-neutral-50 py-16 md:py-20" id="benefits">
      {/* Top horizontal divider */}
      <div className="mx-auto mb-16 h-px max-w-7xl bg-neutral-200" />

      <Container className="max-w-7xl px-4 md:px-8">
        <div className="mx-auto max-w-5xl overflow-hidden border border-neutral-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          {/* Section Header */}
          <motion.div
            className="border-neutral-200 border-b px-6 py-12 text-center sm:px-12"
            initial="hidden"
            variants={fadeIn}
            viewport={{ once: true, margin: "-80px" }}
            whileInView="visible"
          >
            <div className="mb-4 flex items-center justify-center gap-2 font-semibold text-[0.7rem] text-orange-600 uppercase tracking-[0.35em]">
              <span aria-hidden="true" className="h-2 w-2 bg-orange-500" />
              {t("badge")}
            </div>

            <h2 className="font-bold text-3xl text-neutral-900 tracking-tight sm:text-4xl md:text-5xl">
              {t("heading")}
            </h2>

            <p className="mt-5 text-lg text-neutral-600">{t("description")}</p>
          </motion.div>

          {/* 2x2 Benefits Grid with table-style dividers */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2"
            initial="hidden"
            variants={stagger}
            viewport={{ once: true, margin: "-60px" }}
            whileInView="visible"
          >
            {benefits.map((benefit, index) => (
              <motion.div
                className={cn(
                  "bg-white p-8",
                  "border-neutral-200",
                  index < benefits.length - 1 && "border-b",
                  index % 2 === 0 && "md:border-r",
                  index < 2 ? "md:border-b" : "md:border-b-0",
                  index >= benefits.length - 2 && "md:border-b-0"
                )}
                key={benefit.titleKey}
                variants={fadeIn}
              >
                <BenefitCard
                  className="h-full"
                  description={t(benefit.descriptionKey)}
                  icon={benefit.icon}
                  title={t(benefit.titleKey)}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Tag scrollers */}
          {tagRows.length > 0 && (
            <div className="border-neutral-200 border-t bg-neutral-50/70 px-4 py-6 sm:px-8">
              <div className="space-y-4">
                {tagRows.map((row, rowIndex) => (
                  <TagMarquee
                    direction={row.direction}
                    items={row.items}
                    key={`benefit-tags-${rowIndex}`}
                    label={t("badge")}
                    speed={rowIndex === 0 ? 34 : 30}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
