"use client";

import { CheckmarkCircle01Icon, FlashIcon, StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { HeroSearchBar } from "@/components/search-bar";

export function MarketplaceHero() {
  const t = useTranslations("home.hero");

  return (
    <section className="w-full px-3 pt-3 sm:px-4 sm:pt-4 lg:px-5 lg:pt-5">
      <div className="relative min-h-[calc(100svh-1.5rem)] w-full overflow-hidden rounded-3xl lg:min-h-[calc(85vh-1.25rem)]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            alt="Professional household services"
            // Low-res base64 blur placeholder - prevents layout shift and improves perceived performance
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIBAAAgICAgIDAAAAAAAAAAAAAQIDBAARBRIhMQYTQf/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwC3xnKT8ZLYkrQwyCaMS9ZgSAQDodT6yLz/ADc1u/IIwqRop6KFOz2+/mMYD//Z"
            className="rounded-3xl object-cover object-center"
            fetchPriority="high"
            fill
            placeholder="blur"
            priority
            sizes="100vw"
            src="/hero.png"
          />
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex min-h-[calc(100svh-1.5rem)] flex-col items-center justify-center px-4 py-24 sm:px-6 lg:min-h-[calc(85vh-1.25rem)] lg:py-20">
          {/* Headline */}
          <div className="mb-6 max-w-3xl text-center sm:mb-8">
            <h1 className="mb-3 font-[family-name:var(--font-geist-sans)] font-semibold text-3xl text-white tracking-tight sm:mb-4 sm:text-4xl md:text-5xl lg:text-6xl">
              {t("headline")}
            </h1>
            <p className="text-base text-white/90 sm:text-lg md:text-xl">{t("subheadline")}</p>
          </div>

          {/* Airbnb-Style Search Bar */}
          <HeroSearchBar className="w-full max-w-4xl" />

          {/* Trust Badges */}
          <div className="mt-8 flex flex-col items-center gap-4 text-white/80 sm:mt-12 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <HugeiconsIcon className="h-4 w-4" icon={CheckmarkCircle01Icon} />
              </div>
              <span className="font-medium text-sm">{t("trustBadges.vetted")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <HugeiconsIcon className="h-4 w-4" icon={StarIcon} />
              </div>
              <span className="font-medium text-sm">{t("trustBadges.payments")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <HugeiconsIcon className="h-4 w-4" icon={FlashIcon} />
              </div>
              <span className="font-medium text-sm">{t("trustBadges.instant")}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
