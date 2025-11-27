"use client";

import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Container } from "@/components/ui/container";

export function ContactFAQ() {
  const t = useTranslations("pages.contact.faq");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqKeys = ["verification", "payments", "cancellation", "recurring", "areas", "becomePro"];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-neutral-50 py-20 sm:py-24 lg:py-32 dark:bg-rausch-900">
      <Container className="max-w-4xl">
        <h2 className="mb-12 text-center font-bold text-3xl text-neutral-900 tracking-tight sm:text-4xl dark:text-white">
          {t("title")}
        </h2>
        <div className="space-y-4">
          {faqKeys.map((key, index) => (
            <div
              className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-rausch-700 dark:bg-rausch-800"
              key={key}
            >
              <button
                className="flex w-full items-center justify-between p-6 text-left transition sm:p-8"
                onClick={() => toggleFAQ(index)}
                type="button"
              >
                <span className="pr-8 font-semibold text-lg text-neutral-900 dark:text-white">
                  {t(`questions.${key}.question`)}
                </span>
                <HugeiconsIcon
                  className={`h-5 w-5 flex-shrink-0 text-neutral-500 transition-transform duration-300 dark:text-rausch-400 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                  icon={ArrowDown01Icon}
                />
              </button>
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  openIndex === index ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="border-neutral-200 border-t p-6 pt-4 sm:p-8 sm:pt-6 dark:border-rausch-700">
                    <p className="text-base text-neutral-600 leading-relaxed dark:text-rausch-300">
                      {t(`questions.${key}.answer`)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
