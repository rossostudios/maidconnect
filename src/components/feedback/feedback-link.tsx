"use client";

import { useFeedback } from "@/components/providers/feedback-provider";

type FeedbackLinkProps = {
  children: React.ReactNode;
};

export function FeedbackLink({ children }: FeedbackLinkProps) {
  const { openFeedback } = useFeedback();

  return (
    <button className="transition hover:text-[var(--red)]" onClick={openFeedback} type="button">
      {children}
    </button>
  );
}
