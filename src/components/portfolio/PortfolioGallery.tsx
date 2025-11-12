"use client";

import Image from "next/image";
import { useState } from "react";
import type { PortfolioImage } from "@/app/api/professional/portfolio/route";

type Props = {
  images: PortfolioImage[];
  featuredWork?: string;
  professionalName?: string;
};

/**
 * Display portfolio gallery in a grid layout
 * Supports lightbox view for full-size images
 */
export function PortfolioGallery({
  images,
  featuredWork,
  professionalName: _professionalName,
}: Props) {
  const [selectedImage, setSelectedImage] = useState<PortfolioImage | null>(null);

  if (images.length === 0) {
    return null;
  }

  // Sort images by order
  const sortedImages = [...images].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      {/* Featured Work Description */}
      {featuredWork && (
        <div className="rounded-lg border border-[neutral-200] bg-[neutral-50] p-4">
          <h3 className="font-semibold text-[neutral-900] text-sm">Featured Work</h3>
          <p className="mt-2 text-[neutral-400] text-sm">{featuredWork}</p>
        </div>
      )}

      {/* Image Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sortedImages.map((image) => (
          <button
            className="group relative aspect-square overflow-hidden rounded-lg border border-[neutral-200] bg-[neutral-200] transition hover:border-[neutral-500] hover:shadow-md"
            key={image.id}
            onClick={() => setSelectedImage(image)}
            type="button"
          >
            <Image
              alt={image.caption || "Portfolio image"}
              className="h-full w-full object-cover transition group-hover:scale-105"
              height={300}
              loading="lazy"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
              src={image.thumbnail_url || image.url}
              width={300}
            />
            {image.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[neutral-900]/70 to-transparent p-3 text-left">
                <p className="line-clamp-2 text-[neutral-50] text-sm">{image.caption}</p>
              </div>
            )}
            {/* Overlay icon */}
            <div className="absolute inset-0 flex items-center justify-center bg-[neutral-900]/0 opacity-0 transition group-hover:bg-[neutral-900]/20 group-hover:opacity-100">
              <span className="text-2xl text-[neutral-50]">🔍</span>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <Lightbox
          allImages={sortedImages}
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
          onNavigate={setSelectedImage}
        />
      )}
    </div>
  );
}

function Lightbox({
  image,
  onClose,
  allImages,
  onNavigate,
}: {
  image: PortfolioImage;
  onClose: () => void;
  allImages: PortfolioImage[];
  onNavigate: (image: PortfolioImage) => void;
}) {
  const currentIndex = allImages.findIndex((img) => img.id === image.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < allImages.length - 1;

  const handlePrevious = () => {
    if (hasPrevious) {
      const prevImage = allImages[currentIndex - 1];
      if (prevImage) {
        onNavigate(prevImage);
      }
    }
  };

  const handleNext = () => {
    if (hasNext) {
      const nextImage = allImages[currentIndex + 1];
      if (nextImage) {
        onNavigate(nextImage);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
    if (e.key === "ArrowLeft" && hasPrevious) {
      handlePrevious();
    }
    if (e.key === "ArrowRight" && hasNext) {
      handleNext();
    }
  };

  return (
    <div
      aria-label="Close lightbox"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[neutral-900]/90 p-4"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      {/* Close Button */}
      <button
        className="absolute top-4 right-4 rounded-full bg-[neutral-50]/10 p-2 text-2xl text-[neutral-50] transition hover:bg-[neutral-50]/20"
        onClick={onClose}
        type="button"
      >
        ✕
      </button>

      {/* Previous Button */}
      {hasPrevious && (
        <button
          className="-tranneutral-y-1/2 absolute top-1/2 left-4 rounded-full bg-[neutral-50]/10 p-3 text-2xl text-[neutral-50] transition hover:bg-[neutral-50]/20"
          onClick={(e) => {
            e.stopPropagation();
            handlePrevious();
          }}
          type="button"
        >
          ←
        </button>
      )}

      {/* Next Button */}
      {hasNext && (
        <button
          className="-tranneutral-y-1/2 absolute top-1/2 right-4 rounded-full bg-[neutral-50]/10 p-3 text-2xl text-[neutral-50] transition hover:bg-[neutral-50]/20"
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          type="button"
        >
          →
        </button>
      )}

      {/* Image */}
      <div className="max-h-[90vh] max-w-5xl" role="presentation">
        <Image
          alt={image.caption || "Portfolio image"}
          className="max-h-[80vh] w-auto rounded-lg"
          height={800}
          loading="lazy"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
          src={image.url}
          width={1200}
        />
        {image.caption && (
          <p className="mt-3 text-center text-[neutral-50]/90 text-sm">{image.caption}</p>
        )}
        <p className="mt-2 text-center text-[neutral-50]/60 text-xs">
          {currentIndex + 1} of {allImages.length}
        </p>
      </div>
    </div>
  );
}

/**
 * Compact portfolio preview (show first 3-4 images)
 */
export function PortfolioPreview({ images }: { images: PortfolioImage[] }) {
  if (images.length === 0) {
    return null;
  }

  const sortedImages = [...images].sort((a, b) => a.order - b.order);
  const previewImages = sortedImages.slice(0, 4);
  const remaining = images.length - previewImages.length;

  return (
    <div className="grid grid-cols-4 gap-2">
      {previewImages.map((image, index) => (
        <div
          className="relative aspect-square overflow-hidden rounded-md bg-[neutral-200]"
          key={image.id}
        >
          <Image
            alt={image.caption || `Portfolio ${index + 1}`}
            className="h-full w-full object-cover"
            height={100}
            loading="lazy"
            src={image.thumbnail_url || image.url}
            width={100}
          />
          {index === 3 && remaining > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-[neutral-900]/60 font-semibold text-[neutral-50] text-sm">
              +{remaining}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
