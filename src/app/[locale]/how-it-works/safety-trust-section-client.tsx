"use client";

import { LockIcon, Message01Icon, Shield01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion, type Variants } from "motion/react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const cardHover = {
  scale: 1.02,
  y: -4,
  transition: {
    type: "spring" as const,
    stiffness: 400,
    damping: 25,
  },
};

export function SafetyTrustSectionClient() {
  const t = useTranslations("howItWorks.safety");

  const safetyFeatures = [
    {
      icon: Shield01Icon,
      titleKey: "verification.title",
      descriptionKey: "verification.description",
    },
    {
      icon: LockIcon,
      titleKey: "payments.title",
      descriptionKey: "payments.description",
    },
    {
      icon: Message01Icon,
      titleKey: "support.title",
      descriptionKey: "support.description",
    },
  ];

  return (
    <section className="bg-white py-20 sm:py-24 lg:py-32">
      <Container>
        <motion.div
          className="mb-16 text-center"
          initial="hidden"
          variants={stagger}
          viewport={{ once: true, margin: "-100px" }}
          whileInView="visible"
        >
          {/* Badge */}
          <motion.div
            className="mb-6 inline-flex items-center gap-2 font-semibold text-[0.7rem] text-orange-600 uppercase tracking-[0.35em]"
            variants={fadeIn}
          >
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-orange-500" />
            Safety & Trust
          </motion.div>

          {/* Title */}
          <motion.h2
            className="font-bold text-4xl text-neutral-900 tracking-tight md:text-5xl"
            variants={fadeIn}
          >
            {t("title")}
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600 leading-relaxed"
            variants={fadeIn}
          >
            {t("subtitle")}
          </motion.p>
        </motion.div>

        <motion.div
          className="grid gap-8 md:grid-cols-3"
          initial="hidden"
          variants={stagger}
          viewport={{ once: true, margin: "-50px" }}
          whileInView="visible"
        >
          {safetyFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                className="group"
                key={index}
                variants={fadeIn}
                whileHover={cardHover}
              >
                <div className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-neutral-50 p-10 text-center shadow-sm transition-shadow group-hover:shadow-lg">
                  {/* Icon */}
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 transition-colors group-hover:bg-orange-100">
                    <HugeiconsIcon
                      className="h-8 w-8 text-orange-600 transition-transform group-hover:scale-110"
                      icon={Icon}
                    />
                  </div>

                  {/* Title */}
                  <h3 className="mb-4 font-semibold text-neutral-900 text-xl">
                    {t(feature.titleKey)}
                  </h3>

                  {/* Description */}
                  <p className="text-base text-neutral-600 leading-relaxed">
                    {t(feature.descriptionKey)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </Container>
    </section>
  );
}
