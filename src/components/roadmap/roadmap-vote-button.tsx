/**
 * Roadmap Vote Button Component
 *
 * Displays vote count and allows users to upvote roadmap items
 */

"use client";

import { ArrowUp01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { useRoadmapVote } from "@/hooks/use-roadmap-vote";
import { useRouter } from "@/i18n/routing";

type RoadmapVoteButtonProps = {
  roadmapItemId: string;
  voteCount: number;
  hasVoted: boolean;
  canVote: boolean; // Whether user is authenticated
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
};

export function RoadmapVoteButton({
  roadmapItemId,
  voteCount: initialVoteCount,
  hasVoted: initialHasVoted,
  canVote,
  size = "md",
  showLabel = false,
}: RoadmapVoteButtonProps) {
  const router = useRouter();
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);

  const { voteCount, hasVoted, isLoading, toggleVote } = useRoadmapVote({
    roadmapItemId,
    initialVoteCount,
    initialHasVoted,
    onVoteError: (error) => {
      console.error("Vote error:", error);
    },
  });

  const handleClick = async () => {
    if (!canVote) {
      setShowSignInPrompt(true);
      setTimeout(() => {
        router.push("/auth/sign-in");
      }, 1500);
      return;
    }

    await toggleVote();
  };

  const sizeClasses = {
    sm: "px-2 py-1 text-xs gap-1",
    md: "px-3 py-2 text-sm gap-1.5",
    lg: "px-4 py-3 text-base gap-2",
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 20,
  };

  return (
    <div className="relative">
      <button
        aria-label={hasVoted ? "Remove vote" : "Upvote this item"}
        className={`flex flex-col items-center justify-center rounded-[12px] border-2 font-medium transition-all duration-200 ${sizeClasses[size]}
          ${
            hasVoted
              ? "border-[#64748b] bg-[#f8fafc] text-[#64748b]"
              : "border-[#e2e8f0] bg-[#f8fafc] text-[#94a3b8] hover:border-[#64748b] hover:text-[#64748b]"
          }
          ${isLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
          ${canVote ? "" : "hover:border-[#64748b]"}
        `}
        disabled={isLoading}
        onClick={handleClick}
        title={hasVoted ? "Remove your vote" : "Upvote this item"}
        type="button"
      >
        <HugeiconsIcon
          className={`transition-transform ${hasVoted ? "scale-110" : ""}`}
          icon={ArrowUp01Icon}
          size={iconSizes[size]}
        />
        <span className="font-bold">{voteCount}</span>
        {showLabel && <span className="mt-0.5 text-xs">votes</span>}
      </button>

      {/* Sign in prompt */}
      {showSignInPrompt && !canVote && (
        <div className="-translate-x-1/2 absolute bottom-full left-1/2 z-10 mb-2 whitespace-nowrap rounded-lg bg-[#0f172a] px-3 py-2 text-[#f8fafc] text-sm">
          Sign in to vote
          <div className="-translate-x-1/2 -mt-1 absolute top-full left-1/2">
            <div className="h-2 w-2 rotate-45 bg-[#0f172a]" />
          </div>
        </div>
      )}
    </div>
  );
}
