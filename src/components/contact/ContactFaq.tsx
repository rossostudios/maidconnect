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
    <section className="bg-[#f8fafc] py-20 sm:py-24 lg:py-32">
      <Container className="max-w-4xl">
        <h2 className="serif-display-lg mb-12 text-center text-[#0f172a]">{t("title")}</h2>
        <div className="space-y-4">
          {faqKeys.map((key, index) => (
            <div
              className="overflow-hidden rounded-[24px] border border-[#e2e8f0] bg-[#f8fafc] shadow-[0_4px_20px_rgba(22,22,22,0.02)] transition hover:shadow-[0_8px_30px_rgba(22,22,22,0.04)]"
              key={key}
            >
              <button
                className="flex w-full items-center justify-between p-8 text-left transition"
                onClick={() => toggleFAQ(index)}
                type="button"
              >
                <span className="serif-headline-sm pr-8 text-[#0f172a]">
                  {t(`questions.${key}.question`)}
                </span>
                <HugeiconsIcon
                  className={`h-6 w-6 flex-shrink-0 text-[#64748b] transition-transform duration-300 ${
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
                  <div className="border-[#e2e8f0] border-t p-8 pt-6">
                    <p className="text-[#0f172a]/70 text-base leading-relaxed">
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
