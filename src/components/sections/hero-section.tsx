"use client";

import { useTranslations } from "next-intl";
import { AnimatedCounter } from "@/components/ui/animated-counter";
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

          {/* Animated Social Proof Counters */}
          <div className="flex flex-col items-center justify-center gap-8 pt-6 sm:flex-row sm:gap-12">
            <div className="text-center">
              <div className="font-bold text-4xl text-white sm:text-5xl">
                <AnimatedCounter suffix="+" target={12_847} />
              </div>
              <p className="mt-2 text-sm text-white/80">Successful Bookings</p>
            </div>
            <div className="text-center">
              <div className="font-bold text-4xl text-white sm:text-5xl">
                <AnimatedCounter suffix="+" target={450} />
              </div>
              <p className="mt-2 text-sm text-white/80">Verified Professionals</p>
            </div>
            <div className="text-center">
              <div className="font-bold text-4xl text-white sm:text-5xl">
                <AnimatedCounter decimals={1} target={4.9} />
                <span className="text-3xl">★</span>
              </div>
              <p className="mt-2 text-sm text-white/80">Average Rating</p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
            <div className="relative">
              <Button href="/match-wizard" kbd="M" label={t("matchWizard")} />
              <span className="absolute -top-3 -right-3 flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-1 font-semibold text-[10px] text-white uppercase tracking-wider shadow-lg">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                </svg>
                AI
              </span>
            </div>
            <Button
              className="border-white/40 text-white hover:border-white hover:bg-white/10 focus-visible:outline-white"
              href="/professionals"
              kbd="F"
              label={t("browseAll")}
              variant="secondary"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
