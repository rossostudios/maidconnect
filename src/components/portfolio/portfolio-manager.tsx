"use client";

import { useState } from "react";
import type { PortfolioImage } from "@/app/api/professional/portfolio/route";
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
  const [images, setImages] = useState<PortfolioImage[]>(initialImages);
  const [featuredWork, setFeaturedWork] = useState(initialFeaturedWork);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/professional/portfolio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images, featuredWork }),
      });

      if (!response.ok) {
        throw new Error("Failed to update portfolio");
      }

      onUpdate?.(images, featuredWork);
      alert("Portfolio updated successfully!");
    } catch (error) {
      console.error("Failed to update portfolio:", error);
      alert("Failed to update portfolio. Please try again.");
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

  const handleDeleteImage = (id: string) => {
    if (!confirm("Delete this image?")) return;

    const newImages = images
      .filter((img) => img.id !== id)
      .map((img, index) => ({ ...img, order: index }));

    setImages(newImages);
  };

  const handleUpdateCaption = (id: string, caption: string) => {
    setImages(
      images.map((img) => (img.id === id ? { ...img, caption } : img))
    );
    setEditingId(null);
  };

  const handleMoveUp = (id: string) => {
    const index = images.findIndex((img) => img.id === id);
    if (index <= 0) return;

    const newImages = [...images];
    [newImages[index], newImages[index - 1]] = [
      newImages[index - 1],
      newImages[index],
    ];
    newImages.forEach((img, i) => (img.order = i));

    setImages(newImages);
  };

  const handleMoveDown = (id: string) => {
    const index = images.findIndex((img) => img.id === id);
    if (index < 0 || index >= images.length - 1) return;

    const newImages = [...images];
    [newImages[index], newImages[index + 1]] = [
      newImages[index + 1],
      newImages[index],
    ];
    newImages.forEach((img, i) => (img.order = i));

    setImages(newImages);
  };

  const sortedImages = [...images].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      {/* Featured Work */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-[#211f1a]">
          Featured Work Description
        </label>
        <textarea
          value={featuredWork}
          onChange={(e) => setFeaturedWork(e.target.value)}
          placeholder="Describe your specialties and what makes your work unique..."
          rows={3}
          className="w-full rounded-md border border-[#e5dfd4] px-3 py-2 text-sm focus:border-[#ff5d46] focus:outline-none focus:ring-2 focus:ring-[#ff5d46]/20"
        />
        <p className="mt-1 text-xs text-[#7a6d62]">
          This will appear above your portfolio gallery
        </p>
      </div>

      {/* Upload New Images */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-[#211f1a]">
          Upload Portfolio Images
        </h3>
        <ImageUploadDropzone
          onImagesUploaded={handleImagesUploaded}
          maxImages={20 - images.length}
        />
      </div>

      {/* Current Images */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-[#211f1a]">
          Current Images ({images.length})
        </h3>

        {images.length > 0 && (
          <div className="space-y-3">
            {sortedImages.map((image, index) => (
              <div
                key={image.id}
                className="flex gap-3 rounded-lg border border-[#e5dfd4] bg-white p-3"
              >
                {/* Thumbnail */}
                <img
                  src={image.thumbnail_url || image.url}
                  alt={image.caption || `Image ${index + 1}`}
                  className="h-20 w-20 flex-shrink-0 rounded-md object-cover"
                />

                {/* Details */}
                <div className="min-w-0 flex-1">
                  {editingId === image.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        defaultValue={image.caption || ""}
                        placeholder="Add a caption..."
                        onBlur={(e) =>
                          handleUpdateCaption(image.id, e.target.value)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleUpdateCaption(
                              image.id,
                              e.currentTarget.value
                            );
                          }
                        }}
                        className="w-full rounded-md border border-[#e5dfd4] px-2 py-1 text-sm focus:border-[#ff5d46] focus:outline-none"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-[#211f1a]">
                        {image.caption || "(No caption)"}
                      </p>
                      <p className="mt-1 truncate text-xs text-[#7a6d62]">
                        {image.url}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button
                          onClick={() => setEditingId(image.id)}
                          className="text-xs text-[#ff5d46] hover:text-[#eb6c65]"
                        >
                          Edit caption
                        </button>
                        <span className="text-xs text-[#e5dfd4]">•</span>
                        <button
                          onClick={() => handleMoveUp(image.id)}
                          disabled={index === 0}
                          className="text-xs text-[#7a6d62] hover:text-[#ff5d46] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          ↑ Move up
                        </button>
                        <button
                          onClick={() => handleMoveDown(image.id)}
                          disabled={index === sortedImages.length - 1}
                          className="text-xs text-[#7a6d62] hover:text-[#ff5d46] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          ↓ Move down
                        </button>
                        <span className="text-xs text-[#e5dfd4]">•</span>
                        <button
                          onClick={() => handleDeleteImage(image.id)}
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Order Badge */}
                <div className="flex-shrink-0">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#f0ece5] text-xs font-semibold text-[#7a6d62]">
                    {index + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {images.length === 0 && (
          <div className="rounded-lg border border-[#f0ece5] bg-white/90 p-12 text-center">
            <p className="text-2xl">📸</p>
            <p className="mt-2 text-sm font-semibold text-[#211f1a]">
              No portfolio images yet
            </p>
            <p className="mt-1 text-sm text-[#7a6d62]">
              Upload images using the dropzone above to showcase your best work
            </p>
          </div>
        )}
      </div>

      {/* Upload Tips */}
      <div className="rounded-lg border border-[#f0ece5] bg-[#fdfaf6] p-4">
        <h4 className="text-sm font-semibold text-[#211f1a]">
          📸 Portfolio Tips
        </h4>
        <ul className="mt-2 space-y-1 text-sm text-[#7a6d62]">
          <li>• Use high-quality images that showcase your best work</li>
          <li>• Add captions to explain what the project involved</li>
          <li>• Before/after photos are particularly effective</li>
          <li>• Keep your portfolio updated with recent work</li>
          <li>• Aim for 6-12 images for a well-rounded portfolio</li>
        </ul>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <button
          onClick={handleSave}
          disabled={loading}
          className="rounded-md bg-[#ff5d46] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[#eb6c65] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Portfolio"}
        </button>
      </div>
    </div>
  );
}
