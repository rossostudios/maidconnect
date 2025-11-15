"use client";

import {
  ArrowRight01Icon,
  Award01Icon,
  CheckmarkCircle01Icon,
  DollarCircleIcon,
  UserCheckIcon,
  UserSearchIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion, type Variants } from "motion/react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/routing";

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const slideIn: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const iconMap = {
  apply: UserSearchIcon,
  verify: CheckmarkCircle01Icon,
  match: UserCheckIcon,
  serve: Award01Icon,
  earn: DollarCircleIcon,
};

export function ProfessionalFlowSectionClient() {
  const t = useTranslations("howItWorks.professional");

  const steps = [
    {
      icon: "apply" as const,
      title: t("steps.apply.title"),
      description: t("steps.apply.description"),
    },
    {
      icon: "verify" as const,
      title: t("steps.verify.title"),
      description: t("steps.verify.description"),
    },
    {
      icon: "match" as const,
      title: t("steps.match.title"),
      description: t("steps.match.description"),
    },
    {
      icon: "serve" as const,
      title: t("steps.serve.title"),
      description: t("steps.serve.description"),
    },
    {
      icon: "earn" as const,
      title: t("steps.earn.title"),
      description: t("steps.earn.description"),
    },
  ];

  return (
    <section className="relative bg-neutral-50 py-20 sm:py-24 lg:py-32">
      <Container className="max-w-7xl">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
          {/* Left: Image */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, scale: 1 }}
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-200 shadow-2xl">
              <Image
                alt="Professional sign-up process"
                className="object-cover"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                src="/how-it-works-professional.jpg"
              />
            </div>
          </motion.div>

          {/* Right: Content */}
          <div className="flex flex-col justify-center">
            <motion.div
              initial="hidden"
              viewport={{ once: true, margin: "-100px" }}
              whileInView="visible"
            >
              {/* Badge */}
              <motion.div
                className="mb-4 inline-flex items-center gap-2 font-semibold text-[0.7rem] text-orange-600 uppercase tracking-[0.35em]"
                variants={fadeIn}
              >
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-orange-500" />
                For Professionals
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
                className="mt-6 text-lg text-neutral-600 leading-relaxed"
                variants={fadeIn}
              >
                {t("subtitle")}
              </motion.p>

              {/* Timeline */}
              <div className="relative mt-12">
                {/* Vertical line */}
                <div className="absolute top-0 bottom-0 left-6 w-0.5 bg-gradient-to-b from-orange-500 via-orange-500/50 to-transparent md:left-8" />

                {/* Steps */}
                <div className="space-y-8">
                  {steps.map((step, index) => {
                    const Icon = iconMap[step.icon];

                    return (
                      <motion.div
                        className="relative flex gap-6 md:gap-8"
                        initial="hidden"
                        key={index}
                        variants={slideIn}
                        viewport={{ once: true, margin: "-50px" }}
                        whileInView="visible"
                      >
                        {/* Step indicator */}
                        <div className="relative z-10 flex flex-shrink-0 flex-col items-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 font-bold text-white shadow-md md:h-16 md:w-16 md:text-lg">
                            {index + 1}
                          </div>
                        </div>

                        {/* Content card */}
                        <div className="flex-1 pb-8">
                          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-50">
                              <HugeiconsIcon
                                className="h-7 w-7 text-orange-600"
                                icon={Icon}
                              />
                            </div>
                            <h3 className="mb-2 font-semibold text-neutral-900 text-xl">
                              {step.title}
                            </h3>
                            <p className="text-neutral-600 leading-relaxed">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* CTA */}
              <motion.div
                className="mt-12"
                initial="hidden"
                variants={fadeIn}
                viewport={{ once: true }}
                whileInView="visible"
              >
                <Link
                  className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-8 py-4 font-semibold text-base text-white transition hover:bg-orange-600"
                  href="/auth/sign-up?role=professional"
                >
                  {t("cta")}
                  <HugeiconsIcon className="h-5 w-5" icon={ArrowRight01Icon} />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
}
