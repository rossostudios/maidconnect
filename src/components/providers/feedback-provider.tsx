"use client";

import dynamic from "next/dynamic";
import { createContext, type ReactNode, useContext, useState } from "react";

// Dynamic import for modal (lazy load on demand)
const FeedbackModal = dynamic(
  () => import("@/components/feedback/feedback-modal").then((mod) => mod.FeedbackModal),
  { ssr: false }
);

type FeedbackContextType = {
  openFeedback: () => void;
  closeFeedback: () => void;
};

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openFeedback = () => setIsOpen(true);
  const closeFeedback = () => setIsOpen(false);

  return (
    <FeedbackContext.Provider value={{ openFeedback, closeFeedback }}>
      {children}
      <FeedbackModal isOpen={isOpen} onClose={closeFeedback} />
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error("useFeedback must be used within FeedbackProvider");
  }
  return context;
}
