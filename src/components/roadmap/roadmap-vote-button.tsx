/**
 * Roadmap Vote Button Component
 *
 * Displays vote count and allows users to upvote roadmap items
 */

"use client";

import { ChevronUp } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { useRoadmapVote } from "@/hooks/use-roadmap-vote";
import { useState } from "react";

interface RoadmapVoteButtonProps {
  roadmapItemId: string;
  voteCount: number;
  hasVoted: boolean;
  canVote: boolean; // Whether user is authenticated
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

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
        onClick={handleClick}
        disabled={isLoading}
        className={`
          flex flex-col items-center justify-center
          rounded-[12px] border-2 font-medium
          transition-all duration-200
          ${sizeClasses[size]}
          ${
            hasVoted
              ? "border-[#ff5d46] bg-[#fff5f3] text-[#ff5d46]"
              : "border-[#ebe5d8] bg-white text-[#6B7280] hover:border-[#ff5d46] hover:text-[#ff5d46]"
          }
          ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          ${!canVote ? "hover:border-[#ff5d46]" : ""}
        `}
        aria-label={hasVoted ? "Remove vote" : "Upvote this item"}
        title={hasVoted ? "Remove your vote" : "Upvote this item"}
      >
        <ChevronUp
          size={iconSizes[size]}
          className={`transition-transform ${hasVoted ? "scale-110" : ""}`}
        />
        <span className="font-bold">{voteCount}</span>
        {showLabel && <span className="text-xs mt-0.5">votes</span>}
      </button>

      {/* Sign in prompt */}
      {showSignInPrompt && !canVote && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#211f1a] text-white text-sm rounded-lg whitespace-nowrap z-10">
          Sign in to vote
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
            <div className="w-2 h-2 bg-[#211f1a] rotate-45" />
          </div>
        </div>
      )}
    </div>
  );
}
