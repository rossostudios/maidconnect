"use client";

import { Cancel01Icon, Image01Icon as ImageIcon, Upload01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import imageCompression from "browser-image-compression";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { toast } from "@/lib/toast";

type UploadedImage = {
  id: string;
  file: File;
  preview: string;
  caption?: string;
  uploading?: boolean;
  progress?: number;
};

type Props = {
  onImagesUploaded: (images: { url: string; caption?: string }[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
};

export function ImageUploadDropzone({ onImagesUploaded, maxImages = 20, maxSizeMB = 5 }: Props) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) {
        return;
      }

      const fileArray = Array.from(files);
      const remainingSlots = maxImages - images.length;

      if (fileArray.length > remainingSlots) {
        toast.warning(`You can only upload ${remainingSlots} more image(s)`);
        return;
      }

      // Validate file types and sizes
      const validFiles: File[] = [];
      for (const file of fileArray) {
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not an image file`);
          continue;
        }

        if (file.size > maxSizeMB * 1024 * 1024) {
          toast.warning(`${file.name} is larger than ${maxSizeMB}MB`);
          continue;
        }

        validFiles.push(file);
      }

      if (validFiles.length === 0) {
        return;
      }

      // Create preview images
      const newImages: UploadedImage[] = await Promise.all(
        validFiles.map(async (file) => {
          // Compress image
          const compressedFile = await imageCompression(file, {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          });

          const preview = URL.createObjectURL(compressedFile);

          return {
            id: crypto.randomUUID(),
            file: compressedFile,
            preview,
            uploading: false,
          };
        })
      );

      setImages((prev) => [...prev, ...newImages]);
    },
    [images.length, maxImages, maxSizeMB]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragging(false);
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter((img) => img.id !== id);
    });
  }, []);

  const updateCaption = useCallback((id: string, caption: string) => {
    setImages((prev) => prev.map((img) => (img.id === id ? { ...img, caption } : img)));
  }, []);

  const handleUpload = async () => {
    if (images.length === 0) {
      return;
    }

    setUploading(true);

    try {
      const uploadedImages: { url: string; caption?: string }[] = [];

      for (const image of images) {
        // Create FormData for upload
        const formData = new FormData();
        formData.append("file", image.file);

        // Upload to API
        const response = await fetch("/api/professional/portfolio/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to upload image");
        }

        const data = await response.json();
        uploadedImages.push({
          url: data.url,
          caption: image.caption,
        });
      }

      onImagesUploaded(uploadedImages);

      // Clear images after successful upload
      for (const img of images) {
        URL.revokeObjectURL(img.preview);
      }
      setImages([]);
    } catch (error) {
      console.error("Failed to upload images:", error);
      toast.error("Failed to upload images. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition ${
          dragging
            ? "border-[#64748b] bg-[#64748b]/5"
            : "border-[#e2e8f0] hover:border-[#64748b] hover:bg-[#f8fafc]"
        }`}
        onClick={() => fileInputRef.current?.click()}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
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
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          ref={fileInputRef}
          type="file"
        />

        <div className="flex flex-col items-center gap-3">
          <div className="rounded-full bg-[#64748b]/10 p-4">
            <HugeiconsIcon className="h-8 w-8 text-[#64748b]" icon={Upload01Icon} />
          </div>

          <div>
            <p className="font-semibold text-[#0f172a] text-base">
              Drop images here or click to browse
            </p>
            <p className="mt-1 text-[#94a3b8] text-sm">
              JPEG, PNG, WebP • Max {maxSizeMB}MB per image • Up to {maxImages} images
            </p>
          </div>
        </div>
      </div>

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-[#0f172a] text-sm">
              {images.length} image{images.length !== 1 ? "s" : ""} ready to upload
            </p>
            <button
              className="text-[#94a3b8] text-sm hover:text-[#64748b]"
              onClick={() => {
                for (const img of images) {
                  URL.revokeObjectURL(img.preview);
                }
                setImages([]);
              }}
              type="button"
            >
              Clear all
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {images.map((image) => (
              <div
                className="group relative overflow-hidden rounded-xl border border-[#e2e8f0] bg-[#f8fafc]"
                key={image.id}
              >
                {/* Image */}
                <div className="aspect-square overflow-hidden">
                  <Image
                    alt="Preview"
                    className="h-full w-full object-cover"
                    height={200}
                    loading="lazy"
                    src={image.preview}
                    width={200}
                  />
                </div>

                {/* Caption Input */}
                <div className="p-2">
                  <input
                    className="w-full rounded-lg border border-[#e2e8f0] px-2 py-1 text-xs focus:border-[#64748b] focus:outline-none focus:ring-1 focus:ring-[#64748b]"
                    onChange={(e) => updateCaption(image.id, e.target.value)}
                    placeholder="Add caption (optional)"
                    type="text"
                    value={image.caption || ""}
                  />
                </div>

                {/* Remove Button */}
                <button
                  className="absolute top-2 right-2 rounded-full bg-[#f8fafc]/90 p-1.5 opacity-0 shadow-lg transition hover:bg-[#64748b]/100 hover:text-[#f8fafc] group-hover:opacity-100"
                  onClick={() => removeImage(image.id)}
                  type="button"
                >
                  <HugeiconsIcon className="h-4 w-4" icon={Cancel01Icon} />
                </button>
              </div>
            ))}
          </div>

          {/* Upload Button */}
          <button
            className="w-full rounded-xl bg-[#64748b] px-6 py-3 font-semibold text-[#f8fafc] text-base shadow-[0_6px_18px_rgba(244,74,34,0.22)] transition hover:bg-[#64748b] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={uploading || images.length === 0}
            onClick={handleUpload}
            type="button"
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                  <title>Loading spinner</title>
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    fill="none"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    fill="currentColor"
                  />
                </svg>
                Uploading...
              </span>
            ) : (
              `Upload ${images.length} Image${images.length !== 1 ? "s" : ""}`
            )}
          </button>
        </div>
      )}

      {/* Tips */}
      {images.length === 0 && (
        <div className="rounded-xl bg-[#f8fafc] p-4">
          <h4 className="flex items-center gap-2 font-semibold text-[#0f172a] text-sm">
            <HugeiconsIcon className="h-4 w-4" icon={ImageIcon} />
            Image Tips
          </h4>
          <ul className="mt-2 space-y-1 text-[#94a3b8] text-sm">
            <li>• Use clear, well-lit photos</li>
            <li>• Before/after shots work great</li>
            <li>• Images will be automatically compressed</li>
            <li>• Show variety in your work</li>
          </ul>
        </div>
      )}
    </div>
  );
}
