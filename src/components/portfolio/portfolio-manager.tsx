"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import type { PortfolioImage } from "@/app/api/professional/portfolio/route";
import { confirm } from "@/lib/toast";
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
        <label className="mb-2 block font-semibold text-[#0f172a] text-sm" htmlFor="featured-work">
          {t("fields.description.label")}
        </label>
        <textarea
          className="w-full rounded-md border border-[#e2e8f0] px-3 py-2 text-sm focus:border-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#64748b]/20"
          id="featured-work"
          onChange={(e) => setFeaturedWork(e.target.value)}
          placeholder={t("fields.description.placeholder")}
          rows={3}
          value={featuredWork}
        />
        <p className="mt-1 text-[#94a3b8] text-xs">{t("fields.description.helper")}</p>
      </div>

      {/* Upload New Images */}
      <div>
        <h3 className="mb-3 font-semibold text-[#0f172a] text-sm">{t("upload.title")}</h3>
        <ImageUploadDropzone
          maxImages={20 - images.length}
          onImagesUploaded={handleImagesUploaded}
        />
      </div>

      {/* Current Images */}
      <div>
        <h3 className="mb-3 font-semibold text-[#0f172a] text-sm">
          {t("upload.currentImages", { count: images.length })}
        </h3>

        {images.length > 0 && (
          <div className="space-y-3">
            {sortedImages.map((image, index) => (
              <div
                className="flex gap-3 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3"
                key={image.id}
              >
                {/* Thumbnail */}
                <Image
                  alt={image.caption || `Image ${index + 1}`}
                  className="h-20 w-20 flex-shrink-0 rounded-md object-cover"
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
                        className="w-full rounded-md border border-[#e2e8f0] px-2 py-1 text-sm focus:border-[#64748b] focus:outline-none"
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
                      <p className="font-semibold text-[#0f172a] text-sm">
                        {image.caption || "(No caption)"}
                      </p>
                      <p className="mt-1 truncate text-[#94a3b8] text-xs">{image.url}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button
                          className="text-[#64748b] text-xs hover:text-[#64748b]"
                          onClick={() => setEditingId(image.id)}
                          type="button"
                        >
                          {t("actions.editCaption")}
                        </button>
                        <span className="text-[#e2e8f0] text-xs">•</span>
                        <button
                          className="text-[#94a3b8] text-xs hover:text-[#64748b] disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={index === 0}
                          onClick={() => handleMoveUp(image.id)}
                          type="button"
                        >
                          {t("actions.moveUp")}
                        </button>
                        <button
                          className="text-[#94a3b8] text-xs hover:text-[#64748b] disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={index === sortedImages.length - 1}
                          onClick={() => handleMoveDown(image.id)}
                          type="button"
                        >
                          {t("actions.moveDown")}
                        </button>
                        <span className="text-[#e2e8f0] text-xs">•</span>
                        <button
                          className="text-[#64748b] text-xs hover:text-[#64748b]"
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
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#e2e8f0] font-semibold text-[#94a3b8] text-xs">
                    {index + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {images.length === 0 && (
          <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc]/90 p-12 text-center">
            <p className="text-2xl">📸</p>
            <p className="mt-2 font-semibold text-[#0f172a] text-sm">{t("emptyState.title")}</p>
            <p className="mt-1 text-[#94a3b8] text-sm">{t("emptyState.description")}</p>
          </div>
        )}
      </div>

      {/* Upload Tips */}
      <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-4">
        <h4 className="font-semibold text-[#0f172a] text-sm">📸 {t("tips.title")}</h4>
        <ul className="mt-2 space-y-1 text-[#94a3b8] text-sm">
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
          className="rounded-md bg-[#64748b] px-6 py-2 font-semibold text-[#f8fafc] text-sm transition hover:bg-[#64748b] disabled:cursor-not-allowed disabled:opacity-50"
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
