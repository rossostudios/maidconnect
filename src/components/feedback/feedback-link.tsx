"use client";

import { useFeedback } from "@/components/providers/feedback-provider";

interface FeedbackLinkProps {
  children: React.ReactNode;
}

export function FeedbackLink({ children }: FeedbackLinkProps) {
  const { openFeedback } = useFeedback();

  return (
    <button className="transition hover:text-[#8B7355]" onClick={openFeedback} type="button">
      {children}
    </button>
  );
}
