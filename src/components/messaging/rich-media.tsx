"use client";

/**
 * Rich Media Components - Enhanced Messaging Media Support
 *
 * Airbnb-inspired rich media for messages:
 * - Image messages with gallery view
 * - Voice notes with waveform visualization
 * - Location sharing with map preview
 * - File attachments with type icons
 * - Embedded booking cards
 *
 * Following Lia Design System.
 */

import {
  Cancel01Icon,
  Clock01Icon,
  Download01Icon,
  File01Icon,
  Image01Icon,
  Location01Icon,
  Mic01Icon,
  PauseIcon,
  PlayIcon,
  VideoIcon,
  ZoomInIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { geistSans } from "@/app/fonts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/core";
import { type Currency, formatCurrency } from "@/lib/utils/format";

// ============================================================================
// Types
// ============================================================================

export type ImageAttachment = {
  id: string;
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  alt?: string;
};

export type VoiceNote = {
  id: string;
  url: string;
  duration: number; // in seconds
  waveform?: number[]; // normalized amplitude values 0-1
};

export type LocationShare = {
  id: string;
  latitude: number;
  longitude: number;
  address?: string;
  name?: string;
  previewUrl?: string;
};

export type FileAttachment = {
  id: string;
  name: string;
  url: string;
  size: number; // in bytes
  type: string; // MIME type
};

export type EmbeddedBooking = {
  id: string;
  professionalName: string;
  professionalAvatar?: string;
  service: string;
  date: string;
  time: string;
  duration: string;
  price: number;
  currency: Currency;
  status: "pending" | "confirmed" | "completed" | "cancelled";
};

// ============================================================================
// Image Message
// ============================================================================

type ImageMessageProps = {
  images: ImageAttachment[];
  onImageClick?: (imageId: string, index: number) => void;
  className?: string;
};

export function ImageMessage({ images, onImageClick, className }: ImageMessageProps) {
  const isSingle = images.length === 1;
  const isDouble = images.length === 2;
  const isMultiple = images.length > 2;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg",
        isSingle && "max-w-xs",
        isDouble && "grid max-w-sm grid-cols-2 gap-1",
        isMultiple && "grid max-w-sm grid-cols-2 gap-1",
        className
      )}
    >
      {images.slice(0, 4).map((image, index) => (
        <button
          className={cn(
            "group relative aspect-square overflow-hidden bg-neutral-100",
            isSingle && "aspect-auto max-h-80",
            isMultiple && index === 3 && images.length > 4 && "relative"
          )}
          key={image.id}
          onClick={() => onImageClick?.(image.id, index)}
          type="button"
        >
          <Image
            alt={image.alt || "Image"}
            className="object-cover transition-transform group-hover:scale-105"
            fill
            sizes={isSingle ? "320px" : "160px"}
            src={image.thumbnailUrl || image.url}
          />

          {/* Zoom icon on hover */}
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/0 opacity-0 transition-all group-hover:bg-neutral-900/30 group-hover:opacity-100">
            <HugeiconsIcon className="h-6 w-6 text-white" icon={ZoomInIcon} />
          </div>

          {/* More images overlay */}
          {isMultiple && index === 3 && images.length > 4 && (
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/60">
              <span className={cn("font-semibold text-white text-xl", geistSans.className)}>
                +{images.length - 4}
              </span>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// Voice Note Message
// ============================================================================

type VoiceNoteMessageProps = {
  voiceNote: VoiceNote;
  isOwn?: boolean;
  className?: string;
};

export function VoiceNoteMessage({ voiceNote, isOwn = false, className }: VoiceNoteMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlayback = useCallback(() => {
    if (!audioRef.current) {
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleTimeUpdate = useCallback(() => {
    if (!audioRef.current) {
      return;
    }
    const newProgress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
    setProgress(newProgress);
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setProgress(0);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Generate waveform bars (use provided or generate placeholder)
  const waveformBars =
    voiceNote.waveform || Array.from({ length: 32 }, () => Math.random() * 0.7 + 0.3);

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg px-4 py-3",
        isOwn ? "bg-rausch-500" : "bg-neutral-100",
        className
      )}
    >
      {/* Hidden audio element */}
      <audio
        onEnded={handleEnded}
        onTimeUpdate={handleTimeUpdate}
        ref={audioRef}
        src={voiceNote.url}
      />

      {/* Play/Pause button */}
      <button
        className={cn(
          "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-colors",
          isOwn
            ? "bg-white/20 text-white hover:bg-white/30"
            : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
        )}
        onClick={togglePlayback}
        type="button"
      >
        <HugeiconsIcon className="h-5 w-5" icon={isPlaying ? PauseIcon : PlayIcon} />
      </button>

      {/* Waveform visualization */}
      <div className="relative flex h-8 flex-1 items-center gap-0.5">
        {waveformBars.map((amplitude, index) => {
          const barProgress = (index / waveformBars.length) * 100;
          const isActive = barProgress <= progress;

          return (
            <div
              className={cn(
                "w-1 rounded-full transition-colors",
                isOwn
                  ? isActive
                    ? "bg-white"
                    : "bg-white/40"
                  : isActive
                    ? "bg-rausch-500"
                    : "bg-neutral-300"
              )}
              key={index}
              style={{ height: `${amplitude * 100}%` }}
            />
          );
        })}
      </div>

      {/* Duration */}
      <span
        className={cn(
          "flex-shrink-0 font-medium text-xs tabular-nums",
          isOwn ? "text-white/80" : "text-neutral-500",
          geistSans.className
        )}
      >
        {formatDuration(voiceNote.duration)}
      </span>
    </div>
  );
}

// ============================================================================
// Location Message
// ============================================================================

type LocationMessageProps = {
  location: LocationShare;
  onViewMap?: (locationId: string) => void;
  onGetDirections?: (locationId: string) => void;
  className?: string;
};

export function LocationMessage({
  location,
  onViewMap,
  onGetDirections,
  className,
}: LocationMessageProps) {
  // Static map preview URL (using OpenStreetMap tiles or placeholder)
  const mapPreviewUrl =
    location.previewUrl ||
    `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${location.longitude},${location.latitude},14,0/300x150@2x?access_token=placeholder`;

  return (
    <div className={cn("w-72 overflow-hidden rounded-lg border border-neutral-200", className)}>
      {/* Map Preview */}
      <div className="relative h-36 bg-neutral-100">
        <Image
          alt={location.name || "Location"}
          className="object-cover"
          fill
          sizes="288px"
          src={mapPreviewUrl}
        />

        {/* Location pin overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rausch-500 shadow-lg">
            <HugeiconsIcon className="h-5 w-5 text-white" icon={Location01Icon} />
          </div>
        </div>
      </div>

      {/* Location Details */}
      <div className="bg-white p-3">
        {location.name && (
          <h4 className={cn("font-semibold text-neutral-900 text-sm", geistSans.className)}>
            {location.name}
          </h4>
        )}
        {location.address && (
          <p className={cn("mt-1 line-clamp-2 text-neutral-500 text-xs", geistSans.className)}>
            {location.address}
          </p>
        )}

        {/* Action buttons */}
        <div className="mt-3 flex gap-2">
          <Button
            className="flex-1"
            onClick={() => onViewMap?.(location.id)}
            size="sm"
            variant="outline"
          >
            View Map
          </Button>
          <Button className="flex-1" onClick={() => onGetDirections?.(location.id)} size="sm">
            Directions
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// File Attachment Message
// ============================================================================

type FileAttachmentMessageProps = {
  file: FileAttachment;
  onDownload?: (fileId: string) => void;
  className?: string;
};

export function FileAttachmentMessage({ file, onDownload, className }: FileAttachmentMessageProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) {
      return Image01Icon;
    }
    if (mimeType.startsWith("video/")) {
      return VideoIcon;
    }
    return File01Icon;
  };

  const getFileColor = (mimeType: string) => {
    if (mimeType.startsWith("image/")) {
      return "bg-babu-100 text-babu-600";
    }
    if (mimeType.startsWith("video/")) {
      return "bg-purple-100 text-purple-600";
    }
    if (mimeType.includes("pdf")) {
      return "bg-red-100 text-red-600";
    }
    if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) {
      return "bg-green-100 text-green-600";
    }
    return "bg-neutral-100 text-neutral-600";
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3",
        className
      )}
    >
      {/* File icon */}
      <div
        className={cn(
          "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg",
          getFileColor(file.type)
        )}
      >
        <HugeiconsIcon className="h-5 w-5" icon={getFileIcon(file.type)} />
      </div>

      {/* File info */}
      <div className="min-w-0 flex-1">
        <p className={cn("truncate font-medium text-neutral-900 text-sm", geistSans.className)}>
          {file.name}
        </p>
        <p className={cn("text-neutral-500 text-xs", geistSans.className)}>
          {formatFileSize(file.size)}
        </p>
      </div>

      {/* Download button */}
      <Button
        className="flex-shrink-0"
        onClick={() => onDownload?.(file.id)}
        size="sm"
        variant="ghost"
      >
        <HugeiconsIcon className="h-4 w-4" icon={Download01Icon} />
      </Button>
    </div>
  );
}

// ============================================================================
// Embedded Booking Card (for messages)
// ============================================================================

type EmbeddedBookingCardProps = {
  booking: EmbeddedBooking;
  onViewBooking?: (bookingId: string) => void;
  onContact?: (bookingId: string) => void;
  className?: string;
};

export function EmbeddedBookingCard({
  booking,
  onViewBooking,
  onContact,
  className,
}: EmbeddedBookingCardProps) {
  const getStatusStyles = (status: EmbeddedBooking["status"]) => {
    switch (status) {
      case "pending":
        return "bg-rausch-50 text-rausch-700 border-rausch-200";
      case "confirmed":
        return "bg-babu-50 text-babu-700 border-babu-200";
      case "completed":
        return "bg-green-50 text-green-700 border-green-200";
      case "cancelled":
        return "bg-neutral-50 text-neutral-500 border-neutral-200";
      default:
        return "bg-neutral-50 text-neutral-700 border-neutral-200";
    }
  };

  const getStatusLabel = (status: EmbeddedBooking["status"]) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "confirmed":
        return "Confirmed";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  return (
    <div className={cn("w-72 overflow-hidden rounded-lg border border-neutral-200", className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-neutral-100 border-b bg-neutral-50 px-3 py-2">
        <span className={cn("font-medium text-neutral-700 text-xs", geistSans.className)}>
          Booking Details
        </span>
        <Badge className={cn("text-xs", getStatusStyles(booking.status))} size="sm">
          {getStatusLabel(booking.status)}
        </Badge>
      </div>

      {/* Content */}
      <div className="bg-white p-3">
        {/* Professional */}
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg">
            {booking.professionalAvatar ? (
              <Image
                alt={booking.professionalName}
                className="object-cover"
                fill
                sizes="40px"
                src={booking.professionalAvatar}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-rausch-100 to-rausch-200">
                <span className="font-bold text-rausch-600">
                  {booking.professionalName.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p
              className={cn("truncate font-semibold text-neutral-900 text-sm", geistSans.className)}
            >
              {booking.service}
            </p>
            <p className={cn("truncate text-neutral-500 text-xs", geistSans.className)}>
              with {booking.professionalName}
            </p>
          </div>
        </div>

        {/* Date/Time/Price */}
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2 text-neutral-600">
            <HugeiconsIcon className="h-4 w-4" icon={Clock01Icon} />
            <span className={cn("text-sm", geistSans.className)}>
              {booking.date} at {booking.time} ({booking.duration})
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className={cn("text-neutral-500 text-sm", geistSans.className)}>Total</span>
            <span className={cn("font-semibold text-neutral-900", geistSans.className)}>
              {formatCurrency(booking.price, booking.currency)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-3 flex gap-2">
          <Button
            className="flex-1"
            onClick={() => onViewBooking?.(booking.id)}
            size="sm"
            variant="outline"
          >
            View Details
          </Button>
          <Button className="flex-1" onClick={() => onContact?.(booking.id)} size="sm">
            Contact
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Media Picker (for composing messages)
// ============================================================================

type MediaType = "image" | "voice" | "location" | "file";

type MediaPickerProps = {
  onSelectMedia: (type: MediaType) => void;
  className?: string;
};

export function MediaPicker({ onSelectMedia, className }: MediaPickerProps) {
  const mediaOptions: { type: MediaType; icon: typeof Image01Icon; label: string }[] = [
    { type: "image", icon: Image01Icon, label: "Photo" },
    { type: "voice", icon: Mic01Icon, label: "Voice" },
    { type: "location", icon: Location01Icon, label: "Location" },
    { type: "file", icon: File01Icon, label: "File" },
  ];

  return (
    <div className={cn("flex gap-1", className)}>
      {mediaOptions.map((option) => (
        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
          key={option.type}
          onClick={() => onSelectMedia(option.type)}
          title={option.label}
          type="button"
        >
          <HugeiconsIcon className="h-5 w-5" icon={option.icon} />
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// Image Gallery Modal
// ============================================================================

type ImageGalleryProps = {
  images: ImageAttachment[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
};

export function ImageGallery({ images, initialIndex = 0, isOpen, onClose }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  if (!isOpen) {
    return null;
  }

  const currentImage = images[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/95">
      {/* Close button */}
      <button
        className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        onClick={onClose}
        type="button"
      >
        <HugeiconsIcon className="h-5 w-5" icon={Cancel01Icon} />
      </button>

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <button
            className="-translate-y-1/2 absolute top-1/2 left-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            onClick={goToPrevious}
            type="button"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M15 19l-7-7 7-7"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </button>
          <button
            className="-translate-y-1/2 absolute top-1/2 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            onClick={goToNext}
            type="button"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
          </button>
        </>
      )}

      {/* Image */}
      <div className="relative max-h-[90vh] max-w-[90vw]">
        <Image
          alt={currentImage.alt || "Image"}
          className="max-h-[90vh] max-w-[90vw] object-contain"
          height={currentImage.height || 800}
          src={currentImage.url}
          width={currentImage.width || 800}
        />
      </div>

      {/* Image counter */}
      {images.length > 1 && (
        <div className="-translate-x-1/2 absolute bottom-4 left-1/2">
          <span className={cn("text-sm text-white/80", geistSans.className)}>
            {currentIndex + 1} / {images.length}
          </span>
        </div>
      )}
    </div>
  );
}
