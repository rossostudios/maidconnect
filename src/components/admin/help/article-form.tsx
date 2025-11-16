"use client";

import {
  Alert02Icon,
  ArrowLeft02Icon,
  CheckmarkCircle01Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { createHelpArticle, updateHelpArticle } from "@/app/actions/help-articles-actions";
import { ArticleViewer } from "@/components/help/article-viewer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

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

const propertyCardClass =
  " border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-neutral-950/60 p-5 shadow-[0_1px_2px_rgba(22,22,22,0.05)] ";
const propertyHeadingClass =
  "text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-600 dark:text-neutral-400";
const propertyRowClass = "grid grid-cols-[110px_1fr] items-center gap-4 -2xl px-2 py-1.5";
const propertyValueClass =
  "w-full -2xl border border-neutral-200 dark:border-neutral-800/70 bg-white dark:bg-neutral-950 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 outline-none transition focus:border-neutral-900 dark:border-neutral-100/40 focus:ring-0";

type Category = {
  id: string;
  slug: string;
  name_en: string;
  name_es: string;
};

type Tag = {
  id: string;
  slug: string;
  name_en: string;
  name_es: string;
  color: string;
};

type ArticleTag = {
  id: string;
  slug: string;
  name_en: string;
  name_es: string;
  color: string;
};

type ArticleFormProps = {
  locale: "en" | "es";
  categories: Category[];
  tags: Tag[];
  initialData?: {
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
    display_order: number;
    tags?: ArticleTag[];
  };
};

// Translation Health Badge Component
function TranslationHealthBadge({
  fieldValue,
  otherLangValue,
  locale,
}: {
  fieldValue: string;
  otherLangValue: string;
  locale: "en" | "es";
}) {
  const isEmpty = !fieldValue || fieldValue.trim().length === 0;
  const otherIsEmpty = !otherLangValue || otherLangValue.trim().length === 0;

  if (isEmpty && otherIsEmpty) {
    return null; // Both empty - no indicator needed
  }

  if (isEmpty && !otherIsEmpty) {
    // This field is empty but other language has content
    return (
      <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-neutral-900 px-2 py-0.5 font-medium text-white text-xs dark:bg-neutral-100/10 dark:text-neutral-100">
        <HugeiconsIcon className="h-3 w-3" icon={Alert02Icon} />
        {locale === "es" ? "Falta traducción" : "Missing translation"}
      </span>
    );
  }

  if (!(isEmpty || otherIsEmpty)) {
    // Both have content - show healthy status
    return (
      <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-neutral-900 px-2 py-0.5 font-medium text-white text-xs dark:bg-neutral-100/10 dark:text-neutral-100">
        <HugeiconsIcon className="h-3 w-3" icon={CheckmarkCircle01Icon} />
        {locale === "es" ? "Completo" : "Complete"}
      </span>
    );
  }

  return null;
}

export function ArticleForm({ locale, categories, tags, initialData }: ArticleFormProps) {
  const router = useRouter();
  const [isPreview, setIsPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<"en" | "es" | "both">("both");

  // Form state
  const [categoryId, setCategoryId] = useState(initialData?.category_id ?? categories[0]?.id ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [titleEn, setTitleEn] = useState(initialData?.title_en ?? "");
  const [titleEs, setTitleEs] = useState(initialData?.title_es ?? "");
  const [excerptEn, setExcerptEn] = useState(initialData?.excerpt_en ?? "");
  const [excerptEs, setExcerptEs] = useState(initialData?.excerpt_es ?? "");
  const [contentEn, setContentEn] = useState(initialData?.content_en ?? "");
  const [contentEs, setContentEs] = useState(initialData?.content_es ?? "");
  const [isPublished, setIsPublished] = useState(initialData?.is_published ?? false);
  const [displayOrder, setDisplayOrder] = useState(initialData?.display_order ?? 0);
  const [selectedTags, setSelectedTags] = useState<string[]>(() => {
    const tagIds = initialData?.tags?.map((t) => t.id) ?? [];
    console.log("[ArticleForm] Initializing selectedTags:", {
      initialDataTags: initialData?.tags,
      tagIds,
      hasInitialData: !!initialData,
    });
    return tagIds;
  });

  const handleSave = async (publish = false) => {
    // Validation
    if (!categoryId) {
      toast.error(locale === "es" ? "Selecciona una categoría" : "Select a category");
      return;
    }

    if (!slug) {
      toast.error(locale === "es" ? "Ingresa un slug" : "Enter a slug");
      return;
    }

    if (!(titleEn && titleEs)) {
      toast.error(
        locale === "es"
          ? "Ingresa títulos en inglés y español"
          : "Enter titles in English and Spanish"
      );
      return;
    }

    if (!(contentEn && contentEs)) {
      toast.error(
        locale === "es"
          ? "Ingresa contenido en inglés y español"
          : "Enter content in English and Spanish"
      );
      return;
    }

    setSaving(true);

    try {
      const articleData = {
        category_id: categoryId,
        slug,
        title_en: titleEn,
        title_es: titleEs,
        excerpt_en: excerptEn || null,
        excerpt_es: excerptEs || null,
        content_en: contentEn,
        content_es: contentEs,
        is_published: publish || isPublished,
        display_order: displayOrder,
        tags: selectedTags,
      };

      let result;

      if (initialData) {
        // Update existing article
        result = await updateHelpArticle(initialData.id, articleData);
      } else {
        // Create new article
        result = await createHelpArticle(articleData);
      }

      if (result.success) {
        toast.success(
          locale === "es"
            ? publish
              ? "Artículo publicado"
              : "Artículo guardado"
            : publish
              ? "Article published"
              : "Article saved"
        );
        router.push(`/${locale}/admin/help/articles`);
      } else {
        toast.error(result.error ?? (locale === "es" ? "Error al guardar" : "Failed to save"));
      }
    } catch (error) {
      console.error("[Save Article Error]", error);
      toast.error(locale === "es" ? "Error al guardar artículo" : "Failed to save article");
    } finally {
      setSaving(false);
    }
  };

  // Auto-generate slug from English title
  const generateSlug = () => {
    const auto = titleEn
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
    setSlug(auto);
  };

  // Get category name for current locale
  const selectedCategory = categories.find((c) => c.id === categoryId);
  const categoryName = selectedCategory
    ? locale === "es"
      ? selectedCategory.name_es
      : selectedCategory.name_en
    : "";

  // Build preview data for both languages
  const previewArticleEn = {
    _id: initialData?.id ?? "preview",
    id: initialData?.id ?? "preview",
    title: titleEn,
    content: contentEn,
    view_count: 0,
    helpful_count: 0,
    not_helpful_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tags: selectedTags
      .map((tagId) => tags.find((t) => t.id === tagId))
      .filter((t): t is ArticleTag => !!t),
  };

  const previewArticleEs = {
    _id: initialData?.id ?? "preview",
    id: initialData?.id ?? "preview",
    title: titleEs,
    content: contentEs,
    view_count: 0,
    helpful_count: 0,
    not_helpful_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tags: selectedTags
      .map((tagId) => tags.find((t) => t.id === tagId))
      .filter((t): t is ArticleTag => !!t),
  };

  // Synchronized scrolling handler
  const handleScroll = (e: React.UIEvent<HTMLDivElement>, sourcePane: "en" | "es") => {
    if (previewMode !== "both") {
      return;
    }

    const source = e.currentTarget;
    const scrollPercentage = source.scrollTop / (source.scrollHeight - source.clientHeight);

    // Find the other pane and sync its scroll
    const otherPane = document.querySelector(
      sourcePane === "en" ? "[data-preview-pane='es']" : "[data-preview-pane='en']"
    ) as HTMLDivElement;

    if (otherPane) {
      const targetScroll = scrollPercentage * (otherPane.scrollHeight - otherPane.clientHeight);
      otherPane.scrollTop = targetScroll;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Clean Admin Header */}
      <div className="border-neutral-200 border-b bg-white px-6 py-4 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-100 dark:text-neutral-400"
              onClick={() => router.back()}
              type="button"
            >
              <HugeiconsIcon className="h-5 w-5" icon={ArrowLeft02Icon} />
            </button>
            <div>
              <h1 className="font-semibold text-neutral-900 text-xl dark:text-neutral-100">
                {initialData
                  ? locale === "es"
                    ? "Editar Artículo"
                    : "Edit Article"
                  : locale === "es"
                    ? "Nuevo Artículo"
                    : "New Article"}
              </h1>
              <p className="text-neutral-600 text-sm dark:text-neutral-400">
                {locale === "es"
                  ? "Actualiza el contenido del artículo"
                  : "Update the article content"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="flex items-center gap-2 border border-neutral-200 bg-white px-3 py-2 text-neutral-600 text-sm transition-colors hover:bg-white dark:border-neutral-800 dark:bg-neutral-950 dark:bg-neutral-950 dark:text-neutral-400"
              onClick={() => setIsPreview(!isPreview)}
              type="button"
            >
              <HugeiconsIcon className="h-4 w-4" icon={ViewIcon} />
              {isPreview
                ? locale === "es"
                  ? "Editar"
                  : "Edit"
                : locale === "es"
                  ? "Vista Previa"
                  : "Preview"}
            </button>

            <button
              className="border border-neutral-200 bg-white px-4 py-2 text-neutral-600 text-sm transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:bg-neutral-950 dark:text-neutral-400"
              disabled={saving}
              onClick={() => {
                handleSave(false);
              }}
              type="button"
            >
              {locale === "es" ? "Guardar Borrador" : "Save Draft"}
            </button>

            <button
              className="bg-neutral-900 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:bg-neutral-100 dark:text-neutral-950"
              disabled={saving}
              onClick={() => {
                handleSave(true);
              }}
              type="button"
            >
              {locale === "es" ? "Publicar" : "Publish"}
            </button>
          </div>
        </div>
      </div>

      {/* Preview Mode - Dual-language with synchronized scrolling */}
      {isPreview ? (
        <div className="border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
          <div className="border-neutral-200 border-b bg-white px-6 py-3 dark:border-neutral-800 dark:bg-neutral-950">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HugeiconsIcon
                  className="h-5 w-5 text-neutral-600 dark:text-neutral-400"
                  icon={ViewIcon}
                />
                <div>
                  <p className="font-medium text-red-700 text-sm dark:text-red-200">
                    {locale === "es" ? "Vista Previa" : "Preview Mode"}
                  </p>
                  <p className="text-neutral-600 text-xs dark:text-neutral-400">
                    {locale === "es"
                      ? "Comparar idiomas lado a lado"
                      : "Compare languages side-by-side"}
                  </p>
                </div>
              </div>

              {/* Language selector tabs */}
              <div className="flex gap-1 border border-neutral-200 bg-white p-1 dark:border-neutral-800 dark:bg-neutral-950">
                <button
                  className={cn(
                    "px-3 py-1.5 font-medium text-xs",
                    previewMode === "en"
                      ? "bg-neutral-900 text-white shadow-sm dark:bg-neutral-100 dark:text-neutral-950"
                      : "text-neutral-600 dark:text-neutral-400"
                  )}
                  onClick={() => setPreviewMode("en")}
                  type="button"
                >
                  EN
                </button>
                <button
                  className={cn(
                    "px-3 py-1.5 font-medium text-xs",
                    previewMode === "es"
                      ? "bg-neutral-900 text-white shadow-sm dark:bg-neutral-100 dark:text-neutral-950"
                      : "text-neutral-600 dark:text-neutral-400"
                  )}
                  onClick={() => setPreviewMode("es")}
                  type="button"
                >
                  ES
                </button>
                <button
                  className={cn(
                    "px-3 py-1.5 font-medium text-xs",
                    previewMode === "both"
                      ? "bg-neutral-900 text-white shadow-sm dark:bg-neutral-100 dark:text-neutral-950"
                      : "text-neutral-600 dark:text-neutral-400"
                  )}
                  onClick={() => setPreviewMode("both")}
                  type="button"
                >
                  {locale === "es" ? "Ambos" : "Both"}
                </button>
              </div>
            </div>
          </div>

          {/* Preview content */}
          {previewMode === "both" ? (
            /* Side-by-side view with synchronized scrolling */
            <div className="grid grid-cols-2 divide-x divide-[neutral-50]">
              {/* English preview */}
              <div
                className="max-h-[800px] overflow-y-auto p-8"
                data-preview-pane="en"
                onScroll={(e) => handleScroll(e, "en")}
              >
                <div className="mb-4 flex items-center gap-2 border-neutral-200 border-b pb-2 dark:border-neutral-800">
                  <span className="bg-[neutral-200]/30 px-2 py-0.5 font-medium text-neutral-600 text-xs dark:text-neutral-400">
                    English
                  </span>
                  {!titleEn && (
                    <span className="flex items-center gap-1 text-neutral-900 text-xs dark:text-neutral-100">
                      <HugeiconsIcon className="h-3 w-3" icon={Alert02Icon} />
                      Missing title
                    </span>
                  )}
                  {!contentEn && (
                    <span className="flex items-center gap-1 text-neutral-900 text-xs dark:text-neutral-100">
                      <HugeiconsIcon className="h-3 w-3" icon={Alert02Icon} />
                      Missing content
                    </span>
                  )}
                </div>
                <ArticleViewer
                  article={previewArticleEn as any}
                  categoryName={locale === "en" ? categoryName : (selectedCategory?.name_en ?? "")}
                  categorySlug={selectedCategory?.slug ?? ""}
                  relatedArticles={[]}
                  showRelatedArticles={false}
                />
              </div>

              {/* Spanish preview */}
              <div
                className="max-h-[800px] overflow-y-auto p-8"
                data-preview-pane="es"
                onScroll={(e) => handleScroll(e, "es")}
              >
                <div className="mb-4 flex items-center gap-2 border-neutral-200 border-b pb-2 dark:border-neutral-800">
                  <span className="bg-[neutral-200]/30 px-2 py-0.5 font-medium text-neutral-600 text-xs dark:text-neutral-400">
                    Español
                  </span>
                  {!titleEs && (
                    <span className="flex items-center gap-1 text-neutral-900 text-xs dark:text-neutral-100">
                      <HugeiconsIcon className="h-3 w-3" icon={Alert02Icon} />
                      Falta título
                    </span>
                  )}
                  {!contentEs && (
                    <span className="flex items-center gap-1 text-neutral-900 text-xs dark:text-neutral-100">
                      <HugeiconsIcon className="h-3 w-3" icon={Alert02Icon} />
                      Falta contenido
                    </span>
                  )}
                </div>
                <ArticleViewer
                  article={previewArticleEs as any}
                  categoryName={locale === "es" ? categoryName : (selectedCategory?.name_es ?? "")}
                  categorySlug={selectedCategory?.slug ?? ""}
                  relatedArticles={[]}
                  showRelatedArticles={false}
                />
              </div>
            </div>
          ) : (
            /* Single language view */
            <div className="p-8">
              <div className="mb-4 flex items-center gap-2 border-neutral-200 border-b pb-2 dark:border-neutral-800">
                <span className="bg-[neutral-200]/30 px-2 py-0.5 font-medium text-neutral-600 text-xs dark:text-neutral-400">
                  {previewMode === "en" ? "English" : "Español"}
                </span>
              </div>
              <ArticleViewer
                article={(previewMode === "en" ? previewArticleEn : previewArticleEs) as any}
                categoryName={
                  previewMode === "en"
                    ? locale === "en"
                      ? categoryName
                      : (selectedCategory?.name_en ?? "")
                    : locale === "es"
                      ? categoryName
                      : (selectedCategory?.name_es ?? "")
                }
                categorySlug={selectedCategory?.slug ?? ""}
                relatedArticles={[]}
                showRelatedArticles={false}
              />
            </div>
          )}
        </div>
      ) : (
        /* Edit Mode - Clean admin design */
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            {/* Main Content - Tab-based language switcher */}
            <div>
              <Tabs defaultValue="en">
                <div className="mb-6">
                  <div className="flex items-center gap-4">
                    <TabsList className="bg-[neutral-200]/30">
                      <TabsTrigger value="en">
                        English
                        <TranslationHealthBadge
                          fieldValue={titleEn || contentEn}
                          locale="en"
                          otherLangValue={titleEs || contentEs}
                        />
                      </TabsTrigger>
                      <TabsTrigger value="es">
                        Español
                        <TranslationHealthBadge
                          fieldValue={titleEs || contentEs}
                          locale="es"
                          otherLangValue={titleEn || contentEn}
                        />
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </div>

                {/* English Tab */}
                <TabsContent value="en">
                  <div className="space-y-8">
                    <div>
                      <input
                        className="w-full border-none px-0 py-2 font-bold text-4xl text-neutral-900 placeholder-[neutral-200] outline-none dark:text-neutral-100"
                        id="title-en"
                        onChange={(e) => setTitleEn(e.target.value)}
                        placeholder="Untitled"
                        type="text"
                        value={titleEn}
                      />
                    </div>

                    <div>
                      <textarea
                        className="w-full resize-none border-none px-0 py-2 text-neutral-600 placeholder-[neutral-200] outline-none dark:text-neutral-400"
                        id="excerpt-en"
                        onChange={(e) => setExcerptEn(e.target.value)}
                        placeholder="Add a brief description... (optional)"
                        rows={2}
                        value={excerptEn}
                      />
                    </div>

                    <div>
                      <BlockEditor initialContent={contentEn} locale="en" onChange={setContentEn} />
                    </div>
                  </div>
                </TabsContent>

                {/* Spanish Tab */}
                <TabsContent value="es">
                  <div className="space-y-8">
                    <div>
                      <input
                        className="w-full border-none px-0 py-2 font-bold text-4xl text-neutral-900 placeholder-[neutral-200] outline-none dark:text-neutral-100"
                        id="title-es"
                        onChange={(e) => setTitleEs(e.target.value)}
                        placeholder="Sin título"
                        type="text"
                        value={titleEs}
                      />
                    </div>

                    <div>
                      <textarea
                        className="w-full resize-none border-none px-0 py-2 text-neutral-600 placeholder-[neutral-200] outline-none dark:text-neutral-400"
                        id="excerpt-es"
                        onChange={(e) => setExcerptEs(e.target.value)}
                        placeholder="Agrega una breve descripción... (opcional)"
                        rows={2}
                        value={excerptEs}
                      />
                    </div>

                    <div>
                      <BlockEditor initialContent={contentEs} locale="es" onChange={setContentEs} />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar - Metadata */}
            <div className="space-y-5">
              {/* Category & Slug */}
              <div className={propertyCardClass}>
                <p className={propertyHeadingClass}>
                  {locale === "es" ? "Información" : "Information"}
                </p>
                <div className="mt-4 space-y-3 text-sm">
                  <div className={propertyRowClass}>
                    <span className="font-medium text-[12px] text-neutral-600 dark:text-neutral-400">
                      {locale === "es" ? "Categoría" : "Category"}
                    </span>
                    <select
                      className={propertyValueClass}
                      id="category"
                      onChange={(e) => setCategoryId(e.target.value)}
                      value={categoryId}
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {locale === "es" ? cat.name_es : cat.name_en}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={propertyRowClass}>
                    <span className="font-medium text-[12px] text-neutral-600 dark:text-neutral-400">
                      Slug
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        className={cn(propertyValueClass, "font-mono text-xs")}
                        id="slug"
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="article-slug"
                        type="text"
                        value={slug}
                      />
                      <button
                        className="border border-neutral-200 px-3 py-1.5 font-medium text-[11px] text-neutral-600 transition hover:text-neutral-900 dark:border-neutral-800/70 dark:text-neutral-100 dark:text-neutral-400"
                        onClick={generateSlug}
                        type="button"
                      >
                        Auto
                      </button>
                    </div>
                  </div>

                  <div className={propertyRowClass}>
                    <span className="font-medium text-[12px] text-neutral-600 dark:text-neutral-400">
                      {locale === "es" ? "Orden" : "Order"}
                    </span>
                    <input
                      className={propertyValueClass}
                      id="display-order"
                      min="0"
                      onChange={(e) => setDisplayOrder(Number.parseInt(e.target.value, 10) || 0)}
                      type="number"
                      value={displayOrder}
                    />
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className={propertyCardClass}>
                <div className="flex items-center justify-between">
                  <p className={propertyHeadingClass}>{locale === "es" ? "Etiquetas" : "Tags"}</p>
                  {selectedTags.length > 0 && (
                    <span className="bg-white px-2 py-0.5 font-medium text-neutral-900 text-xs dark:bg-neutral-950 dark:text-neutral-100">
                      {selectedTags.length}
                    </span>
                  )}
                </div>

                {selectedTags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedTags.map((tagId) => {
                      const tag = tags.find((t) => t.id === tagId);
                      if (!tag) {
                        return null;
                      }
                      return (
                        <span
                          className="inline-flex items-center gap-1 rounded-full bg-[neutral-200]/30 px-2 py-1 text-neutral-600 text-xs dark:text-neutral-400"
                          key={tagId}
                        >
                          <span>{locale === "es" ? tag.name_es : tag.name_en}</span>
                          <button
                            className="text-neutral-600 dark:text-neutral-400/70"
                            onClick={() => {
                              setSelectedTags(selectedTags.filter((id) => id !== tagId));
                            }}
                            title={locale === "es" ? "Remover" : "Remove"}
                            type="button"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}

                <div className="mt-3 max-h-48 space-y-1 overflow-y-auto">
                  {tags.length === 0 ? (
                    <p className="text-neutral-600 text-xs dark:text-neutral-400/70">
                      {locale === "es" ? "No hay etiquetas" : "No tags"}
                    </p>
                  ) : (
                    tags.map((tag) => (
                      <label
                        className="flex cursor-pointer items-center gap-2 px-2 py-1 text-neutral-600 text-xs hover:bg-white dark:bg-neutral-950 dark:text-neutral-400"
                        key={tag.id}
                      >
                        <input
                          checked={selectedTags.includes(tag.id)}
                          className="h-3.5 w-3.5 border-neutral-400/40 text-neutral-900 focus:ring-0 dark:border-neutral-500/40 dark:text-neutral-100"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTags([...selectedTags, tag.id]);
                            } else {
                              setSelectedTags(selectedTags.filter((id) => id !== tag.id));
                            }
                          }}
                          type="checkbox"
                        />
                        <span className="flex-1">
                          {locale === "es" ? tag.name_es : tag.name_en}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Publish Status */}
              <div className={propertyCardClass}>
                <p className={propertyHeadingClass}>{locale === "es" ? "Estado" : "Status"}</p>
                <div className={cn(propertyRowClass, "mt-4 bg-white dark:bg-neutral-950/60")}>
                  <span className="font-medium text-[12px] text-neutral-600 dark:text-neutral-400">
                    {locale === "es" ? "Estado" : "Status"}
                  </span>
                  <div className="flex items-center justify-between gap-3">
                    <span className="bg-white px-3 py-1 font-medium text-neutral-600 text-sm dark:bg-neutral-950 dark:text-neutral-400">
                      {isPublished
                        ? locale === "es"
                          ? "Publicado"
                          : "Published"
                        : locale === "es"
                          ? "Borrador"
                          : "Draft"}
                    </span>
                    <label className="inline-flex cursor-pointer items-center gap-2">
                      <input
                        checked={isPublished}
                        className="h-5 w-10 cursor-pointer rounded-full border-neutral-400/40 text-neutral-900 focus:ring-neutral-500 dark:border-neutral-500/40 dark:text-neutral-100 dark:focus:ring-neutral-400"
                        onChange={(e) => setIsPublished(e.target.checked)}
                        type="checkbox"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
