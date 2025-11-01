/**
 * Roadmap Item Card Component
 *
 * Displays a roadmap item with status, category, votes, and description
 */

"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { RoadmapVoteButton } from "./roadmap-vote-button";
import type { RoadmapItemWithVoteStatus } from "@/types/roadmap";
import { ROADMAP_STATUS_CONFIG, ROADMAP_CATEGORY_CONFIG, formatTargetQuarter } from "@/types/roadmap";

interface RoadmapItemCardProps {
  item: RoadmapItemWithVoteStatus;
}

export function RoadmapItemCard({ item }: RoadmapItemCardProps) {
  const statusConfig = ROADMAP_STATUS_CONFIG[item.status];
  const categoryConfig = ROADMAP_CATEGORY_CONFIG[item.category];

  return (
    <div className="group relative">
      <Link href={`/roadmap/${item.slug}`}>
        <div className="relative p-4 bg-white border-2 border-[#ebe5d8] rounded-[20px] hover:border-[#ff5d46] transition-all duration-200">
          {/* Header with status and category */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[#211f1a] text-base mb-2 line-clamp-2 group-hover:text-[#ff5d46] transition-colors">
                {item.title}
              </h3>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Status badge */}
                <span
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg"
                  style={{
                    backgroundColor: statusConfig.bgColor,
                    color: statusConfig.color,
                    borderColor: statusConfig.borderColor,
                    borderWidth: '1px',
                  }}
                >
                  <span>{statusConfig.icon}</span>
                  <span>{statusConfig.label}</span>
                </span>

                {/* Category badge */}
                <span
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg bg-[#fbfaf9] text-[#6B7280] border border-[#ebe5d8]"
                >
                  <span>{categoryConfig.icon}</span>
                  <span>{categoryConfig.label}</span>
                </span>

                {/* Target quarter */}
                {item.target_quarter && (
                  <span className="text-xs text-[#6B7280]">
                    {formatTargetQuarter(item.target_quarter)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Description preview */}
          <div
            className="text-sm text-[#6B7280] line-clamp-3 mb-4"
            dangerouslySetInnerHTML={{ __html: item.description }}
          />

          {/* Footer with votes and comments */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Comment count */}
              {item.comment_count > 0 && (
                <div className="flex items-center gap-1.5 text-sm text-[#6B7280]">
                  <MessageSquare size={16} />
                  <span>{item.comment_count}</span>
                </div>
              )}

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="hidden sm:flex items-center gap-1.5">
                  {item.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-xs bg-[#f3f4f6] text-[#6B7280] rounded-md"
                    >
                      #{tag}
                    </span>
                  ))}
                  {item.tags.length > 2 && (
                    <span className="text-xs text-[#6B7280]">
                      +{item.tags.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Vote button - positioned at bottom right */}
            <div onClick={(e) => e.preventDefault()}>
              <RoadmapVoteButton
                roadmapItemId={item.id}
                voteCount={item.vote_count}
                hasVoted={item.hasVoted || false}
                canVote={item.canVote || false}
                size="md"
              />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
