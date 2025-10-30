"use client";

import { Camera } from "lucide-react";
import Image from "next/image";
import type { ProfessionalPortfolioImage } from "@/components/professionals/types";

type Props = {
  images: ProfessionalPortfolioImage[];
};

export function ProfessionalPortfolioGallery({ images }: Props) {
  const hasImages = images.length > 0;

  return (
    <section className="rounded-[32px] border border-[#ebe5d8] bg-white p-6 shadow-[0_24px_60px_rgba(18,17,15,0.06)]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#211f1a]">Portfolio</h3>
          <p className="text-sm text-[#7a6d62]">
            A sample of recent work to showcase attention to detail, organization, and finishing
            touches.
          </p>
        </div>
        {!hasImages ? (
          <div className="flex items-center gap-2 rounded-full border border-dashed border-[#d8cfbf] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.26em] text-[#a49c90]">
            <Camera className="h-3.5 w-3.5" />
            Coming soon
          </div>
        ) : null}
      </div>

      {hasImages ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {images.map((item, index) => (
            <figure
              key={`${item.url}-${index}`}
              className="group relative overflow-hidden rounded-[28px] border border-[#efe7dc] bg-[#fbfafa]"
            >
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={item.url}
                  alt={item.caption ?? "Portfolio image"}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition group-hover:scale-105"
                />
              </div>
              {item.caption ? (
                <figcaption className="p-4 text-sm text-[#5d574b]">{item.caption}</figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-[28px] border border-dashed border-[#d8cfbf] bg-[#fbfafa] p-6 text-sm text-[#7a6d62]">
          <p className="font-semibold text-[#211f1a]">No portfolio images yet</p>
          <p className="mt-2 text-sm">
            Once this professional uploads photos of their work, you&apos;ll see them here.
          </p>
        </div>
      )}
    </section>
  );
}
