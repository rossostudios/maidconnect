"use client";

import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils/core";

type FaqKey =
  | "howMuchDoesItCost"
  | "whyPlatformFee"
  | "conciergeVsMarketplace"
  | "professionalKeepsRate"
  | "paymentSecurity"
  | "cancellationPolicy";

const FAQ_KEYS: FaqKey[] = [
  "howMuchDoesItCost",
  "whyPlatformFee",
  "conciergeVsMarketplace",
  "professionalKeepsRate",
  "paymentSecurity",
  "cancellationPolicy",
];

export function PricingFaqSection() {
  const t = useTranslations("pricing.faq");
  const [openFaqId, setOpenFaqId] = useState<FaqKey | null>(null);

  const toggleFaq = (id: FaqKey) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

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
    <section className="bg-white py-16 sm:py-20">
      <Container className="max-w-4xl">
        <motion.div
          className="mb-12 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <h2 className="mb-baseline-1 font-[family-name:var(--font-geist-sans)] font-bold text-[36px] text-neutral-900 leading-[48px]">
            {t("title")}
          </h2>
          <p className="text-[16px] text-neutral-700 leading-[24px]">{t("subtitle")}</p>
        </motion.div>

        <motion.div
          className="space-y-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          {FAQ_KEYS.map((faqKey) => {
            const isOpen = openFaqId === faqKey;

            return (
              <motion.div key={faqKey} variants={fadeInUp}>
                <Card
                  className={cn(
                    "overflow-hidden border-2 transition-all duration-200",
                    isOpen
                      ? "border-orange-500 shadow-lg"
                      : "border-neutral-200 hover:border-neutral-300"
                  )}
                >
                  <motion.button
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                    onClick={() => toggleFaq(faqKey)}
                    type="button"
                    whileHover={{ backgroundColor: "rgba(255, 247, 240, 0.5)" }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="font-[family-name:var(--font-geist-sans)] font-bold text-[18px] text-neutral-900 leading-[24px]">
                      {t(`questions.${faqKey}.question`)}
                    </span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                      <HugeiconsIcon
                        className={cn(
                          "flex-shrink-0 text-neutral-600",
                          isOpen ? "text-orange-600" : ""
                        )}
                        icon={ArrowDown01Icon}
                        size={24}
                      />
                    </motion.div>
                  </motion.button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <CardContent className="px-6 pb-5">
                          <motion.p
                            className="text-[16px] text-neutral-700 leading-[24px]"
                            initial={{ y: -10 }}
                            animate={{ y: 0 }}
                            transition={{ delay: 0.1 }}
                          >
                            {t(`questions.${faqKey}.answer`)}
                          </motion.p>
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          className="mt-12 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <p className="mb-4 text-[16px] text-neutral-700 leading-[24px]">
            Still have questions about pricing?
          </p>
          <motion.a
            className="inline-block rounded-full border-2 border-neutral-200 bg-white px-8 py-3 font-semibold text-neutral-900 transition-all duration-200 hover:border-orange-500 hover:bg-orange-50 hover:text-orange-600"
            href="/contact"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            Contact Support
          </motion.a>
        </motion.div>
      </Container>
    </section>
  );
}
