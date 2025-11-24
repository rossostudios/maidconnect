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
import { PortableText } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ArticleTags } from "@/components/help/article-tags";
import { portableTextComponents } from "@/lib/integrations/sanity/PortableText";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { cn } from "@/lib/utils";

const articleTheme = {
  shell: "mx-auto w-full max-w-4xl space-y-10 px-4 sm:px-0",
  metaCard:
    "flex flex-wrap items-center gap-4  border border-[neutral-200] bg-[neutral-50]/90 px-4 py-3 text-sm text-[neutral-400]",
  gradientCard:
    " border border-[neutral-200] bg-gradient-to-br from-[neutral-50] via-[neutral-50] to-[bg-[neutral-50]] px-6 py-5",
};

type ArticleTag = {
  _id: string;
  slug: string;
  name: string;
  color: string;
};

type HelpArticle = {
  _id: string;
  title: string;
  content: PortableTextBlock[];
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

// Calculate estimated read time based on Portable Text blocks
function calculateReadTime(content: PortableTextBlock[]): number {
  const wordsPerMinute = 200;

  // Extract text from all blocks
  const text = content
    .map((block) => {
      if (block._type === "block" && Array.isArray(block.children)) {
        return block.children
          .filter((child: any) => child._type === "span")
          .map((child: any) => child.text || "")
          .join(" ");
      }
      return "";
    })
    .join(" ");

  const wordCount = text.trim().split(/\s+/).length;
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
        article_id: article._id,
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
          article_id: article._id,
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

  // Inject single "Back to top" button at the end of article (mobile affordance)
  useEffect(() => {
    const contentElement = contentRef.current;
    if (!contentElement) {
      return;
    }

    // Remove any existing back-to-top buttons to prevent duplicates
    for (const btn of contentElement.querySelectorAll(".back-to-top-btn")) {
      btn.remove();
    }

    // Create single back-to-top button
    const backToTopBtn = document.createElement("div");
    backToTopBtn.className = "back-to-top-btn mt-8 mb-8 flex justify-center sm:justify-end";
    backToTopBtn.innerHTML = `
      <button
        type="button"
        class="inline-flex items-center gap-2  border border-[neutral-200] bg-[neutral-50] px-4 py-2 text-sm font-medium text-[neutral-400] transition hover:border-[neutral-400]/40 hover:bg-[neutral-50] hover:text-[neutral-900]"
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
      for (const btn of contentElement.querySelectorAll(".back-to-top-btn")) {
        btn.remove();
      }
    };
  }, [locale]);

  return (
    <div className={articleTheme.shell}>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[neutral-400] text-sm">
        <Link className="hover:text-[neutral-500]" href={`/${locale}/help`}>
          {t("breadcrumb.home")}
        </Link>
        <span>/</span>
        <Link className="hover:text-[neutral-500]" href={`/${locale}/help/${categorySlug}`}>
          {categoryName}
        </Link>
      </nav>

      {/* Article Header */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <h1 className="font-semibold text-3xl text-[neutral-900] tracking-tight md:text-[40px] md:leading-tight">
            {article.title}
          </h1>

          {isAdmin && articleId && (
            <Link
              className="inline-flex shrink-0 items-center gap-2 border border-[neutral-200] bg-[neutral-50] px-4 py-2 font-medium text-[neutral-400] text-xs shadow-sm transition hover:border-[neutral-500]/40 hover:text-[neutral-500]"
              href={`/${locale}/admin/help/articles/${articleId}/edit`}
            >
              <HugeiconsIcon className="h-3.5 w-3.5" icon={PencilEdit02Icon} />
              <span>{locale === "en" ? "Edit" : "Editar"}</span>
            </Link>
          )}
        </div>

        {article.tags && article.tags.length > 0 && (
          <ArticleTags locale={locale} tags={article.tags as any} />
        )}

        <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_320px]">
          <div className={articleTheme.metaCard}>
            {recentlyUpdated && (
              <span className="inline-flex items-center gap-1 bg-[neutral-500]/10 px-3 py-1 font-semibold text-[neutral-500] text-xs">
                <HugeiconsIcon className="h-3.5 w-3.5" icon={CheckmarkCircle02Icon} />
                {t("meta.recentlyUpdated")}
              </span>
            )}
            <div className="flex items-center gap-1.5">
              <HugeiconsIcon className="h-4 w-4 text-[neutral-400]/70" icon={Calendar01Icon} />
              <span>{t("meta.updated", { date: formatDate(article.updated_at) })}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <HugeiconsIcon className="h-4 w-4 text-[neutral-400]/70" icon={ViewIcon} />
              <span>{t("meta.views", { count: article.view_count })}</span>
            </div>
          </div>

          {/* Need-to-Know Summary Card (Zendesk 2025 - above-the-fold orientation) */}
          <div className={cn(articleTheme.gradientCard, "lg:sticky lg:top-6")}>
            <div className="mb-3 flex items-center gap-2">
              <HugeiconsIcon className="h-5 w-5 text-[neutral-400]" icon={Note01Icon} />
              <h3 className="font-semibold text-[neutral-900] text-lg">
                {locale === "en" ? "Need to Know" : "Lo que necesitas saber"}
              </h3>
            </div>
            <div className="space-y-3 text-[neutral-400] text-sm">
              <div className="flex items-start gap-2">
                <HugeiconsIcon className="mt-0.5 h-4 w-4 text-[neutral-400]" icon={Clock01Icon} />
                <div>
                  <span className="font-medium">
                    {locale === "en" ? "Read time:" : "Tiempo de lectura:"}
                  </span>{" "}
                  {readTime} {locale === "en" ? "min" : "min"}
                </div>
              </div>
              <div className="flex items-start gap-2">
                <HugeiconsIcon
                  className="mt-0.5 h-4 w-4 text-[neutral-500]"
                  icon={CheckmarkCircle02Icon}
                />
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
                  <HugeiconsIcon className="mt-0.5 h-4 w-4 text-[neutral-500]" icon={Link01Icon} />
                  <div>
                    <span className="font-medium">
                      {locale === "en" ? "Related:" : "Relacionado:"}
                    </span>{" "}
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
        className="prose prose-lg w-full max-w-none prose-a:text-[neutral-500] prose-headings:text-[neutral-900] prose-p:text-[neutral-900]"
        ref={contentRef}
      >
        <PortableText components={portableTextComponents} value={article.content} />
      </div>

      {/* Enhanced Feedback Section (W3C findable-support pattern) */}
      <div className="border border-[neutral-200] bg-[neutral-50]/80 px-6 py-8">
        {feedbackSubmitted ? (
          <div className="bg-[neutral-500]/10 p-6 text-[neutral-500]">
            <p className="mb-2 font-semibold text-lg">
              {feedbackType === "helpful"
                ? t("feedback.thanksHelpful")
                : t("feedback.thanksNotHelpful")}
            </p>
            <p className="text-[neutral-500] text-sm">
              {locale === "en"
                ? "Your feedback helps us improve our help center."
                : "Tu retroalimentación nos ayuda a mejorar nuestro centro de ayuda."}
            </p>
          </div>
        ) : (
          <div>
            {/* Contextual question based on article type */}
            <h3 className="mb-6 font-semibold text-[neutral-900] text-xl">
              {locale === "en"
                ? "Did this article help you complete your task?"
                : "¿Este artículo te ayudó a completar tu tarea?"}
            </h3>

            <div className="flex flex-wrap gap-4">
              <button
                className="flex items-center gap-2 border border-[neutral-400]/40 bg-[neutral-50] px-6 py-3 font-medium text-[neutral-400] transition hover:border-[neutral-500] hover:bg-[neutral-500]/10 hover:text-[neutral-500] disabled:opacity-50"
                disabled={submitting}
                onClick={() => handleFeedback(true)}
                type="button"
              >
                <HugeiconsIcon className="h-5 w-5" icon={ThumbsUpIcon} />
                {t("feedback.helpful")}
              </button>
              <button
                className="flex items-center gap-2 border border-[neutral-400]/40 bg-[neutral-50] px-6 py-3 font-medium text-[neutral-400] transition hover:border-[neutral-500]/100 hover:bg-[neutral-500]/10 hover:text-[neutral-500] disabled:opacity-50"
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
          <div className="mt-6 border border-[neutral-200] bg-[neutral-50] p-6">
            <h4 className="mb-4 font-semibold text-[neutral-900] text-lg">
              {locale === "en"
                ? "What stopped you from completing your task?"
                : "¿Qué te impidió completar tu tarea?"}
            </h4>

            {/* Quick Response Chips */}
            <div className="mb-4">
              <p className="mb-3 text-[neutral-400] text-sm">
                {locale === "en" ? "Quick responses:" : "Respuestas rápidas:"}
              </p>
              <div className="flex flex-wrap gap-2">
                {quickResponses.map((response) => (
                  <button
                    className={cn(
                      "border px-4 py-2 text-sm transition-all",
                      selectedQuickResponse === response
                        ? "border-[neutral-500] bg-[neutral-500]/10 text-[neutral-500]"
                        : "border-[neutral-400]/40 bg-[neutral-50] text-[neutral-400] hover:border-[neutral-400] hover:bg-[neutral-50]"
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
              <label className="mb-2 block font-medium text-[neutral-400] text-sm">
                {locale === "en"
                  ? "Additional details (optional):"
                  : "Detalles adicionales (opcional):"}
              </label>
              <textarea
                className="w-full border border-[neutral-400]/40 p-3 text-sm focus:border-[neutral-500] focus:outline-none focus:ring-2 focus:ring-[neutral-500]/20"
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
                className="bg-[neutral-500] px-6 py-2 font-medium text-[neutral-50] text-sm transition hover:bg-[neutral-500] disabled:opacity-50"
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
                className="border border-[neutral-400]/40 bg-[neutral-50] px-6 py-2 font-medium text-[neutral-400] text-sm transition hover:bg-[neutral-50]"
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
          <h3 className="mb-6 font-semibold text-[neutral-900] text-xl">{t("related.title")}</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {relatedArticles.map((related) => (
              <Link
                className="group border border-[neutral-200] bg-[neutral-50]/80 p-5 transition hover:border-[neutral-500]/40 hover:shadow-md"
                href={`/${locale}/help/${related.category_slug}/${related.slug}`}
                key={related.id}
              >
                <h4 className="mb-2 font-semibold text-[neutral-900] group-hover:text-[neutral-500]">
                  {related.title}
                </h4>
                {related.excerpt && <p className="text-[neutral-400] text-sm">{related.excerpt}</p>}
                <div className="mt-3 flex items-center text-[neutral-500] text-sm">
                  <span>{t("related.readMore")}</span>
                  <HugeiconsIcon className="ml-1 h-4 w-4" icon={ArrowRight01Icon} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Contact Support CTA */}
      <div className={cn(articleTheme.gradientCard, "text-center")}>
        <HugeiconsIcon
          className="mx-auto mb-4 h-12 w-12 text-[neutral-500]"
          icon={BubbleChatIcon}
        />
        <h3 className="mb-2 font-semibold text-[neutral-900] text-xl">{t("contact.title")}</h3>
        <p className="mb-6 text-[neutral-400]">{t("contact.description")}</p>
        <Link
          className="inline-flex items-center gap-2 bg-[neutral-500] px-6 py-3 font-semibold text-[neutral-50] transition hover:bg-[neutral-500]"
          href={`/${locale}/contact`}
        >
          {t("contact.button")}
          <HugeiconsIcon className="h-5 w-5" icon={ArrowRight01Icon} />
        </Link>
      </div>
    </div>
  );
}
