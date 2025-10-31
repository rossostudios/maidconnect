"use client";

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
export function PortfolioGallery({ images, featuredWork, professionalName }: Props) {
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
        <div className="rounded-lg border border-[#f0ece5] bg-[#fdfaf6] p-4">
          <h3 className="font-semibold text-[#211f1a] text-sm">Featured Work</h3>
          <p className="mt-2 text-[#7a6d62] text-sm">{featuredWork}</p>
        </div>
      )}

      {/* Image Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sortedImages.map((image) => (
          <button
            type="button"
            className="group relative aspect-square overflow-hidden rounded-lg border border-[#e5dfd4] bg-[#f0ece5] transition hover:border-[#ff5d46] hover:shadow-md"
            key={image.id}
            onClick={() => setSelectedImage(image)}
          >
            <img
              alt={image.caption || "Portfolio image"}
              className="h-full w-full object-cover transition group-hover:scale-105"
              src={image.thumbnail_url || image.url}
            />
            {image.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-left">
                <p className="line-clamp-2 text-sm text-white">{image.caption}</p>
              </div>
            )}
            {/* Overlay icon */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/20 group-hover:opacity-100">
              <span className="text-2xl text-white">🔍</span>
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
      onNavigate(allImages[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      onNavigate(allImages[currentIndex + 1]);
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      {/* Close Button */}
      <button
        type="button"
        className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-2xl text-white transition hover:bg-white/20"
        onClick={onClose}
      >
        ✕
      </button>

      {/* Previous Button */}
      {hasPrevious && (
        <button
          type="button"
          className="-translate-y-1/2 absolute top-1/2 left-4 rounded-full bg-white/10 p-3 text-2xl text-white transition hover:bg-white/20"
          onClick={(e) => {
            e.stopPropagation();
            handlePrevious();
          }}
        >
          ←
        </button>
      )}

      {/* Next Button */}
      {hasNext && (
        <button
          type="button"
          className="-translate-y-1/2 absolute top-1/2 right-4 rounded-full bg-white/10 p-3 text-2xl text-white transition hover:bg-white/20"
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
        >
          →
        </button>
      )}

      {/* Image */}
      <div className="max-h-[90vh] max-w-5xl" onClick={(e) => e.stopPropagation()}>
        <img
          alt={image.caption || "Portfolio image"}
          className="max-h-[80vh] w-auto rounded-lg"
          src={image.url}
        />
        {image.caption && <p className="mt-3 text-center text-sm text-white/90">{image.caption}</p>}
        <p className="mt-2 text-center text-white/60 text-xs">
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
          className="relative aspect-square overflow-hidden rounded-md bg-[#f0ece5]"
          key={image.id}
        >
          <img
            alt={image.caption || `Portfolio ${index + 1}`}
            className="h-full w-full object-cover"
            src={image.thumbnail_url || image.url}
          />
          {index === 3 && remaining > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 font-semibold text-sm text-white">
              +{remaining}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
