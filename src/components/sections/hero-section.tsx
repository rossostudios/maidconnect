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
      >
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

          <p className="mx-auto max-w-2xl text-white/90 text-xl sm:text-2xl">{t("subtitle")}</p>

          <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
            <Button href="/professionals" icon label={t("findProfessional")} />
            <Button
              className="border-white/40 text-white hover:border-white hover:bg-white/10 focus-visible:outline-white"
              href="#how-it-works"
              label={t("howItWorks")}
              variant="secondary"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
