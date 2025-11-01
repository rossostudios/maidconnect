/**
 * Roadmap Editor Component
 *
 * Form for creating and editing roadmap items (admin only)
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { Save, X, Eye } from "lucide-react";
import type {
  RoadmapItem,
  RoadmapItemInput,
  RoadmapStatus,
  RoadmapCategory,
  RoadmapPriority,
  RoadmapVisibility,
  RoadmapAudience,
} from "@/types/roadmap";
import { generateRoadmapSlug, ROADMAP_STATUS_CONFIG, ROADMAP_CATEGORY_CONFIG } from "@/types/roadmap";

interface RoadmapEditorProps {
  mode: "create" | "edit";
  initialData?: RoadmapItem;
}

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
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        featured_image_url: featuredImageUrl || null,
      };

      const url = mode === "create" ? "/api/admin/roadmap" : `/api/admin/roadmap/${initialData?.id}`;
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
    <form className="max-w-4xl mx-auto space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-[16px] text-red-600">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-semibold text-[#211f1a] mb-2">
          Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 border-2 border-[#ebe5d8] rounded-[12px] focus:border-[#ff5d46] outline-none transition-colors"
          placeholder="Add real-time notifications"
          required
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-semibold text-[#211f1a] mb-2">
          Slug *
        </label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full px-4 py-3 border-2 border-[#ebe5d8] rounded-[12px] focus:border-[#ff5d46] outline-none transition-colors font-mono text-sm"
          placeholder="add-real-time-notifications"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-[#211f1a] mb-2">
          Description *
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={8}
          className="w-full px-4 py-3 border-2 border-[#ebe5d8] rounded-[12px] focus:border-[#ff5d46] outline-none transition-colors resize-y"
          placeholder="Describe the roadmap item..."
          required
        />
      </div>

      {/* Status and Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-[#211f1a] mb-2">
            Status *
          </label>
          <div className="space-y-2">
            {(Object.keys(ROADMAP_STATUS_CONFIG) as RoadmapStatus[]).map((statusOption) => {
              const config = ROADMAP_STATUS_CONFIG[statusOption];
              return (
                <label
                  key={statusOption}
                  className={`flex items-center gap-3 p-3 border-2 rounded-[12px] cursor-pointer transition-all ${
                    status === statusOption
                      ? "border-[#ff5d46] bg-[#fff5f3]"
                      : "border-[#ebe5d8] hover:border-[#ff5d46]"
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={statusOption}
                    checked={status === statusOption}
                    onChange={(e) => setStatus(e.target.value as RoadmapStatus)}
                    className="text-[#ff5d46]"
                  />
                  <span>{config.icon}</span>
                  <span className="font-medium text-[#211f1a]">{config.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#211f1a] mb-2">
            Category *
          </label>
          <div className="space-y-2">
            {(Object.keys(ROADMAP_CATEGORY_CONFIG) as RoadmapCategory[]).map((categoryOption) => {
              const config = ROADMAP_CATEGORY_CONFIG[categoryOption];
              return (
                <label
                  key={categoryOption}
                  className={`flex items-center gap-3 p-3 border-2 rounded-[12px] cursor-pointer transition-all ${
                    category === categoryOption
                      ? "border-[#ff5d46] bg-[#fff5f3]"
                      : "border-[#ebe5d8] hover:border-[#ff5d46]"
                  }`}
                >
                  <input
                    type="radio"
                    name="category"
                    value={categoryOption}
                    checked={category === categoryOption}
                    onChange={(e) => setCategory(e.target.value as RoadmapCategory)}
                    className="text-[#ff5d46]"
                  />
                  <span>{config.icon}</span>
                  <span className="font-medium text-[#211f1a]">{config.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Priority and Target Quarter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-[#211f1a] mb-2">
            Priority
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as RoadmapPriority)}
            className="w-full px-4 py-3 border-2 border-[#ebe5d8] rounded-[12px] focus:border-[#ff5d46] outline-none transition-colors"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#211f1a] mb-2">
            Target Quarter
          </label>
          <input
            type="text"
            value={targetQuarter}
            onChange={(e) => setTargetQuarter(e.target.value)}
            className="w-full px-4 py-3 border-2 border-[#ebe5d8] rounded-[12px] focus:border-[#ff5d46] outline-none transition-colors"
            placeholder="Q1 2025"
          />
        </div>
      </div>

      {/* Target Audience */}
      <div>
        <label className="block text-sm font-semibold text-[#211f1a] mb-2">
          Target Audience
        </label>
        <div className="flex gap-3">
          {(["all", "customer", "professional"] as RoadmapAudience[]).map((audience) => (
            <label
              key={audience}
              className={`flex-1 p-3 border-2 rounded-[12px] cursor-pointer text-center transition-all ${
                targetAudience.includes(audience)
                  ? "border-[#ff5d46] bg-[#fff5f3] text-[#ff5d46]"
                  : "border-[#ebe5d8] hover:border-[#ff5d46]"
              }`}
            >
              <input
                type="checkbox"
                checked={targetAudience.includes(audience)}
                onChange={() => handleAudienceToggle(audience)}
                className="sr-only"
              />
              <span className="font-medium capitalize">{audience}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-semibold text-[#211f1a] mb-2">
          Tags (comma separated)
        </label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full px-4 py-3 border-2 border-[#ebe5d8] rounded-[12px] focus:border-[#ff5d46] outline-none transition-colors"
          placeholder="notifications, realtime, websockets"
        />
      </div>

      {/* Featured Image */}
      <div>
        <label className="block text-sm font-semibold text-[#211f1a] mb-2">
          Featured Image URL
        </label>
        <input
          type="url"
          value={featuredImageUrl}
          onChange={(e) => setFeaturedImageUrl(e.target.value)}
          className="w-full px-4 py-3 border-2 border-[#ebe5d8] rounded-[12px] focus:border-[#ff5d46] outline-none transition-colors"
          placeholder="https://example.com/image.png"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4 pt-6 border-t border-[#ebe5d8]">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border-2 border-[#ebe5d8] rounded-[12px] font-medium text-[#6B7280] hover:border-[#211f1a] hover:text-[#211f1a] transition-all"
        >
          <X size={20} className="inline mr-2" />
          Cancel
        </button>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={isSubmitting}
            className="px-6 py-3 border-2 border-[#ebe5d8] rounded-[12px] font-medium text-[#6B7280] hover:border-[#211f1a] hover:text-[#211f1a] transition-all disabled:opacity-50"
          >
            <Save size={20} className="inline mr-2" />
            Save Draft
          </button>

          <button
            type="submit"
            onClick={(e) => handleSubmit(e, false)}
            disabled={isSubmitting}
            className="px-6 py-3 bg-[#ff5d46] text-white rounded-[12px] font-medium hover:bg-[#e54d36] transition-all disabled:opacity-50"
          >
            <Eye size={20} className="inline mr-2" />
            {visibility === "published" ? "Update & Publish" : "Publish"}
          </button>
        </div>
      </div>
    </form>
  );
}
