"use client";

import { Camera01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import type { ProfessionalPortfolioImage } from "@/components/professionals/types";

type Props = {
  images: ProfessionalPortfolioImage[];
};

export function ProfessionalPortfolioGallery({ images }: Props) {
  const hasImages = images.length > 0;

  return (
    <section className="border border-[neutral-200] bg-[neutral-50] p-6 shadow-[0_24px_60px_rgba(22,22,22,0.06)]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-semibold text-[neutral-900] text-lg">Portfolio</h3>
          <p className="text-[neutral-400] text-sm">
            A sample of recent work to showcase attention to detail, organization, and finishing
            touches.
          </p>
        </div>
        {hasImages ? null : (
          <div className="flex items-center gap-2 border border-[neutral-200] border-dashed px-3 py-1.5 font-semibold text-[neutral-400] text-xs uppercase tracking-[0.26em]">
            <HugeiconsIcon className="h-3.5 w-3.5" icon={Camera01Icon} />
            Coming soon
          </div>
        )}
      </div>

      {hasImages ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {images.map((item, index) => (
            <figure
              className="group relative overflow-hidden border border-[neutral-200] bg-[neutral-50]"
              key={`${item.url}-${index}`}
            >
              <div className="relative aspect-[4/3] w-full">
                <Image
                  alt={item.caption ?? "Portfolio image"}
                  className="object-cover transition group-hover:scale-105"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  src={item.url}
                />
              </div>
              {item.caption ? (
                <figcaption className="p-4 text-[neutral-400] text-sm">{item.caption}</figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      ) : (
        <div className="mt-5 border border-[neutral-200] border-dashed bg-[neutral-50] p-6 text-[neutral-400] text-sm">
          <p className="font-semibold text-[neutral-900]">No portfolio images yet</p>
          <p className="mt-2 text-sm">
            Once this professional uploads photos of their work, you&apos;ll see them here.
          </p>
        </div>
      )}
    </section>
  );
}
