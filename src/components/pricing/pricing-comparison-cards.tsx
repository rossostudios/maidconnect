"use client";

import { ArrowUp01Icon, CheckmarkCircle01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function PricingComparisonCards() {
  const t = useTranslations("pricing.comparison");

  return (
    <div className="mx-auto max-w-2xl">
      <Card className="relative rounded-lg border-4 border-orange-500 bg-white shadow-xl transition-all duration-200 hover:shadow-2xl">
        <div className="-top-4 -translate-x-1/2 absolute left-1/2">
          <Badge
            className="rounded-full bg-orange-500 px-4 py-1 text-white shadow-md"
            variant="default"
          >
            {t("popularBadge")}
          </Badge>
        </div>

        <CardContent className="p-8 md:p-12">
          {/* Icon & Title */}
          <div className="mb-6 text-center">
            <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-lg bg-orange-100">
              <HugeiconsIcon className="h-10 w-10 text-orange-600" icon={ArrowUp01Icon} />
            </div>
            <h3 className="mb-2 font-[family-name:var(--font-geist-sans)] font-bold text-[32px] text-neutral-900 leading-[32px]">
              {t("concierge.title")}
            </h3>
            <p className="text-[18px] text-neutral-700 leading-[24px]">{t("concierge.subtitle")}</p>
          </div>

          {/* Commission - Updated to 20% */}
          <div className="mb-8 rounded-lg bg-neutral-50 py-8 text-center">
            <div className="mb-1 font-semibold text-[14px] text-neutral-600 uppercase leading-[24px] tracking-wider">
              {t("platformFee")}
            </div>
            <div className="font-[family-name:var(--font-geist-sans)] font-bold text-[56px] text-orange-600 leading-[56px]">
              20%
            </div>
            <div className="mt-2 text-[16px] text-neutral-600 leading-[24px]">
              {t("addedToServiceCost")}
            </div>
          </div>

          {/* Features */}
          <ul className="mb-8 space-y-4">
            {(t.raw("concierge.features") as string[]).map((feature, idx) => (
              <li className="flex items-start gap-3" key={idx}>
                <HugeiconsIcon
                  className="mt-0.5 h-6 w-6 flex-shrink-0 text-green-600"
                  icon={CheckmarkCircle01Icon}
                />
                <span className="text-[18px] text-neutral-900 leading-[24px]">{feature}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <a
            className="block w-full rounded-lg bg-orange-500 py-4 text-center font-semibold text-lg text-white shadow-md transition-all duration-200 hover:bg-orange-600 hover:shadow-lg"
            href="/concierge"
          >
            {t("concierge.cta")}
          </a>

          {/* Best For */}
          <div className="mt-6 rounded-lg border border-neutral-200 bg-neutral-50 p-5">
            <p className="text-[16px] text-neutral-700 leading-[20px]">
              <span className="font-semibold text-neutral-900">{t("bestFor")}</span>{" "}
              {t("concierge.bestFor")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
