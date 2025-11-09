"use client";

import {
  Alert02Icon,
  ArrowLeft02Icon,
  CheckmarkCircle01Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createHelpArticle, updateHelpArticle } from "@/app/actions/help-articles-actions";
import { BlockEditor } from "@/components/admin/help/block-editor";
import { ArticleViewer } from "@/components/help/article-viewer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

const propertyCardClass =
  "rounded-3xl border border-slate-100/80 bg-slate-50/60 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.05)] backdrop-blur";
const propertyHeadingClass = "text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500";
const propertyRowClass = "grid grid-cols-[110px_1fr] items-center gap-4 rounded-2xl px-2 py-1.5";
const propertyValueClass =
  "w-full rounded-2xl border border-slate-200/70 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#E85D48]/40 focus:ring-0";

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

interface ArticleFormProps {
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
}

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
      <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-800 text-xs">
        <HugeiconsIcon className="h-3 w-3" icon={Alert02Icon} />
        {locale === "es" ? "Falta traducción" : "Missing translation"}
      </span>
    );
  }

  if (!(isEmpty || otherIsEmpty)) {
    // Both have content - show healthy status
    return (
      <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 font-medium text-green-800 text-xs">
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
    if (previewMode !== "both") return;

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
    <div className="min-h-screen bg-white">
      {/* Clean Admin Header */}
      <div className="border-gray-200 border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="text-gray-500 transition-colors hover:text-gray-900"
              onClick={() => router.back()}
              type="button"
            >
              <HugeiconsIcon className="h-5 w-5" icon={ArrowLeft02Icon} />
            </button>
            <div>
              <h1 className="font-semibold text-gray-900 text-xl">
                {initialData
                  ? locale === "es"
                    ? "Editar Artículo"
                    : "Edit Article"
                  : locale === "es"
                    ? "Nuevo Artículo"
                    : "New Article"}
              </h1>
              <p className="text-gray-500 text-sm">
                {locale === "es"
                  ? "Actualiza el contenido del artículo"
                  : "Update the article content"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-700 text-sm transition-colors hover:bg-gray-50"
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
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-700 text-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={saving}
              onClick={() => {
                handleSave(false);
              }}
              type="button"
            >
              {locale === "es" ? "Guardar Borrador" : "Save Draft"}
            </button>

            <button
              className="rounded-lg bg-[#E85D48] px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-[#D64A36] disabled:cursor-not-allowed disabled:opacity-50"
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
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="border-gray-200 border-b bg-gray-50 px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HugeiconsIcon className="h-5 w-5 text-gray-600" icon={ViewIcon} />
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {locale === "es" ? "Vista Previa" : "Preview Mode"}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {locale === "es"
                      ? "Comparar idiomas lado a lado"
                      : "Compare languages side-by-side"}
                  </p>
                </div>
              </div>

              {/* Language selector tabs */}
              <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-1">
                <button
                  className={cn(
                    "rounded px-3 py-1.5 font-medium text-xs",
                    previewMode === "en" ? "bg-[#E85D48] text-white shadow-sm" : "text-gray-600"
                  )}
                  onClick={() => setPreviewMode("en")}
                  type="button"
                >
                  EN
                </button>
                <button
                  className={cn(
                    "rounded px-3 py-1.5 font-medium text-xs",
                    previewMode === "es" ? "bg-[#E85D48] text-white shadow-sm" : "text-gray-600"
                  )}
                  onClick={() => setPreviewMode("es")}
                  type="button"
                >
                  ES
                </button>
                <button
                  className={cn(
                    "rounded px-3 py-1.5 font-medium text-xs",
                    previewMode === "both" ? "bg-[#E85D48] text-white shadow-sm" : "text-gray-600"
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
            <div className="grid grid-cols-2 divide-x divide-gray-200">
              {/* English preview */}
              <div
                className="max-h-[800px] overflow-y-auto p-8"
                data-preview-pane="en"
                onScroll={(e) => handleScroll(e, "en")}
              >
                <div className="mb-4 flex items-center gap-2 border-gray-200 border-b pb-2">
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-700 text-xs">
                    English
                  </span>
                  {!titleEn && (
                    <span className="flex items-center gap-1 text-amber-600 text-xs">
                      <HugeiconsIcon className="h-3 w-3" icon={Alert02Icon} />
                      Missing title
                    </span>
                  )}
                  {!contentEn && (
                    <span className="flex items-center gap-1 text-amber-600 text-xs">
                      <HugeiconsIcon className="h-3 w-3" icon={Alert02Icon} />
                      Missing content
                    </span>
                  )}
                </div>
                <ArticleViewer
                  article={previewArticleEn}
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
                <div className="mb-4 flex items-center gap-2 border-gray-200 border-b pb-2">
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-700 text-xs">
                    Español
                  </span>
                  {!titleEs && (
                    <span className="flex items-center gap-1 text-amber-600 text-xs">
                      <HugeiconsIcon className="h-3 w-3" icon={Alert02Icon} />
                      Falta título
                    </span>
                  )}
                  {!contentEs && (
                    <span className="flex items-center gap-1 text-amber-600 text-xs">
                      <HugeiconsIcon className="h-3 w-3" icon={Alert02Icon} />
                      Falta contenido
                    </span>
                  )}
                </div>
                <ArticleViewer
                  article={previewArticleEs}
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
              <div className="mb-4 flex items-center gap-2 border-gray-200 border-b pb-2">
                <span className="rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-700 text-xs">
                  {previewMode === "en" ? "English" : "Español"}
                </span>
              </div>
              <ArticleViewer
                article={previewMode === "en" ? previewArticleEn : previewArticleEs}
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
                    <TabsList className="bg-gray-100">
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
                        className="w-full border-none px-0 py-2 font-bold text-4xl text-gray-900 placeholder-gray-300 outline-none"
                        id="title-en"
                        onChange={(e) => setTitleEn(e.target.value)}
                        placeholder="Untitled"
                        type="text"
                        value={titleEn}
                      />
                    </div>

                    <div>
                      <textarea
                        className="w-full resize-none border-none px-0 py-2 text-gray-600 placeholder-gray-300 outline-none"
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
                        className="w-full border-none px-0 py-2 font-bold text-4xl text-gray-900 placeholder-gray-300 outline-none"
                        id="title-es"
                        onChange={(e) => setTitleEs(e.target.value)}
                        placeholder="Sin título"
                        type="text"
                        value={titleEs}
                      />
                    </div>

                    <div>
                      <textarea
                        className="w-full resize-none border-none px-0 py-2 text-gray-600 placeholder-gray-300 outline-none"
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
                    <span className="font-medium text-[12px] text-slate-500">
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
                    <span className="font-medium text-[12px] text-slate-500">Slug</span>
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
                        className="rounded-2xl border border-slate-200/70 px-3 py-1.5 font-medium text-[11px] text-slate-600 transition hover:text-[#E85D48]"
                        onClick={generateSlug}
                        type="button"
                      >
                        Auto
                      </button>
                    </div>
                  </div>

                  <div className={propertyRowClass}>
                    <span className="font-medium text-[12px] text-slate-500">
                      {locale === "es" ? "Orden" : "Order"}
                    </span>
                    <input
                      className={propertyValueClass}
                      id="display-order"
                      min="0"
                      onChange={(e) => setDisplayOrder(Number.parseInt(e.target.value) || 0)}
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
                    <span className="rounded-full bg-[#FEECE8] px-2 py-0.5 font-medium text-[#E85D48] text-xs">
                      {selectedTags.length}
                    </span>
                  )}
                </div>

                {selectedTags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedTags.map((tagId) => {
                      const tag = tags.find((t) => t.id === tagId);
                      if (!tag) return null;
                      return (
                        <span
                          className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-slate-700 text-xs"
                          key={tagId}
                        >
                          <span>{locale === "es" ? tag.name_es : tag.name_en}</span>
                          <button
                            className="text-slate-400"
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
                    <p className="text-slate-400 text-xs">
                      {locale === "es" ? "No hay etiquetas" : "No tags"}
                    </p>
                  ) : (
                    tags.map((tag) => (
                      <label
                        className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-slate-600 text-xs hover:bg-slate-50"
                        key={tag.id}
                      >
                        <input
                          checked={selectedTags.includes(tag.id)}
                          className="h-3.5 w-3.5 rounded border-slate-300 text-[#E85D48] focus:ring-0"
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
                <div className={cn(propertyRowClass, "mt-4 bg-white/60")}>
                  <span className="font-medium text-[12px] text-slate-500">
                    {locale === "es" ? "Estado" : "Status"}
                  </span>
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-white px-3 py-1 font-medium text-slate-700 text-sm">
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
                        className="h-5 w-10 cursor-pointer rounded-full border-slate-300 text-[#E85D48] focus:ring-[#E85D48]"
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
