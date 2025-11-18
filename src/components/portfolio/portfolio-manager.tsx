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
          className={cn("mb-2 block font-semibold text-neutral-900 text-sm", geistSans.className)}
          htmlFor="featured-work"
        >
          {t("fields.description.label")}
        </label>
        <textarea
          className={cn(
            "w-full border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/20",
            geistSans.className
          )}
          id="featured-work"
          onChange={(e) => setFeaturedWork(e.target.value)}
          placeholder={t("fields.description.placeholder")}
          rows={3}
          value={featuredWork}
        />
        <p className={cn("mt-1 text-neutral-700 text-xs", geistSans.className)}>
          {t("fields.description.helper")}
        </p>
      </div>

      {/* Upload New Images */}
      <div>
        <h3 className={cn("mb-3 font-semibold text-neutral-900 text-sm", geistSans.className)}>
          {t("upload.title")}
        </h3>
        <ImageUploadDropzone
          maxImages={20 - images.length}
          onImagesUploaded={handleImagesUploaded}
        />
      </div>

      {/* Current Images */}
      <div>
        <h3 className={cn("mb-3 font-semibold text-neutral-900 text-sm", geistSans.className)}>
          {t("upload.currentImages", { count: images.length })}
        </h3>

        {images.length > 0 && (
          <div className="space-y-3">
            {sortedImages.map((image, index) => (
              <div
                className="flex gap-3 border border-neutral-200 bg-neutral-50 p-3"
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
                          "w-full border border-neutral-200 px-2 py-1 text-sm focus:border-neutral-900 focus:outline-none",
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
                        className={cn(
                          "font-semibold text-neutral-900 text-sm",
                          geistSans.className
                        )}
                      >
                        {image.caption || "(No caption)"}
                      </p>
                      <p
                        className={cn(
                          "mt-1 truncate text-neutral-700 text-xs",
                          geistSans.className
                        )}
                      >
                        {image.url}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button
                          className={cn(
                            "text-neutral-700 text-xs hover:text-neutral-900",
                            geistSans.className
                          )}
                          onClick={() => setEditingId(image.id)}
                          type="button"
                        >
                          {t("actions.editCaption")}
                        </button>
                        <span className="text-neutral-200 text-xs">•</span>
                        <button
                          className={cn(
                            "text-neutral-700 text-xs hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-50",
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
                            "text-neutral-700 text-xs hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-50",
                            geistSans.className
                          )}
                          disabled={index === sortedImages.length - 1}
                          onClick={() => handleMoveDown(image.id)}
                          type="button"
                        >
                          {t("actions.moveDown")}
                        </button>
                        <span className="text-neutral-200 text-xs">•</span>
                        <button
                          className={cn(
                            "text-neutral-700 text-xs hover:text-neutral-900",
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
                      "inline-flex h-6 w-6 items-center justify-center bg-neutral-200 font-semibold text-neutral-700 text-xs",
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
          <div className="border border-neutral-200 bg-neutral-50 p-12 text-center">
            <p className="text-2xl">📸</p>
            <p className={cn("mt-2 font-semibold text-neutral-900 text-sm", geistSans.className)}>
              {t("emptyState.title")}
            </p>
            <p className={cn("mt-1 text-neutral-700 text-sm", geistSans.className)}>
              {t("emptyState.description")}
            </p>
          </div>
        )}
      </div>

      {/* Upload Tips */}
      <div className="border border-neutral-200 bg-neutral-50 p-4">
        <h4 className={cn("font-semibold text-neutral-900 text-sm", geistSans.className)}>
          📸 {t("tips.title")}
        </h4>
        <ul className={cn("mt-2 space-y-1 text-neutral-700 text-sm", geistSans.className)}>
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
            "border border-[#FF5200] bg-[#FF5200] px-6 py-2 font-semibold text-sm text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:border-orange-200 disabled:bg-orange-200 disabled:text-neutral-700",
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
