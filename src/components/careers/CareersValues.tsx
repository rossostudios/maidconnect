import {
  Agreement01Icon,
  AnalyticsUpIcon,
  Idea01Icon,
  Target01Icon,
  UserGroupIcon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";

const valueIcons = {
  clarity: ViewIcon,
  impact: Target01Icon,
  curiosity: Idea01Icon,
  trust: Agreement01Icon,
  momentum: AnalyticsUpIcon,
  collaboration: UserGroupIcon,
};

export async function CareersValues() {
  const t = await getTranslations("pages.careers.values");
  const values = ["clarity", "impact", "curiosity", "trust", "momentum", "collaboration"] as const;

  return (
    <section className="bg-[neutral-50] py-20 sm:py-24 lg:py-32">
      <Container className="max-w-6xl">
        {/* Section Header */}
        <div className="max-w-3xl">
          <h2 className="type-serif-lg text-[neutral-900]">{t("title")}</h2>
          <p className="mt-6 text-[neutral-400] text-lg leading-relaxed sm:text-xl">
            {t("description")}
          </p>
        </div>

        {/* Values Grid */}
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
          {values.map((valueKey) => {
            return (
              <div className="flex flex-col" key={valueKey}>
                {/* Icon */}
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[neutral-500]/10">
                  <HugeiconsIcon
                    className="h-6 w-6 text-[neutral-500]"
                    icon={valueIcons[valueKey]}
                  />
                </div>

                {/* Title */}
                <h3 className="mb-3 font-semibold text-[neutral-900] text-xl">
                  {t(`items.${valueKey}.title`)}
                </h3>

                {/* Description */}
                <p className="text-[neutral-400] text-base leading-relaxed">
                  {t(`items.${valueKey}.description`)}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
