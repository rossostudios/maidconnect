"use client";

import { Clock01Icon, StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useRecentlyViewed } from "@/hooks/useRecently";
import { Link } from "@/i18n/routing";
import { formatCOP } from "@/lib/format";

/**
 * Recently Viewed Professionals Component
 * Displays a horizontal scrollable list of recently viewed professionals
 */
export function RecentlyViewed() {
  const { recentlyViewed } = useRecentlyViewed();

  if (recentlyViewed.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-[neutral-900]">
        <HugeiconsIcon className="h-5 w-5" icon={Clock01Icon} />
        <h2 className="font-semibold text-lg">Recently Viewed</h2>
      </div>

      <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-4">
        {recentlyViewed.map((item) => (
          <Link
            className="group min-w-[240px] flex-shrink-0 rounded-2xl border border-[neutral-200] bg-[neutral-50] p-4 shadow-[0_10px_40px_rgba(22,22,22,0.04)] transition hover:border-[neutral-500] hover:shadow-[0_20px_50px_rgba(22,22,22,0.08)]"
            href={`/professionals/${item.id}`}
            key={item.id}
          >
            <div className="flex gap-3">
              {/* Photo */}
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full">
                <Image
                  alt={item.name}
                  className="object-cover"
                  fill
                  sizes="64px"
                  src={item.photo}
                />
              </div>

              {/* Info */}
              <div className="flex-1 space-y-1">
                <h3 className="font-semibold text-[neutral-900] text-base leading-tight group-hover:text-[neutral-500]">
                  {item.name}
                </h3>
                <p className="text-[neutral-400] text-sm">{item.service}</p>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1 text-[neutral-400]">
                    <HugeiconsIcon
                      className="h-3 w-3 fill-[neutral-500] text-[neutral-500]"
                      icon={StarIcon}
                    />
                    <span className="font-semibold">{item.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-[neutral-400]">{formatCOP(item.hourlyRate)}/hr</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
