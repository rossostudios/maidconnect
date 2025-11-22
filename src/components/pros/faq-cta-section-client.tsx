"use client";

import { ArrowRight01Icon, CheckmarkCircle01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/routing";

export function ProsFaqCtaSection() {
  const t = useTranslations("pros.faqCta");
  const faqs = t.raw("faqs") as Array<{ question: string; answer: string }>;

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
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <>
      {/* FAQ Section */}
      <section className="py-20 lg:py-28">
        <Container className="max-w-4xl">
          <motion.div
            className="mb-16 text-center"
            initial="hidden"
            variants={fadeInUp}
            viewport={{ once: true, margin: "-100px" }}
            whileInView="visible"
          >
            <h2 className="mb-4 font-bold text-4xl text-neutral-900 sm:text-5xl">{t("title")}</h2>
            <p className="text-lg text-neutral-700">{t("subtitle")}</p>
          </motion.div>

          <motion.div
            className="space-y-6"
            initial="hidden"
            variants={staggerContainer}
            viewport={{ once: true, margin: "-100px" }}
            whileInView="visible"
          >
            {faqs.map((faq) => (
              <motion.div
                className="border border-neutral-200 bg-white p-6 shadow-sm"
                key={faq.question}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                variants={fadeInUp}
                whileHover={{ scale: 1.01, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)" }}
              >
                <h3 className="mb-3 font-semibold text-lg text-neutral-900">{faq.question}</h3>
                <p className="text-neutral-700 leading-relaxed">{faq.answer}</p>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </section>

      {/* Final CTA Section */}
      <section
        className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 py-20 text-white lg:py-28"
        id="apply"
      >
        <Container className="relative max-w-4xl text-center">
          <motion.div
            initial="hidden"
            variants={staggerContainer}
            viewport={{ once: true, margin: "-100px" }}
            whileInView="visible"
          >
            <motion.h2
              className="mb-6 font-bold text-4xl leading-tight sm:text-5xl"
              variants={fadeInUp}
            >
              {t("cta.title")}
            </motion.h2>
            <motion.p className="mb-8 text-orange-50 text-xl" variants={fadeInUp}>
              {t("cta.subtitle")}
            </motion.p>

            <motion.div
              className="flex flex-col gap-4 sm:flex-row sm:justify-center"
              variants={fadeInUp}
            >
              <Link href="/auth/sign-up?type=professional">
                <motion.div
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    className="min-w-[250px] border-white bg-white text-orange-600 hover:bg-neutral-50"
                    size="lg"
                    variant="outline"
                  >
                    {t("cta.primary")}
                    <HugeiconsIcon className="ml-2 h-5 w-5" icon={ArrowRight01Icon} />
                  </Button>
                </motion.div>
              </Link>
              <Link href="/contact">
                <motion.div
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    className="min-w-[200px] border border-white bg-transparent text-white hover:bg-white/10"
                    size="lg"
                    variant="ghost"
                  >
                    {t("cta.secondary")}
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            <motion.div
              className="mt-8 flex flex-wrap items-center justify-center gap-4 text-orange-100 text-sm"
              variants={fadeInUp}
            >
              <div className="flex items-center gap-2">
                <HugeiconsIcon className="h-5 w-5" icon={CheckmarkCircle01Icon} />
                <span>{t("cta.pills.noHidden")}</span>
              </div>
              <div className="flex items-center gap-2">
                <HugeiconsIcon className="h-5 w-5" icon={CheckmarkCircle01Icon} />
                <span>{t("cta.pills.fastStart")}</span>
              </div>
              <div className="flex items-center gap-2">
                <HugeiconsIcon className="h-5 w-5" icon={CheckmarkCircle01Icon} />
                <span>{t("cta.pills.bilingual")}</span>
              </div>
            </motion.div>
          </motion.div>
        </Container>

        {/* Decorative Elements */}
        <div className="pointer-events-none absolute top-0 right-0 h-96 w-96 bg-white opacity-10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-96 w-96 bg-orange-900 opacity-20 blur-3xl" />
      </section>
    </>
  );
}
