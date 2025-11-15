"use client";

import { ArrowUp01Icon, CheckmarkCircle01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/core";

type ServiceType = "marketplace" | "concierge";

type Props = {
  highlightConcierge?: boolean;
};

export function PricingComparisonCards({ highlightConcierge = false }: Props) {
  const t = useTranslations("pricing.comparison");

  const services: Array<{
    type: ServiceType;
    icon: typeof Search01Icon;
    commission: number;
    isPopular: boolean;
  }> = [
    {
      type: "marketplace",
      icon: Search01Icon,
      commission: 15,
      isPopular: false,
    },
    {
      type: "concierge",
      icon: ArrowUp01Icon,
      commission: 25,
      isPopular: highlightConcierge,
    },
  ];

  return (
    <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
      {services.map((service) => {
        const Icon = service.icon;
        const isPopular = service.isPopular;

        return (
          <Card
            className={cn(
              "relative bg-white transition-all duration-200 hover:shadow-lg",
              isPopular
                ? "scale-105 border-4 border-orange-500 shadow-xl"
                : "border-2 border-neutral-200"
            )}
            key={service.type}
          >
            {isPopular && (
              <div className="-top-4 -translate-x-1/2 absolute left-1/2">
                <Badge className="bg-orange-500 px-4 py-1 text-white shadow-md" variant="default">
                  {t("popularBadge")}
                </Badge>
              </div>
            )}

            <CardContent className="p-8">
              {/* Icon & Title */}
              <div className="mb-6 text-center">
                <div
                  className={cn(
                    "mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full",
                    isPopular ? "bg-orange-100" : "bg-neutral-100"
                  )}
                >
                  <HugeiconsIcon
                    className={cn("h-8 w-8", isPopular ? "text-orange-600" : "text-neutral-700")}
                    icon={Icon}
                  />
                </div>
                <h3 className="mb-2 font-[family-name:var(--font-geist-sans)] font-bold text-[28px] text-neutral-900 leading-[24px]">
                  {t(`${service.type}.title`)}
                </h3>
                <p className="text-[16px] text-neutral-700 leading-[24px]">
                  {t(`${service.type}.subtitle`)}
                </p>
              </div>

              {/* Commission */}
              <div className="mb-8 rounded-xl bg-neutral-50 py-6 text-center">
                <div className="mb-1 font-semibold text-[14px] text-neutral-600 uppercase leading-[24px] tracking-wider">
                  {t("platformFee")}
                </div>
                <div className="font-[family-name:var(--font-geist-sans)] font-bold text-[48px] text-neutral-900 leading-[48px]">
                  {service.commission}%
                </div>
                <div className="mt-1 text-[14px] text-neutral-600 leading-[24px]">
                  {t("addedToServiceCost")}
                </div>
              </div>

              {/* Features */}
              <ul className="mb-8 space-y-3">
                {(t.raw(`${service.type}.features`) as string[]).map((feature, idx) => (
                  <li className="flex items-start gap-3" key={idx}>
                    <HugeiconsIcon
                      className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600"
                      icon={CheckmarkCircle01Icon}
                    />
                    <span className="text-[16px] text-neutral-900 leading-[24px]">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                className={cn(
                  "block w-full rounded-full py-4 text-center font-semibold transition-all duration-200",
                  isPopular
                    ? "bg-orange-500 text-white shadow-md hover:bg-orange-600 hover:shadow-lg"
                    : "border-2 border-neutral-200 text-neutral-900 hover:border-orange-500 hover:bg-orange-50 hover:text-orange-600"
                )}
                href={service.type === "marketplace" ? "/professionals" : "/concierge"}
              >
                {t(`${service.type}.cta`)}
              </a>

              {/* Best For */}
              <div className="mt-6 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-[14px] text-neutral-700 leading-[20px]">
                  <span className="font-semibold text-neutral-900">{t("bestFor")}</span>{" "}
                  {t(`${service.type}.bestFor`)}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
