"use client";

/**
 * PortfolioDashboard - Single Scrolling Portfolio Management
 *
 * Replaces the three-tab structure with a unified scrolling experience.
 * Airbnb-inspired design with gamified progress header.
 *
 * Sections:
 * - Portfolio Completeness Header (gamified progress)
 * - Featured Work (highlight best work)
 * - Before/After Transformations
 * - Work Gallery
 *
 * Note: Credentials and Trust Profile have been moved to Settings > Verification
 *
 * Following Lia Design System:
 * - rounded-lg containers
 * - rausch-500 primary accent
 * - neutral color palette
 */

import {
  ArrowDown01Icon,
  Camera02Icon,
  FloppyDiskIcon,
  Image01Icon,
  Loading03Icon,
  StarIcon,
  ViewIcon,
} from "hugeicons-react";
import { useTranslations } from "next-intl";
import React, { useCallback, useState } from "react";
import { toast } from "sonner";
import type { BeforeAfterPair, PortfolioImage } from "@/app/api/professional/portfolio/route";
import { geistSans } from "@/app/fonts";
import { cn } from "@/lib/utils/core";
import { BeforeAfterManager } from "./before-after-manager";
import { ImageUploadDropzone } from "./image-upload-dropzone";
import { PortfolioCompletenessHeader } from "./portfolio-completeness-header";
import { PortfolioPreviewModal } from "./portfolio-preview-modal";

// ============================================================================
// Types
// ============================================================================

export type PortfolioDashboardProps = {
  /** Portfolio images */
  images: PortfolioImage[];
  /** Before/After transformation pairs */
  beforeAfterPairs: BeforeAfterPair[];
  /** Featured work description */
  featuredWork?: string;
  /** Featured image ID */
  featuredImageId?: string;
  /** Professional ID */
  professionalId: string;
  /** Professional's display name (for preview) */
  professionalName?: string;
  /** Additional CSS classes */
  className?: string;
};

// ============================================================================
// Section Header Component
// ============================================================================

type SectionProps = {
  title: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
};

function Section({
  title,
  description,
  icon,
  children,
  defaultOpen = true,
  className,
}: SectionProps) {
  return (
    <details
      className={cn("group rounded-lg border border-border bg-card", className)}
      open={defaultOpen}
    >
      <summary
        className={cn(
          "flex cursor-pointer items-center justify-between p-6",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch-500 focus-visible:ring-offset-2",
          "rounded-lg transition-colors hover:bg-muted"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rausch-50 dark:bg-rausch-500/10">
            {React.createElement(icon, { className: "h-5 w-5 text-rausch-500" })}
          </div>
          <div>
            <h3 className={cn("font-semibold text-foreground text-lg", geistSans.className)}>
              {title}
            </h3>
            {description && (
              <p className={cn("text-muted-foreground text-sm", geistSans.className)}>
                {description}
              </p>
            )}
          </div>
        </div>
        <ArrowDown01Icon className="h-5 w-5 text-neutral-400 transition-transform group-open:rotate-180 dark:text-neutral-500" />
      </summary>
      <div className="border-border border-t p-6">{children}</div>
    </details>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function PortfolioDashboard({
  images: initialImages,
  beforeAfterPairs: initialBeforeAfterPairs,
  featuredWork: initialFeaturedWork = "",
  featuredImageId: initialFeaturedImageId,
  professionalId: _professionalId,
  professionalName,
  className,
}: PortfolioDashboardProps) {
  const t = useTranslations("dashboard.pro.portfolio");

  // State management
  const [images, setImages] = useState<PortfolioImage[]>(initialImages);
  const [beforeAfterPairs, setBeforeAfterPairs] =
    useState<BeforeAfterPair[]>(initialBeforeAfterPairs);
  const [featuredWork, setFeaturedWork] = useState(initialFeaturedWork);
  const [featuredImageId, setFeaturedImageId] = useState<string | undefined>(
    initialFeaturedImageId
  );
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Mark changes
  const markChanged = useCallback(() => {
    setHasChanges(true);
  }, []);

  // Handle images update (reserved for future drag-drop reordering)
  const _handleImagesUpdate = useCallback(
    (newImages: PortfolioImage[]) => {
      setImages(newImages);
      markChanged();
    },
    [markChanged]
  );

  // Handle before/after pairs update
  const handleBeforeAfterUpdate = useCallback(
    (newPairs: BeforeAfterPair[]) => {
      setBeforeAfterPairs(newPairs);
      markChanged();
    },
    [markChanged]
  );

  // Handle featured work update
  const handleFeaturedWorkChange = useCallback(
    (value: string) => {
      setFeaturedWork(value);
      markChanged();
    },
    [markChanged]
  );

  // Handle featured image selection
  const handleFeaturedImageSelect = useCallback(
    (imageId: string | undefined) => {
      setFeaturedImageId(imageId);
      markChanged();
    },
    [markChanged]
  );

  // Handle new images uploaded
  const handleImagesUploaded = useCallback(
    (uploadedImages: { url: string; caption?: string }[]) => {
      const newImages: PortfolioImage[] = uploadedImages.map((img, index) => ({
        id: crypto.randomUUID(),
        url: img.url,
        caption: img.caption,
        order: images.length + index,
        created_at: new Date().toISOString(),
      }));
      setImages([...images, ...newImages]);
      markChanged();
    },
    [images, markChanged]
  );

  // Handle image deletion
  const handleDeleteImage = useCallback(
    async (id: string) => {
      const newImages = images
        .filter((img) => img.id !== id)
        .map((img, index) => ({ ...img, order: index }));
      setImages(newImages);

      // Clear featured image if deleted
      if (featuredImageId === id) {
        setFeaturedImageId(undefined);
      }
      markChanged();
    },
    [images, featuredImageId, markChanged]
  );

  // Handle image move
  const handleMoveImage = useCallback(
    (id: string, direction: "up" | "down") => {
      const index = images.findIndex((img) => img.id === id);
      if (
        (direction === "up" && index <= 0) ||
        (direction === "down" && index >= images.length - 1)
      ) {
        return;
      }

      const newImages = [...images];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      const current = newImages[index];
      const target = newImages[targetIndex];

      if (current && target) {
        [newImages[index], newImages[targetIndex]] = [target, current];
        for (let i = 0; i < newImages.length; i++) {
          const img = newImages[i];
          if (img) {
            img.order = i;
          }
        }
        setImages(newImages);
        markChanged();
      }
    },
    [images, markChanged]
  );

  // Save all portfolio changes
  const handleSave = async () => {
    setSaving(true);

    try {
      const response = await fetch("/api/professional/portfolio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images,
          beforeAfterPairs,
          featuredWork,
          featuredImageId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save portfolio");
      }

      toast.success(t("saveSuccess"));
      setHasChanges(false);
    } catch (error) {
      console.error("Failed to save portfolio:", error);
      toast.error(t("saveError"));
    } finally {
      setSaving(false);
    }
  };

  const sortedImages = [...images].sort((a, b) => a.order - b.order);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Completeness Header */}
      <PortfolioCompletenessHeader
        beforeAfterPairs={beforeAfterPairs}
        featuredImageId={featuredImageId}
        featuredWork={featuredWork}
        images={images}
      />

      {/* Sticky Save Bar */}
      {hasChanges && (
        <div className="sticky top-4 z-10 rounded-lg border border-rausch-200 bg-rausch-50 p-4 shadow-lg dark:border-rausch-500/30 dark:bg-rausch-500/10">
          <div className="flex items-center justify-between">
            <p
              className={cn(
                "font-semibold text-rausch-700 text-sm dark:text-rausch-400",
                geistSans.className
              )}
            >
              {t("unsavedChanges")}
            </p>
            <button
              className={cn(
                "flex items-center gap-2 rounded-lg bg-rausch-500 px-6 py-2.5 font-semibold text-sm text-white transition",
                "hover:bg-rausch-600",
                "disabled:cursor-not-allowed disabled:opacity-50",
                geistSans.className
              )}
              disabled={saving}
              onClick={handleSave}
              type="button"
            >
              {saving ? (
                <>
                  <Loading03Icon className="h-4 w-4 animate-spin" />
                  {t("saving")}
                </>
              ) : (
                <>
                  <FloppyDiskIcon className="h-4 w-4" />
                  {t("saveChanges")}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Featured Work Section */}
      <Section
        defaultOpen={true}
        description={t("sections.featured.description")}
        icon={StarIcon}
        title={t("sections.featured.title")}
      >
        <div className="space-y-6">
          {/* Featured Image Selection */}
          <div>
            <label
              className={cn(
                "mb-3 block font-semibold text-foreground text-sm",
                geistSans.className
              )}
              htmlFor="featured-image"
            >
              {t("fields.featuredImage.label")}
            </label>
            {sortedImages.length > 0 ? (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                {sortedImages.slice(0, 10).map((image) => (
                  <button
                    className={cn(
                      "group relative aspect-square overflow-hidden rounded-lg border-2 transition",
                      featuredImageId === image.id
                        ? "border-rausch-500 ring-2 ring-rausch-500/20"
                        : "border-neutral-200 hover:border-rausch-300 dark:border-neutral-700 dark:hover:border-rausch-400"
                    )}
                    key={image.id}
                    onClick={() =>
                      handleFeaturedImageSelect(featuredImageId === image.id ? undefined : image.id)
                    }
                    type="button"
                  >
                    <img
                      alt={image.caption || "Portfolio image"}
                      className="h-full w-full object-cover"
                      src={image.thumbnail_url || image.url}
                    />
                    {featuredImageId === image.id && (
                      <div className="absolute inset-0 flex items-center justify-center bg-rausch-500/20">
                        <div className="rounded-full bg-rausch-500 p-1.5">
                          <StarIcon className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <p className={cn("text-muted-foreground text-sm", geistSans.className)}>
                {t("fields.featuredImage.empty")}
              </p>
            )}
            <p className={cn("mt-2 text-muted-foreground text-xs", geistSans.className)}>
              {t("fields.featuredImage.helper")}
            </p>
          </div>

          {/* Featured Description */}
          <div>
            <label
              className={cn(
                "mb-2 block font-semibold text-foreground text-sm",
                geistSans.className
              )}
              htmlFor="featured-work"
            >
              {t("fields.description.label")}
            </label>
            <textarea
              className={cn(
                "w-full rounded-lg border border-border bg-muted px-4 py-3 text-foreground text-sm",
                "focus:border-rausch-500 focus:outline-none focus:ring-2 focus:ring-rausch-500/20",
                geistSans.className
              )}
              id="featured-work"
              maxLength={500}
              onChange={(e) => handleFeaturedWorkChange(e.target.value)}
              placeholder={t("fields.description.placeholder")}
              rows={4}
              value={featuredWork}
            />
            <div className="mt-1 flex items-center justify-between">
              <p className={cn("text-muted-foreground text-xs", geistSans.className)}>
                {t("fields.description.helper")}
              </p>
              <p className={cn("text-muted-foreground text-xs", geistSans.className)}>
                {featuredWork.length}/500
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Before/After Transformations Section */}
      <Section
        defaultOpen={true}
        description={t("sections.beforeAfter.description")}
        icon={Image01Icon}
        title={t("sections.beforeAfter.title")}
      >
        <BeforeAfterManager
          maxPairs={10}
          onUpdate={handleBeforeAfterUpdate}
          pairs={beforeAfterPairs}
        />
      </Section>

      {/* Work Gallery Section */}
      <Section
        defaultOpen={true}
        description={t("sections.gallery.description")}
        icon={Camera02Icon}
        title={t("sections.gallery.title")}
      >
        <div className="space-y-6">
          {/* Upload Area */}
          <div>
            <h4 className={cn("mb-3 font-semibold text-foreground text-sm", geistSans.className)}>
              {t("upload.title")}
            </h4>
            <ImageUploadDropzone
              maxImages={20 - images.length}
              onImagesUploaded={handleImagesUploaded}
            />
          </div>

          {/* Image Grid */}
          {sortedImages.length > 0 && (
            <div>
              <h4 className={cn("mb-3 font-semibold text-foreground text-sm", geistSans.className)}>
                {t("upload.currentImages", { count: images.length })}
              </h4>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {sortedImages.map((image, index) => (
                  <div
                    className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted"
                    key={image.id}
                  >
                    <img
                      alt={image.caption || `Image ${index + 1}`}
                      className="h-full w-full object-cover"
                      src={image.thumbnail_url || image.url}
                    />
                    {/* Overlay with actions */}
                    <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition group-hover:opacity-100">
                      {/* Order badge */}
                      <div className="flex justify-end p-2">
                        <span
                          className={cn(
                            "inline-flex h-6 w-6 items-center justify-center rounded-full bg-white font-semibold text-neutral-900 text-xs",
                            geistSans.className
                          )}
                        >
                          {index + 1}
                        </span>
                      </div>
                      {/* Actions */}
                      <div className="flex items-center justify-between p-2">
                        <div className="flex gap-1">
                          <button
                            className="rounded bg-white/90 p-1.5 text-neutral-700 transition hover:bg-white disabled:opacity-50"
                            disabled={index === 0}
                            onClick={() => handleMoveImage(image.id, "up")}
                            title={t("actions.moveUp")}
                            type="button"
                          >
                            ←
                          </button>
                          <button
                            className="rounded bg-white/90 p-1.5 text-neutral-700 transition hover:bg-white disabled:opacity-50"
                            disabled={index === sortedImages.length - 1}
                            onClick={() => handleMoveImage(image.id, "down")}
                            title={t("actions.moveDown")}
                            type="button"
                          >
                            →
                          </button>
                        </div>
                        <button
                          className="rounded bg-red-500 p-1.5 text-white transition hover:bg-red-600"
                          onClick={() => handleDeleteImage(image.id)}
                          title={t("actions.delete")}
                          type="button"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    {/* Featured badge */}
                    {featuredImageId === image.id && (
                      <div className="absolute top-2 left-2">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full bg-rausch-500 px-2 py-0.5 text-white text-xs",
                            geistSans.className
                          )}
                        >
                          <StarIcon className="h-3 w-3" />
                          Featured
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {images.length === 0 && (
            <div className="rounded-lg border-2 border-border border-dashed bg-muted/50 p-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rausch-50 dark:bg-rausch-500/10">
                <Camera02Icon className="h-8 w-8 text-rausch-500" />
              </div>
              <h4 className={cn("mt-4 font-semibold text-foreground text-lg", geistSans.className)}>
                {t("emptyState.title")}
              </h4>
              <p
                className={cn(
                  "mx-auto mt-2 max-w-sm text-muted-foreground text-sm",
                  geistSans.className
                )}
              >
                {t("emptyState.description")}
              </p>
            </div>
          )}

          {/* Upload Tips */}
          <div className="rounded-lg bg-babu-50 p-4 dark:bg-babu-500/10">
            <h4
              className={cn(
                "flex items-center gap-2 font-semibold text-babu-700 text-sm dark:text-babu-400",
                geistSans.className
              )}
            >
              <Camera02Icon className="h-4 w-4" />
              {t("tips.title")}
            </h4>
            <ul
              className={cn(
                "mt-2 space-y-1 text-babu-600 text-sm dark:text-babu-300",
                geistSans.className
              )}
            >
              <li>• {t("tips.tip1")}</li>
              <li>• {t("tips.tip2")}</li>
              <li>• {t("tips.tip3")}</li>
              <li>• {t("tips.tip4")}</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* Preview Button */}
      <div className="flex justify-center pt-4">
        <button
          className={cn(
            "flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 font-semibold text-muted-foreground text-sm transition",
            "hover:border-rausch-200 hover:bg-rausch-50 hover:text-rausch-600",
            "dark:hover:border-rausch-400 dark:hover:bg-rausch-500/10 dark:hover:text-rausch-400",
            geistSans.className
          )}
          onClick={() => setPreviewOpen(true)}
          type="button"
        >
          <ViewIcon className="h-5 w-5" />
          {t("previewProfile")}
        </button>
      </div>

      {/* Portfolio Preview Modal */}
      <PortfolioPreviewModal
        beforeAfterPairs={beforeAfterPairs}
        featuredImageId={featuredImageId}
        featuredWork={featuredWork}
        images={images}
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        professionalName={professionalName}
      />
    </div>
  );
}
