"use client";

import {
  BriefcaseIcon,
  Calendar03Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";

const colorClasses = {
  orange: {
    bg: "bg-orange-100",
    text: "text-orange-600",
    border: "border-orange-200",
  },
  neutral: {
    bg: "bg-neutral-100",
    text: "text-neutral-600",
    border: "border-neutral-200",
  },
  blue: {
    bg: "bg-blue-100",
    text: "text-blue-600",
    border: "border-blue-200",
  },
};

export function ProsThreeWaysToEarnSection() {
  const t = useTranslations("pros.earn");

  const earningPaths = [
    {
      icon: SparklesIcon,
      titleKey: "instant.title",
      descriptionKey: "instant.description",
      color: "orange" as const,
    },
    {
      icon: Calendar03Icon,
      titleKey: "recurring.title",
      descriptionKey: "recurring.description",
      color: "neutral" as const,
    },
    {
      icon: BriefcaseIcon,
      titleKey: "placement.title",
      descriptionKey: "placement.description",
      color: "blue" as const,
    },
  ];

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  return (
    <section className="border-neutral-200 border-y bg-neutral-50 py-20 lg:py-28">
      <Container className="max-w-7xl">
        <motion.div
          className="mb-16 text-center"
          initial="hidden"
          variants={fadeInUp}
          viewport={{ once: true, margin: "-100px" }}
          whileInView="visible"
        >
          <h2 className="mb-4 font-[family-name:var(--font-geist-sans)] font-bold text-4xl text-neutral-900 sm:text-5xl">
            {t("title")}
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-neutral-700 leading-relaxed">
            {t("subtitle")}
          </p>
        </motion.div>

        <motion.div
          className="grid gap-8 md:grid-cols-3"
          initial="hidden"
          variants={staggerContainer}
          viewport={{ once: true, margin: "-100px" }}
          whileInView="visible"
        >
          {earningPaths.map((path) => {
            const Icon = path.icon;
            const colors = colorClasses[path.color];
            return (
              <motion.div
                className={`flex flex-col items-start gap-4 rounded-lg border ${colors.border} bg-white p-6 shadow-md transition-shadow duration-200 hover:shadow-lg`}
                key={path.titleKey}
                variants={fadeInUp}
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${colors.bg} shadow-sm`}>
                  <HugeiconsIcon className={`h-6 w-6 ${colors.text}`} icon={Icon} />
                </div>

                <div>
                  <h3 className="mb-2 font-[family-name:var(--font-geist-sans)] font-semibold text-lg text-neutral-900">{t(path.titleKey)}</h3>
                  <p className="text-neutral-600 leading-relaxed text-sm">{t(path.descriptionKey)}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          className="mt-12 rounded-lg border border-blue-200 bg-blue-50 p-6 text-center shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <p className="font-[family-name:var(--font-geist-sans)] font-semibold text-blue-900 text-lg leading-relaxed">
            {t("ctaText")}
          </p>
        </motion.div>
      </Container>
    </section>
  );
}
