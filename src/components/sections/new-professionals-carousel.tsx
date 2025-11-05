"use client";

import { ArrowLeft01Icon, ArrowRight01Icon, FavouriteIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "framer-motion";
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
    const scrollAmount = Math.max(container.clientWidth - 120, 360);

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
    <section className="bg-[var(--background)] py-16 sm:py-24">
      <div className="mx-auto max-w-[1600px] px-6 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[400px_1fr] xl:gap-16">
          {/* Left Column - Title & Description */}
          <motion.div
            className="flex flex-col justify-between will-change-transform motion-reduce:transform-none motion-reduce:opacity-100"
            initial={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, x: 0 }}
          >
            <div className="space-y-6">
              <p className="font-medium text-[var(--muted-foreground)] text-xs uppercase tracking-[0.15em]">
                NEW PROFESSIONALS
              </p>
              <h2 className="type-serif-lg text-[var(--foreground)]">The Drop</h2>
              <p className="text-[var(--muted-foreground)] text-lg leading-relaxed">
                New to Casaora and new to your home care plans. Explore the latest drop of
                handpicked professionals, tried & tested by us.
              </p>
              <Link
                className="inline-flex items-center justify-center rounded-full border-2 border-[var(--foreground)] bg-transparent px-8 py-3 font-medium text-[var(--foreground)] text-sm transition-all hover:bg-[var(--foreground)] hover:text-white"
                href="/professionals"
              >
                ALL OUR PROFESSIONALS
              </Link>
            </div>

            {/* Navigation Arrows */}
            <div className="mt-12 flex gap-3">
              <button
                aria-label="Scroll left"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--foreground)] transition-all hover:border-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                disabled={!canScrollLeft}
                onClick={() => scroll("left")}
                type="button"
              >
                <HugeiconsIcon className="h-5 w-5" icon={ArrowLeft01Icon} strokeWidth={2} />
              </button>
              <button
                aria-label="Scroll right"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--foreground)] transition-all hover:border-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                disabled={!canScrollRight}
                onClick={() => scroll("right")}
                type="button"
              >
                <HugeiconsIcon className="h-5 w-5" icon={ArrowRight01Icon} strokeWidth={2} />
              </button>
            </div>
          </motion.div>

          {/* Right Column - Scrollable Cards */}
          <div className="relative">
            <div
              className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-4"
              onScroll={checkScrollability}
              ref={scrollContainerRef}
            >
              {professionals.map((pro, index) => (
                <motion.div
                  className="w-[280px] flex-shrink-0 snap-start overflow-hidden rounded-2xl bg-white shadow-sm will-change-transform motion-reduce:scale-100 motion-reduce:transform-none motion-reduce:opacity-100 sm:w-[320px]"
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  key={pro.id}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.12,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  viewport={{ once: true, margin: "-80px", amount: 0.2 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                >
                  {/* Image Container */}
                  <div className="relative aspect-[3/4] overflow-hidden rounded-t-2xl bg-gray-100">
                    <Link className="block h-full w-full" href={`/professionals/${pro.id}`}>
                      <Image
                        alt={pro.name}
                        className="h-full w-full object-cover object-[center_20%]"
                        fill
                        priority={index < 3}
                        sizes="(max-width: 768px) 280px, 320px"
                        src={pro.profilePicture || "/placeholder-professional.jpg"}
                      />
                    </Link>

                    {/* Book Now Button - Bottom Right */}
                    <Link
                      className="absolute right-4 bottom-4 rounded-sm bg-[var(--red)] px-4 py-2 font-semibold text-white text-xs uppercase tracking-wider shadow-lg transition-all hover:bg-[var(--red-hover)] active:scale-95"
                      href={`/professionals/${pro.id}`}
                    >
                      BOOK NOW
                    </Link>
                  </div>

                  {/* Info Card */}
                  <div className="p-5">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="mb-1 font-medium text-[var(--muted-foreground)] text-xs uppercase tracking-wide">
                          {pro.city}, {pro.country}
                        </p>
                        <h3 className="type-serif-sm mb-1 text-[var(--foreground)]">{pro.name}</h3>
                        <p className="text-[var(--foreground)] text-sm">FROM €{pro.hourlyRate}</p>
                      </div>

                      {/* Favorite Heart Button - Below Image */}
                      <button
                        aria-label={`Add ${pro.name} to favorites`}
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-[var(--border)] bg-white text-[var(--foreground)] transition-all hover:border-[var(--red)] hover:text-[var(--red)] active:scale-95"
                        type="button"
                      >
                        <HugeiconsIcon className="h-5 w-5" icon={FavouriteIcon} strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
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
