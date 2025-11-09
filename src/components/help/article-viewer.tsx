"use client";

import {
  ArrowRight01Icon,
  BubbleChatIcon,
  Calendar01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Link01Icon,
  Note01Icon,
  PencilEdit02Icon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { marked } from "marked";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArticleTags } from "@/components/help/article-tags";
import { sanitizeRichContent } from "@/lib/sanitize";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

const articleTheme = {
  shell: "mx-auto w-full max-w-4xl space-y-10 px-4 sm:px-0",
  metaCard:
    "flex flex-wrap items-center gap-4 rounded-2xl border border-slate-100 bg-white/90 px-4 py-3 text-sm text-slate-600",
  gradientCard:
    "rounded-3xl border border-slate-100 bg-gradient-to-br from-white via-white to-slate-50 px-6 py-5",
};

type ArticleTag = {
  id: string;
  slug: string;
  name_en: string;
  name_es: string;
  color: string;
};

type HelpArticle = {
  id: string;
  title: string;
  content: string;
  view_count: number;
  helpful_count: number;
  not_helpful_count: number;
  created_at: string;
  updated_at: string;
  tags?: ArticleTag[];
};

type RelatedArticle = {
  id: string;
  category_slug: string;
  slug: string;
  title: string;
  excerpt: string | null;
};

type ArticleViewerProps = {
  article: HelpArticle;
  articleId?: string;
  categorySlug: string;
  categoryName: string;
  isAdmin?: boolean;
  relatedArticles?: RelatedArticle[];
  showRelatedArticles?: boolean;
};

// Calculate estimated read time based on word count
function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

// Check if article was recently updated (within last 30 days)
function isRecentlyUpdated(updatedAt: string): boolean {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return new Date(updatedAt) > thirtyDaysAgo;
}

export function ArticleViewer({
  article,
  articleId,
  categorySlug,
  categoryName,
  isAdmin = false,
  relatedArticles = [],
  showRelatedArticles = true,
}: ArticleViewerProps) {
  const t = useTranslations("help.article");
  const locale = useLocale();
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackType, setFeedbackType] = useState<"helpful" | "not_helpful" | null>(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedQuickResponse, setSelectedQuickResponse] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Quick response options (W3C findable-support pattern)
  const quickResponses =
    locale === "en"
      ? ["Too technical", "Missing steps", "Outdated info", "Confusing", "Wrong article"]
      : ["Muy técnico", "Faltan pasos", "Info desactualizada", "Confuso", "Artículo equivocado"];

  // Calculate read time and check if recently updated
  const readTime = calculateReadTime(article.content);
  const recentlyUpdated = isRecentlyUpdated(article.updated_at);

  const handleFeedback = async (isHelpful: boolean) => {
    if (feedbackSubmitted) {
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();

      // Get or create session ID for anonymous users
      let sessionId = localStorage.getItem("help_session_id");
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        localStorage.setItem("help_session_id", sessionId);
      }

      // Check if user is authenticated
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase.from("help_article_feedback").insert({
        article_id: article.id,
        user_id: user?.id || null,
        session_id: user ? null : sessionId,
        is_helpful: isHelpful,
        feedback_text: feedbackText || null,
      });

      if (error) {
        // Check if already submitted
        if (error.code === "23505") {
          // Unique constraint violation
          toast.info(t("feedback.alreadySubmitted"));
        } else {
          console.error("Feedback error:", error);
          toast.error(t("feedback.error"));
        }
      } else {
        setFeedbackSubmitted(true);
        setFeedbackType(isHelpful ? "helpful" : "not_helpful");

        // If not helpful, show feedback form
        if (!(isHelpful || feedbackText)) {
          setShowFeedbackForm(true);
        }
      }
    } catch (error) {
      console.error("Feedback submission failed:", error);
      toast.error(t("feedback.error"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleFeedbackTextSubmit = async () => {
    if (!feedbackText.trim()) {
      setShowFeedbackForm(false);
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const sessionId = localStorage.getItem("help_session_id");
      const {
        data: { user },
      } = await supabase.auth.getUser();

      await supabase
        .from("help_article_feedback")
        .update({ feedback_text: feedbackText })
        .match({
          article_id: article.id,
          ...(user ? { user_id: user.id } : { session_id: sessionId }),
        });

      setShowFeedbackForm(false);
    } catch (error) {
      console.error("Feedback update failed:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  // Convert markdown to HTML, then sanitize to prevent XSS attacks
  // Admin-controlled content, but still sanitized for safety
  const sanitizedContent = useMemo(() => {
    // Convert markdown to HTML first (using parse for synchronous conversion)
    const html = marked.parse(article.content, { async: false }) as string;
    // Then sanitize the HTML
    return sanitizeRichContent(html);
  }, [article.content]);

  // Inject single "Back to top" button at the end of article (mobile affordance)
  useEffect(() => {
    const contentElement = contentRef.current;
    if (!contentElement) return;

    // Remove any existing back-to-top buttons to prevent duplicates
    contentElement.querySelectorAll(".back-to-top-btn").forEach((btn) => btn.remove());

    // Create single back-to-top button
    const backToTopBtn = document.createElement("div");
    backToTopBtn.className = "back-to-top-btn mt-8 mb-8 flex justify-center sm:justify-end";
    backToTopBtn.innerHTML = `
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
        aria-label="${locale === "en" ? "Back to top" : "Volver arriba"}"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
        <span>${locale === "en" ? "Back to top" : "Volver arriba"}</span>
      </button>
    `;

    // Add click handler for smooth scroll
    const button = backToTopBtn.querySelector("button");
    button?.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // Insert at the end of content
    contentElement.appendChild(backToTopBtn);

    // Cleanup function
    return () => {
      contentElement.querySelectorAll(".back-to-top-btn").forEach((btn) => btn.remove());
    };
  }, [sanitizedContent, locale]);

  return (
    <div className={articleTheme.shell}>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link className="hover:text-[#E85D48]" href={`/${locale}/help`}>
          {t("breadcrumb.home")}
        </Link>
        <span>/</span>
        <Link className="hover:text-[#E85D48]" href={`/${locale}/help/${categorySlug}`}>
          {categoryName}
        </Link>
      </nav>

      {/* Article Header */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <h1 className="font-semibold text-3xl tracking-tight text-slate-900 md:text-[40px] md:leading-tight">
            {article.title}
          </h1>

          {isAdmin && articleId && (
            <Link
              className="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm transition hover:border-[#E85D48]/40 hover:text-[#E85D48]"
              href={`/${locale}/admin/help/articles/${articleId}/edit`}
            >
              <HugeiconsIcon className="h-3.5 w-3.5" icon={PencilEdit02Icon} />
              <span>{locale === "en" ? "Edit" : "Editar"}</span>
            </Link>
          )}
        </div>

        {article.tags && article.tags.length > 0 && (
          <ArticleTags locale={locale} tags={article.tags} />
        )}

        <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_320px]">
          <div className={articleTheme.metaCard}>
            {recentlyUpdated && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                <HugeiconsIcon className="h-3.5 w-3.5" icon={CheckmarkCircle02Icon} />
                {t("meta.recentlyUpdated")}
              </span>
            )}
            <div className="flex items-center gap-1.5">
              <HugeiconsIcon className="h-4 w-4 text-slate-400" icon={Calendar01Icon} />
              <span>{t("meta.updated", { date: formatDate(article.updated_at) })}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <HugeiconsIcon className="h-4 w-4 text-slate-400" icon={ViewIcon} />
              <span>{t("meta.views", { count: article.view_count })}</span>
            </div>
          </div>

          {/* Need-to-Know Summary Card (Zendesk 2025 - above-the-fold orientation) */}
          <div className={cn(articleTheme.gradientCard, "lg:sticky lg:top-6")}>
            <div className="mb-3 flex items-center gap-2">
              <HugeiconsIcon className="h-5 w-5 text-slate-500" icon={Note01Icon} />
              <h3 className="font-semibold text-lg text-slate-900">
                {locale === "en" ? "Need to Know" : "Lo que necesitas saber"}
              </h3>
            </div>
            <div className="space-y-3 text-sm text-slate-700">
              <div className="flex items-start gap-2">
                <HugeiconsIcon className="mt-0.5 h-4 w-4 text-slate-500" icon={Clock01Icon} />
                <div>
                  <span className="font-medium">
                    {locale === "en" ? "Read time:" : "Tiempo de lectura:"}
                  </span>{" "}
                  {readTime} {locale === "en" ? "min" : "min"}
                </div>
              </div>
              <div className="flex items-start gap-2">
                <HugeiconsIcon className="mt-0.5 h-4 w-4 text-emerald-500" icon={CheckmarkCircle02Icon} />
                <div>
                  <span className="font-medium">
                    {locale === "en" ? "You'll learn:" : "Aprenderás:"}
                  </span>{" "}
                  {locale === "en"
                    ? "Step-by-step guide to complete this task"
                    : "Guía paso a paso para completar esta tarea"}
                </div>
              </div>
              {relatedArticles.length > 0 && (
                <div className="flex items-start gap-2">
                  <HugeiconsIcon className="mt-0.5 h-4 w-4 text-sky-500" icon={Link01Icon} />
                  <div>
                    <span className="font-medium">{locale === "en" ? "Related:" : "Relacionado:"}</span>{" "}
                    {relatedArticles.length} {locale === "en" ? "articles" : "artículos"}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Article Content - Constrained for readability (50-75ch per UXPin 2025) */}
      <div
        className="prose prose-lg w-full max-w-none prose-a:text-[#E85D48] prose-headings:text-slate-900 prose-p:text-slate-800"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        ref={contentRef}
      />

      {/* Enhanced Feedback Section (W3C findable-support pattern) */}
      <div className="rounded-3xl border border-slate-100 bg-white/80 px-6 py-8">
        {feedbackSubmitted ? (
          <div className="rounded-lg bg-green-50 p-6 text-green-800">
            <p className="mb-2 font-semibold text-lg">
              {feedbackType === "helpful"
                ? t("feedback.thanksHelpful")
                : t("feedback.thanksNotHelpful")}
            </p>
            <p className="text-green-700 text-sm">
              {locale === "en"
                ? "Your feedback helps us improve our help center."
                : "Tu retroalimentación nos ayuda a mejorar nuestro centro de ayuda."}
            </p>
          </div>
        ) : (
          <div>
            {/* Contextual question based on article type */}
            <h3 className="mb-6 font-semibold text-gray-900 text-xl">
              {locale === "en"
                ? "Did this article help you complete your task?"
                : "¿Este artículo te ayudó a completar tu tarea?"}
            </h3>

            <div className="flex flex-wrap gap-4">
              <button
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition hover:border-green-500 hover:bg-green-50 hover:text-green-700 disabled:opacity-50"
                disabled={submitting}
                onClick={() => handleFeedback(true)}
                type="button"
              >
                <HugeiconsIcon className="h-5 w-5" icon={ThumbsUpIcon} />
                {t("feedback.helpful")}
              </button>
              <button
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition hover:border-[#E85D48]/100 hover:bg-[#E85D48]/10 hover:text-red-700 disabled:opacity-50"
                disabled={submitting}
                onClick={() => {
                  setShowFeedbackForm(true);
                  handleFeedback(false);
                }}
                type="button"
              >
                <HugeiconsIcon className="h-5 w-5" icon={ThumbsDownIcon} />
                {t("feedback.notHelpful")}
              </button>
            </div>
          </div>
        )}

        {/* Enhanced Feedback Form with Quick Responses */}
        {showFeedbackForm && !feedbackSubmitted && (
          <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-6">
            <h4 className="mb-4 font-semibold text-gray-900 text-lg">
              {locale === "en"
                ? "What stopped you from completing your task?"
                : "¿Qué te impidió completar tu tarea?"}
            </h4>

            {/* Quick Response Chips */}
            <div className="mb-4">
              <p className="mb-3 text-gray-600 text-sm">
                {locale === "en" ? "Quick responses:" : "Respuestas rápidas:"}
              </p>
              <div className="flex flex-wrap gap-2">
                {quickResponses.map((response) => (
                  <button
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm transition-all",
                      selectedQuickResponse === response
                        ? "border-[#E85D48] bg-[#E85D48]/10 text-[#E85D48]"
                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                    )}
                    key={response}
                    onClick={() => {
                      setSelectedQuickResponse(response);
                      setFeedbackText(response);
                    }}
                    type="button"
                  >
                    {response}
                  </button>
                ))}
              </div>
            </div>

            {/* Free Text Area */}
            <div className="mb-4">
              <label className="mb-2 block font-medium text-gray-700 text-sm">
                {locale === "en"
                  ? "Additional details (optional):"
                  : "Detalles adicionales (opcional):"}
              </label>
              <textarea
                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-[#E85D48] focus:outline-none focus:ring-2 focus:ring-[#E85D48]/20"
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder={
                  locale === "en"
                    ? "Tell us more about your experience..."
                    : "Cuéntanos más sobre tu experiencia..."
                }
                rows={4}
                value={selectedQuickResponse === feedbackText ? "" : feedbackText}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                className="rounded-lg bg-[#E85D48] px-6 py-2 font-medium text-sm text-white transition hover:bg-[#D64A36] disabled:opacity-50"
                disabled={submitting || !feedbackText}
                onClick={handleFeedbackTextSubmit}
                type="button"
              >
                {submitting
                  ? locale === "en"
                    ? "Submitting..."
                    : "Enviando..."
                  : t("feedback.submit")}
              </button>
              <button
                className="rounded-lg border border-gray-300 bg-white px-6 py-2 font-medium text-gray-700 text-sm transition hover:bg-gray-50"
                onClick={() => setShowFeedbackForm(false)}
                type="button"
              >
                {t("feedback.skip")}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Related Articles */}
      {showRelatedArticles && relatedArticles.length > 0 && (
        <div className="mx-auto mb-12 max-w-3xl">
          <h3 className="mb-6 font-semibold text-gray-900 text-xl">{t("related.title")}</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {relatedArticles.map((related) => (
              <Link
                className="group rounded-2xl border border-slate-100 bg-white/80 p-5 transition hover:border-[#E85D48]/40 hover:shadow-md"
                href={`/${locale}/help/${related.category_slug}/${related.slug}`}
                key={related.id}
              >
                <h4 className="mb-2 font-semibold text-slate-900 group-hover:text-[#E85D48]">
                  {related.title}
                </h4>
                {related.excerpt && <p className="text-sm text-slate-600">{related.excerpt}</p>}
                <div className="mt-3 flex items-center text-sm text-[#E85D48]">
                  <span>{t("related.readMore")}</span>
                  <HugeiconsIcon className="ml-1 h-4 w-4" icon={ArrowRight01Icon} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Contact Support CTA */}
      <div className={cn(articleTheme.gradientCard, "text-center") }>
        <HugeiconsIcon className="mx-auto mb-4 h-12 w-12 text-[#E85D48]" icon={BubbleChatIcon} />
        <h3 className="mb-2 font-semibold text-xl text-slate-900">{t("contact.title")}</h3>
        <p className="mb-6 text-slate-600">{t("contact.description")}</p>
        <Link
          className="inline-flex items-center gap-2 rounded-xl bg-[#E85D48] px-6 py-3 font-semibold text-white transition hover:bg-[#d54a36]"
          href={`/${locale}/contact`}
        >
          {t("contact.button")}
          <HugeiconsIcon className="h-5 w-5" icon={ArrowRight01Icon} />
        </Link>
      </div>
    </div>
  );
}
