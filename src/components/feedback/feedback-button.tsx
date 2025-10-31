"use client";

import { MessageSquare } from "lucide-react";
import { useState } from "react";
import { FeedbackModal } from "./feedback-modal";

/**
 * Floating feedback button
 * Fixed bottom-right position, opens feedback modal
 */
export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        aria-label="Send Feedback"
        className="group fixed right-6 bottom-6 z-40 flex items-center gap-2 rounded-full bg-[#ff5d46] px-4 py-3 font-semibold text-white shadow-lg transition hover:bg-[#e54d36] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#ff5d46] focus:ring-offset-2 sm:px-5 sm:py-4"
        data-feedback-button
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />
        <span className="hidden sm:inline">Feedback</span>
      </button>

      {/* Feedback Modal */}
      <FeedbackModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
