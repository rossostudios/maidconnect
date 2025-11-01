"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export function HeroSection() {
  const t = useTranslations("hero");

  return (
    <section className="relative overflow-hidden px-[25px] py-20 sm:py-24 lg:py-32">
      {/* Video Background */}
      <video
        autoPlay
        className="absolute inset-0 right-[25px] left-[25px] h-full w-[calc(100%-50px)] rounded-3xl object-cover"
        loop
        muted
        playsInline
        preload="metadata"
      >
        {/* TODO: Add compressed WebM version for better compression */}
        {/* <source src="/hero.webm" type="video/webm" /> */}
        <source src="/hero.mp4" type="video/mp4" />
      </video>

      {/* Dark Overlay */}
      <div className="absolute inset-0 right-[25px] left-[25px] w-[calc(100%-50px)] rounded-3xl bg-black/60" />

      {/* Content */}
      <Container className="relative z-10 text-center">
        <div className="mx-auto max-w-5xl space-y-8">
          <span className="inline-flex items-center gap-3 rounded-full bg-white/20 px-5 py-2.5 font-semibold text-white text-xs uppercase tracking-[0.32em] backdrop-blur-sm">
            {t("badge")}
          </span>

          <h1 className="font-semibold text-5xl text-white leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
            {t("title")}
          </h1>

          <div className="mx-auto max-w-3xl space-y-4">
            <p className="font-semibold text-white text-xl sm:text-2xl">{t("subtitle")}</p>
            <p className="text-lg text-white/80 sm:text-xl">{t("description")}</p>
          </div>

          {/* Trust Signals Row */}
          <div className="flex flex-col items-center justify-center gap-3 pt-2 text-sm text-white/90 sm:flex-row sm:gap-6">
            <span className="flex items-center gap-2">
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  fillRule="evenodd"
                />
              </svg>
              {t("trustSignals.verified")}
            </span>
            <span className="hidden text-white/40 sm:inline">•</span>
            <span>{t("trustSignals.cities")}</span>
            <span className="hidden text-white/40 sm:inline">•</span>
            <span>{t("trustSignals.rating")}</span>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
            <Button href="/professionals" kbd="F" label={t("findProfessional")} />
            <Button
              className="border-white/40 text-white hover:border-white hover:bg-white/10 focus-visible:outline-white"
              href="/contact"
              label={t("bookConsultation")}
              variant="secondary"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
