"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import type { PortfolioImage } from "@/app/api/professional/portfolio/route";
import { geistSans } from "@/app/fonts";
import { confirm } from "@/lib/toast";
import { cn } from "@/lib/utils/core";
import { ImageUploadDropzone } from "./image-upload-dropzone";

type Props = {
  images: PortfolioImage[];
  featuredWork?: string;
  onUpdate?: (images: PortfolioImage[], featuredWork?: string) => void;
};

/**
 * Professional interface to manage portfolio gallery
 * Add, reorder, edit captions, and delete images
 */
export function PortfolioManager({
  images: initialImages,
  featuredWork: initialFeaturedWork = "",
  onUpdate,
}: Props) {
  const t = useTranslations("dashboard.pro.portfolioManager");
  const [images, setImages] = useState<PortfolioImage[]>(initialImages);
  const [featuredWork, setFeaturedWork] = useState(initialFeaturedWork);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);

    const savePromise = fetch("/api/professional/portfolio", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ images, featuredWork }),
    }).then(async (response) => {
      if (!response.ok) {
        throw new Error("Failed to update portfolio");
      }
      return response;
    });

    try {
      await toast.promise(savePromise, {
        loading: "Saving portfolio...",
        success: t("success"),
        error: (error) => error.message || t("error"),
      });
      onUpdate?.(images, featuredWork);
    } catch (error) {
      console.error("Failed to update portfolio:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImagesUploaded = (uploadedImages: { url: string; caption?: string }[]) => {
    const newImages: PortfolioImage[] = uploadedImages.map((img, index) => ({
      id: crypto.randomUUID(),
      url: img.url,
      caption: img.caption,
      order: images.length + index,
      created_at: new Date().toISOString(),
    }));

    setImages([...images, ...newImages]);
  };

  const handleDeleteImage = async (id: string) => {
    const confirmed = await confirm(t("deleteConfirm"), "Delete Image");
    if (!confirmed) {
      return;
    }

    const newImages = images
      .filter((img) => img.id !== id)
      .map((img, index) => ({ ...img, order: index }));

    setImages(newImages);
  };

  const handleUpdateCaption = (id: string, caption: string) => {
    setImages(images.map((img) => (img.id === id ? { ...img, caption } : img)));
    setEditingId(null);
  };

  const handleMoveUp = (id: string) => {
    const index = images.findIndex((img) => img.id === id);
    if (index <= 0) {
      return;
    }

    const newImages = [...images];
    const current = newImages[index];
    const previous = newImages[index - 1];

    if (current && previous) {
      [newImages[index], newImages[index - 1]] = [previous, current];
      for (let i = 0; i < newImages.length; i++) {
        const img = newImages[i];
        if (img) {
          img.order = i;
        }
      }
      setImages(newImages);
    }
  };

  const handleMoveDown = (id: string) => {
    const index = images.findIndex((img) => img.id === id);
    if (index < 0 || index >= images.length - 1) {
      return;
    }

    const newImages = [...images];
    const current = newImages[index];
    const next = newImages[index + 1];

    if (current && next) {
      [newImages[index], newImages[index + 1]] = [next, current];
      for (let i = 0; i < newImages.length; i++) {
        const img = newImages[i];
        if (img) {
          img.order = i;
        }
      }
      setImages(newImages);
    }
  };

  const sortedImages = [...images].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      {/* Featured Work */}
      <div>
        <label
          className={cn("mb-2 block font-semibold text-foreground text-sm", geistSans.className)}
          htmlFor="featured-work"
        >
          {t("fields.description.label")}
        </label>
        <textarea
          className={cn(
            "w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-foreground text-sm",
            "focus:border-rausch-500 focus:outline-none focus:ring-2 focus:ring-rausch-500/20",
            "dark:border-neutral-700 dark:bg-neutral-800",
            geistSans.className
          )}
          id="featured-work"
          onChange={(e) => setFeaturedWork(e.target.value)}
          placeholder={t("fields.description.placeholder")}
          rows={3}
          value={featuredWork}
        />
        <p className={cn("mt-1 text-muted-foreground text-xs", geistSans.className)}>
          {t("fields.description.helper")}
        </p>
      </div>

      {/* Upload New Images */}
      <div>
        <h3 className={cn("mb-3 font-semibold text-foreground text-sm", geistSans.className)}>
          {t("upload.title")}
        </h3>
        <ImageUploadDropzone
          maxImages={20 - images.length}
          onImagesUploaded={handleImagesUploaded}
        />
      </div>

      {/* Current Images */}
      <div>
        <h3 className={cn("mb-3 font-semibold text-foreground text-sm", geistSans.className)}>
          {t("upload.currentImages", { count: images.length })}
        </h3>

        {images.length > 0 && (
          <div className="space-y-3">
            {sortedImages.map((image, index) => (
              <div
                className="flex gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-800"
                key={image.id}
              >
                {/* Thumbnail */}
                <Image
                  alt={image.caption || `Image ${index + 1}`}
                  className="h-20 w-20 flex-shrink-0 object-cover"
                  height={80}
                  loading="lazy"
                  src={image.thumbnail_url || image.url}
                  width={80}
                />

                {/* Details */}
                <div className="min-w-0 flex-1">
                  {editingId === image.id ? (
                    <div className="space-y-2">
                      <input
                        autoFocus
                        className={cn(
                          "w-full rounded-lg border border-neutral-200 bg-white px-2 py-1 text-foreground text-sm",
                          "focus:border-rausch-500 focus:outline-none focus:ring-2 focus:ring-rausch-500/20",
                          "dark:border-neutral-700 dark:bg-neutral-900",
                          geistSans.className
                        )}
                        defaultValue={image.caption || ""}
                        onBlur={(e) => handleUpdateCaption(image.id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleUpdateCaption(image.id, e.currentTarget.value);
                          }
                        }}
                        placeholder={t("actions.editCaption")}
                        type="text"
                      />
                    </div>
                  ) : (
                    <>
                      <p
                        className={cn("font-semibold text-foreground text-sm", geistSans.className)}
                      >
                        {image.caption || "(No caption)"}
                      </p>
                      <p
                        className={cn(
                          "mt-1 truncate text-muted-foreground text-xs",
                          geistSans.className
                        )}
                      >
                        {image.url}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button
                          className={cn(
                            "text-muted-foreground text-xs hover:text-foreground",
                            geistSans.className
                          )}
                          onClick={() => setEditingId(image.id)}
                          type="button"
                        >
                          {t("actions.editCaption")}
                        </button>
                        <span className="text-neutral-300 text-xs dark:text-neutral-600">•</span>
                        <button
                          className={cn(
                            "text-muted-foreground text-xs hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50",
                            geistSans.className
                          )}
                          disabled={index === 0}
                          onClick={() => handleMoveUp(image.id)}
                          type="button"
                        >
                          {t("actions.moveUp")}
                        </button>
                        <button
                          className={cn(
                            "text-muted-foreground text-xs hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50",
                            geistSans.className
                          )}
                          disabled={index === sortedImages.length - 1}
                          onClick={() => handleMoveDown(image.id)}
                          type="button"
                        >
                          {t("actions.moveDown")}
                        </button>
                        <span className="text-neutral-300 text-xs dark:text-neutral-600">•</span>
                        <button
                          className={cn(
                            "text-muted-foreground text-xs hover:text-foreground",
                            geistSans.className
                          )}
                          onClick={() => handleDeleteImage(image.id)}
                          type="button"
                        >
                          {t("actions.delete")}
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Order Badge */}
                <div className="flex-shrink-0">
                  <span
                    className={cn(
                      "inline-flex h-6 w-6 items-center justify-center rounded bg-neutral-200 font-semibold text-neutral-700 text-xs dark:bg-neutral-700 dark:text-neutral-300",
                      geistSans.className
                    )}
                  >
                    {index + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {images.length === 0 && (
          <div className="rounded-lg border-2 border-neutral-200 border-dashed bg-neutral-50 p-12 text-center dark:border-neutral-700 dark:bg-neutral-800/50">
            <p className="text-2xl">📸</p>
            <p className={cn("mt-2 font-semibold text-foreground text-sm", geistSans.className)}>
              {t("emptyState.title")}
            </p>
            <p className={cn("mt-1 text-muted-foreground text-sm", geistSans.className)}>
              {t("emptyState.description")}
            </p>
          </div>
        )}
      </div>

      {/* Upload Tips */}
      <div className="rounded-lg border border-babu-200 bg-babu-50 p-4 dark:border-babu-500/30 dark:bg-babu-500/10">
        <h4
          className={cn(
            "font-semibold text-babu-900 text-sm dark:text-babu-400",
            geistSans.className
          )}
        >
          📸 {t("tips.title")}
        </h4>
        <ul
          className={cn(
            "mt-2 space-y-1 text-babu-700 text-sm dark:text-babu-300",
            geistSans.className
          )}
        >
          <li>• {t("tips.tip1")}</li>
          <li>• {t("tips.tip2")}</li>
          <li>• {t("tips.tip3")}</li>
          <li>• {t("tips.tip4")}</li>
          <li>• {t("tips.tip5")}</li>
        </ul>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <button
          className={cn(
            "rounded-lg border border-rausch-500 bg-rausch-500 px-6 py-2 font-semibold text-sm text-white transition",
            "hover:border-rausch-600 hover:bg-rausch-600",
            "disabled:cursor-not-allowed disabled:border-neutral-300 disabled:bg-neutral-300 disabled:text-neutral-500",
            "dark:disabled:border-neutral-700 dark:disabled:bg-neutral-700 dark:disabled:text-neutral-400",
            geistSans.className
          )}
          disabled={loading}
          onClick={handleSave}
          type="button"
        >
          {loading ? t("saving") : t("save")}
        </button>
      </div>
    </div>
  );
}
