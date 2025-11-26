"use client";

/**
 * BeforeAfterUploadCard - Upload Before/After Transformation Pairs
 *
 * Modal interface for uploading before/after image pairs.
 * Essential feature for home service professionals to showcase transformations.
 *
 * Following Lia Design System:
 * - rounded-lg containers
 * - rausch-500 primary accent
 * - neutral color palette
 */

import imageCompression from "browser-image-compression";
import { Cancel01Icon, Image01Icon, Loading03Icon, Upload01Icon } from "hugeicons-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCallback, useRef, useState } from "react";
import { geistSans } from "@/app/fonts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils/core";

// ============================================================================
// Types
// ============================================================================

export type BeforeAfterPair = {
  id: string;
  beforeUrl: string;
  afterUrl: string;
  beforeThumbnail?: string;
  afterThumbnail?: string;
  caption?: string;
  projectType?: string;
  order: number;
  createdAt: string;
};

type ImageSlot = {
  file: File | null;
  preview: string | null;
  uploading: boolean;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPairCreated: (pair: BeforeAfterPair) => void;
  existingPairsCount: number;
  maxSizeMB?: number;
};

// ============================================================================
// Project Type Options
// ============================================================================

const PROJECT_TYPES = [
  { value: "deep_cleaning", label: "Deep Cleaning" },
  { value: "organization", label: "Organization" },
  { value: "garden_landscaping", label: "Garden/Landscaping" },
  { value: "repair_maintenance", label: "Repair/Maintenance" },
  { value: "painting", label: "Painting" },
  { value: "renovation", label: "Renovation" },
  { value: "other", label: "Other" },
] as const;

// ============================================================================
// Image Dropzone Slot
// ============================================================================

type DropzoneSlotProps = {
  label: string;
  image: ImageSlot;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
  maxSizeMB: number;
};

function DropzoneSlot({ label, image, onFileSelect, onRemove, maxSizeMB }: DropzoneSlotProps) {
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) {
        return;
      }

      const file = files[0];
      if (!file) {
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.warning(`Image must be smaller than ${maxSizeMB}MB`);
        return;
      }

      // Compress image
      try {
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        });
        onFileSelect(compressedFile);
      } catch (error) {
        console.error("Failed to compress image:", error);
        onFileSelect(file);
      }
    },
    [maxSizeMB, onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  if (image.preview) {
    return (
      <div className="relative aspect-square overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800">
        <Image
          alt={label}
          className="object-cover"
          fill
          sizes="(max-width: 768px) 50vw, 200px"
          src={image.preview}
        />
        <button
          className="absolute top-2 right-2 rounded-full bg-white/90 p-1.5 shadow-lg transition hover:bg-red-50 dark:bg-neutral-800/90 dark:hover:bg-red-900/50"
          onClick={onRemove}
          type="button"
        >
          <Cancel01Icon className="h-4 w-4 text-red-500" />
        </button>
        <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent p-3">
          <span className={cn("font-semibold text-sm text-white", geistSans.className)}>
            {label}
          </span>
        </div>
        {image.uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loading03Icon className="h-8 w-8 animate-spin text-white" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 text-center transition",
        dragging
          ? "border-rausch-500 bg-rausch-50 dark:bg-rausch-500/10"
          : "border-neutral-300 bg-neutral-50 hover:border-rausch-400 hover:bg-rausch-50/50 dark:border-neutral-600 dark:bg-neutral-800 dark:hover:border-rausch-400 dark:hover:bg-rausch-500/10"
      )}
      onClick={() => fileInputRef.current?.click()}
      onDragLeave={() => setDragging(false)}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDrop={handleDrop}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          fileInputRef.current?.click();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <input
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        ref={fileInputRef}
        type="file"
      />
      <div className="rounded-full bg-neutral-200 p-3 dark:bg-neutral-700">
        <Upload01Icon className="h-6 w-6 text-neutral-500 dark:text-neutral-400" />
      </div>
      <p className={cn("mt-3 font-semibold text-foreground text-sm", geistSans.className)}>
        {label}
      </p>
      <p className={cn("mt-1 text-muted-foreground text-xs", geistSans.className)}>
        Drop or click to upload
      </p>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function BeforeAfterUploadCard({
  open,
  onOpenChange,
  onPairCreated,
  existingPairsCount,
  maxSizeMB = 5,
}: Props) {
  const t = useTranslations("dashboard.pro.portfolio.beforeAfter");
  const [beforeImage, setBeforeImage] = useState<ImageSlot>({
    file: null,
    preview: null,
    uploading: false,
  });
  const [afterImage, setAfterImage] = useState<ImageSlot>({
    file: null,
    preview: null,
    uploading: false,
  });
  const [caption, setCaption] = useState("");
  const [projectType, setProjectType] = useState("");
  const [saving, setSaving] = useState(false);

  const resetForm = useCallback(() => {
    if (beforeImage.preview) {
      URL.revokeObjectURL(beforeImage.preview);
    }
    if (afterImage.preview) {
      URL.revokeObjectURL(afterImage.preview);
    }
    setBeforeImage({ file: null, preview: null, uploading: false });
    setAfterImage({ file: null, preview: null, uploading: false });
    setCaption("");
    setProjectType("");
  }, [beforeImage.preview, afterImage.preview]);

  const handleBeforeSelect = useCallback((file: File) => {
    const preview = URL.createObjectURL(file);
    setBeforeImage({ file, preview, uploading: false });
  }, []);

  const handleAfterSelect = useCallback((file: File) => {
    const preview = URL.createObjectURL(file);
    setAfterImage({ file, preview, uploading: false });
  }, []);

  const handleRemoveBefore = useCallback(() => {
    if (beforeImage.preview) {
      URL.revokeObjectURL(beforeImage.preview);
    }
    setBeforeImage({ file: null, preview: null, uploading: false });
  }, [beforeImage.preview]);

  const handleRemoveAfter = useCallback(() => {
    if (afterImage.preview) {
      URL.revokeObjectURL(afterImage.preview);
    }
    setAfterImage({ file: null, preview: null, uploading: false });
  }, [afterImage.preview]);

  const handleSave = async () => {
    if (!(beforeImage.file && afterImage.file)) {
      toast.error("Please upload both before and after images");
      return;
    }

    setSaving(true);
    setBeforeImage((prev) => ({ ...prev, uploading: true }));
    setAfterImage((prev) => ({ ...prev, uploading: true }));

    try {
      // Upload before image
      const beforeFormData = new FormData();
      beforeFormData.append("file", beforeImage.file);
      const beforeRes = await fetch("/api/professional/portfolio/upload", {
        method: "POST",
        body: beforeFormData,
      });
      if (!beforeRes.ok) {
        throw new Error("Failed to upload before image");
      }
      const beforeData = await beforeRes.json();

      // Upload after image
      const afterFormData = new FormData();
      afterFormData.append("file", afterImage.file);
      const afterRes = await fetch("/api/professional/portfolio/upload", {
        method: "POST",
        body: afterFormData,
      });
      if (!afterRes.ok) {
        throw new Error("Failed to upload after image");
      }
      const afterData = await afterRes.json();

      // Create the pair
      const pair: BeforeAfterPair = {
        id: crypto.randomUUID(),
        beforeUrl: beforeData.url,
        afterUrl: afterData.url,
        beforeThumbnail: beforeData.thumbnailUrl,
        afterThumbnail: afterData.thumbnailUrl,
        caption: caption.trim() || undefined,
        projectType: projectType || undefined,
        order: existingPairsCount,
        createdAt: new Date().toISOString(),
      };

      onPairCreated(pair);
      toast.success(t("uploadSuccess"));
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create before/after pair:", error);
      toast.error(t("uploadError"));
    } finally {
      setSaving(false);
      setBeforeImage((prev) => ({ ...prev, uploading: false }));
      setAfterImage((prev) => ({ ...prev, uploading: false }));
    }
  };

  const canSave = beforeImage.file && afterImage.file && !saving;

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className={cn("text-xl", geistSans.className)}>{t("title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Image Dropzones */}
          <div className="grid grid-cols-2 gap-4">
            <DropzoneSlot
              image={beforeImage}
              label={t("beforeLabel")}
              maxSizeMB={maxSizeMB}
              onFileSelect={handleBeforeSelect}
              onRemove={handleRemoveBefore}
            />
            <DropzoneSlot
              image={afterImage}
              label={t("afterLabel")}
              maxSizeMB={maxSizeMB}
              onFileSelect={handleAfterSelect}
              onRemove={handleRemoveAfter}
            />
          </div>

          {/* Caption */}
          <div>
            <label
              className={cn(
                "mb-2 block font-semibold text-foreground text-sm",
                geistSans.className
              )}
              htmlFor="caption"
            >
              {t("captionLabel")}
            </label>
            <input
              className={cn(
                "w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-foreground text-sm placeholder:text-muted-foreground",
                "focus:border-rausch-500 focus:outline-none focus:ring-2 focus:ring-rausch-500/20",
                "dark:border-neutral-700 dark:bg-neutral-800",
                geistSans.className
              )}
              id="caption"
              maxLength={200}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={t("captionPlaceholder")}
              type="text"
              value={caption}
            />
            <p className={cn("mt-1 text-muted-foreground text-xs", geistSans.className)}>
              {t("captionHelper")}
            </p>
          </div>

          {/* Project Type */}
          <div>
            <label
              className={cn(
                "mb-2 block font-semibold text-foreground text-sm",
                geistSans.className
              )}
              htmlFor="projectType"
            >
              {t("projectTypeLabel")}
            </label>
            <select
              className={cn(
                "w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-foreground text-sm",
                "focus:border-rausch-500 focus:outline-none focus:ring-2 focus:ring-rausch-500/20",
                "dark:border-neutral-700 dark:bg-neutral-800",
                geistSans.className
              )}
              id="projectType"
              onChange={(e) => setProjectType(e.target.value)}
              value={projectType}
            >
              <option value="">{t("selectProjectType")}</option>
              {PROJECT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Tips */}
          <div className="rounded-lg bg-babu-50 p-4 dark:bg-babu-500/10">
            <h4
              className={cn(
                "flex items-center gap-2 font-semibold text-babu-900 text-sm dark:text-babu-400",
                geistSans.className
              )}
            >
              <Image01Icon className="h-4 w-4" />
              {t("tipsTitle")}
            </h4>
            <ul
              className={cn(
                "mt-2 space-y-1 text-babu-700 text-sm dark:text-babu-300",
                geistSans.className
              )}
            >
              <li>• {t("tip1")}</li>
              <li>• {t("tip2")}</li>
              <li>• {t("tip3")}</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-neutral-200 border-t pt-4 dark:border-neutral-700">
            <button
              className={cn(
                "rounded-lg border border-neutral-200 bg-white px-6 py-2.5 font-semibold text-neutral-700 text-sm transition",
                "hover:bg-neutral-50",
                "dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700",
                geistSans.className
              )}
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              type="button"
            >
              {t("cancel")}
            </button>
            <button
              className={cn(
                "rounded-lg bg-rausch-500 px-6 py-2.5 font-semibold text-sm text-white transition",
                "hover:bg-rausch-600",
                "disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500",
                "dark:disabled:bg-neutral-700 dark:disabled:text-neutral-500",
                geistSans.className
              )}
              disabled={!canSave}
              onClick={handleSave}
              type="button"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <Loading03Icon className="h-4 w-4 animate-spin" />
                  {t("saving")}
                </span>
              ) : (
                t("savePair")
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
