/**
 * Quick Replies Component
 *
 * Pre-defined message templates for professionals to respond faster
 * Sprint 2: Professional Inbox Improvements
 */

"use client";

import { ArrowDown01Icon, ArrowUp01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

type QuickReply = {
  id: string;
  label: string;
  message: string;
  category: "acceptance" | "questions" | "scheduling" | "general";
};

const QUICK_REPLIES: QuickReply[] = [
  // Acceptance messages
  {
    id: "accept-1",
    label: "Accept - Available",
    message:
      "Hello! I'd be happy to help with your booking. I'm available at the requested time. Looking forward to working with you!",
    category: "acceptance",
  },
  {
    id: "accept-2",
    label: "Accept - Confirm Details",
    message:
      "Thank you for your request! I can accommodate this booking. Just to confirm the service details and address - could you verify everything looks correct?",
    category: "acceptance",
  },

  // Questions
  {
    id: "question-1",
    label: "Ask About Details",
    message:
      "Thanks for reaching out! I have a few questions to ensure I can provide the best service:\n\n1. Approximate square footage?\n2. Any specific areas needing extra attention?\n3. Any pets in the home?",
    category: "questions",
  },
  {
    id: "question-2",
    label: "Ask About Access",
    message:
      "I'd love to help! Quick question about access: Will someone be home, or should we arrange a key pickup/lockbox access?",
    category: "questions",
  },
  {
    id: "question-3",
    label: "Ask About Supplies",
    message:
      "I can definitely help! Do you have cleaning supplies and equipment, or would you prefer I bring my own? (Additional fee may apply)",
    category: "questions",
  },

  // Scheduling
  {
    id: "schedule-1",
    label: "Propose Alternative Time",
    message:
      "Thank you for your booking request! I'm unfortunately not available at that exact time, but I have openings:\n\n• [Time option 1]\n• [Time option 2]\n\nWould either of these work for you?",
    category: "scheduling",
  },
  {
    id: "schedule-2",
    label: "Confirm Timing",
    message:
      "Perfect! I have you scheduled for [date/time]. I'll plan to arrive promptly and complete the service within [duration]. See you then!",
    category: "scheduling",
  },
  {
    id: "schedule-3",
    label: "Running Late",
    message:
      "Hi! I'm running about 15-20 minutes behind schedule due to traffic. I apologize for the inconvenience and will be there as soon as possible!",
    category: "scheduling",
  },

  // General
  {
    id: "general-1",
    label: "Thank You",
    message:
      "Thank you so much for choosing my services! I really appreciate your business and look forward to helping you again in the future.",
    category: "general",
  },
  {
    id: "general-2",
    label: "Follow Up",
    message:
      "Hi! I wanted to follow up on our last service. I hope everything was to your satisfaction. Please let me know if you need anything or would like to schedule another appointment!",
    category: "general",
  },
  {
    id: "general-3",
    label: "Unavailable",
    message:
      "Thank you for your interest! Unfortunately, I'm not available for this booking. I recommend checking out other professionals on the platform who may be able to help.",
    category: "general",
  },
];

type QuickRepliesProps = {
  onSelectReply: (message: string) => void;
};

export function QuickReplies({ onSelectReply }: QuickRepliesProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<QuickReply["category"] | "all">("all");

  const filteredReplies =
    selectedCategory === "all"
      ? QUICK_REPLIES
      : QUICK_REPLIES.filter((r) => r.category === selectedCategory);

  const categoryLabels: Record<QuickReply["category"] | "all", string> = {
    all: "All Templates",
    acceptance: "Acceptances",
    questions: "Questions",
    scheduling: "Scheduling",
    general: "General",
  };

  if (!isExpanded) {
    return (
      <button
        className="flex items-center gap-2 rounded-lg border border-[#E5E5E5] bg-white px-4 py-2 font-medium text-[var(--foreground)] text-sm transition hover:border-[var(--red)] hover:text-[var(--red)]"
        onClick={() => setIsExpanded(true)}
        type="button"
      >
        <span>Quick Replies</span>
        <HugeiconsIcon className="h-4 w-4" icon={ArrowDown01Icon} />
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-[#E5E5E5] bg-white p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-[var(--foreground)] text-sm">Quick Reply Templates</h3>
        <button
          className="text-[#737373] transition hover:text-[var(--red)]"
          onClick={() => setIsExpanded(false)}
          type="button"
        >
          <HugeiconsIcon className="h-5 w-5" icon={ArrowUp01Icon} />
        </button>
      </div>

      {/* Category Filter */}
      <div className="mb-3 flex gap-2 overflow-x-auto">
        {(["all", "acceptance", "questions", "scheduling", "general"] as const).map((category) => (
          <button
            className={`whitespace-nowrap rounded-full px-3 py-1 font-medium text-xs transition ${
              selectedCategory === category
                ? "bg-[var(--red)] text-white"
                : "bg-[#FAFAF9] text-[#737373] hover:bg-[#F5F5F5]"
            }`}
            key={category}
            onClick={() => setSelectedCategory(category)}
            type="button"
          >
            {categoryLabels[category]}
          </button>
        ))}
      </div>

      {/* Quick Reply Buttons */}
      <div className="grid max-h-64 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
        {filteredReplies.map((reply) => (
          <button
            className="rounded-lg border border-[#E5E5E5] bg-[#FAFAF9] px-4 py-3 text-left text-sm transition hover:border-[var(--red)] hover:bg-white"
            key={reply.id}
            onClick={() => {
              onSelectReply(reply.message);
              setIsExpanded(false);
            }}
            type="button"
          >
            <div className="mb-1 font-medium text-[var(--foreground)]">{reply.label}</div>
            <div className="line-clamp-2 text-[#737373] text-xs">{reply.message}</div>
          </button>
        ))}
      </div>

      <p className="mt-3 text-center text-[#A3A3A3] text-xs">
        Click a template to insert it into your message. You can edit it before sending.
      </p>
    </div>
  );
}
