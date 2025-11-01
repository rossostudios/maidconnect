/**
 * Roadmap Vote Hook
 *
 * Custom hook for managing roadmap item votes with optimistic updates
 */

"use client";

import { useState } from "react";
import type { VoteToggleResponse } from "@/types/roadmap";

interface UseRoadmapVoteOptions {
  roadmapItemId: string;
  initialVoteCount: number;
  initialHasVoted: boolean;
  onVoteSuccess?: (response: VoteToggleResponse) => void;
  onVoteError?: (error: string) => void;
}

export function useRoadmapVote({
  roadmapItemId,
  initialVoteCount,
  initialHasVoted,
  onVoteSuccess,
  onVoteError,
}: UseRoadmapVoteOptions) {
  const [voteCount, setVoteCount] = useState(initialVoteCount);
  const [hasVoted, setHasVoted] = useState(initialHasVoted);
  const [isLoading, setIsLoading] = useState(false);

  const toggleVote = async () => {
    // Optimistic update
    const previousVoteCount = voteCount;
    const previousHasVoted = hasVoted;

    setIsLoading(true);
    setHasVoted(!hasVoted);
    setVoteCount(hasVoted ? voteCount - 1 : voteCount + 1);

    try {
      const response = await fetch("/api/roadmap/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roadmap_item_id: roadmapItemId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle vote");
      }

      const data: VoteToggleResponse = await response.json();

      if (!data.success) {
        throw new Error("Vote toggle failed");
      }

      // Update with actual values from server
      setVoteCount(data.vote_count);
      setHasVoted(data.has_voted);

      onVoteSuccess?.(data);
    } catch (error) {
      // Revert optimistic update
      setVoteCount(previousVoteCount);
      setHasVoted(previousHasVoted);

      const errorMessage = error instanceof Error ? error.message : "Failed to toggle vote";
      onVoteError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    voteCount,
    hasVoted,
    isLoading,
    toggleVote,
  };
}
