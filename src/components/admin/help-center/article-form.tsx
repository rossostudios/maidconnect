"use client";

import { BookOpen01Icon, EyeIcon, PencilEdit02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { marked } from "marked";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { sanitizeRichContent } from "@/lib/sanitize";
import { toast } from "@/lib/toast";
import { createArticle, updateArticle } from "./article-actions";

type Category = {
  id: string;
  slug: string;
  name_en: string;
  name_es: string;
};

type ArticleFormProps = {
  categories: Category[];
  article?: {
    id: string;
    category_id: string;
    slug: string;
    title_en: string;
    title_es: string;
    excerpt_en: string | null;
    excerpt_es: string | null;
    content_en: string;
    content_es: string;
    is_published: boolean;
  };
};

export function ArticleForm({ categories, article }: ArticleFormProps) {
  const router = useRouter();
  const isEditing = !!article;

  // Form state
  const [categoryId, setCategoryId] = useState(article?.category_id || "");
  const [slug, setSlug] = useState(article?.slug || "");
  const [titleEn, setTitleEn] = useState(article?.title_en || "");
  const [titleEs, setTitleEs] = useState(article?.title_es || "");
  const [excerptEn, setExcerptEn] = useState(article?.excerpt_en || "");
  const [excerptEs, setExcerptEs] = useState(article?.excerpt_es || "");
  const [contentEn, setContentEn] = useState(article?.content_en || "");
  const [contentEs, setContentEs] = useState(article?.content_es || "");
  const [isPublished, setIsPublished] = useState(article?.is_published ?? false);

  // UI state
  const [activeTab, setActiveTab] = useState<"en" | "es">("en");
  const [previewMode, setPreviewMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Auto-generate slug from English title
  const handleTitleEnChange = (value: string) => {
    setTitleEn(value);
    if (!isEditing) {
      // Only auto-generate slug for new articles
      const autoSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setSlug(autoSlug);
    }
  };

  // Preview content
  const currentContent = activeTab === "en" ? contentEn : contentEs;
  const previewHtml = useMemo(() => {
    if (!(currentContent && previewMode)) {
      return "";
    }
    const html = marked.parse(currentContent, { async: false }) as string;
    return sanitizeRichContent(html);
  }, [currentContent, previewMode]);

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!categoryId) {
      toast.error("Please select a category");
      return;
    }
    if (!slug) {
      toast.error("Slug is required");
      return;
    }
    if (!(titleEn && titleEs)) {
      toast.error("Title is required in both languages");
      return;
    }
    if (!(contentEn && contentEs)) {
      toast.error("Content is required in both languages");
      return;
    }

    setSubmitting(true);

    try {
      const formData = {
        category_id: categoryId,
        slug,
        title_en: titleEn,
        title_es: titleEs,
        excerpt_en: excerptEn || null,
        excerpt_es: excerptEs || null,
        content_en: contentEn,
        content_es: contentEs,
        is_published: isPublished,
      };

      if (isEditing) {
        await updateArticle(article.id, formData);
        toast.success("Article updated successfully");
      } else {
        await createArticle(formData);
        toast.success("Article created successfully");
      }

      router.push("/admin/help-center");
      router.refresh();
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save article");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 font-bold text-3xl text-[#171717]">
            {isEditing ? "Edit Article" : "Create New Article"}
          </h1>
          <p className="text-[#737373]">
            {isEditing
              ? "Update the article content and settings"
              : "Write a new help center article"}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            className="rounded-lg border border-[#E5E5E5] bg-white px-6 py-3 font-semibold text-[#171717] transition hover:border-[#E85D48]"
            onClick={() => router.back()}
            type="button"
          >
            Cancel
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-lg bg-[#E85D48] px-6 py-3 font-semibold text-white transition hover:bg-[#D14B39] disabled:opacity-50"
            disabled={submitting}
            type="submit"
          >
            <HugeiconsIcon className="h-5 w-5" icon={BookOpen01Icon} />
            {submitting ? "Saving..." : isEditing ? "Update Article" : "Create Article"}
          </button>
        </div>
      </div>

      {/* Main Form */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column - Form Fields */}
        <div className="space-y-6 lg:col-span-1">
          {/* Category */}
          <div>
            <label className="mb-2 block font-semibold text-[#171717] text-sm" htmlFor="category">
              Category
            </label>
            <select
              className="w-full rounded-lg border border-[#E5E5E5] bg-white px-4 py-3 text-[#171717] transition focus:border-[#E85D48] focus:outline-none focus:ring-2 focus:ring-[#E85D48]/20"
              id="category"
              onChange={(e) => setCategoryId(e.target.value)}
              required
              value={categoryId}
            >
              <option value="">Select a category...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name_en}
                </option>
              ))}
            </select>
          </div>

          {/* Slug */}
          <div>
            <label className="mb-2 block font-semibold text-[#171717] text-sm" htmlFor="slug">
              Slug (URL)
            </label>
            <input
              className="w-full rounded-lg border border-[#E5E5E5] bg-white px-4 py-3 font-mono text-[#171717] text-sm transition focus:border-[#E85D48] focus:outline-none focus:ring-2 focus:ring-[#E85D48]/20"
              id="slug"
              onChange={(e) => setSlug(e.target.value)}
              placeholder="your-article-slug"
              required
              type="text"
              value={slug}
            />
            <p className="mt-1 text-[#737373] text-xs">
              Used in URL: /help/category/<strong>{slug || "slug"}</strong>
            </p>
          </div>

          {/* Published Status */}
          <div className="rounded-lg border border-[#E5E5E5] bg-white p-4">
            <label className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-[#171717] text-sm">Published</div>
                <div className="text-[#737373] text-xs">Make this article visible to users</div>
              </div>
              <input
                checked={isPublished}
                className="h-5 w-5 rounded border-[#E5E5E5] text-[#E85D48] focus:ring-2 focus:ring-[#E85D48]/20"
                onChange={(e) => setIsPublished(e.target.checked)}
                type="checkbox"
              />
            </label>
          </div>

          {/* Markdown Guide */}
          <div className="rounded-lg border border-[#E5E5E5] bg-gray-50 p-4">
            <h3 className="mb-3 font-semibold text-[#171717] text-sm">Markdown Guide</h3>
            <div className="space-y-2 font-mono text-[#737373] text-xs">
              <div># Heading 1</div>
              <div>## Heading 2</div>
              <div>**bold text**</div>
              <div>*italic text*</div>
              <div>[link](url)</div>
              <div>- List item</div>
              <div>`code`</div>
              <div>```code block```</div>
            </div>
          </div>
        </div>

        {/* Right Column - Content Editor */}
        <div className="space-y-6 lg:col-span-2">
          {/* Language Tabs */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                className={`rounded-lg px-4 py-2 font-semibold text-sm transition ${
                  activeTab === "en"
                    ? "bg-[#E85D48] text-white"
                    : "border border-[#E5E5E5] bg-white text-[#737373] hover:border-[#E85D48]"
                }`}
                onClick={() => setActiveTab("en")}
                type="button"
              >
                English
              </button>
              <button
                className={`rounded-lg px-4 py-2 font-semibold text-sm transition ${
                  activeTab === "es"
                    ? "bg-[#E85D48] text-white"
                    : "border border-[#E5E5E5] bg-white text-[#737373] hover:border-[#E85D48]"
                }`}
                onClick={() => setActiveTab("es")}
                type="button"
              >
                Español
              </button>
            </div>

            <button
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition ${
                previewMode
                  ? "bg-[#E85D48] text-white"
                  : "border border-[#E5E5E5] bg-white text-[#737373] hover:border-[#E85D48]"
              }`}
              onClick={() => setPreviewMode(!previewMode)}
              type="button"
            >
              <HugeiconsIcon className="h-4 w-4" icon={previewMode ? PencilEdit02Icon : EyeIcon} />
              {previewMode ? "Edit" : "Preview"}
            </button>
          </div>

          {/* English Content */}
          {activeTab === "en" && (
            <div className="space-y-4">
              {/* Title EN */}
              <div>
                <label
                  className="mb-2 block font-semibold text-[#171717] text-sm"
                  htmlFor="title_en"
                >
                  Title (English)
                </label>
                <input
                  className="w-full rounded-lg border border-[#E5E5E5] bg-white px-4 py-3 text-[#171717] transition focus:border-[#E85D48] focus:outline-none focus:ring-2 focus:ring-[#E85D48]/20"
                  id="title_en"
                  onChange={(e) => handleTitleEnChange(e.target.value)}
                  placeholder="How to create your first booking"
                  required
                  type="text"
                  value={titleEn}
                />
              </div>

              {/* Excerpt EN */}
              <div>
                <label
                  className="mb-2 block font-semibold text-[#171717] text-sm"
                  htmlFor="excerpt_en"
                >
                  Excerpt (English)
                  <span className="ml-2 font-normal text-[#737373]">Optional</span>
                </label>
                <input
                  className="w-full rounded-lg border border-[#E5E5E5] bg-white px-4 py-3 text-[#171717] transition focus:border-[#E85D48] focus:outline-none focus:ring-2 focus:ring-[#E85D48]/20"
                  id="excerpt_en"
                  onChange={(e) => setExcerptEn(e.target.value)}
                  placeholder="A brief summary of the article..."
                  type="text"
                  value={excerptEn}
                />
              </div>

              {/* Content EN */}
              <div>
                <label
                  className="mb-2 block font-semibold text-[#171717] text-sm"
                  htmlFor="content_en"
                >
                  Content (English)
                </label>
                {previewMode ? (
                  <div
                    className="prose prose-lg max-w-none prose-code:rounded rounded-lg border border-[#E5E5E5] bg-white prose-code:bg-gray-100 p-6 prose-code:px-1.5 prose-code:py-0.5 prose-headings:font-semibold prose-a:text-[#E85D48] prose-code:text-gray-900 prose-headings:text-gray-900 prose-strong:text-gray-900 prose-a:no-underline prose-code:before:content-none prose-code:after:content-none hover:prose-a:underline"
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                ) : (
                  <textarea
                    className="min-h-[400px] w-full rounded-lg border border-[#E5E5E5] bg-white p-4 font-mono text-[#171717] text-sm transition focus:border-[#E85D48] focus:outline-none focus:ring-2 focus:ring-[#E85D48]/20"
                    id="content_en"
                    onChange={(e) => setContentEn(e.target.value)}
                    placeholder="# Article Title

Start writing your article in Markdown...

## Section Heading

Your content here..."
                    required
                    value={contentEn}
                  />
                )}
              </div>
            </div>
          )}

          {/* Spanish Content */}
          {activeTab === "es" && (
            <div className="space-y-4">
              {/* Title ES */}
              <div>
                <label
                  className="mb-2 block font-semibold text-[#171717] text-sm"
                  htmlFor="title_es"
                >
                  Título (Español)
                </label>
                <input
                  className="w-full rounded-lg border border-[#E5E5E5] bg-white px-4 py-3 text-[#171717] transition focus:border-[#E85D48] focus:outline-none focus:ring-2 focus:ring-[#E85D48]/20"
                  id="title_es"
                  onChange={(e) => setTitleEs(e.target.value)}
                  placeholder="Cómo crear tu primera reserva"
                  required
                  type="text"
                  value={titleEs}
                />
              </div>

              {/* Excerpt ES */}
              <div>
                <label
                  className="mb-2 block font-semibold text-[#171717] text-sm"
                  htmlFor="excerpt_es"
                >
                  Extracto (Español)
                  <span className="ml-2 font-normal text-[#737373]">Opcional</span>
                </label>
                <input
                  className="w-full rounded-lg border border-[#E5E5E5] bg-white px-4 py-3 text-[#171717] transition focus:border-[#E85D48] focus:outline-none focus:ring-2 focus:ring-[#E85D48]/20"
                  id="excerpt_es"
                  onChange={(e) => setExcerptEs(e.target.value)}
                  placeholder="Un breve resumen del artículo..."
                  type="text"
                  value={excerptEs}
                />
              </div>

              {/* Content ES */}
              <div>
                <label
                  className="mb-2 block font-semibold text-[#171717] text-sm"
                  htmlFor="content_es"
                >
                  Contenido (Español)
                </label>
                {previewMode ? (
                  <div
                    className="prose prose-lg max-w-none prose-code:rounded rounded-lg border border-[#E5E5E5] bg-white prose-code:bg-gray-100 p-6 prose-code:px-1.5 prose-code:py-0.5 prose-headings:font-semibold prose-a:text-[#E85D48] prose-code:text-gray-900 prose-headings:text-gray-900 prose-strong:text-gray-900 prose-a:no-underline prose-code:before:content-none prose-code:after:content-none hover:prose-a:underline"
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                ) : (
                  <textarea
                    className="min-h-[400px] w-full rounded-lg border border-[#E5E5E5] bg-white p-4 font-mono text-[#171717] text-sm transition focus:border-[#E85D48] focus:outline-none focus:ring-2 focus:ring-[#E85D48]/20"
                    id="content_es"
                    onChange={(e) => setContentEs(e.target.value)}
                    placeholder="# Título del Artículo

Empieza a escribir tu artículo en Markdown...

## Encabezado de Sección

Tu contenido aquí..."
                    required
                    value={contentEs}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
