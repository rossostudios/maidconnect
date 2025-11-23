"use client";

/**
 * ImageGalleryModal - Airbnb-Style Lightbox
 *
 * Full-screen image viewer with:
 * - Dark overlay with blur
 * - Navigation arrows (keyboard + click)
 * - Thumbnail strip at bottom
 * - Counter (1 of 12)
 * - Smooth slide transitions
 */

import { ArrowLeft01Icon, ArrowRight01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Dialog as AriaDialog, Button, Modal, ModalOverlay } from "react-aria-components";
import { cn } from "@/lib/utils/core";

export type GalleryImage = {
  src: string;
  alt: string;
  caption?: string;
};

export type ImageGalleryModalProps = {
  /** Array of images to display */
  images: GalleryImage[];
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Initial image index to show */
  initialIndex?: number;
  /** Additional class names */
  className?: string;
};

/**
 * Full-screen image gallery modal with Airbnb-style navigation
 */
export function ImageGalleryModal({
  images,
  isOpen,
  onClose,
  initialIndex = 0,
  className,
}: ImageGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoading, setIsLoading] = useState(true);

  // Reset to initial index when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setIsLoading(true);
    }
  }, [isOpen, initialIndex]);

  const goToPrevious = useCallback(() => {
    setIsLoading(true);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setIsLoading(true);
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          goToPrevious();
          break;
        case "ArrowRight":
          e.preventDefault();
          goToNext();
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
        default:
          // Other keys are ignored
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, goToPrevious, goToNext, onClose]);

  const goToIndex = (index: number) => {
    if (index !== currentIndex) {
      setIsLoading(true);
      setCurrentIndex(index);
    }
  };

  if (!isOpen || images.length === 0) {
    return null;
  }

  const currentImage = images[currentIndex];

  return (
    <ModalOverlay
      className={cn(
        "fixed inset-0 z-50",
        "flex items-center justify-center",
        "bg-black/95",
        "data-[entering]:fade-in-0 data-[entering]:animate-in",
        "data-[exiting]:fade-out-0 data-[exiting]:animate-out"
      )}
      isDismissable
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
    >
      <Modal
        className={cn(
          "fixed inset-0",
          "data-[entering]:fade-in-0 data-[entering]:animate-in",
          "data-[exiting]:fade-out-0 data-[exiting]:animate-out",
          "duration-200"
        )}
      >
        <AriaDialog
          aria-label="Image gallery"
          className={cn("relative h-full w-full outline-none", className)}
        >
          {/* Close button - top right */}
          <Button
            aria-label="Close gallery"
            className={cn(
              "absolute top-4 right-4 z-50",
              "flex h-10 w-10 items-center justify-center rounded-full",
              "bg-white/10 text-white backdrop-blur-sm",
              "transition-colors hover:bg-white/20",
              "focus:outline-none focus:ring-2 focus:ring-white/50"
            )}
            onPress={onClose}
          >
            <HugeiconsIcon className="h-5 w-5" icon={Cancel01Icon} />
          </Button>

          {/* Counter - top center */}
          <div className="-translate-x-1/2 absolute top-4 left-1/2 z-50">
            <span className="rounded-full bg-black/50 px-4 py-2 font-medium text-sm text-white backdrop-blur-sm">
              {currentIndex + 1} / {images.length}
            </span>
          </div>

          {/* Main image container */}
          <div className="flex h-full items-center justify-center px-16 py-20">
            {/* Previous button */}
            {images.length > 1 && (
              <Button
                aria-label="Previous image"
                className={cn(
                  "absolute left-4 z-50",
                  "flex h-12 w-12 items-center justify-center rounded-full",
                  "bg-white shadow-lg",
                  "transition-all hover:scale-105 active:scale-95",
                  "focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                )}
                onPress={goToPrevious}
              >
                <HugeiconsIcon className="h-5 w-5 text-neutral-900" icon={ArrowLeft01Icon} />
              </Button>
            )}

            {/* Image */}
            <div className="relative h-full max-h-[calc(100vh-200px)] w-full">
              {/* Loading shimmer */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-16 w-16 animate-spin rounded-full border-4 border-white/20 border-t-white" />
                </div>
              )}

              <Image
                alt={currentImage.alt}
                className={cn(
                  "object-contain transition-opacity duration-300",
                  isLoading ? "opacity-0" : "opacity-100"
                )}
                fill
                onLoad={() => setIsLoading(false)}
                priority
                sizes="100vw"
                src={currentImage.src}
              />
            </div>

            {/* Next button */}
            {images.length > 1 && (
              <Button
                aria-label="Next image"
                className={cn(
                  "absolute right-4 z-50",
                  "flex h-12 w-12 items-center justify-center rounded-full",
                  "bg-white shadow-lg",
                  "transition-all hover:scale-105 active:scale-95",
                  "focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                )}
                onPress={goToNext}
              >
                <HugeiconsIcon className="h-5 w-5 text-neutral-900" icon={ArrowRight01Icon} />
              </Button>
            )}
          </div>

          {/* Caption */}
          {currentImage.caption && (
            <div className="absolute right-0 bottom-24 left-0 text-center">
              <p className="mx-auto max-w-xl px-4 text-sm text-white/80">{currentImage.caption}</p>
            </div>
          )}

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="absolute right-0 bottom-4 left-0">
              <div className="flex justify-center gap-2 px-4">
                {images.map((image, index) => (
                  <button
                    aria-label={`View image ${index + 1}`}
                    className={cn(
                      "relative h-14 w-14 shrink-0 overflow-hidden rounded-lg",
                      "transition-all duration-200",
                      "focus:outline-none focus:ring-2 focus:ring-white/50",
                      index === currentIndex
                        ? "opacity-100 ring-2 ring-white"
                        : "opacity-50 hover:opacity-75"
                    )}
                    key={`thumb-${image.src}`}
                    onClick={() => goToIndex(index)}
                    type="button"
                  >
                    <Image
                      alt={`Thumbnail ${index + 1}`}
                      className="object-cover"
                      fill
                      sizes="56px"
                      src={image.src}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </AriaDialog>
      </Modal>
    </ModalOverlay>
  );
}

/**
 * Hook for managing gallery modal state
 */
export function useImageGallery(images: GalleryImage[]) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);

  const openGallery = (index = 0) => {
    setInitialIndex(index);
    setIsOpen(true);
  };

  const closeGallery = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    initialIndex,
    openGallery,
    closeGallery,
    images,
  };
}

/**
 * Trigger component for opening gallery on image click
 */
export type GalleryTriggerProps = {
  /** Index of this image in the gallery */
  index: number;
  /** Function to open gallery at this index */
  onOpen: (index: number) => void;
  /** Children (typically an Image) */
  children: React.ReactNode;
  /** Additional class names */
  className?: string;
};

export function GalleryTrigger({ index, onOpen, children, className }: GalleryTriggerProps) {
  return (
    <button
      className={cn(
        "relative cursor-pointer overflow-hidden",
        "focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2",
        className
      )}
      onClick={() => onOpen(index)}
      type="button"
    >
      {children}
    </button>
  );
}
