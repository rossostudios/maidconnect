"use client";

import { useFeedback } from "@/components/providers/feedback-provider";

type FeedbackLinkProps = {
  children: React.ReactNode;
  className?: string;
};

export function FeedbackLink({ children, className }: FeedbackLinkProps) {
  const { openFeedback } = useFeedback();

  return (
    <button
      className={className || "text-stone-600 underline transition hover:text-stone-900"}
      onClick={openFeedback}
      type="button"
    >
      {children}
    </button>
  );
}
