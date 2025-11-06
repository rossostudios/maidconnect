"use client";

import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/routing";

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
    <section className="bg-white py-20 sm:py-32">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8">
        {/* Header */}
        <div className="mb-16 flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-end">
          <div className="max-w-xl space-y-4">
            <p className="tagline text-[#7a6d62]">NEW PROFESSIONALS</p>
            <h2 className="serif-display-lg text-[#1A1614]">Latest Arrivals</h2>
            <p className="text-[#1A1614]/70 text-base leading-relaxed">
              Meet our newest professionals ready to help with your home care needs.
            </p>
          </div>

          {/* Navigation */}
          <div className="flex gap-2">
            <button
              aria-label="Previous"
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#E85D48]/30 bg-white text-[#1A1614] transition hover:border-[#E85D48] hover:bg-[#E85D48] hover:text-white disabled:opacity-30 disabled:hover:border-[#E85D48]/30 disabled:hover:bg-white disabled:hover:text-[#1A1614]"
              disabled={!canScrollLeft}
              onClick={() => scroll("left")}
              type="button"
            >
              <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft01Icon} />
            </button>
            <button
              aria-label="Next"
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#E85D48]/30 bg-white text-[#1A1614] transition hover:border-[#E85D48] hover:bg-[#E85D48] hover:text-white disabled:opacity-30 disabled:hover:border-[#E85D48]/30 disabled:hover:bg-white disabled:hover:text-[#1A1614]"
              disabled={!canScrollRight}
              onClick={() => scroll("right")}
              type="button"
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
              {/* Image */}
              <div className="relative mb-4 aspect-[3/4] overflow-hidden rounded-lg bg-gray-100">
                <Image
                  alt={pro.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  fill
                  sizes="(max-width: 768px) 260px, 300px"
                  src={pro.profilePicture || "/placeholder-professional.jpg"}
                />
              </div>

              {/* Info */}
              <div className="space-y-1">
                <h3 className="font-semibold text-[#1A1614] text-base">{pro.name}</h3>
                <p className="text-[#7a6d62] text-sm">
                  {pro.city}, {pro.country}
                </p>
                <p className="font-semibold text-[#E85D48] text-sm">€{pro.hourlyRate}/hr</p>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Link */}
        <div className="mt-12 text-center">
          <Link
            className="inline-flex items-center justify-center rounded-full border-2 border-[#E85D48] bg-transparent px-8 py-3 font-semibold text-[#E85D48] text-sm transition hover:bg-[#E85D48] hover:text-white"
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
