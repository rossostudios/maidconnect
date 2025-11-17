"use client";

import { BookOpen01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { createArticle, updateArticle } from "./article-actions";

// Code split BlockEditor (1499 LOC) - lazy load on demand
const BlockEditor = dynamic(
  () =>
    import("@/components/admin/help/block-editor").then((mod) => ({ default: mod.BlockEditor })),
  {
    loading: () => (
      <div className="min-h-96 animate-pulse border border-neutral-200 bg-neutral-50 p-8">
        <div className="mb-4 h-10 w-48 bg-neutral-200" />
        <div className="space-y-3">
          <div className="h-4 w-full bg-neutral-200" />
          <div className="h-4 w-5/6 bg-neutral-200" />
          <div className="h-4 w-4/6 bg-neutral-200" />
        </div>
      </div>
    ),
    ssr: false, // BlockEditor is client-only
  }
);

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

type FormState = {
  categoryId: string;
  slug: string;
  titleEn: string;
  titleEs: string;
  contentEn: string;
  contentEs: string;
};

const buildSlugFromTitle = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const getFormValidationError = ({
  categoryId,
  slug,
  titleEn,
  titleEs,
  contentEn,
  contentEs,
}: FormState) => {
  if (!categoryId) {
    return "Please select a category";
  }
  if (!slug) {
    return "Slug is required";
  }
  if (!(titleEn && titleEs)) {
    return "Title is required in both languages";
  }
  if (!(contentEn && contentEs)) {
    return "Content is required in both languages";
  }
  return null;
};

const getHeaderTitle = (isEditing: boolean) => (isEditing ? "Edit Article" : "Create New Article");

const getHeaderSubtitle = (isEditing: boolean) =>
  isEditing ? "Update the article content and settings" : "Write a new help center article";

const getSubmitButtonLabel = (isEditing: boolean, submitting: boolean) => {
  if (submitting) {
    return "Saving...";
  }
  return isEditing ? "Update Article" : "Create Article";
};

const getSuccessToastMessage = (isEditing: boolean) =>
  isEditing ? "Article updated successfully" : "Article created successfully";

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
  const [submitting, setSubmitting] = useState(false);

  // Auto-generate slug from English title
  const handleTitleEnChange = (value: string) => {
    setTitleEn(value);
    if (!isEditing) {
      setSlug(buildSlugFromTitle(value));
    }
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = getFormValidationError({
      categoryId,
      slug,
      titleEn,
      titleEs,
      contentEn,
      contentEs,
    });

    if (validationError) {
      toast.error(validationError);
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
      } else {
        await createArticle(formData);
      }

      toast.success(getSuccessToastMessage(isEditing));

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
          <h1 className="mb-2 font-bold text-3xl text-neutral-900 dark:text-neutral-100">
            {getHeaderTitle(isEditing)}
          </h1>
          <p className="text-neutral-600 dark:text-neutral-300">{getHeaderSubtitle(isEditing)}</p>
        </div>

        <div className="flex gap-3">
          <button
            className="border border-neutral-200 bg-white px-6 py-3 font-semibold text-neutral-900 transition hover:border-orange-500 hover:text-orange-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:border-orange-400 dark:hover:text-orange-400"
            onClick={() => router.back()}
            type="button"
          >
            Cancel
          </button>
          <button
            className="inline-flex items-center gap-2 bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50 dark:bg-orange-600 dark:hover:bg-orange-700"
            disabled={submitting}
            type="submit"
          >
            <HugeiconsIcon className="h-5 w-5" icon={BookOpen01Icon} />
            {getSubmitButtonLabel(isEditing, submitting)}
          </button>
        </div>
      </div>

      {/* Main Form */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column - Form Fields */}
        <div className="space-y-6 lg:col-span-1">
          {/* Category */}
          <div>
            <label
              className="mb-2 block font-semibold text-orange-600 text-sm dark:text-orange-500"
              htmlFor="category"
            >
              Category
            </label>
            <select
              className="w-full border border-neutral-200 bg-white px-4 py-3 text-neutral-900 transition focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-500/20 dark:border-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:ring-neutral-400/20"
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
            <label
              className="mb-2 block font-semibold text-orange-600 text-sm dark:text-orange-500"
              htmlFor="slug"
            >
              Slug (URL)
            </label>
            <input
              className="w-full border border-neutral-200 bg-white px-4 py-3 font-mono text-orange-600 text-sm transition focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-500/20 dark:border-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-orange-500 dark:focus:ring-neutral-400/20"
              id="slug"
              onChange={(e) => setSlug(e.target.value)}
              placeholder="your-article-slug"
              required
              type="text"
              value={slug}
            />
            <p className="mt-1 text-neutral-600 text-xs dark:text-neutral-300">
              Used in URL: /help/category/<strong>{slug || "slug"}</strong>
            </p>
          </div>

          {/* Published Status */}
          <div className="border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
            <label className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-orange-600 text-sm dark:text-orange-500">
                  Published
                </div>
                <div className="text-neutral-600 text-xs dark:text-neutral-300">
                  Make this article visible to users
                </div>
              </div>
              <input
                checked={isPublished}
                className="h-5 w-5 border-neutral-200 text-orange-600 focus:ring-2 focus:ring-orange-500/20 dark:border-neutral-800 dark:text-orange-500 dark:focus:ring-orange-400/20"
                onChange={(e) => setIsPublished(e.target.checked)}
                type="checkbox"
              />
            </label>
          </div>

          {/* Editor Shortcuts Guide */}
          <div className="border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
            <h3 className="mb-3 font-semibold text-orange-600 text-sm dark:text-orange-500">
              Editor Shortcuts
            </h3>
            <div className="space-y-2 text-neutral-600 text-xs dark:text-neutral-300">
              <div>
                <kbd className="bg-neutral-100 px-1 dark:bg-neutral-800">/</kbd> Open block menu
              </div>
              <div>
                <kbd className="bg-neutral-100 px-1 dark:bg-neutral-800">Enter</kbd> Create new
                block
              </div>
              <div>
                <kbd className="bg-neutral-100 px-1 dark:bg-neutral-800">Backspace</kbd>{" "}
                Delete/merge blocks
              </div>
              <div>Select text for formatting toolbar</div>
            </div>
          </div>
        </div>

        {/* Right Column - Content Editor */}
        <div className="space-y-6 lg:col-span-2">
          {/* Language Tabs */}
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 font-semibold text-sm transition ${
                activeTab === "en"
                  ? "bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700"
                  : "border border-neutral-200 bg-white text-neutral-600 hover:border-orange-500 hover:text-orange-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
              }`}
              onClick={() => setActiveTab("en")}
              type="button"
            >
              English
            </button>
            <button
              className={`px-4 py-2 font-semibold text-sm transition ${
                activeTab === "es"
                  ? "bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700"
                  : "border border-neutral-200 bg-white text-neutral-600 hover:border-orange-500 hover:text-orange-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
              }`}
              onClick={() => setActiveTab("es")}
              type="button"
            >
              Español
            </button>
          </div>

          {/* English Content */}
          {activeTab === "en" && (
            <div className="space-y-4">
              {/* Title EN */}
              <div>
                <label
                  className="mb-2 block font-semibold text-orange-600 text-sm dark:text-orange-500"
                  htmlFor="title_en"
                >
                  Title (English)
                </label>
                <input
                  className="w-full border border-neutral-200 bg-white px-4 py-3 text-neutral-900 transition focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:border-orange-400 dark:focus:ring-orange-400/20"
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
                  className="mb-2 block font-semibold text-orange-600 text-sm dark:text-orange-500"
                  htmlFor="excerpt_en"
                >
                  Excerpt (English)
                  <span className="ml-2 font-normal text-neutral-600 dark:text-neutral-300">
                    Optional
                  </span>
                </label>
                <input
                  className="w-full border border-neutral-200 bg-white px-4 py-3 text-neutral-900 transition focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:border-orange-400 dark:focus:ring-orange-400/20"
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
                  className="mb-2 block font-semibold text-orange-600 text-sm dark:text-orange-500"
                  htmlFor="content_en"
                >
                  Content (English)
                </label>
                <BlockEditor
                  initialContent={contentEn}
                  locale="en"
                  onChange={(markdown) => setContentEn(markdown)}
                  placeholder="Start writing your article..."
                />
              </div>
            </div>
          )}

          {/* Spanish Content */}
          {activeTab === "es" && (
            <div className="space-y-4">
              {/* Title ES */}
              <div>
                <label
                  className="mb-2 block font-semibold text-orange-600 text-sm dark:text-orange-500"
                  htmlFor="title_es"
                >
                  Título (Español)
                </label>
                <input
                  className="w-full border border-neutral-200 bg-white px-4 py-3 text-neutral-900 transition focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:border-orange-400 dark:focus:ring-orange-400/20"
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
                  className="mb-2 block font-semibold text-orange-600 text-sm dark:text-orange-500"
                  htmlFor="excerpt_es"
                >
                  Extracto (Español)
                  <span className="ml-2 font-normal text-neutral-600 dark:text-neutral-300">
                    Opcional
                  </span>
                </label>
                <input
                  className="w-full border border-neutral-200 bg-white px-4 py-3 text-neutral-900 transition focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:border-orange-400 dark:focus:ring-orange-400/20"
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
                  className="mb-2 block font-semibold text-orange-600 text-sm dark:text-orange-500"
                  htmlFor="content_es"
                >
                  Contenido (Español)
                </label>
                <BlockEditor
                  initialContent={contentEs}
                  locale="es"
                  onChange={(markdown) => setContentEs(markdown)}
                  placeholder="Empieza a escribir tu artículo..."
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
