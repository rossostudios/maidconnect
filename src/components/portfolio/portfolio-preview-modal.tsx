"use client";

/**
 * PortfolioPreviewModal - Customer-Facing Portfolio Preview
 *
 * Shows professionals how their portfolio will appear to customers.
 * Simulates the customer-facing view with all portfolio elements.
 *
 * Sections:
 * - Featured Work (hero image + description)
 * - Before/After Transformations (with slider)
 * - Work Gallery (image grid)
 *
 * Following Lia Design System:
 * - rounded-lg containers
 * - rausch-500 primary accent
 * - neutral color palette
 */

import {
  Cancel01Icon,
  ComputerIcon,
  Image01Icon,
  SmartPhone01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { BeforeAfterPair, PortfolioImage } from "@/app/api/professional/portfolio/route";
import { geistSans } from "@/app/fonts";
import { cn } from "@/lib/utils/core";
import { BeforeAfterPreview } from "./before-after-preview";

// ============================================================================
// Types
// ============================================================================

type Props = {
  /** Whether modal is open */
  isOpen: boolean;
  /** Callback when modal closes */
  onClose: () => void;
  /** Portfolio images */
  images: PortfolioImage[];
  /** Before/After transformation pairs */
  beforeAfterPairs: BeforeAfterPair[];
  /** Featured work description */
  featuredWork?: string;
  /** Featured image ID */
  featuredImageId?: string;
  /** Professional's name (for display) */
  professionalName?: string;
};

type ViewMode = "desktop" | "mobile";

// ============================================================================
// Gallery Image Modal
// ============================================================================

type GalleryModalProps = {
  images: PortfolioImage[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
};

function GalleryModal({ images, currentIndex, onClose, onPrev, onNext }: GalleryModalProps) {
  const currentImage = images[currentIndex];
  if (!currentImage) {
    return null;
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
      role="dialog"
    >
      <button
        aria-label="Close"
        className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
        onClick={onClose}
        type="button"
      >
        <HugeiconsIcon className="h-6 w-6" icon={Cancel01Icon} />
      </button>

      <div className="relative max-h-[80vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
        <Image
          alt={currentImage.caption || "Portfolio image"}
          className="max-h-[80vh] w-auto rounded-lg object-contain"
          height={800}
          src={currentImage.url}
          width={1200}
        />

        {/* Navigation */}
        {images.length > 1 && (
          <>
            <button
              className={cn(
                "-translate-y-1/2 absolute top-1/2 left-4 rounded-full bg-white p-3 shadow-lg transition",
                "hover:bg-neutral-50",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
              disabled={currentIndex === 0}
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
              }}
              type="button"
            >
              ←
            </button>
            <button
              className={cn(
                "-translate-y-1/2 absolute top-1/2 right-4 rounded-full bg-white p-3 shadow-lg transition",
                "hover:bg-neutral-50",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
              disabled={currentIndex === images.length - 1}
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              type="button"
            >
              →
            </button>
          </>
        )}

        {/* Caption */}
        {currentImage.caption && (
          <div className="absolute right-0 bottom-0 left-0 rounded-b-lg bg-gradient-to-t from-black/80 to-transparent p-6">
            <p className={cn("text-center text-white", geistSans.className)}>
              {currentImage.caption}
            </p>
          </div>
        )}

        {/* Counter */}
        <div className="absolute top-4 left-4">
          <span
            className={cn(
              "rounded-full bg-black/50 px-3 py-1 text-sm text-white",
              geistSans.className
            )}
          >
            {currentIndex + 1} / {images.length}
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function PortfolioPreviewModal({
  isOpen,
  onClose,
  images,
  beforeAfterPairs,
  featuredWork,
  featuredImageId,
  professionalName = "Professional",
}: Props) {
  const t = useTranslations("dashboard.pro.portfolio.preview");
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);
  const [activeBeforeAfterIndex, setActiveBeforeAfterIndex] = useState(0);

  if (!isOpen) {
    return null;
  }

  const sortedImages = [...images].sort((a, b) => a.order - b.order);
  const featuredImage = sortedImages.find((img) => img.id === featuredImageId);
  const sortedPairs = [...beforeAfterPairs].sort((a, b) => a.order - b.order);

  const handlePrevImage = () => {
    if (galleryIndex !== null && galleryIndex > 0) {
      setGalleryIndex(galleryIndex - 1);
    }
  };

  const handleNextImage = () => {
    if (galleryIndex !== null && galleryIndex < sortedImages.length - 1) {
      setGalleryIndex(galleryIndex + 1);
    }
  };

  return (
    <>
      <div
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/80 p-4"
        onClick={onClose}
        role="dialog"
      >
        <div
          className={cn(
            "relative flex max-h-[90vh] flex-col overflow-hidden rounded-xl bg-white shadow-2xl",
            viewMode === "desktop" ? "w-full max-w-4xl" : "w-full max-w-[375px]"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-neutral-200 border-b px-6 py-4">
            <div>
              <h2 className={cn("font-bold text-lg text-neutral-900", geistSans.className)}>
                {t("title")}
              </h2>
              <p className={cn("text-neutral-500 text-sm", geistSans.className)}>{t("subtitle")}</p>
            </div>
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex rounded-lg border border-neutral-200 p-1">
                <button
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition",
                    viewMode === "desktop"
                      ? "bg-rausch-500 text-white"
                      : "text-neutral-600 hover:bg-neutral-50"
                  )}
                  onClick={() => setViewMode("desktop")}
                  type="button"
                >
                  <HugeiconsIcon className="h-4 w-4" icon={ComputerIcon} />
                  <span className={cn("hidden sm:inline", geistSans.className)}>Desktop</span>
                </button>
                <button
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition",
                    viewMode === "mobile"
                      ? "bg-rausch-500 text-white"
                      : "text-neutral-600 hover:bg-neutral-50"
                  )}
                  onClick={() => setViewMode("mobile")}
                  type="button"
                >
                  <HugeiconsIcon className="h-4 w-4" icon={SmartPhone01Icon} />
                  <span className={cn("hidden sm:inline", geistSans.className)}>Mobile</span>
                </button>
              </div>

              {/* Close Button */}
              <button
                aria-label="Close preview"
                className="rounded-lg p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600"
                onClick={onClose}
                type="button"
              >
                <HugeiconsIcon className="h-5 w-5" icon={Cancel01Icon} />
              </button>
            </div>
          </div>

          {/* Preview Content */}
          <div className="flex-1 overflow-y-auto">
            <div className={cn("p-6", viewMode === "mobile" && "px-4")}>
              {/* Profile Header Mock */}
              <div className="mb-6 flex items-center gap-4 rounded-lg bg-neutral-50 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rausch-100">
                  <span className={cn("font-bold text-lg text-rausch-600", geistSans.className)}>
                    {professionalName.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className={cn("font-semibold text-neutral-900", geistSans.className)}>
                    {professionalName}
                  </h3>
                  <p className={cn("text-neutral-500 text-sm", geistSans.className)}>
                    {t("portfolioLabel")}
                  </p>
                </div>
              </div>

              {/* Featured Work Section */}
              {(featuredImage || featuredWork) && (
                <div className="mb-8">
                  <h4
                    className={cn(
                      "mb-4 font-semibold text-lg text-neutral-900",
                      geistSans.className
                    )}
                  >
                    {t("sections.featured")}
                  </h4>
                  {featuredImage && (
                    <div className="relative mb-4 aspect-video overflow-hidden rounded-lg">
                      <Image
                        alt={featuredImage.caption || "Featured work"}
                        className="object-cover"
                        fill
                        src={featuredImage.url}
                      />
                    </div>
                  )}
                  {featuredWork && (
                    <p className={cn("text-neutral-700 leading-relaxed", geistSans.className)}>
                      {featuredWork}
                    </p>
                  )}
                </div>
              )}

              {/* Before/After Section */}
              {sortedPairs.length > 0 && (
                <div className="mb-8">
                  <h4
                    className={cn(
                      "mb-4 font-semibold text-lg text-neutral-900",
                      geistSans.className
                    )}
                  >
                    {t("sections.transformations")}
                  </h4>
                  <div className="space-y-4">
                    {/* Main Slider */}
                    {sortedPairs[activeBeforeAfterIndex] && (
                      <BeforeAfterPreview
                        aspectRatio="video"
                        className="w-full"
                        pair={sortedPairs[activeBeforeAfterIndex]}
                      />
                    )}

                    {/* Caption */}
                    {sortedPairs[activeBeforeAfterIndex]?.caption && (
                      <p
                        className={cn("text-center text-neutral-600 text-sm", geistSans.className)}
                      >
                        {sortedPairs[activeBeforeAfterIndex].caption}
                      </p>
                    )}

                    {/* Thumbnails Navigation */}
                    {sortedPairs.length > 1 && (
                      <div className="flex justify-center gap-2 overflow-x-auto py-2">
                        {sortedPairs.map((pair, index) => (
                          <button
                            className={cn(
                              "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition",
                              activeBeforeAfterIndex === index
                                ? "border-rausch-500 ring-2 ring-rausch-500/20"
                                : "border-neutral-200 hover:border-rausch-300"
                            )}
                            key={pair.id}
                            onClick={() => setActiveBeforeAfterIndex(index)}
                            type="button"
                          >
                            <div className="flex h-full">
                              <div className="relative w-1/2">
                                <Image
                                  alt="Before"
                                  className="object-cover"
                                  fill
                                  src={pair.beforeThumbnail || pair.beforeUrl}
                                />
                              </div>
                              <div className="relative w-1/2">
                                <Image
                                  alt="After"
                                  className="object-cover"
                                  fill
                                  src={pair.afterThumbnail || pair.afterUrl}
                                />
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Gallery Section */}
              {sortedImages.length > 0 && (
                <div>
                  <h4
                    className={cn(
                      "mb-4 font-semibold text-lg text-neutral-900",
                      geistSans.className
                    )}
                  >
                    {t("sections.gallery")}
                  </h4>
                  <div
                    className={cn(
                      "grid gap-3",
                      viewMode === "desktop" ? "grid-cols-3" : "grid-cols-2"
                    )}
                  >
                    {sortedImages.slice(0, viewMode === "desktop" ? 9 : 6).map((image, index) => (
                      <button
                        className="group relative aspect-square overflow-hidden rounded-lg"
                        key={image.id}
                        onClick={() => setGalleryIndex(index)}
                        type="button"
                      >
                        <Image
                          alt={image.caption || `Work sample ${index + 1}`}
                          className="object-cover transition group-hover:scale-105"
                          fill
                          src={image.thumbnail_url || image.url}
                        />
                        <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/20" />
                      </button>
                    ))}
                  </div>

                  {/* More Images Indicator */}
                  {sortedImages.length > (viewMode === "desktop" ? 9 : 6) && (
                    <p
                      className={cn(
                        "mt-3 text-center text-neutral-500 text-sm",
                        geistSans.className
                      )}
                    >
                      +{sortedImages.length - (viewMode === "desktop" ? 9 : 6)} {t("moreImages")}
                    </p>
                  )}
                </div>
              )}

              {/* Empty State */}
              {sortedImages.length === 0 && sortedPairs.length === 0 && !featuredWork && (
                <div className="py-12 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
                    <HugeiconsIcon className="h-8 w-8 text-neutral-400" icon={Image01Icon} />
                  </div>
                  <h4 className={cn("mt-4 font-semibold text-neutral-900", geistSans.className)}>
                    {t("emptyState.title")}
                  </h4>
                  <p className={cn("mt-2 text-neutral-500 text-sm", geistSans.className)}>
                    {t("emptyState.description")}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-neutral-200 border-t px-6 py-4">
            <div className="flex items-center justify-between">
              <p className={cn("text-neutral-500 text-sm", geistSans.className)}>
                {t("footer.hint")}
              </p>
              <button
                className={cn(
                  "rounded-lg bg-rausch-500 px-6 py-2.5 font-semibold text-white transition",
                  "hover:bg-rausch-600",
                  geistSans.className
                )}
                onClick={onClose}
                type="button"
              >
                {t("footer.close")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Modal (nested) */}
      {galleryIndex !== null && (
        <GalleryModal
          currentIndex={galleryIndex}
          images={sortedImages}
          onClose={() => setGalleryIndex(null)}
          onNext={handleNextImage}
          onPrev={handlePrevImage}
        />
      )}
    </>
  );
}
