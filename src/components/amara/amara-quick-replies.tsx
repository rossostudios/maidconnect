"use client";

/**
 * Amara Quick Replies Component
 *
 * Displays contextual quick reply buttons to guide user interactions.
 * Provides common actions like searching for professionals, checking availability, etc.
 */

import { Calendar01Icon, Location01Icon, Search01Icon, StarIcon } from "hugeicons-react";

export type QuickReply = {
  id: string;
  text: string;
  icon?: React.ReactNode;
};

type AmaraQuickRepliesProps = {
  replies: QuickReply[];
  onSelect: (reply: QuickReply) => void;
  disabled?: boolean;
};

export function AmaraQuickReplies({ replies, onSelect, disabled = false }: AmaraQuickRepliesProps) {
  if (replies.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {replies.map((reply) => (
        <button
          className="amara-quick-reply group hover:-translate-y-0.5 inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2.5 font-medium text-gray-700 text-sm shadow-sm transition-all hover:border-[var(--red)] hover:bg-[var(--red)] hover:text-white hover:shadow-md active:translate-y-0 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-2"
          disabled={disabled}
          key={reply.id}
          onClick={() => onSelect(reply)}
          type="button"
        >
          {reply.icon && (
            <span className="text-gray-500 transition-colors group-hover:text-white">
              {reply.icon}
            </span>
          )}
          <span>{reply.text}</span>
        </button>
      ))}
    </div>
  );
}

/**
 * Get context-aware quick replies based on conversation state
 */
export function getContextualQuickReplies(
  messageCount: number,
  lastMessage?: string,
  t?: any
): QuickReply[] {
  // Welcome screen replies
  if (messageCount === 1) {
    return [
      {
        id: "search",
        text: t?.("quickReply.searchProfessionals") || "Find a cleaner",
        icon: <Search01Icon className="h-4 w-4" />,
      },
      {
        id: "availability",
        text: t?.("quickReply.checkAvailability") || "Check availability",
        icon: <Calendar01Icon className="h-4 w-4" />,
      },
      {
        id: "topRated",
        text: t?.("quickReply.topRated") || "Top rated cleaners",
        icon: <StarIcon className="h-4 w-4" />,
      },
      {
        id: "nearMe",
        text: t?.("quickReply.nearMe") || "Cleaners near me",
        icon: <Location01Icon className="h-4 w-4" />,
      },
    ];
  }

  // After professional search results
  if (
    lastMessage?.toLowerCase().includes("professional") ||
    lastMessage?.toLowerCase().includes("cleaner")
  ) {
    return [
      {
        id: "check-availability",
        text: t?.("quickReply.checkTheirAvailability") || "Check their availability",
        icon: <Calendar01Icon className="h-4 w-4" />,
      },
      {
        id: "search-different",
        text: t?.("quickReply.searchDifferent") || "Search different area",
        icon: <Location01Icon className="h-4 w-4" />,
      },
      {
        id: "see-reviews",
        text: t?.("quickReply.seeReviews") || "See their reviews",
        icon: <StarIcon className="h-4 w-4" />,
      },
    ];
  }

  // After availability check
  if (lastMessage?.toLowerCase().includes("available")) {
    return [
      {
        id: "book-now",
        text: t?.("quickReply.bookNow") || "Book this time",
      },
      {
        id: "check-other-times",
        text: t?.("quickReply.checkOtherTimes") || "Check other times",
        icon: <Calendar01Icon className="h-4 w-4" />,
      },
    ];
  }

  return [];
}
