import { Eye, Handshake, Lightbulb, Target, TrendingUp, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";

const valueIcons = {
  clarity: Eye,
  impact: Target,
  curiosity: Lightbulb,
  trust: Handshake,
  momentum: TrendingUp,
  collaboration: Users,
};

export async function CareersValues() {
  const t = await getTranslations("pages.careers.values");
  const values = ["clarity", "impact", "curiosity", "trust", "momentum", "collaboration"] as const;

  return (
    <section className="bg-[#fbfaf9] py-20 sm:py-24 lg:py-32">
      <Container className="max-w-6xl">
        {/* Section Header */}
        <div className="max-w-3xl">
          <h2 className="font-semibold text-4xl text-[#211f1a] leading-tight sm:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-6 text-[#5d574b] text-lg leading-relaxed sm:text-xl">
            {t("description")}
          </p>
        </div>

        {/* Values Grid */}
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
          {values.map((valueKey) => {
            const Icon = valueIcons[valueKey];
            return (
              <div className="flex flex-col" key={valueKey}>
                {/* Icon */}
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#ff5d46]/10">
                  <Icon className="h-6 w-6 text-[#ff5d46]" strokeWidth={2} />
                </div>

                {/* Title */}
                <h3 className="mb-3 font-semibold text-[#211f1a] text-xl">
                  {t(`items.${valueKey}.title`)}
                </h3>

                {/* Description */}
                <p className="text-[#5d574b] text-base leading-relaxed">
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
