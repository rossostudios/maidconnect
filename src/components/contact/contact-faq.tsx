"use client";

import { ChevronDown } from "lucide-react";
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
    <section className="bg-[#fbfaf9] py-20 sm:py-24 lg:py-32">
      <Container className="max-w-4xl">
        <h2 className="mb-12 text-center font-semibold text-4xl text-[#211f1a] sm:text-5xl">
          {t("title")}
        </h2>
        <div className="space-y-4">
          {faqKeys.map((key, index) => (
            <div
              className="overflow-hidden rounded-[24px] border border-[#ebe5d8] bg-white shadow-[0_4px_20px_rgba(18,17,15,0.02)] transition hover:shadow-[0_8px_30px_rgba(18,17,15,0.04)]"
              key={key}
            >
              <button
                className="flex w-full items-center justify-between p-8 text-left transition"
                onClick={() => toggleFAQ(index)}
                type="button"
              >
                <span className="pr-8 font-semibold text-[#211f1a] text-xl">
                  {t(`questions.${key}.question`)}
                </span>
                <ChevronDown
                  className={`h-6 w-6 flex-shrink-0 text-[#7d7566] transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  openIndex === index ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="border-[#ebe5d8] border-t p-8 pt-6">
                    <p className="text-[#5d574b] text-base leading-relaxed">
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
