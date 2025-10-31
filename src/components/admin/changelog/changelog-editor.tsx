"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Bug, Zap, Shield, Palette, Save, Eye, Loader2 } from "lucide-react";

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
  { value: "features", label: "Features", icon: Sparkles, color: "text-purple-600" },
  { value: "improvements", label: "Improvements", icon: Zap, color: "text-blue-600" },
  { value: "fixes", label: "Fixes", icon: Bug, color: "text-green-600" },
  { value: "security", label: "Security", icon: Shield, color: "text-red-600" },
  { value: "design", label: "Design", icon: Palette, color: "text-pink-600" },
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
      ? new Date(initialData.published_at).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    categories: initialData?.categories || [],
    tags: initialData?.tags?.join(", ") || "",
    target_audience: initialData?.target_audience || ["all"],
    featured_image_url: initialData?.featured_image_url || "",
    visibility: initialData?.visibility || "draft",
  });

  // Auto-generate slug from title
  const generateSlug = useCallback((title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }, []);

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

      const url = mode === "create" ? "/api/admin/changelog" : `/api/admin/changelog/${changelogId}`;

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

      const result = await response.json();

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
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      <form className="space-y-6">
        {/* Basic Info */}
        <div className="rounded-2xl border border-[#ebe5d8] bg-white p-6">
          <h3 className="mb-4 font-bold text-[#211f1a] text-lg">Basic Information</h3>

          <div className="space-y-4">
            {/* Sprint Number */}
            <div>
              <label htmlFor="sprint_number" className="mb-2 block font-medium text-[#211f1a] text-sm">
                Sprint Number *
              </label>
              <input
                type="number"
                id="sprint_number"
                value={formData.sprint_number}
                onChange={(e) => setFormData({ ...formData, sprint_number: parseInt(e.target.value) || 1 })}
                min="1"
                required
                className="w-full rounded-xl border border-[#ebe5d8] px-4 py-3 text-[#211f1a] focus:border-[#ff5d46] focus:outline-none focus:ring-2 focus:ring-[#ff5d4620]"
              />
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="mb-2 block font-medium text-[#211f1a] text-sm">
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
                placeholder="e.g., Enhanced Search and New Dashboard Features"
                className="w-full rounded-xl border border-[#ebe5d8] px-4 py-3 text-[#211f1a] focus:border-[#ff5d46] focus:outline-none focus:ring-2 focus:ring-[#ff5d4620]"
              />
            </div>

            {/* Slug */}
            <div>
              <label htmlFor="slug" className="mb-2 block font-medium text-[#211f1a] text-sm">
                Slug *
              </label>
              <input
                type="text"
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
                placeholder="auto-generated-from-title"
                className="w-full rounded-xl border border-[#ebe5d8] bg-[#fbfaf9] px-4 py-3 font-mono text-[#5d574b] text-sm focus:border-[#ff5d46] focus:outline-none focus:ring-2 focus:ring-[#ff5d4620]"
              />
              <p className="mt-1 text-[#7a6d62] text-xs">
                URL-friendly version of the title (auto-generated)
              </p>
            </div>

            {/* Summary */}
            <div>
              <label htmlFor="summary" className="mb-2 block font-medium text-[#211f1a] text-sm">
                Summary
              </label>
              <textarea
                id="summary"
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                rows={3}
                placeholder="Brief overview of this update (shown in list view)"
                className="w-full rounded-xl border border-[#ebe5d8] px-4 py-3 text-[#211f1a] focus:border-[#ff5d46] focus:outline-none focus:ring-2 focus:ring-[#ff5d4620]"
              />
            </div>

            {/* Published Date */}
            <div>
              <label htmlFor="published_at" className="mb-2 block font-medium text-[#211f1a] text-sm">
                Published Date *
              </label>
              <input
                type="date"
                id="published_at"
                value={formData.published_at}
                onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
                required
                className="w-full rounded-xl border border-[#ebe5d8] px-4 py-3 text-[#211f1a] focus:border-[#ff5d46] focus:outline-none focus:ring-2 focus:ring-[#ff5d4620]"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="rounded-2xl border border-[#ebe5d8] bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-[#211f1a] text-lg">Content *</h3>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 rounded-lg border border-[#ebe5d8] px-3 py-1.5 text-[#5d574b] text-sm transition hover:border-[#ff5d46]"
            >
              <Eye className="h-4 w-4" />
              {showPreview ? "Edit" : "Preview"}
            </button>
          </div>

          {showPreview ? (
            <div
              className="prose prose-lg max-w-none rounded-xl border border-[#ebe5d8] bg-[#fbfaf9] p-6"
              dangerouslySetInnerHTML={{ __html: formData.content }}
            />
          ) : (
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={15}
              required
              placeholder="Write your changelog content here (supports HTML)..."
              className="w-full rounded-xl border border-[#ebe5d8] px-4 py-3 font-mono text-[#211f1a] text-sm focus:border-[#ff5d46] focus:outline-none focus:ring-2 focus:ring-[#ff5d4620]"
            />
          )}

          <p className="mt-2 text-[#7a6d62] text-xs">Supports HTML formatting</p>
        </div>

        {/* Categories */}
        <div className="rounded-2xl border border-[#ebe5d8] bg-white p-6">
          <h3 className="mb-4 font-bold text-[#211f1a] text-lg">Categories</h3>
          <div className="flex flex-wrap gap-3">
            {categoryOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = formData.categories.includes(option.value);

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleCategoryToggle(option.value)}
                  className={`flex items-center gap-2 rounded-full border-2 px-4 py-2 font-medium text-sm transition ${
                    isSelected
                      ? "border-[#ff5d46] bg-[#ff5d46] text-white"
                      : "border-[#ebe5d8] text-[#5d574b] hover:border-[#ff5d46]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tags & Audience */}
        <div className="rounded-2xl border border-[#ebe5d8] bg-white p-6">
          <h3 className="mb-4 font-bold text-[#211f1a] text-lg">Metadata</h3>

          <div className="space-y-4">
            {/* Tags */}
            <div>
              <label htmlFor="tags" className="mb-2 block font-medium text-[#211f1a] text-sm">
                Tags
              </label>
              <input
                type="text"
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="performance, ui, mobile (comma-separated)"
                className="w-full rounded-xl border border-[#ebe5d8] px-4 py-3 text-[#211f1a] focus:border-[#ff5d46] focus:outline-none focus:ring-2 focus:ring-[#ff5d4620]"
              />
            </div>

            {/* Target Audience */}
            <div>
              <label className="mb-2 block font-medium text-[#211f1a] text-sm">Target Audience</label>
              <div className="flex flex-wrap gap-2">
                {audienceOptions.map((option) => {
                  const isSelected = formData.target_audience.includes(option.value);

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleAudienceToggle(option.value)}
                      className={`rounded-lg border-2 px-3 py-1.5 font-medium text-sm transition ${
                        isSelected
                          ? "border-[#ff5d46] bg-[#ff5d4620] text-[#ff5d46]"
                          : "border-[#ebe5d8] text-[#5d574b] hover:border-[#ff5d46]"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Featured Image URL */}
            <div>
              <label htmlFor="featured_image_url" className="mb-2 block font-medium text-[#211f1a] text-sm">
                Featured Image URL
              </label>
              <input
                type="url"
                id="featured_image_url"
                value={formData.featured_image_url}
                onChange={(e) => setFormData({ ...formData, featured_image_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="w-full rounded-xl border border-[#ebe5d8] px-4 py-3 text-[#211f1a] focus:border-[#ff5d46] focus:outline-none focus:ring-2 focus:ring-[#ff5d4620]"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#ebe5d8] bg-white p-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-full border border-[#ebe5d8] px-6 py-2.5 font-semibold text-[#5d574b] transition hover:border-[#ff5d46]"
            disabled={saving}
          >
            Cancel
          </button>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, "draft")}
              disabled={saving}
              className="flex items-center gap-2 rounded-full border-2 border-[#ebe5d8] bg-white px-6 py-2.5 font-semibold text-[#211f1a] transition hover:border-[#ff5d46] disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Draft
                </>
              )}
            </button>

            <button
              type="button"
              onClick={(e) => handleSubmit(e, "published")}
              disabled={saving}
              className="flex items-center gap-2 rounded-full bg-[#ff5d46] px-6 py-2.5 font-semibold text-white transition hover:bg-[#e54d36] disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
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
