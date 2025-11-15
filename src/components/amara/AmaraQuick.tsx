import { Calendar01Icon, Location01Icon, Search01Icon, StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

("use client");

/**
 * Amara Quick Replies Component
 *
 * Displays contextual quick reply buttons to guide user interactions.
 * Provides common actions like searching for professionals, checking availability, etc.
 */

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
          className="amara-quick-reply group hover:-translate-y-0.5 inline-flex min-h-[44px] items-center gap-1.5 border border-[neutral-200] bg-[neutral-50] px-4 py-2.5 font-medium text-[neutral-400] text-sm shadow-sm transition-all hover:border-[neutral-500] hover:bg-[neutral-500] hover:text-[neutral-50] hover:shadow-md active:translate-y-0 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-2"
          disabled={disabled}
          key={reply.id}
          onClick={() => onSelect(reply)}
          type="button"
        >
          {reply.icon && (
            <span className="text-[neutral-400] transition-colors group-hover:text-[neutral-50]">
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
        icon: <HugeiconsIcon className="h-4 w-4" icon={Search01Icon} />,
      },
      {
        id: "availability",
        text: t?.("quickReply.checkAvailability") || "Check availability",
        icon: <HugeiconsIcon className="h-4 w-4" icon={Calendar01Icon} />,
      },
      {
        id: "topRated",
        text: t?.("quickReply.topRated") || "Top rated cleaners",
        icon: <HugeiconsIcon className="h-4 w-4" icon={StarIcon} />,
      },
      {
        id: "nearMe",
        text: t?.("quickReply.nearMe") || "Cleaners near me",
        icon: <HugeiconsIcon className="h-4 w-4" icon={Location01Icon} />,
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
        icon: <HugeiconsIcon className="h-4 w-4" icon={Calendar01Icon} />,
      },
      {
        id: "search-different",
        text: t?.("quickReply.searchDifferent") || "Search different area",
        icon: <HugeiconsIcon className="h-4 w-4" icon={Location01Icon} />,
      },
      {
        id: "see-reviews",
        text: t?.("quickReply.seeReviews") || "See their reviews",
        icon: <HugeiconsIcon className="h-4 w-4" icon={StarIcon} />,
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
        icon: <HugeiconsIcon className="h-4 w-4" icon={Calendar01Icon} />,
      },
    ];
  }

  return [];
}
