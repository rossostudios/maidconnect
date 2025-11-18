"use client";

import {
  CheckmarkCircle01Icon,
  SparklesIcon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type PricingComparisonCardsProps = {
  highlightConcierge?: boolean;
};

export function PricingComparisonCards({
  highlightConcierge = false,
}: PricingComparisonCardsProps) {
  const t = useTranslations("pricing.comparison");

  return (
    <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2">
      {/* Marketplace Card */}
      <Card
        className={`relative h-full rounded-3xl bg-white transition-all duration-300 ${highlightConcierge
            ? "border border-neutral-200 shadow-xl shadow-neutral-900/5 hover:shadow-2xl hover:shadow-neutral-900/10"
            : "border-2 border-orange-500 shadow-2xl shadow-orange-900/10 scale-[1.02]"
          }`}
      >
        {!highlightConcierge && (
          <div className="-top-4 -translate-x-1/2 absolute left-1/2">
            <Badge
              className="rounded-full bg-orange-500 px-6 py-1.5 font-bold text-sm text-white shadow-lg shadow-orange-500/20 uppercase tracking-wider"
              variant="default"
            >
              {t("popularBadge")}
            </Badge>
          </div>
        )}

        <CardContent className="flex h-full flex-col p-10">
          {/* Icon & Title */}
          <div className="mb-8 text-center">
            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 shadow-sm">
              <HugeiconsIcon className="h-10 w-10" icon={SparklesIcon} />
            </div>
            <h3 className="mb-3 font-[family-name:var(--font-geist-sans)] font-bold text-3xl text-neutral-900">
              {t("marketplace.title")}
            </h3>
            <p className="text-lg text-neutral-600 leading-relaxed">
              {t("marketplace.subtitle")}
            </p>
          </div>

          {/* Commission */}
          <div className="mb-10 rounded-2xl bg-neutral-50 py-8 text-center">
            <div className="mb-2 font-bold text-neutral-500 text-xs uppercase tracking-widest">
              {t("platformFee")}
            </div>
            <div className="font-[family-name:var(--font-geist-sans)] font-bold text-6xl text-neutral-900 tracking-tight">
              15%
            </div>
            <div className="mt-2 font-medium text-neutral-500 text-sm">
              {t("addedToServiceCost")}
            </div>
          </div>

          {/* Features */}
          <div className="mb-10 flex-grow">
            <ul className="space-y-5">
              {(t.raw("marketplace.features") as string[]).map((feature, idx) => (
                <li className="flex items-start gap-4" key={idx}>
                  <div className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <HugeiconsIcon className="h-3 w-3" icon={CheckmarkCircle01Icon} />
                  </div>
                  <span className="text-base text-neutral-700 leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div className="mt-auto space-y-6">
            <a
              className="block w-full rounded-xl bg-orange-600 py-4 text-center font-bold text-lg text-white shadow-lg shadow-orange-600/20 transition-all duration-200 hover:bg-orange-700 hover:shadow-xl hover:scale-[1.02]"
              href="/professionals"
            >
              {t("marketplace.cta")}
            </a>

            {/* Best For */}
            <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-4 text-center">
              <p className="text-sm text-neutral-600">
                <span className="font-bold text-neutral-900">{t("bestFor")}</span>{" "}
                {t("marketplace.bestFor")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Concierge Card */}
      <Card
        className={`relative h-full rounded-3xl bg-white transition-all duration-300 ${highlightConcierge
            ? "border-2 border-blue-600 shadow-2xl shadow-blue-900/10 scale-[1.02]"
            : "border border-neutral-200 shadow-xl shadow-neutral-900/5 hover:shadow-2xl hover:shadow-neutral-900/10"
          }`}
      >
        {highlightConcierge && (
          <div className="-top-4 -translate-x-1/2 absolute left-1/2">
            <Badge
              className="rounded-full bg-blue-600 px-6 py-1.5 font-bold text-sm text-white shadow-lg shadow-blue-600/20 uppercase tracking-wider"
              variant="default"
            >
              {t("premiumBadge")}
            </Badge>
          </div>
        )}

        <CardContent className="flex h-full flex-col p-10">
          {/* Icon & Title */}
          <div className="mb-8 text-center">
            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm">
              <HugeiconsIcon className="h-10 w-10" icon={UserMultiple02Icon} />
            </div>
            <h3 className="mb-3 font-[family-name:var(--font-geist-sans)] font-bold text-3xl text-neutral-900">
              {t("concierge.title")}
            </h3>
            <p className="text-lg text-neutral-600 leading-relaxed">{t("concierge.subtitle")}</p>
          </div>

          {/* Direct Hire Fee */}
          <div className="mb-10 rounded-2xl bg-blue-50/50 py-8 text-center">
            <div className="mb-2 font-bold text-blue-600/80 text-xs uppercase tracking-widest">
              {t("oneTimeFee")}
            </div>
            <div className="font-[family-name:var(--font-geist-sans)] font-bold text-6xl text-blue-900 tracking-tight">
              $299
            </div>
            <div className="mt-2 font-medium text-blue-600/80 text-sm">
              {t("forPermanentPlacement")}
            </div>
          </div>

          {/* Features */}
          <div className="mb-10 flex-grow">
            <ul className="space-y-5">
              {(t.raw("concierge.features") as string[]).map((feature, idx) => (
                <li className="flex items-start gap-4" key={idx}>
                  <div className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <HugeiconsIcon className="h-3 w-3" icon={CheckmarkCircle01Icon} />
                  </div>
                  <span className="text-base text-neutral-700 leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div className="mt-auto space-y-6">
            <a
              className="block w-full rounded-xl bg-blue-600 py-4 text-center font-bold text-lg text-white shadow-lg shadow-blue-600/20 transition-all duration-200 hover:bg-blue-700 hover:shadow-xl hover:scale-[1.02]"
              href="/concierge"
            >
              {t("concierge.cta")}
            </a>

            {/* Best For */}
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-center">
              <p className="text-sm text-blue-900/80">
                <span className="font-bold text-blue-900">{t("bestFor")}</span>{" "}
                {t("concierge.bestFor")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
