"use client";

import {
  Clock01Icon,
  DollarCircleIcon,
  Message01Icon,
  RepeatIcon,
  Shield01Icon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";

export function ProsBenefitsSection() {
  const t = useTranslations("pros.benefits");
  const benefits = [
    {
      icon: DollarCircleIcon,
      title: t("items.setRates.title"),
      description: t("items.setRates.description"),
    },
    {
      icon: Clock01Icon,
      title: t("items.payment.title"),
      description: t("items.payment.description"),
    },
    {
      icon: UserMultiple02Icon,
      title: t("items.clients.title"),
      description: t("items.clients.description"),
    },
    {
      icon: RepeatIcon,
      title: t("items.longTerm.title"),
      description: t("items.longTerm.description"),
    },
    {
      icon: Message01Icon,
      title: t("items.language.title"),
      description: t("items.language.description"),
    },
    {
      icon: Shield01Icon,
      title: t("items.safety.title"),
      description: t("items.safety.description"),
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
    <section className="py-20 lg:py-28">
      <Container className="max-w-7xl">
        <motion.div
          className="mb-16 text-center"
          initial="hidden"
          variants={fadeInUp}
          viewport={{ once: true, margin: "-100px" }}
          whileInView="visible"
        >
          <h2 className="mb-4 font-bold text-4xl text-neutral-900 sm:text-5xl">
            Why professionals choose Casaora
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-neutral-700">
            We've built a platform that puts you first — fair pay, quality clients, and support when
            you need it.
          </p>
        </motion.div>

        <motion.div
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          variants={staggerContainer}
          viewport={{ once: true, margin: "-100px" }}
          whileInView="visible"
        >
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                className="flex flex-col items-start gap-4 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                key={benefit.title}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                variants={fadeInUp}
                whileHover={{ y: -4 }}
              >
                <motion.div
                  className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100"
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  whileHover={{ scale: 1.15, rotate: 10 }}
                >
                  <HugeiconsIcon className="h-6 w-6 text-orange-600" icon={Icon} />
                </motion.div>

                <div>
                  <h3 className="mb-2 font-semibold text-lg text-neutral-900">{benefit.title}</h3>
                  <p className="text-neutral-600 leading-relaxed">{benefit.description}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </Container>
    </section>
  );
}
