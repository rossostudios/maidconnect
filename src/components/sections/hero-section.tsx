"use client";

import { MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export function HeroSection() {
  const t = useTranslations("hero");

  const trustSignals = [
    { icon: ShieldCheck, label: t("trustSignals.verified") },
    { icon: MapPin, label: t("trustSignals.cities") },
    { icon: Sparkles, label: t("trustSignals.rating") },
  ] as const;

  return (
    <section className="relative overflow-hidden px-[25px] py-28 sm:py-36 lg:py-44">
      {/* Immersive background */}
      <video
        autoPlay
        className="absolute inset-0 right-[25px] left-[25px] h-full w-[calc(100%-50px)] rounded-3xl object-cover"
        loop
        muted
        playsInline
        preload="metadata"
      >
        <source src="/hero.webm" type="video/webm" />
        <source src="/hero.mp4" type="video/mp4" />
      </video>

      {/* Atmosphere overlay */}
      <div className="pointer-events-none absolute inset-0 right-[25px] left-[25px] h-full w-[calc(100%-50px)] rounded-3xl bg-[radial-gradient(circle_at_top_right,rgba(215,183,135,0.24),transparent_58%),linear-gradient(165deg,rgba(17,16,14,0.82),rgba(17,16,14,0.54))]" />

      <Container className="relative z-10 flex flex-col items-center text-center lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl space-y-6 text-left text-white">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 font-semibold text-white/80 text-xs uppercase tracking-[0.24em]">
            {t("badge")}
          </span>

          <h1 className="font-[family-name:var(--font-cinzel)] text-5xl text-white leading-tight tracking-[0.18em] sm:text-6xl lg:text-7xl">
            {t("title")}
          </h1>

          <p className="text-lg text-white/85 leading-relaxed sm:text-xl">{t("subtitle")}</p>

          <p className="text-base text-white/70 leading-relaxed">{t("description")}</p>

          <div
            className="flex w-full flex-col gap-3 pt-10 sm:flex-row sm:items-center"
            data-tour="search"
          >
            <Button
              className="w-full shadow-[var(--shadow-elevated)] sm:w-auto"
              href="/contact"
              label={t("bookConsultation")}
              size="lg"
              variant="primary"
            />
            <Button
              className="w-full sm:ml-1 sm:w-auto"
              href="/professionals"
              label={t("browseAll")}
              size="lg"
              variant="secondary"
            />
          </div>
          <ul className="mt-12 grid w-full gap-4 text-left sm:grid-cols-3">
            {trustSignals.map(({ icon: Icon, label }) => (
              <li
                className="glass-card flex items-start gap-3 rounded-2xl p-5 text-[var(--foreground)]"
                key={label}
              >
                <span
                  aria-hidden="true"
                  className="flex h-12 w-12 items-center justify-center rounded-full"
                  style={{
                    background: "color-mix(in srgb, var(--accent) 24%, transparent)",
                  }}
                >
                  <Icon className="h-5 w-5 text-[var(--accent)]" />
                </span>
                <p className="font-medium text-current text-sm leading-snug">{label}</p>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
