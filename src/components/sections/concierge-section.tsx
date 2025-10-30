"use client";

import { Languages, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export function ConciergeSection() {
  const t = useTranslations("concierge");

  return (
    <section className="py-16 sm:py-20 lg:py-24" id="concierge">
      <Container>
        <div className="mx-auto max-w-5xl space-y-12 text-center">
          <div className="space-y-6">
            <h2 className="font-semibold text-4xl text-[#211f1a] leading-tight sm:text-5xl lg:text-6xl">
              {t("title")}
            </h2>
            <p className="mx-auto max-w-2xl text-[#5d574b] text-xl">{t("subtitle")}</p>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
            <Button href="/professionals" icon label={t("browseProfessionals")} />
            <Button href="#get-started" label={t("bookConsultation")} variant="secondary" />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-[#7a6d62] text-sm">
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {t("cities")}
            </span>
            <span className="inline-flex items-center gap-2">
              <Languages className="h-4 w-4" />
              {t("languages")}
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}
