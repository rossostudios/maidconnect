/**
 * Roadmap Editor Component
 *
 * Form for creating and editing roadmap items (admin only)
 */

"use client";

import { Cancel01Icon, FloppyDiskIcon, ViewIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/routing";
import type {
  RoadmapAudience,
  RoadmapCategory,
  RoadmapItem,
  RoadmapItemInput,
  RoadmapPriority,
  RoadmapStatus,
  RoadmapVisibility,
} from "@/types/roadmap";
import {
  generateRoadmapSlug,
  ROADMAP_CATEGORY_CONFIG,
  ROADMAP_STATUS_CONFIG,
} from "@/types/roadmap";

type RoadmapEditorProps = {
  mode: "create" | "edit";
  initialData?: RoadmapItem;
};

export function RoadmapEditor({ mode, initialData }: RoadmapEditorProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [status, setStatus] = useState<RoadmapStatus>(initialData?.status || "under_consideration");
  const [category, setCategory] = useState<RoadmapCategory>(initialData?.category || "features");
  const [priority, setPriority] = useState<RoadmapPriority>(initialData?.priority || "medium");
  const [targetQuarter, setTargetQuarter] = useState(initialData?.target_quarter || "");
  const [visibility, _setVisibility] = useState<RoadmapVisibility>(
    initialData?.visibility || "draft"
  );
  const [targetAudience, setTargetAudience] = useState<RoadmapAudience[]>(
    initialData?.target_audience || ["all"]
  );
  const [tags, setTags] = useState(initialData?.tags?.join(", ") || "");
  const [featuredImageUrl, setFeaturedImageUrl] = useState(initialData?.featured_image_url || "");

  // Auto-generate slug from title
  useEffect(() => {
    if (mode === "create" && title && !slug) {
      setSlug(generateRoadmapSlug(title));
    }
  }, [title, mode, slug]);

  const handleSubmit = async (e: React.FormEvent, draft = false) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload: RoadmapItemInput = {
        title,
        slug,
        description,
        status,
        category,
        priority,
        target_quarter: targetQuarter || null,
        visibility: draft ? "draft" : visibility,
        target_audience: targetAudience,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        featured_image_url: featuredImageUrl || null,
      };

      const url =
        mode === "create" ? "/api/admin/roadmap" : `/api/admin/roadmap/${initialData?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || "Failed to save roadmap item");
      }

      router.push("/admin/roadmap");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAudienceToggle = (audience: RoadmapAudience) => {
    if (targetAudience.includes(audience)) {
      setTargetAudience(targetAudience.filter((a) => a !== audience));
    } else {
      setTargetAudience([...targetAudience, audience]);
    }
  };

  return (
    <form className="mx-auto max-w-4xl space-y-6">
      {error && (
        <div className="rounded-[16px] border border-[#64748b]/30 bg-[#64748b]/10 p-4 text-[#64748b]">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="mb-2 block font-semibold text-[#0f172a] text-sm" htmlFor="roadmap-title">
          Title *
        </label>
        <input
          className="w-full rounded-[12px] border-2 border-[#e2e8f0] px-4 py-3 outline-none transition-colors focus:border-[#64748b]"
          id="roadmap-title"
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add real-time notifications"
          required
          type="text"
          value={title}
        />
      </div>

      {/* Slug */}
      <div>
        <label className="mb-2 block font-semibold text-[#0f172a] text-sm" htmlFor="roadmap-slug">
          Slug *
        </label>
        <input
          className="w-full rounded-[12px] border-2 border-[#e2e8f0] px-4 py-3 font-mono text-sm outline-none transition-colors focus:border-[#64748b]"
          id="roadmap-slug"
          onChange={(e) => setSlug(e.target.value)}
          placeholder="add-real-time-notifications"
          required
          type="text"
          value={slug}
        />
      </div>

      {/* Description */}
      <div>
        <label
          className="mb-2 block font-semibold text-[#0f172a] text-sm"
          htmlFor="roadmap-description"
        >
          Description *
        </label>
        <textarea
          className="w-full resize-y rounded-[12px] border-2 border-[#e2e8f0] px-4 py-3 outline-none transition-colors focus:border-[#64748b]"
          id="roadmap-description"
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the roadmap item..."
          required
          rows={8}
          value={description}
        />
      </div>

      {/* Status and Category */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <div className="mb-2 block font-semibold text-[#0f172a] text-sm">Status *</div>
          <div className="space-y-2">
            {(Object.keys(ROADMAP_STATUS_CONFIG) as RoadmapStatus[]).map((statusOption) => {
              const config = ROADMAP_STATUS_CONFIG[statusOption];
              return (
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-[12px] border-2 p-3 transition-all ${
                    status === statusOption
                      ? "border-[#64748b] bg-[#f8fafc]"
                      : "border-[#e2e8f0] hover:border-[#64748b]"
                  }`}
                  key={statusOption}
                >
                  <input
                    checked={status === statusOption}
                    className="text-[#64748b]"
                    name="status"
                    onChange={(e) => setStatus(e.target.value as RoadmapStatus)}
                    type="radio"
                    value={statusOption}
                  />
                  <span>{config.icon}</span>
                  <span className="font-medium text-[#0f172a]">{config.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div>
          <div className="mb-2 block font-semibold text-[#0f172a] text-sm">Category *</div>
          <div className="space-y-2">
            {(Object.keys(ROADMAP_CATEGORY_CONFIG) as RoadmapCategory[]).map((categoryOption) => {
              const config = ROADMAP_CATEGORY_CONFIG[categoryOption];
              return (
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-[12px] border-2 p-3 transition-all ${
                    category === categoryOption
                      ? "border-[#64748b] bg-[#f8fafc]"
                      : "border-[#e2e8f0] hover:border-[#64748b]"
                  }`}
                  key={categoryOption}
                >
                  <input
                    checked={category === categoryOption}
                    className="text-[#64748b]"
                    name="category"
                    onChange={(e) => setCategory(e.target.value as RoadmapCategory)}
                    type="radio"
                    value={categoryOption}
                  />
                  <span>{config.icon}</span>
                  <span className="font-medium text-[#0f172a]">{config.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Priority and Target Quarter */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label
            className="mb-2 block font-semibold text-[#0f172a] text-sm"
            htmlFor="roadmap-priority"
          >
            Priority
          </label>
          <select
            className="w-full rounded-[12px] border-2 border-[#e2e8f0] px-4 py-3 outline-none transition-colors focus:border-[#64748b]"
            id="roadmap-priority"
            onChange={(e) => setPriority(e.target.value as RoadmapPriority)}
            value={priority}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label
            className="mb-2 block font-semibold text-[#0f172a] text-sm"
            htmlFor="roadmap-quarter"
          >
            Target Quarter
          </label>
          <input
            className="w-full rounded-[12px] border-2 border-[#e2e8f0] px-4 py-3 outline-none transition-colors focus:border-[#64748b]"
            id="roadmap-quarter"
            onChange={(e) => setTargetQuarter(e.target.value)}
            placeholder="Q1 2025"
            type="text"
            value={targetQuarter}
          />
        </div>
      </div>

      {/* Target Audience */}
      <div>
        <div className="mb-2 block font-semibold text-[#0f172a] text-sm">Target Audience</div>
        <div className="flex gap-3">
          {(["all", "customer", "professional"] as RoadmapAudience[]).map((audience) => (
            <label
              className={`flex-1 cursor-pointer rounded-[12px] border-2 p-3 text-center transition-all ${
                targetAudience.includes(audience)
                  ? "border-[#64748b] bg-[#f8fafc] text-[#64748b]"
                  : "border-[#e2e8f0] hover:border-[#64748b]"
              }`}
              key={audience}
            >
              <input
                checked={targetAudience.includes(audience)}
                className="sr-only"
                onChange={() => handleAudienceToggle(audience)}
                type="checkbox"
              />
              <span className="font-medium capitalize">{audience}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="mb-2 block font-semibold text-[#0f172a] text-sm" htmlFor="roadmap-tags">
          Tags (comma separated)
        </label>
        <input
          className="w-full rounded-[12px] border-2 border-[#e2e8f0] px-4 py-3 outline-none transition-colors focus:border-[#64748b]"
          id="roadmap-tags"
          onChange={(e) => setTags(e.target.value)}
          placeholder="notifications, realtime, websockets"
          type="text"
          value={tags}
        />
      </div>

      {/* Featured Image */}
      <div>
        <label className="mb-2 block font-semibold text-[#0f172a] text-sm" htmlFor="roadmap-image">
          Featured Image URL
        </label>
        <input
          className="w-full rounded-[12px] border-2 border-[#e2e8f0] px-4 py-3 outline-none transition-colors focus:border-[#64748b]"
          id="roadmap-image"
          onChange={(e) => setFeaturedImageUrl(e.target.value)}
          placeholder="https://example.com/image.png"
          type="url"
          value={featuredImageUrl}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4 border-[#e2e8f0] border-t pt-6">
        <button
          className="rounded-[12px] border-2 border-[#e2e8f0] px-6 py-3 font-medium text-[#94a3b8] transition-all hover:border-[#0f172a] hover:text-[#0f172a]"
          onClick={() => router.back()}
          type="button"
        >
          <HugeiconsIcon className="mr-2 inline" icon={Cancel01Icon} size={20} />
          Cancel
        </button>

        <div className="flex gap-3">
          <button
            className="rounded-[12px] border-2 border-[#e2e8f0] px-6 py-3 font-medium text-[#94a3b8] transition-all hover:border-[#0f172a] hover:text-[#0f172a] disabled:opacity-50"
            disabled={isSubmitting}
            onClick={(e) => handleSubmit(e, true)}
            type="button"
          >
            <HugeiconsIcon className="mr-2 inline" icon={FloppyDiskIcon} size={20} />
            Save Draft
          </button>

          <button
            className="rounded-[12px] bg-[#64748b] px-6 py-3 font-medium text-[#f8fafc] transition-all hover:bg-[#64748b] disabled:opacity-50"
            disabled={isSubmitting}
            onClick={(e) => handleSubmit(e, false)}
            type="submit"
          >
            <HugeiconsIcon className="mr-2 inline" icon={ViewIcon} size={20} />
            {visibility === "published" ? "Update & Publish" : "Publish"}
          </button>
        </div>
      </div>
    </form>
  );
}
