"use client";

import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
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

  return (
    <section className="bg-white py-16 sm:py-20">
      <Container className="max-w-4xl">
        <div className="mb-12 text-center">
          <h2 className="mb-baseline-1 font-[family-name:var(--font-family-satoshi)] font-bold text-[36px] text-neutral-900 leading-[48px]">
            {t("title")}
          </h2>
          <p className="text-[16px] text-neutral-700 leading-[24px]">{t("subtitle")}</p>
        </div>

        <div className="space-y-4">
          {FAQ_KEYS.map((faqKey) => {
            const isOpen = openFaqId === faqKey;

            return (
              <Card
                className={cn(
                  "overflow-hidden border-2 transition-all duration-200",
                  isOpen
                    ? "border-orange-500 shadow-lg"
                    : "border-neutral-200 hover:border-neutral-300"
                )}
                key={faqKey}
              >
                <button
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  onClick={() => toggleFaq(faqKey)}
                  type="button"
                >
                  <span className="font-[family-name:var(--font-family-satoshi)] font-bold text-[18px] text-neutral-900 leading-[24px]">
                    {t(`questions.${faqKey}.question`)}
                  </span>
                  <HugeiconsIcon
                    className={cn(
                      "flex-shrink-0 text-neutral-600 transition-transform duration-200",
                      isOpen ? "rotate-180 text-orange-600" : ""
                    )}
                    icon={ArrowDown01Icon}
                    size={24}
                  />
                </button>

                {isOpen && (
                  <CardContent className="px-6 pb-5">
                    <p className="text-[16px] text-neutral-700 leading-[24px]">
                      {t(`questions.${faqKey}.answer`)}
                    </p>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center">
          <p className="mb-4 text-[16px] text-neutral-700 leading-[24px]">
            Still have questions about pricing?
          </p>
          <a
            className="inline-block rounded-full border-2 border-neutral-200 bg-white px-8 py-3 font-semibold text-neutral-900 transition-all duration-200 hover:border-orange-500 hover:bg-orange-50 hover:text-orange-600"
            href="/contact"
          >
            Contact Support
          </a>
        </div>
      </Container>
    </section>
  );
}
