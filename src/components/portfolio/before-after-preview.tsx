"use client";

/**
 * BeforeAfterPreview - Interactive Before/After Comparison Slider
 *
 * Allows users to slide between before and after images to see transformations.
 * Uses a draggable divider for comparison.
 *
 * Following Lia Design System:
 * - rounded-lg containers
 * - rausch-500 primary accent
 * - neutral color palette
 */

import { ArrowLeft01Icon, ArrowRight01Icon } from "hugeicons-react";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { geistSans } from "@/app/fonts";
import { cn } from "@/lib/utils/core";
import type { BeforeAfterPair } from "./before-after-upload-card";

// ============================================================================
// Types
// ============================================================================

type Props = {
  pair: BeforeAfterPair;
  className?: string;
  showLabels?: boolean;
  aspectRatio?: "square" | "video" | "auto";
};

// ============================================================================
// Main Component
// ============================================================================

export function BeforeAfterPreview({
  pair,
  className,
  showLabels = true,
  aspectRatio = "square",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const aspectClass = {
    square: "aspect-square",
    video: "aspect-video",
    auto: "",
  }[aspectRatio];

  const updateSliderPosition = useCallback((clientX: number) => {
    if (!containerRef.current) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) {
        return;
      }
      updateSliderPosition(e.clientX);
    },
    [isDragging, updateSliderPosition]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!(isDragging && e.touches[0])) {
        return;
      }
      updateSliderPosition(e.touches[0].clientX);
    },
    [isDragging, updateSliderPosition]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      updateSliderPosition(e.clientX);
    },
    [updateSliderPosition]
  );

  return (
    <div
      aria-label="Before and after comparison slider"
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={Math.round(sliderPosition)}
      className={cn(
        "relative select-none overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800",
        aspectClass,
        isDragging ? "cursor-ew-resize" : "cursor-pointer",
        className
      )}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") {
          setSliderPosition((prev) => Math.max(0, prev - 5));
        } else if (e.key === "ArrowRight") {
          setSliderPosition((prev) => Math.min(100, prev + 5));
        }
      }}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseUp}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchStart}
      ref={containerRef}
      role="slider"
      tabIndex={0}
    >
      {/* After Image (Full Width Background) */}
      <div className="absolute inset-0">
        <Image
          alt="After"
          className="object-cover"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          src={pair.afterUrl}
        />
      </div>

      {/* Before Image (Clipped) */}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPosition}%` }}>
        <div className="absolute inset-0" style={{ width: `${100 / (sliderPosition / 100)}%` }}>
          <Image
            alt="Before"
            className="object-cover"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            src={pair.beforeUrl}
          />
        </div>
      </div>

      {/* Slider Handle */}
      <div
        className="absolute top-0 bottom-0 z-10 flex items-center"
        style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
      >
        {/* Vertical Line */}
        <div className="h-full w-0.5 bg-white shadow-lg" />

        {/* Handle Button */}
        <div
          className={cn(
            "-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2",
            "flex h-10 w-10 items-center justify-center rounded-full",
            "bg-white shadow-lg",
            isDragging ? "scale-110" : "hover:scale-105",
            "transition-transform"
          )}
        >
          <ArrowLeft01Icon className="h-3 w-3 text-neutral-600 dark:text-neutral-400" />
          <ArrowRight01Icon className="h-3 w-3 text-neutral-600 dark:text-neutral-400" />
        </div>
      </div>

      {/* Labels */}
      {showLabels && (
        <>
          <div className="absolute bottom-3 left-3 z-20">
            <span
              className={cn(
                "rounded-full bg-black/60 px-3 py-1 font-semibold text-white text-xs",
                geistSans.className
              )}
            >
              Before
            </span>
          </div>
          <div className="absolute right-3 bottom-3 z-20">
            <span
              className={cn(
                "rounded-full bg-black/60 px-3 py-1 font-semibold text-white text-xs",
                geistSans.className
              )}
            >
              After
            </span>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================================
// Thumbnail Card (for grid display)
// ============================================================================

type BeforeAfterThumbnailProps = {
  pair: BeforeAfterPair;
  onClick?: () => void;
  className?: string;
};

export function BeforeAfterThumbnail({ pair, onClick, className }: BeforeAfterThumbnailProps) {
  return (
    <button
      className={cn(
        "group relative overflow-hidden rounded-lg bg-neutral-100",
        "aspect-square w-full",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch-500 focus-visible:ring-offset-2",
        className
      )}
      onClick={onClick}
      type="button"
    >
      {/* Split View */}
      <div className="absolute inset-0 flex">
        {/* Before Half */}
        <div className="relative h-full w-1/2 overflow-hidden">
          <Image
            alt="Before"
            className="object-cover"
            fill
            sizes="(max-width: 768px) 25vw, 15vw"
            src={pair.beforeThumbnail || pair.beforeUrl}
          />
        </div>

        {/* Divider */}
        <div className="z-10 h-full w-0.5 bg-white" />

        {/* After Half */}
        <div className="relative h-full w-1/2 overflow-hidden">
          <Image
            alt="After"
            className="object-cover"
            fill
            sizes="(max-width: 768px) 25vw, 15vw"
            src={pair.afterThumbnail || pair.afterUrl}
          />
        </div>
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30">
        <span
          className={cn(
            "rounded-full bg-white px-3 py-1.5 font-semibold text-neutral-900 text-xs opacity-0 shadow-lg transition",
            "group-hover:opacity-100",
            geistSans.className
          )}
        >
          View
        </span>
      </div>

      {/* Caption Badge */}
      {pair.caption && (
        <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent p-2">
          <p className={cn("truncate text-white text-xs", geistSans.className)}>{pair.caption}</p>
        </div>
      )}
    </button>
  );
}

// ============================================================================
// Modal Preview
// ============================================================================

type BeforeAfterModalPreviewProps = {
  pair: BeforeAfterPair;
  onClose: () => void;
};

export function BeforeAfterModalPreview({ pair, onClose }: BeforeAfterModalPreviewProps) {
  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
      role="dialog"
    >
      <div className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <BeforeAfterPreview aspectRatio="video" className="shadow-2xl" pair={pair} />

        {pair.caption && (
          <div className="mt-4 text-center">
            <p className={cn("text-white", geistSans.className)}>{pair.caption}</p>
            {pair.projectType && (
              <p className={cn("mt-1 text-neutral-400 text-sm", geistSans.className)}>
                {pair.projectType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </p>
            )}
          </div>
        )}

        <button
          className={cn(
            "mx-auto mt-4 block rounded-full bg-white/10 px-6 py-2 font-semibold text-sm text-white transition",
            "hover:bg-white/20",
            geistSans.className
          )}
          onClick={onClose}
          type="button"
        >
          Close
        </button>
      </div>
    </div>
  );
}
