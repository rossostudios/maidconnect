"use client";

import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type Professional = {
  id: string;
  name: string;
  city: string;
  country: string;
  profilePicture: string | null;
  hourlyRate: number;
  specialties: string[];
};

type NewProfessionalsCarouselProps = {
  professionals: Professional[];
};

export function NewProfessionalsCarousel({ professionals }: NewProfessionalsCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollability = () => {
    if (!scrollContainerRef.current) {
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 8);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 8);
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) {
      return;
    }

    const container = scrollContainerRef.current;
    const scrollAmount = container.clientWidth;

    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });

    window.setTimeout(checkScrollability, 350);
  };

  useEffect(() => {
    checkScrollability();

    const handleResize = () => checkScrollability();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkScrollability]);

  if (professionals.length === 0) {
    return null;
  }

  return (
    <section className="bg-stone-50 py-20 sm:py-32">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8">
        {/* Header */}
        <div className="mb-16 flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-end">
          <div className="max-w-xl space-y-4">
            <p className="font-medium text-sm text-stone-600 uppercase tracking-wider">
              NEW PROFESSIONALS
            </p>
            <h2 className="font-semibold text-3xl text-stone-900 tracking-tight sm:text-4xl">
              Latest Arrivals
            </h2>
            <p className="text-base text-stone-600 leading-relaxed">
              Meet our newest professionals ready to help with your home care needs.
            </p>
          </div>

          {/* Navigation */}
          <div className="flex gap-2">
            <button
              aria-label="Previous"
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-stone-300 bg-white text-stone-900 transition-all",
                "hover:border-stone-900 hover:bg-stone-900 hover:text-white",
                "disabled:opacity-30 disabled:hover:border-stone-300 disabled:hover:bg-white disabled:hover:text-stone-900"
              )}
              disabled={!canScrollLeft}
              onClick={() => scroll("left")}
            >
              <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft01Icon} />
            </button>
            <button
              aria-label="Next"
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-stone-300 bg-white text-stone-900 transition-all",
                "hover:border-stone-900 hover:bg-stone-900 hover:text-white",
                "disabled:opacity-30 disabled:hover:border-stone-300 disabled:hover:bg-white disabled:hover:text-stone-900"
              )}
              disabled={!canScrollRight}
              onClick={() => scroll("right")}
            >
              <HugeiconsIcon className="h-4 w-4" icon={ArrowRight01Icon} />
            </button>
          </div>
        </div>

        {/* Professional Cards */}
        <div
          className="no-scrollbar -mx-6 sm:-mx-8 flex gap-8 overflow-x-auto scroll-smooth px-6 sm:px-8"
          onScroll={checkScrollability}
          ref={scrollContainerRef}
        >
          {professionals.map((pro) => (
            <Link
              className="group block w-[260px] flex-shrink-0 sm:w-[300px]"
              href={`/professionals/${pro.id}`}
              key={pro.id}
            >
              <Card className="overflow-hidden border-stone-200 bg-white transition-all duration-300 group-hover:shadow-lg">
                {/* Image */}
                <div className="relative aspect-[3/4] overflow-hidden bg-stone-100">
                  <Image
                    alt={pro.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    fill
                    sizes="(max-width: 768px) 260px, 300px"
                    src={pro.profilePicture || "/placeholder-professional.jpg"}
                  />
                </div>

                {/* Info */}
                <CardContent className="space-y-1 p-4">
                  <h3 className="font-semibold text-base text-stone-900">{pro.name}</h3>
                  <p className="text-sm text-stone-600">
                    {pro.city}, {pro.country}
                  </p>
                  <p className="font-semibold text-sm text-stone-900">€{pro.hourlyRate}/hr</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* View All Link */}
        <div className="mt-12 text-center">
          <Link
            className="inline-flex items-center justify-center rounded-full border-2 border-stone-900 bg-transparent px-8 py-3 font-semibold text-sm text-stone-900 transition-all hover:bg-stone-900 hover:text-white"
            href="/professionals"
          >
            View All Professionals
          </Link>
        </div>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
