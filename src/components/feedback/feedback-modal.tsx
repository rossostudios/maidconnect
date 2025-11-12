"use client";

import {
  AnalyticsUpIcon,
  Bug01Icon,
  CheckmarkCircle01Icon,
  FavouriteIcon,
  HelpCircleIcon,
  Idea01Icon,
  Sad01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { BaseModal } from "@/components/shared/base-modal";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useModalForm } from "@/hooks/use-modal-form";
import type { HugeIcon } from "@/types/icons";

type FeedbackModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type FeedbackType = "bug" | "feature_request" | "improvement" | "complaint" | "praise" | "other";

type FeedbackFormData = {
  feedbackType: FeedbackType;
  subject: string;
  message: string;
  email: string;
  consent: boolean;
};

const feedbackTypes: { value: FeedbackType; label: string; icon: HugeIcon; description: string }[] =
  [
    {
      value: "bug",
      label: "Bug Report",
      icon: Bug01Icon,
      description: "Something isn't working correctly",
    },
    {
      value: "feature_request",
      label: "Feature Request",
      icon: Idea01Icon,
      description: "Suggest a new feature",
    },
    {
      value: "improvement",
      label: "Improvement",
      icon: AnalyticsUpIcon,
      description: "Suggest an enhancement",
    },
    {
      value: "complaint",
      label: "Complaint",
      icon: Sad01Icon,
      description: "Report an issue or concern",
    },
    {
      value: "praise",
      label: "Praise",
      icon: FavouriteIcon,
      description: "Share positive feedback",
    },
    {
      value: "other",
      label: "Other",
      icon: HelpCircleIcon,
      description: "General feedback",
    },
  ];

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const t = useTranslations("feedback");
  const [submitted, setSubmitted] = useState(false);

  const form = useModalForm<FeedbackFormData>({
    initialData: {
      feedbackType: "other",
      subject: "",
      message: "",
      email: "",
      consent: false,
    },
    resetOnClose: true,
  });

  const feedbackMutation = useApiMutation({
    url: "/api/feedback",
    method: "POST",
    onSuccess: () => {
      setSubmitted(true);
      // Auto-close after 2 seconds
      setTimeout(() => {
        onClose();
        setSubmitted(false);
      }, 2000);
    },
  });

  const handleSubmit = async () => {
    if (form.formData.message.length < 10) {
      form.setError("Message must be at least 10 characters");
      return;
    }

    if (!form.formData.consent) {
      form.setError("Please consent to data processing");
      return;
    }

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

      await feedbackMutation.mutate({
        feedback_type: form.formData.feedbackType,
        subject: form.formData.subject || undefined,
        message: form.formData.message,
        user_email: form.formData.email || undefined,
        ...context,
      });
    } catch (error) {
      form.setError(error instanceof Error ? error.message : "Failed to submit feedback");
    }
  };

  // Success State
  if (submitted) {
    return (
      <BaseModal
        closeOnBackdropClick={false}
        closeOnEscape={false}
        isOpen={isOpen}
        onClose={onClose}
        showCloseButton={false}
        size="md"
      >
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[neutral-500]/10">
            <HugeiconsIcon className="h-8 w-8 text-[neutral-500]" icon={CheckmarkCircle01Icon} />
          </div>
          <h3 className="font-bold text-2xl text-[neutral-900]">{t("success.title")}</h3>
          <p className="mt-2 text-[neutral-400] text-base">{t("success.message")}</p>
        </div>
      </BaseModal>
    );
  }

  const selectedType = feedbackTypes.find((type) => type.value === form.formData.feedbackType);

  return (
    <BaseModal
      closeOnBackdropClick={!feedbackMutation.isLoading}
      closeOnEscape={!feedbackMutation.isLoading}
      description={t("description")}
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      title={t("title")}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        {/* Feedback Type */}
        <div className="mb-6">
          <div className="mb-3 block font-semibold text-[neutral-900] text-base">
            {t("form.typeLabel")}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {feedbackTypes.map((type) => {
              const isSelected = form.formData.feedbackType === type.value;

              return (
                <button
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition ${
                    isSelected
                      ? "border-[neutral-500] bg-[neutral-500]/10"
                      : "border-[neutral-200] bg-[neutral-50] hover:border-[neutral-500]/50"
                  }`}
                  key={type.value}
                  onClick={() => form.updateField("feedbackType", type.value)}
                  type="button"
                >
                  <HugeiconsIcon
                    className={`h-6 w-6 ${isSelected ? "text-[neutral-500]" : "text-[neutral-400]"}`}
                    icon={type.icon}
                  />
                  <span
                    className={`font-medium text-sm ${isSelected ? "text-[neutral-500]" : "text-[neutral-900]"}`}
                  >
                    {type.label}
                  </span>
                </button>
              );
            })}
          </div>
          {selectedType && (
            <p className="mt-2 text-[neutral-400] text-sm">{selectedType.description}</p>
          )}
        </div>

        {/* Subject (Optional) */}
        <div className="mb-6">
          <label
            className="mb-2 block font-semibold text-[neutral-900] text-base"
            htmlFor="subject"
          >
            {t("form.subjectLabel")}{" "}
            <span className="text-[neutral-400]">({t("form.optional")})</span>
          </label>
          <input
            className="w-full rounded-xl border border-[neutral-200] px-4 py-3 text-base shadow-sm transition focus:border-[neutral-500] focus:outline-none focus:ring-2 focus:ring-[neutral-500]/20 disabled:opacity-60"
            disabled={feedbackMutation.isLoading}
            id="subject"
            maxLength={200}
            onChange={(e) => form.updateField("subject", e.target.value)}
            placeholder={t("form.subjectPlaceholder")}
            type="text"
            value={form.formData.subject}
          />
        </div>

        {/* Message */}
        <div className="mb-6">
          <label
            className="mb-2 block font-semibold text-[neutral-900] text-base"
            htmlFor="message"
          >
            {t("form.messageLabel")} <span className="text-[neutral-500]/100">*</span>
          </label>
          <textarea
            className="w-full rounded-xl border border-[neutral-200] px-4 py-3 text-base shadow-sm transition focus:border-[neutral-500] focus:outline-none focus:ring-2 focus:ring-[neutral-500]/20 disabled:opacity-60"
            disabled={feedbackMutation.isLoading}
            id="message"
            maxLength={5000}
            minLength={10}
            onChange={(e) => form.updateField("message", e.target.value)}
            placeholder={t("form.messagePlaceholder")}
            required
            rows={6}
            value={form.formData.message}
          />
          <p className="mt-1 text-right text-[neutral-400] text-sm">
            {form.formData.message.length}/5000 characters
          </p>
        </div>

        {/* Email (for anonymous users) */}
        <div className="mb-6">
          <label className="mb-2 block font-semibold text-[neutral-900] text-base" htmlFor="email">
            {t("form.emailLabel")}{" "}
            <span className="text-[neutral-400]">({t("form.optional")})</span>
          </label>
          <input
            className="w-full rounded-xl border border-[neutral-200] px-4 py-3 text-base shadow-sm transition focus:border-[neutral-500] focus:outline-none focus:ring-2 focus:ring-[neutral-500]/20 disabled:opacity-60"
            disabled={feedbackMutation.isLoading}
            id="email"
            onChange={(e) => form.updateField("email", e.target.value)}
            placeholder={t("form.emailPlaceholder")}
            type="email"
            value={form.formData.email}
          />
          <p className="mt-1 text-[neutral-400] text-sm">{t("form.emailHelp")}</p>
        </div>

        {/* Consent */}
        <div className="mb-6">
          <label className="flex items-start gap-3">
            <input
              checked={form.formData.consent}
              className="mt-1 h-4 w-4 rounded border-[neutral-200] text-[neutral-500] transition focus:ring-2 focus:ring-[neutral-500]/20 disabled:opacity-60"
              disabled={feedbackMutation.isLoading}
              onChange={(e) => form.updateField("consent", e.target.checked)}
              required
              type="checkbox"
            />
            <span className="text-[neutral-400] text-sm leading-relaxed">
              {t("form.consentText")}
            </span>
          </label>
        </div>

        {/* Privacy Notice */}
        <div className="mb-6 rounded-xl bg-[neutral-50] p-4">
          <p className="text-[neutral-500] text-sm leading-relaxed">{t("form.privacyNotice")}</p>
        </div>

        {/* Error Message */}
        {form.error && (
          <div className="mb-6 rounded-xl bg-[neutral-500]/10 p-4 text-[neutral-500] text-sm">
            {form.error}
          </div>
        )}

        {/* Submit Button */}
        <button
          className="w-full rounded-full bg-[neutral-500] px-6 py-4 font-semibold text-[neutral-50] text-base transition hover:bg-[neutral-500] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={
            feedbackMutation.isLoading ||
            !form.formData.consent ||
            form.formData.message.length < 10
          }
          type="submit"
        >
          {feedbackMutation.isLoading ? t("form.submitting") : t("form.submit")}
        </button>
      </form>
    </BaseModal>
  );
}
