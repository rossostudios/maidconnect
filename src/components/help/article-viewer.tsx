"use client";

import {
  ArrowRight01Icon,
  BubbleChatIcon,
  Calendar01Icon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  ViewIcon,
} from "hugeicons-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { sanitizeRichContent } from "@/lib/sanitize";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { toast } from "@/lib/toast";

type HelpArticle = {
  id: string;
  title: string;
  content: string;
  view_count: number;
  helpful_count: number;
  not_helpful_count: number;
  created_at: string;
  updated_at: string;
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

  // Sanitize article content to prevent XSS attacks
  // Admin-controlled content, but still sanitized for safety
  const sanitizedContent = useMemo(() => sanitizeRichContent(article.content), [article.content]);

  return (
    <div className="mx-auto max-w-4xl">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-gray-600 text-sm">
        <Link className="hover:text-[var(--red)]" href={`/${locale}/help`}>
          {t("breadcrumb.home")}
        </Link>
        <span>/</span>
        <Link className="hover:text-[var(--red)]" href={`/${locale}/help/${categorySlug}`}>
          {categoryName}
        </Link>
      </nav>

      {/* Article Header */}
      <div className="mb-8">
        <h1 className="mb-4 font-bold text-3xl text-gray-900 md:text-4xl">{article.title}</h1>

        <div className="flex flex-wrap items-center gap-4 text-gray-600 text-sm">
          <div className="flex items-center gap-1.5">
            <Calendar01Icon className="h-4 w-4" />
            <span>{t("meta.updated", { date: formatDate(article.updated_at) })}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ViewIcon className="h-4 w-4" />
            <span>{t("meta.views", { count: article.view_count })}</span>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div
        className="prose prose-lg mb-12 max-w-none prose-code:rounded prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-headings:font-semibold prose-a:text-[var(--red)] prose-code:text-gray-900 prose-headings:text-gray-900 prose-strong:text-gray-900 prose-a:no-underline prose-code:before:content-none prose-code:after:content-none hover:prose-a:underline"
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
                <ThumbsUpIcon className="h-5 w-5" />
                {t("feedback.helpful")}
              </button>
              <button
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition hover:border-red-500 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                disabled={submitting}
                onClick={() => handleFeedback(false)}
                type="button"
              >
                <ThumbsDownIcon className="h-5 w-5" />
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
              className="mb-4 w-full rounded-lg border border-gray-300 p-3 focus:border-[var(--red)] focus:outline-none focus:ring-2 focus:ring-[var(--red)]/20"
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder={t("feedback.placeholder")}
              rows={4}
              value={feedbackText}
            />
            <div className="flex gap-3">
              <button
                className="rounded-lg bg-[var(--red)] px-6 py-2 font-medium text-white transition hover:bg-[var(--red)] disabled:opacity-50"
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
                className="group rounded-lg border border-gray-200 p-4 transition hover:border-[var(--red)] hover:shadow-md"
                href={`/${locale}/help/${related.category_slug}/${related.slug}`}
                key={related.id}
              >
                <h4 className="mb-2 font-semibold text-gray-900 group-hover:text-[var(--red)]">
                  {related.title}
                </h4>
                {related.excerpt && <p className="text-gray-600 text-sm">{related.excerpt}</p>}
                <div className="mt-3 flex items-center text-[var(--red)] text-sm">
                  <span>{t("related.readMore")}</span>
                  <ArrowRight01Icon className="ml-1 h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Contact Support CTA */}
      <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-8 text-center">
        <BubbleChatIcon className="mx-auto mb-4 h-12 w-12 text-[var(--red)]" />
        <h3 className="mb-2 font-semibold text-gray-900 text-xl">{t("contact.title")}</h3>
        <p className="mb-6 text-gray-600">{t("contact.description")}</p>
        <Link
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--red)] px-6 py-3 font-semibold text-white transition hover:bg-[var(--red)]"
          href={`/${locale}/contact`}
        >
          {t("contact.button")}
          <ArrowRight01Icon className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}
