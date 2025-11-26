"use client";

/**
 * CityShowcase - Airbnb-Style City Cards with Horizontal Scroll
 *
 * Displays cities where Casaora operates in a horizontally scrollable layout.
 * Each card shows a city image, name, country, and can link to city-specific pages.
 *
 * Design: Clean cards with images, horizontal scroll, subtle animations.
 */

import { ArrowLeft02Icon, ArrowRight02Icon, Location01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils/core";

// Featured cities with images (subset of all cities for homepage showcase)
const featuredCities = [
  {
    slug: "bogota",
    name: "Bogotá",
    country: "Colombia",
    image: "/bogota.png",
    proCount: "500+",
  },
  {
    slug: "medellin",
    name: "Medellín",
    country: "Colombia",
    image: "/medellin.png",
    proCount: "300+",
  },
  {
    slug: "cartagena",
    name: "Cartagena",
    country: "Colombia",
    image: "/cartagena.png",
    proCount: "150+",
  },
  {
    slug: "buenos-aires",
    name: "Buenos Aires",
    country: "Argentina",
    image: "/buenosaires.png",
    proCount: "200+",
  },
  {
    slug: "montevideo",
    name: "Montevideo",
    country: "Uruguay",
    image: "/montevideo.png",
    proCount: "100+",
  },
  {
    slug: "asuncion",
    name: "Asunción",
    country: "Paraguay",
    image: "/asuncion.png",
    proCount: "80+",
  },
];

type CityShowcaseProps = {
  className?: string;
};

export function CityShowcase({ className }: CityShowcaseProps) {
  const t = useTranslations("home.cityShowcase");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollButtons = () => {
    if (!scrollContainerRef.current) {
      return;
    }
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    updateScrollButtons();
    container.addEventListener("scroll", updateScrollButtons);
    window.addEventListener("resize", updateScrollButtons);

    return () => {
      container.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [updateScrollButtons]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) {
      return;
    }
    const scrollAmount = 320;
    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className={cn("bg-background py-16 sm:py-20 lg:py-24", className)}>
      <Container className="max-w-6xl">
        {/* Section Header */}
        <div className="mb-8 flex items-end justify-between sm:mb-10">
          <div>
            <h2 className="font-[family-name:var(--font-geist-sans)] font-semibold text-2xl text-foreground sm:text-3xl lg:text-4xl">
              {t("title")}
            </h2>
            <p className="mt-2 text-base text-muted-foreground sm:text-lg">{t("subtitle")}</p>
          </div>

          {/* Desktop Scroll Buttons */}
          <div className="hidden gap-2 sm:flex">
            <button
              aria-label="Scroll left"
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card transition-all",
                canScrollLeft
                  ? "cursor-pointer hover:border-rausch-500/50 hover:shadow-sm"
                  : "cursor-not-allowed opacity-40"
              )}
              disabled={!canScrollLeft}
              onClick={() => scroll("left")}
              type="button"
            >
              <HugeiconsIcon className="h-5 w-5 text-muted-foreground" icon={ArrowLeft02Icon} />
            </button>
            <button
              aria-label="Scroll right"
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card transition-all",
                canScrollRight
                  ? "cursor-pointer hover:border-rausch-500/50 hover:shadow-sm"
                  : "cursor-not-allowed opacity-40"
              )}
              disabled={!canScrollRight}
              onClick={() => scroll("right")}
              type="button"
            >
              <HugeiconsIcon className="h-5 w-5 text-muted-foreground" icon={ArrowRight02Icon} />
            </button>
          </div>
        </div>

        {/* Scrollable Cards */}
        <div className="relative">
          <div
            className="-mx-4 scrollbar-hide sm:-mx-0 flex gap-4 overflow-x-auto px-4 pb-4 sm:gap-6 sm:px-0"
            ref={scrollContainerRef}
          >
            {featuredCities.map((city) => (
              <Link
                className="group flex-shrink-0"
                href={`/professionals?city=${city.slug}`}
                key={city.slug}
              >
                <div className="w-[260px] overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-rausch-500/50 hover:shadow-lg sm:w-[280px]">
                  {/* City Image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <Image
                      alt={`${city.name}, ${city.country}`}
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      fill
                      sizes="(max-width: 640px) 260px, 280px"
                      src={city.image}
                    />
                    {/* Pro Count Badge */}
                    <div className="absolute right-3 bottom-3 rounded-full bg-card px-3 py-1 font-medium text-foreground text-xs shadow-sm">
                      {city.proCount} {t("pros")}
                    </div>
                  </div>

                  {/* City Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground text-lg group-hover:text-rausch-500">
                      {city.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-1 text-muted-foreground text-sm">
                      <HugeiconsIcon className="h-4 w-4" icon={Location01Icon} />
                      <span>{city.country}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {/* View All Card */}
            <Link className="group flex-shrink-0" href="/professionals">
              <div className="flex h-full w-[260px] flex-col items-center justify-center rounded-xl border border-border border-dashed bg-muted p-8 transition-all hover:border-rausch-500 hover:bg-rausch-500/10 sm:w-[280px]">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-card transition-colors group-hover:bg-rausch-500/20">
                  <HugeiconsIcon
                    className="h-6 w-6 text-muted-foreground group-hover:text-rausch-500"
                    icon={ArrowRight02Icon}
                  />
                </div>
                <span className="font-semibold text-foreground group-hover:text-rausch-500">
                  {t("viewAll")}
                </span>
                <span className="mt-1 text-muted-foreground text-sm">{t("coverage")}</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Bottom Note */}
        <p className="mt-6 text-center text-muted-foreground text-sm sm:mt-8">{t("bottomNote")}</p>
      </Container>
    </section>
  );
}
