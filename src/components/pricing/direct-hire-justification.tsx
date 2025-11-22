"use client";

import {
  ArrowUp01Icon,
  CheckmarkCircle01Icon,
  Message01Icon,
  Search01Icon,
  Shield01Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

export function DirectHireJustification() {
  const t = useTranslations("pricing.directHire");

  const benefits = [
    { icon: CheckmarkCircle01Icon, key: "humanMatching" },
    { icon: Search01Icon, key: "englishSupport" },
    { icon: ArrowUp01Icon, key: "priorityBooking" },
    { icon: Shield01Icon, key: "qualityGuarantee" },
    { icon: Message01Icon, key: "dedicatedCoordinator" },
    { icon: StarIcon, key: "topProfessionals" },
  ];

  return (
    <section className="bg-orange-50 py-24">
      <Container className="max-w-6xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-500 text-white shadow-orange-500/20 shadow-xl">
            <HugeiconsIcon className="h-10 w-10" icon={ArrowUp01Icon} />
          </div>
          <h2 className="mb-6 font-[family-name:var(--font-geist-sans)] font-bold text-4xl text-neutral-900 tracking-tight md:text-5xl">
            {t("title")}
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-neutral-700 leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="mb-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <Card
                className="h-full rounded-2xl border border-orange-200 bg-white transition-all duration-200 hover:border-orange-300 hover:shadow-orange-900/5 hover:shadow-xl"
                key={benefit.key}
              >
                <CardContent className="p-8">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                    <HugeiconsIcon className="h-7 w-7" icon={Icon} />
                  </div>
                  <h3 className="mb-3 font-[family-name:var(--font-geist-sans)] font-bold text-neutral-900 text-xl">
                    {t(`benefits.${benefit.key}.title`)}
                  </h3>
                  <p className="text-base text-neutral-600 leading-relaxed">
                    {t(`benefits.${benefit.key}.description`)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Perfect For Section */}
        <Card className="overflow-hidden rounded-3xl border-2 border-orange-500 bg-white shadow-2xl shadow-orange-900/10">
          <CardContent className="p-10 md:p-16">
            <h3 className="mb-10 text-center font-[family-name:var(--font-geist-sans)] font-bold text-3xl text-neutral-900">
              {t("perfectFor.title")}
            </h3>
            <div className="grid gap-6 md:grid-cols-2">
              {(t.raw("perfectFor.audiences") as string[]).map((audience, idx) => (
                <div className="flex items-start gap-4 rounded-xl bg-neutral-50 p-4" key={idx}>
                  <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-orange-500 text-white shadow-sm">
                    <span className="font-bold text-xs">✓</span>
                  </div>
                  <span className="font-medium text-lg text-neutral-900 leading-relaxed">
                    {audience}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-12 text-center">
              <a
                className="inline-block rounded-xl bg-orange-500 px-10 py-4 font-bold text-lg text-white shadow-lg shadow-orange-500/20 transition-all duration-200 hover:scale-[1.02] hover:bg-orange-600 hover:shadow-xl"
                href="/direct-hire"
              >
                {t("cta")}
              </a>
              <p className="mt-6 text-base text-neutral-600">{t("ctaSubtext")}</p>
            </div>
          </CardContent>
        </Card>
      </Container>
    </section>
  );
}
