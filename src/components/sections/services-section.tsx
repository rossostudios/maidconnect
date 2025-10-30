"use client";

import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";

export function ServicesSection() {
  const t = useTranslations("services");

  const serviceKeys = [
    "housekeeping",
    "childcare",
    "relocation",
    "elderCare",
    "petCare",
    "lifestyle",
  ] as const;

  return (
    <section id="services" className="py-16 sm:py-20 lg:py-24">
      <Container>
        <div className="mx-auto max-w-6xl space-y-12 text-center">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#a49c90]">
              {t("badge")}
            </p>
            <h2 className="mx-auto max-w-3xl text-4xl font-semibold leading-tight text-[#211f1a] sm:text-5xl lg:text-6xl">
              {t("title")}
            </h2>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {serviceKeys.map((key) => (
              <div
                key={key}
                className="group flex h-full flex-col items-start rounded-[28px] border border-[#e5dfd4] bg-white p-8 text-left shadow-[0_10px_40px_rgba(15,15,15,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(15,15,15,0.12)] hover:backdrop-blur-sm"
              >
                <h3 className="text-2xl font-semibold text-[#211f1a]">{t(`items.${key}.title`)}</h3>
                <p className="mt-3 text-base text-[#5d574b]">{t(`items.${key}.description`)}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
