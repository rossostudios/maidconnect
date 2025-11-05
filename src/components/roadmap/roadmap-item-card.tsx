/**
 * Roadmap Item Card Component
 *
 * Displays a roadmap item with status, category, votes, and description
 */

"use client";

import { Message01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import type { RoadmapItemWithVoteStatus } from "@/types/roadmap";
import {
  formatTargetQuarter,
  ROADMAP_CATEGORY_CONFIG,
  ROADMAP_STATUS_CONFIG,
} from "@/types/roadmap";
import { RoadmapVoteButton } from "./roadmap-vote-button";

type RoadmapItemCardProps = {
  item: RoadmapItemWithVoteStatus;
};

export function RoadmapItemCard({ item }: RoadmapItemCardProps) {
  const statusConfig = ROADMAP_STATUS_CONFIG[item.status];
  const categoryConfig = ROADMAP_CATEGORY_CONFIG[item.category];

  return (
    <div className="group relative">
      <Link href={`/roadmap/${item.slug}`}>
        <div className="relative rounded-[20px] border-2 border-[#ebe5d8] bg-white p-4 transition-all duration-200 hover:border-[var(--red)]">
          {/* Header with status and category */}
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="mb-2 line-clamp-2 font-semibold text-[var(--foreground)] text-base transition-colors group-hover:text-[var(--red)]">
                {item.title}
              </h3>

              <div className="flex flex-wrap items-center gap-2">
                {/* Status badge */}
                <span
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-medium text-xs"
                  style={{
                    backgroundColor: statusConfig.bgColor,
                    color: statusConfig.color,
                    borderColor: statusConfig.borderColor,
                    borderWidth: "1px",
                  }}
                >
                  <span>{statusConfig.icon}</span>
                  <span>{statusConfig.label}</span>
                </span>

                {/* Category badge */}
                <span className="inline-flex items-center gap-1 rounded-lg border border-[#ebe5d8] bg-[var(--background)] px-2 py-1 font-medium text-[#6B7280] text-xs">
                  <span>{categoryConfig.icon}</span>
                  <span>{categoryConfig.label}</span>
                </span>

                {/* Target quarter */}
                {item.target_quarter && (
                  <span className="text-[#6B7280] text-xs">
                    {formatTargetQuarter(item.target_quarter)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Description preview */}
          <div
            className="mb-4 line-clamp-3 text-[#6B7280] text-sm"
            dangerouslySetInnerHTML={{ __html: item.description }}
          />

          {/* Footer with votes and comments */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Comment count */}
              {item.comment_count > 0 && (
                <div className="flex items-center gap-1.5 text-[#6B7280] text-sm">
                  <HugeiconsIcon icon={Message01Icon} size={16} />
                  <span>{item.comment_count}</span>
                </div>
              )}

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="hidden items-center gap-1.5 sm:flex">
                  {item.tags.slice(0, 2).map((tag) => (
                    <span
                      className="rounded-md bg-[#f3f4f6] px-2 py-0.5 text-[#6B7280] text-xs"
                      key={tag}
                    >
                      #{tag}
                    </span>
                  ))}
                  {item.tags.length > 2 && (
                    <span className="text-[#6B7280] text-xs">+{item.tags.length - 2}</span>
                  )}
                </div>
              )}
            </div>

            {/* Vote button - positioned at bottom right */}
            <div>
              <RoadmapVoteButton
                canVote={item.canVote ?? false}
                hasVoted={item.hasVoted ?? false}
                roadmapItemId={item.id}
                size="md"
                voteCount={item.vote_count}
              />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
