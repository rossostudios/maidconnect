"use client";

import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/routing";

export function ProsHowItWorksSection() {
  const t = useTranslations("pros.howItWorks");
  const howItWorksSteps = (t.raw("steps") as Array<{ title: string; description: string }>).map(
    (step, idx) => ({ ...step, step: (idx + 1).toString() })
  );

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
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <section className="bg-white py-20 lg:py-28" id="how-it-works">
      <Container className="max-w-7xl">
        <motion.div
          className="mb-16 text-center"
          initial="hidden"
          variants={fadeInUp}
          viewport={{ once: true, margin: "-100px" }}
          whileInView="visible"
        >
          <h2 className="mb-4 font-bold text-4xl text-neutral-900 sm:text-5xl">{t("title")}</h2>
          <p className="mx-auto max-w-2xl text-lg text-neutral-700">{t("subtitle")}</p>
        </motion.div>

        <motion.div
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
          initial="hidden"
          variants={staggerContainer}
          viewport={{ once: true, margin: "-100px" }}
          whileInView="visible"
        >
          {howItWorksSteps.map((item, index) => (
            <motion.div className="relative" key={item.step} variants={fadeInUp}>
              {/* Connector Line (desktop only) */}
              {index < howItWorksSteps.length - 1 && (
                <motion.div
                  className="absolute top-12 left-1/2 hidden h-0.5 w-full bg-rausch-200 lg:block"
                  initial={{ scaleX: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 + 0.3 }}
                  viewport={{ once: true }}
                  whileInView={{ scaleX: 1 }}
                />
              )}

              <div className="relative flex flex-col items-center text-center">
                <motion.div
                  className="relative z-10 mb-4 flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-rausch-500 font-bold text-2xl text-white shadow-md"
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  whileHover={{ scale: 1.15, rotate: 10 }}
                >
                  {item.step}
                </motion.div>

                <h3 className="mb-2 font-semibold text-lg text-neutral-900">{item.title}</h3>
                <p className="text-neutral-600 text-sm leading-relaxed">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <Link href="#apply">
            <motion.div
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button className="min-w-[250px]" size="lg">
                {t("cta")}
                <HugeiconsIcon className="ml-2 h-5 w-5" icon={ArrowRight01Icon} />
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </Container>
    </section>
  );
}
