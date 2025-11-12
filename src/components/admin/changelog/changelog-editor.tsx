"use client";

import {
  Bug01Icon,
  FlashIcon,
  FloppyDiskIcon,
  Loading01Icon,
  MagicWand01Icon,
  PaintBoardIcon,
  Shield01Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { sanitizeRichContent } from "@/lib/sanitize";

type ChangelogFormData = {
  sprint_number: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  published_at: string;
  categories: string[];
  tags: string;
  target_audience: string[];
  featured_image_url: string;
  visibility: "draft" | "published" | "archived";
};

type ChangelogEditorProps = {
  initialData?: Partial<ChangelogFormData>;
  changelogId?: string;
  mode: "create" | "edit";
};

const categoryOptions = [
  {
    value: "features",
    label: "Features",
    icon: MagicWand01Icon,
    color: "text-stone-900 dark:text-stone-100",
  },
  {
    value: "improvements",
    label: "Improvements",
    icon: FlashIcon,
    color: "text-stone-900 dark:text-stone-100",
  },
  { value: "fixes", label: "Fixes", icon: Bug01Icon, color: "text-stone-900 dark:text-stone-100" },
  {
    value: "security",
    label: "Security",
    icon: Shield01Icon,
    color: "text-stone-900 dark:text-stone-100",
  },
  {
    value: "design",
    label: "Design",
    icon: PaintBoardIcon,
    color: "text-stone-900 dark:text-stone-100",
  },
];

const audienceOptions = [
  { value: "all", label: "All Users" },
  { value: "customer", label: "Customers" },
  { value: "professional", label: "Professionals" },
  { value: "admin", label: "Admins" },
];

export function ChangelogEditor({ initialData, changelogId, mode }: ChangelogEditorProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState<ChangelogFormData>({
    sprint_number: initialData?.sprint_number || 1,
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    summary: initialData?.summary || "",
    content: initialData?.content || "",
    published_at: initialData?.published_at
      ? new Date(initialData.published_at).toISOString().split("T")[0] || ""
      : new Date().toISOString().split("T")[0] || "",
    categories: initialData?.categories || [],
    tags: Array.isArray(initialData?.tags) ? initialData.tags.join(", ") : initialData?.tags || "",
    target_audience: initialData?.target_audience || ["all"],
    featured_image_url: initialData?.featured_image_url || "",
    visibility: initialData?.visibility || "draft",
  });

  // Auto-generate slug from title
  const generateSlug = useCallback(
    (title: string) =>
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, ""),
    []
  );

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: generateSlug(title),
    }));
  };

  const handleCategoryToggle = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const handleAudienceToggle = (audience: string) => {
    setFormData((prev) => ({
      ...prev,
      target_audience: prev.target_audience.includes(audience)
        ? prev.target_audience.filter((a) => a !== audience)
        : [...prev.target_audience, audience],
    }));
  };

  const handleSubmit = async (e: React.FormEvent, visibility: "draft" | "published") => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      // Prepare data
      const tagsArray = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      const payload = {
        ...formData,
        tags: tagsArray,
        visibility,
        published_at: new Date(formData.published_at).toISOString(),
      };

      const url =
        mode === "create" ? "/api/admin/changelog" : `/api/admin/changelog/${changelogId}`;

      const method = mode === "create" ? "POST" : "PATCH";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save changelog");
      }

      // Redirect to list or show success
      router.push("/admin/changelog");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      )}

      <form className="space-y-6">
        {/* Basic Info */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-950">
          <h3 className="mb-4 font-bold text-lg text-stone-900 dark:text-stone-100">
            Basic Information
          </h3>

          <div className="space-y-4">
            {/* Sprint Number */}
            <div>
              <label
                className="mb-2 block font-medium text-red-700 text-sm dark:text-red-200"
                htmlFor="sprint_number"
              >
                Sprint Number *
              </label>
              <input
                className="w-full rounded-xl border border-stone-200 px-4 py-3 text-stone-900 focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-500/20 dark:border-stone-100 dark:border-stone-800 dark:text-stone-100 dark:focus:ring-stone-400/20"
                id="sprint_number"
                min="1"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sprint_number: Number.parseInt(e.target.value, 10) || 1,
                  })
                }
                required
                type="number"
                value={formData.sprint_number}
              />
            </div>

            {/* Title */}
            <div>
              <label
                className="mb-2 block font-medium text-red-700 text-sm dark:text-red-200"
                htmlFor="title"
              >
                Title *
              </label>
              <input
                className="w-full rounded-xl border border-stone-200 px-4 py-3 text-stone-900 focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-500/20 dark:border-stone-100 dark:border-stone-800 dark:text-stone-100 dark:focus:ring-stone-400/20"
                id="title"
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g., Enhanced Search and New Dashboard Features"
                required
                type="text"
                value={formData.title}
              />
            </div>

            {/* Slug */}
            <div>
              <label
                className="mb-2 block font-medium text-red-700 text-sm dark:text-red-200"
                htmlFor="slug"
              >
                Slug *
              </label>
              <input
                className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 font-mono text-stone-600 text-sm focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-500/20 dark:border-stone-100 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-400 dark:focus:ring-stone-400/20"
                id="slug"
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="auto-generated-from-title"
                required
                type="text"
                value={formData.slug}
              />
              <p className="mt-1 text-stone-600 text-xs dark:text-stone-400">
                URL-friendly version of the title (auto-generated)
              </p>
            </div>

            {/* Summary */}
            <div>
              <label
                className="mb-2 block font-medium text-red-700 text-sm dark:text-red-200"
                htmlFor="summary"
              >
                Summary
              </label>
              <textarea
                className="w-full rounded-xl border border-stone-200 px-4 py-3 text-stone-900 focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-500/20 dark:border-stone-100 dark:border-stone-800 dark:text-stone-100 dark:focus:ring-stone-400/20"
                id="summary"
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="Brief overview of this update (shown in list view)"
                rows={3}
                value={formData.summary}
              />
            </div>

            {/* Published Date */}
            <div>
              <label
                className="mb-2 block font-medium text-red-700 text-sm dark:text-red-200"
                htmlFor="published_at"
              >
                Published Date *
              </label>
              <input
                className="w-full rounded-xl border border-stone-200 px-4 py-3 text-stone-900 focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-500/20 dark:border-stone-100 dark:border-stone-800 dark:text-stone-100 dark:focus:ring-stone-400/20"
                id="published_at"
                onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
                required
                type="date"
                value={formData.published_at}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-950">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100">Content *</h3>
            <button
              className="flex items-center gap-2 rounded-lg border border-stone-200 px-3 py-1.5 text-stone-600 text-sm transition hover:border-stone-900 dark:border-stone-100 dark:border-stone-800 dark:text-stone-400"
              onClick={() => setShowPreview(!showPreview)}
              type="button"
            >
              <HugeiconsIcon className="h-4 w-4" icon={ViewIcon} />
              {showPreview ? "Edit" : "Preview"}
            </button>
          </div>

          {showPreview ? (
            <div
              className="prose prose-lg max-w-none rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-950"
              dangerouslySetInnerHTML={{ __html: sanitizeRichContent(formData.content) }}
            />
          ) : (
            <textarea
              className="w-full rounded-xl border border-stone-200 px-4 py-3 font-mono text-red-700 text-sm focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-500/20 dark:border-stone-100 dark:border-stone-800 dark:text-red-200 dark:focus:ring-stone-400/20"
              id="content"
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write your changelog content here (supports HTML)..."
              required
              rows={15}
              value={formData.content}
            />
          )}

          <p className="mt-2 text-stone-600 text-xs dark:text-stone-400">
            Supports HTML formatting
          </p>
        </div>

        {/* Categories */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-950">
          <h3 className="mb-4 font-bold text-lg text-stone-900 dark:text-stone-100">Categories</h3>
          <div className="flex flex-wrap gap-3">
            {categoryOptions.map((option) => {
              const isSelected = formData.categories.includes(option.value);

              return (
                <button
                  className={`flex items-center gap-2 rounded-full border-2 px-4 py-2 font-medium text-sm transition ${
                    isSelected
                      ? "border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-950"
                      : "border-stone-200 text-stone-600 hover:border-stone-900 dark:border-stone-100 dark:border-stone-800 dark:text-stone-400"
                  }`}
                  key={option.value}
                  onClick={() => handleCategoryToggle(option.value)}
                  type="button"
                >
                  <HugeiconsIcon className="h-4 w-4" icon={option.icon} />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tags & Audience */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-950">
          <h3 className="mb-4 font-bold text-lg text-stone-900 dark:text-stone-100">Metadata</h3>

          <div className="space-y-4">
            {/* Tags */}
            <div>
              <label
                className="mb-2 block font-medium text-red-700 text-sm dark:text-red-200"
                htmlFor="tags"
              >
                Tags
              </label>
              <input
                className="w-full rounded-xl border border-stone-200 px-4 py-3 text-stone-900 focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-500/20 dark:border-stone-100 dark:border-stone-800 dark:text-stone-100 dark:focus:ring-stone-400/20"
                id="tags"
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="performance, ui, mobile (comma-separated)"
                type="text"
                value={formData.tags}
              />
            </div>

            {/* Target Audience */}
            <div>
              <div className="mb-2 block font-medium text-red-700 text-sm dark:text-red-200">
                Target Audience
              </div>
              <div className="flex flex-wrap gap-2">
                {audienceOptions.map((option) => {
                  const isSelected = formData.target_audience.includes(option.value);

                  return (
                    <button
                      className={`rounded-lg border-2 px-3 py-1.5 font-medium text-sm transition ${
                        isSelected
                          ? "border-stone-900 bg-stone-100 text-stone-900 dark:border-stone-100 dark:bg-stone-800 dark:text-stone-100"
                          : "border-stone-200 text-stone-600 hover:border-stone-900 dark:border-stone-100 dark:border-stone-800 dark:text-stone-400"
                      }`}
                      key={option.value}
                      onClick={() => handleAudienceToggle(option.value)}
                      type="button"
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Featured Image URL */}
            <div>
              <label
                className="mb-2 block font-medium text-red-700 text-sm dark:text-red-200"
                htmlFor="featured_image_url"
              >
                Featured Image URL
              </label>
              <input
                className="w-full rounded-xl border border-stone-200 px-4 py-3 text-stone-900 focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-500/20 dark:border-stone-100 dark:border-stone-800 dark:text-stone-100 dark:focus:ring-stone-400/20"
                id="featured_image_url"
                onChange={(e) => setFormData({ ...formData, featured_image_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
                type="url"
                value={formData.featured_image_url}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-950">
          <button
            className="rounded-full border border-stone-200 px-6 py-2.5 font-semibold text-stone-600 transition hover:border-stone-900 dark:border-stone-100 dark:border-stone-800 dark:text-stone-400"
            disabled={saving}
            onClick={() => router.back()}
            type="button"
          >
            Cancel
          </button>

          <div className="flex gap-3">
            <button
              className="flex items-center gap-2 rounded-full border-2 border-stone-200 bg-white px-6 py-2.5 font-semibold text-stone-900 transition hover:border-stone-900 disabled:opacity-50 dark:border-stone-100 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100"
              disabled={saving}
              onClick={(e) => handleSubmit(e, "draft")}
              type="button"
            >
              {saving ? (
                <>
                  <HugeiconsIcon className="h-4 w-4 animate-spin" icon={Loading01Icon} />
                  Saving...
                </>
              ) : (
                <>
                  <HugeiconsIcon className="h-4 w-4" icon={FloppyDiskIcon} />
                  Save Draft
                </>
              )}
            </button>

            <button
              className="flex items-center gap-2 rounded-full bg-stone-900 px-6 py-2.5 font-semibold text-white transition hover:bg-stone-900 disabled:opacity-50 dark:bg-stone-100 dark:bg-stone-100 dark:text-stone-950"
              disabled={saving}
              onClick={(e) => handleSubmit(e, "published")}
              type="button"
            >
              {saving ? (
                <>
                  <HugeiconsIcon className="h-4 w-4 animate-spin" icon={Loading01Icon} />
                  Publishing...
                </>
              ) : (
                <>
                  <HugeiconsIcon className="h-4 w-4" icon={MagicWand01Icon} />
                  Publish
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
