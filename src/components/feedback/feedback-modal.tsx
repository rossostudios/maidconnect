"use client";

import { Bug, CheckCircle, Frown, Heart, HelpCircle, Lightbulb, TrendingUp, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

type FeedbackModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type FeedbackType = "bug" | "feature_request" | "improvement" | "complaint" | "praise" | "other";

const feedbackTypes: { value: FeedbackType; label: string; icon: any; description: string }[] = [
  {
    value: "bug",
    label: "Bug Report",
    icon: Bug,
    description: "Something isn't working correctly",
  },
  {
    value: "feature_request",
    label: "Feature Request",
    icon: Lightbulb,
    description: "Suggest a new feature",
  },
  {
    value: "improvement",
    label: "Improvement",
    icon: TrendingUp,
    description: "Suggest an enhancement",
  },
  {
    value: "complaint",
    label: "Complaint",
    icon: Frown,
    description: "Report an issue or concern",
  },
  {
    value: "praise",
    label: "Praise",
    icon: Heart,
    description: "Share positive feedback",
  },
  {
    value: "other",
    label: "Other",
    icon: HelpCircle,
    description: "General feedback",
  },
];

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const t = useTranslations("feedback");

  const [feedbackType, setFeedbackType] = useState<FeedbackType>("other");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !loading) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose, loading]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setFeedbackType("other");
        setSubject("");
        setMessage("");
        setEmail("");
        setConsent(false);
        setSubmitted(false);
        setError(null);
      }, 300);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (message.length < 10) {
      setError("Message must be at least 10 characters");
      return;
    }

    if (!consent) {
      setError("Please consent to data processing");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Gather context
      const context = {
        page_url: window.location.href,
        page_path: window.location.pathname,
        user_agent: navigator.userAgent,
        viewport_size: {
          width: window.innerWidth,
          height: window.innerHeight,
          pixelRatio: window.devicePixelRatio,
        },
      };

      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedback_type: feedbackType,
          subject: subject || undefined,
          message,
          user_email: email || undefined,
          ...context,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit feedback");
      }

      setSubmitted(true);

      // Auto-close after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  // Success State
  if (submitted) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={handleBackdropClick}
      >
        <div className="w-full max-w-md rounded-[28px] bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="font-bold text-2xl text-[#211f1a]">{t("success.title")}</h3>
          <p className="mt-2 text-[#5d574b] text-base">{t("success.message")}</p>
        </div>
      </div>
    );
  }

  const selectedType = feedbackTypes.find((type) => type.value === feedbackType);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-white p-6 shadow-xl sm:p-8">
        {/* Close Button */}
        <button
          aria-label="Close"
          className="absolute top-4 right-4 rounded-full p-2 text-[#5d574b] transition hover:bg-[#ebe5d8] sm:top-6 sm:right-6"
          disabled={loading}
          onClick={onClose}
          type="button"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-6 pr-12">
          <h2 className="font-bold text-2xl text-[#211f1a] sm:text-3xl">{t("title")}</h2>
          <p className="mt-2 text-[#5d574b] text-base">{t("description")}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Feedback Type */}
          <div className="mb-6">
            <label className="mb-3 block font-semibold text-[#211f1a] text-base">
              {t("form.typeLabel")}
            </label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {feedbackTypes.map((type) => {
                const TypeIcon = type.icon;
                const isSelected = feedbackType === type.value;

                return (
                  <button
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition ${
                      isSelected
                        ? "border-[#ff5d46] bg-[#ff5d4610]"
                        : "border-[#ebe5d8] bg-white hover:border-[#ff5d46]/50"
                    }`}
                    key={type.value}
                    onClick={() => setFeedbackType(type.value)}
                    type="button"
                  >
                    <TypeIcon
                      className={`h-6 w-6 ${isSelected ? "text-[#ff5d46]" : "text-[#7a6d62]"}`}
                    />
                    <span
                      className={`font-medium text-sm ${isSelected ? "text-[#ff5d46]" : "text-[#211f1a]"}`}
                    >
                      {type.label}
                    </span>
                  </button>
                );
              })}
            </div>
            {selectedType && (
              <p className="mt-2 text-[#7a6d62] text-sm">{selectedType.description}</p>
            )}
          </div>

          {/* Subject (Optional) */}
          <div className="mb-6">
            <label className="mb-2 block font-semibold text-[#211f1a] text-base" htmlFor="subject">
              {t("form.subjectLabel")}{" "}
              <span className="text-[#7a6d62]">({t("form.optional")})</span>
            </label>
            <input
              className="w-full rounded-xl border border-[#ebe5d8] px-4 py-3 text-base shadow-sm transition focus:border-[#ff5d46] focus:outline-none focus:ring-2 focus:ring-[#ff5d4633] disabled:opacity-60"
              disabled={loading}
              id="subject"
              maxLength={200}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t("form.subjectPlaceholder")}
              type="text"
              value={subject}
            />
          </div>

          {/* Message */}
          <div className="mb-6">
            <label className="mb-2 block font-semibold text-[#211f1a] text-base" htmlFor="message">
              {t("form.messageLabel")} <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full rounded-xl border border-[#ebe5d8] px-4 py-3 text-base shadow-sm transition focus:border-[#ff5d46] focus:outline-none focus:ring-2 focus:ring-[#ff5d4633] disabled:opacity-60"
              disabled={loading}
              id="message"
              maxLength={5000}
              minLength={10}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("form.messagePlaceholder")}
              required
              rows={6}
              value={message}
            />
            <p className="mt-1 text-right text-[#7a6d62] text-sm">
              {message.length}/5000 characters
            </p>
          </div>

          {/* Email (for anonymous users) */}
          <div className="mb-6">
            <label className="mb-2 block font-semibold text-[#211f1a] text-base" htmlFor="email">
              {t("form.emailLabel")} <span className="text-[#7a6d62]">({t("form.optional")})</span>
            </label>
            <input
              className="w-full rounded-xl border border-[#ebe5d8] px-4 py-3 text-base shadow-sm transition focus:border-[#ff5d46] focus:outline-none focus:ring-2 focus:ring-[#ff5d4633] disabled:opacity-60"
              disabled={loading}
              id="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("form.emailPlaceholder")}
              type="email"
              value={email}
            />
            <p className="mt-1 text-[#7a6d62] text-sm">{t("form.emailHelp")}</p>
          </div>

          {/* Consent */}
          <div className="mb-6">
            <label className="flex items-start gap-3">
              <input
                checked={consent}
                className="mt-1 h-4 w-4 rounded border-[#ebe5d8] text-[#ff5d46] transition focus:ring-2 focus:ring-[#ff5d4633] disabled:opacity-60"
                disabled={loading}
                onChange={(e) => setConsent(e.target.checked)}
                required
                type="checkbox"
              />
              <span className="text-[#5d574b] text-sm leading-relaxed">
                {t("form.consentText")}
              </span>
            </label>
          </div>

          {/* Privacy Notice */}
          <div className="mb-6 rounded-xl bg-blue-50 p-4">
            <p className="text-blue-900 text-sm leading-relaxed">{t("form.privacyNotice")}</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-xl bg-red-50 p-4 text-red-800 text-sm">{error}</div>
          )}

          {/* Submit Button */}
          <button
            className="w-full rounded-full bg-[#ff5d46] px-6 py-4 font-semibold text-base text-white transition hover:bg-[#e54d36] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading || !consent || message.length < 10}
            type="submit"
          >
            {loading ? t("form.submitting") : t("form.submit")}
          </button>
        </form>
      </div>
    </div>
  );
}
