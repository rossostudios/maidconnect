"use client";

import {
  ArrowRight01Icon,
  BubbleChatIcon,
  Calendar01Icon,
  Clock01Icon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { marked } from "marked";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ArticleTags } from "@/components/help/article-tags";
import { sanitizeRichContent } from "@/lib/sanitize";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { toast } from "@/lib/toast";

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
  categorySlug: string;
  categoryName: string;
  relatedArticles?: RelatedArticle[];
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
  categorySlug,
  categoryName,
  relatedArticles = [],
}: ArticleViewerProps) {
  const t = useTranslations("help.article");
  const locale = useLocale();
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackType, setFeedbackType] = useState<"helpful" | "not_helpful" | null>(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  return (
    <div className="mx-auto max-w-4xl">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-gray-600 text-sm">
        <Link className="hover:text-[#E85D48]" href={`/${locale}/help`}>
          {t("breadcrumb.home")}
        </Link>
        <span>/</span>
        <Link className="hover:text-[#E85D48]" href={`/${locale}/help/${categorySlug}`}>
          {categoryName}
        </Link>
      </nav>

      {/* Article Header */}
      <div className="mb-8">
        <h1 className="mb-4 font-bold text-3xl text-gray-900 md:text-4xl">{article.title}</h1>

        {/* Article Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mb-4">
            <ArticleTags locale={locale} tags={article.tags} />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 text-gray-600 text-sm">
          {/* Recently Updated Badge */}
          {recentlyUpdated && (
            <span className="rounded-full bg-green-100 px-2.5 py-1 font-medium text-green-700 text-xs">
              {t("meta.recentlyUpdated")}
            </span>
          )}

          {/* Updated Date */}
          <div className="flex items-center gap-1.5">
            <HugeiconsIcon className="h-4 w-4" icon={Calendar01Icon} />
            <span>{t("meta.updated", { date: formatDate(article.updated_at) })}</span>
          </div>

          {/* View Count */}
          <div className="flex items-center gap-1.5">
            <HugeiconsIcon className="h-4 w-4" icon={ViewIcon} />
            <span>{t("meta.views", { count: article.view_count })}</span>
          </div>

          {/* Read Time */}
          <div className="flex items-center gap-1.5">
            <HugeiconsIcon className="h-4 w-4" icon={Clock01Icon} />
            <span>{t("meta.readTime", { minutes: readTime })}</span>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div
        className="prose prose-lg mb-12 max-w-none prose-code:rounded prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-headings:font-semibold prose-a:text-[#E85D48] prose-code:text-gray-900 prose-headings:text-gray-900 prose-strong:text-gray-900 prose-a:no-underline prose-code:before:content-none prose-code:after:content-none hover:prose-a:underline"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />

      {/* Feedback Section */}
      <div className="mb-12 border-gray-200 border-t border-b py-8">
        {feedbackSubmitted ? (
          <div className="rounded-lg bg-green-50 p-4 text-green-800">
            <p className="font-medium">
              {feedbackType === "helpful"
                ? t("feedback.thanksHelpful")
                : t("feedback.thanksNotHelpful")}
            </p>
          </div>
        ) : (
          <div>
            <h3 className="mb-4 font-semibold text-gray-900 text-lg">{t("feedback.question")}</h3>
            <div className="flex gap-4">
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
                onClick={() => handleFeedback(false)}
                type="button"
              >
                <HugeiconsIcon className="h-5 w-5" icon={ThumbsDownIcon} />
                {t("feedback.notHelpful")}
              </button>
            </div>
          </div>
        )}

        {/* Feedback Form for Not Helpful */}
        {showFeedbackForm && (
          <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-6">
            <h4 className="mb-3 font-semibold text-gray-900">{t("feedback.tellUsMore")}</h4>
            <textarea
              className="mb-4 w-full rounded-lg border border-gray-300 p-3 focus:border-[#E85D48] focus:outline-none focus:ring-2 focus:ring-[#E85D48]/20"
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder={t("feedback.placeholder")}
              rows={4}
              value={feedbackText}
            />
            <div className="flex gap-3">
              <button
                className="rounded-lg bg-[#E85D48] px-6 py-2 font-medium text-white transition hover:bg-[#E85D48] disabled:opacity-50"
                disabled={submitting}
                onClick={() => {
                  handleFeedbackTextSubmit();
                }}
                type="button"
              >
                {t("feedback.submit")}
              </button>
              <button
                className="rounded-lg border border-gray-300 bg-white px-6 py-2 font-medium text-gray-700 transition hover:bg-gray-50"
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
      {relatedArticles.length > 0 && (
        <div className="mb-12">
          <h3 className="mb-6 font-semibold text-gray-900 text-xl">{t("related.title")}</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {relatedArticles.map((related) => (
              <Link
                className="group rounded-lg border border-gray-200 p-4 transition hover:border-[#E85D48] hover:shadow-md"
                href={`/${locale}/help/${related.category_slug}/${related.slug}`}
                key={related.id}
              >
                <h4 className="mb-2 font-semibold text-gray-900 group-hover:text-[#E85D48]">
                  {related.title}
                </h4>
                {related.excerpt && <p className="text-gray-600 text-sm">{related.excerpt}</p>}
                <div className="mt-3 flex items-center text-[#E85D48] text-sm">
                  <span>{t("related.readMore")}</span>
                  <HugeiconsIcon className="ml-1 h-4 w-4" icon={ArrowRight01Icon} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Contact Support CTA */}
      <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-8 text-center">
        <HugeiconsIcon className="mx-auto mb-4 h-12 w-12 text-[#E85D48]" icon={BubbleChatIcon} />
        <h3 className="mb-2 font-semibold text-gray-900 text-xl">{t("contact.title")}</h3>
        <p className="mb-6 text-gray-600">{t("contact.description")}</p>
        <Link
          className="inline-flex items-center gap-2 rounded-lg bg-[#E85D48] px-6 py-3 font-semibold text-white transition hover:bg-[#E85D48]"
          href={`/${locale}/contact`}
        >
          {t("contact.button")}
          <HugeiconsIcon className="h-5 w-5" icon={ArrowRight01Icon} />
        </Link>
      </div>
    </div>
  );
}
