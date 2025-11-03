"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export function HeroSection() {
  const t = useTranslations("hero");

  return (
    <section className="relative overflow-hidden px-[25px] py-32 sm:py-40 lg:py-48">
      {/* Video Background */}
      <video
        autoPlay
        className="absolute inset-0 right-[25px] left-[25px] h-full w-[calc(100%-50px)] rounded-3xl object-cover"
        loop
        muted
        playsInline
        preload="metadata"
      >
        {/* WebM version for better compression (71MB MP4 → ~5MB WebM target) */}
        <source src="/hero.webm" type="video/webm" />
        {/* MP4 fallback for broader compatibility */}
        <source src="/hero.mp4" type="video/mp4" />
      </video>

      {/* Dark Overlay */}
      <div className="absolute inset-0 right-[25px] left-[25px] w-[calc(100%-50px)] rounded-3xl bg-black/50" />

      {/* Content */}
      <Container className="relative z-10 text-center">
        <div className="mx-auto max-w-4xl space-y-12">
          <h1 className="font-[family-name:var(--font-cinzel)] text-6xl text-white leading-[1.1] tracking-wide sm:text-7xl lg:text-8xl">
            {t("title")}
          </h1>

          <p className="mx-auto max-w-2xl text-white/90 text-xl sm:text-2xl leading-relaxed">
            {t("subtitle")}
          </p>

          <div className="flex flex-col items-center justify-center gap-4 pt-8 sm:flex-row" data-tour="search">
            <Button href="/professionals" kbd="F" label={t("browseAll")} size="lg" />
            <Button
              className="border-white/40 text-white hover:border-white hover:bg-white/10 focus-visible:outline-white"
              href="/contact"
              label={t("bookConsultation")}
              size="lg"
              variant="secondary"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
