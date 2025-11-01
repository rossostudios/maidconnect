"use client";

import { useFeedback } from "@/components/providers/feedback-provider";

interface FeedbackLinkProps {
  children: React.ReactNode;
}

export function FeedbackLink({ children }: FeedbackLinkProps) {
  const { openFeedback } = useFeedback();

  return (
    <button className="transition hover:text-[#ff5d46]" onClick={openFeedback} type="button">
      {children}
    </button>
  );
}
