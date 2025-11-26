"use client";

import { ArrowRight01Icon, Award01Icon, CheckmarkCircle01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/routing";

export function ProsHeroSection() {
  const t = useTranslations("pros.hero");
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-rausch-50 via-white to-neutral-50 py-20 lg:py-28">
      <Container className="relative max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Column - Content */}
          <motion.div
            animate="visible"
            className="flex flex-col justify-center"
            initial="hidden"
            variants={staggerContainer}
          >
            <motion.div
              className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-rausch-200 bg-rausch-50 px-4 py-1.5 font-medium text-rausch-700 text-sm"
              variants={fadeInUp}
            >
              <HugeiconsIcon className="h-4 w-4" icon={Award01Icon} />
              {t("badge")}
            </motion.div>

            <motion.h1
              className="mb-6 font-bold text-5xl text-neutral-900 leading-tight lg:text-6xl"
              variants={fadeInUp}
            >
              {t("title")}
            </motion.h1>

            <motion.p className="mb-8 text-neutral-700 text-xl leading-relaxed" variants={fadeInUp}>
              {t("subtitle")}
            </motion.p>

            <motion.div className="flex flex-col gap-4 sm:flex-row" variants={fadeInUp}>
              <Link href="#apply">
                <motion.div
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button className="min-w-[200px]" size="lg">
                    {t("primaryCta")}
                    <HugeiconsIcon className="ml-2 h-5 w-5" icon={ArrowRight01Icon} />
                  </Button>
                </motion.div>
              </Link>
              <Link href="#how-it-works">
                <motion.div
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button className="min-w-[200px]" size="lg" variant="outline">
                    {t("secondaryCta")}
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            <motion.div
              className="mt-8 flex items-center gap-6 text-neutral-600 text-sm"
              variants={fadeInUp}
            >
              <div className="flex items-center gap-2">
                <HugeiconsIcon className="h-5 w-5 text-green-600" icon={CheckmarkCircle01Icon} />
                <span>{t("pills.free")}</span>
              </div>
              <div className="flex items-center gap-2">
                <HugeiconsIcon className="h-5 w-5 text-green-600" icon={CheckmarkCircle01Icon} />
                <span>{t("pills.noUpfront")}</span>
              </div>
              <div className="flex items-center gap-2">
                <HugeiconsIcon className="h-5 w-5 text-green-600" icon={CheckmarkCircle01Icon} />
                <span>{t("pills.earnFast")}</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Earnings Preview */}
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center lg:justify-end"
            initial={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <div className="w-full max-w-md rounded-lg border border-neutral-200 bg-white p-8 shadow-lg">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rausch-100">
                  <HugeiconsIcon className="h-5 w-5 text-rausch-700" icon={Award01Icon} />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">{t("panel.title")}</h3>
                  <p className="text-neutral-600 text-sm">{t("panel.subtitle")}</p>
                </div>
              </div>
              <ul className="space-y-3 text-neutral-700">
                <li>• {t("panel.items.keepAll")}</li>
                <li>• {t("panel.items.customerFee")}</li>
                <li>• {t("panel.items.vetting")}</li>
                <li>• {t("panel.items.support")}</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </Container>

      {/* Decorative Elements */}
      <div className="pointer-events-none absolute top-0 right-0 h-96 w-96 bg-rausch-100 opacity-20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-96 w-96 bg-neutral-200 opacity-20 blur-3xl" />
    </section>
  );
}
