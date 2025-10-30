"use client";

import imageCompression from "browser-image-compression";
import { Image as ImageIcon, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";

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
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);
      const remainingSlots = maxImages - images.length;

      if (fileArray.length > remainingSlots) {
        alert(`You can only upload ${remainingSlots} more image(s)`);
        return;
      }

      // Validate file types and sizes
      const validFiles: File[] = [];
      for (const file of fileArray) {
        if (!file.type.startsWith("image/")) {
          alert(`${file.name} is not an image file`);
          continue;
        }

        if (file.size > maxSizeMB * 1024 * 1024) {
          alert(`${file.name} is larger than ${maxSizeMB}MB`);
          continue;
        }

        validFiles.push(file);
      }

      if (validFiles.length === 0) return;

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
    if (images.length === 0) return;

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
      images.forEach((img) => URL.revokeObjectURL(img.preview));
      setImages([]);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload images. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition ${
          dragging
            ? "border-[#ff5d46] bg-[#ff5d46]/5"
            : "border-[#ebe5d8] hover:border-[#ff5d46] hover:bg-[#fbfaf9]"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-3">
          <div className="rounded-full bg-[#ff5d46]/10 p-4">
            <Upload className="h-8 w-8 text-[#ff5d46]" />
          </div>

          <div>
            <p className="text-base font-semibold text-[#211f1a]">
              Drop images here or click to browse
            </p>
            <p className="mt-1 text-sm text-[#7d7566]">
              JPEG, PNG, WebP • Max {maxSizeMB}MB per image • Up to {maxImages} images
            </p>
          </div>
        </div>
      </div>

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[#211f1a]">
              {images.length} image{images.length !== 1 ? "s" : ""} ready to upload
            </p>
            <button
              onClick={() => {
                images.forEach((img) => URL.revokeObjectURL(img.preview));
                setImages([]);
              }}
              className="text-sm text-[#7d7566] hover:text-[#ff5d46]"
            >
              Clear all
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {images.map((image) => (
              <div
                key={image.id}
                className="group relative overflow-hidden rounded-xl border border-[#ebe5d8] bg-white"
              >
                {/* Image */}
                <div className="aspect-square overflow-hidden">
                  <img src={image.preview} alt="Preview" className="h-full w-full object-cover" />
                </div>

                {/* Caption Input */}
                <div className="p-2">
                  <input
                    type="text"
                    placeholder="Add caption (optional)"
                    value={image.caption || ""}
                    onChange={(e) => updateCaption(image.id, e.target.value)}
                    className="w-full rounded-lg border border-[#ebe5d8] px-2 py-1 text-xs focus:border-[#ff5d46] focus:outline-none focus:ring-1 focus:ring-[#ff5d46]"
                  />
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeImage(image.id)}
                  className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 opacity-0 shadow-lg transition hover:bg-red-500 hover:text-white group-hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={uploading || images.length === 0}
            className="w-full rounded-xl bg-[#ff5d46] px-6 py-3 text-base font-semibold text-white shadow-[0_6px_18px_rgba(255,93,70,0.22)] transition hover:bg-[#eb6c65] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
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
        <div className="rounded-xl bg-[#fbfaf9] p-4">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-[#211f1a]">
            <ImageIcon className="h-4 w-4" />
            Image Tips
          </h4>
          <ul className="mt-2 space-y-1 text-sm text-[#7d7566]">
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
