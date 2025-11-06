"use client";

import { useFeedback } from "@/components/providers/feedback-provider";

type FeedbackLinkProps = {
  children: React.ReactNode;
};

export function FeedbackLink({ children }: FeedbackLinkProps) {
  const { openFeedback } = useFeedback();

  return (
    <button className="transition hover:text-[#E85D48]" onClick={openFeedback} type="button">
      {children}
    </button>
  );
}
