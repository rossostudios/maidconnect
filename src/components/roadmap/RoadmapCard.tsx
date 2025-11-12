/**
 * Roadmap Item Card Component
 *
 * Displays a roadmap item with status, category, votes, and description
 */

"use client";

import {
  BulbIcon,
  Calendar01Icon,
  Database01Icon,
  Link04Icon,
  LockIcon,
  MagicWand01Icon,
  Message01Icon,
  PaintBoardIcon,
  Rocket01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { sanitizeRichContent } from "@/lib/sanitize";
import type { RoadmapItemWithVoteStatus } from "@/types/roadmap";
import {
  formatTargetQuarter,
  ROADMAP_CATEGORY_CONFIG,
  ROADMAP_STATUS_CONFIG,
} from "@/types/roadmap";
import { RoadmapVoteButton } from "./RoadmapVote";

// Icon mapping for status and category icons
const ICON_MAP = {
  BulbIcon,
  Calendar01Icon,
  Rocket01Icon,
  Tick02Icon,
  MagicWand01Icon,
  Database01Icon,
  PaintBoardIcon,
  LockIcon,
  Link04Icon,
} as const;

type RoadmapCardProps = {
  item: RoadmapItemWithVoteStatus;
};

export function RoadmapCard({ item }: RoadmapCardProps) {
  const statusConfig = ROADMAP_STATUS_CONFIG[item.status];
  const categoryConfig = ROADMAP_CATEGORY_CONFIG[item.category];

  // Get the actual icon components
  const StatusIcon = ICON_MAP[statusConfig.icon as keyof typeof ICON_MAP];
  const CategoryIcon = ICON_MAP[categoryConfig.icon as keyof typeof ICON_MAP];

  return (
    <div className="group relative">
      <Link href={`/roadmap/${item.slug}`}>
        {/* Auto Layout: Vertical stack, padding 16px, gap 16px, rounded corners */}
        <div className="relative flex flex-col gap-4 rounded-[20px] border-2 border-[neutral-200] bg-[neutral-50] p-4 transition-all duration-200 hover:border-[neutral-500]">
          {/* Header - Auto Layout: Vertical stack, gap 8px */}
          <div className="flex flex-col gap-2">
            <h3 className="line-clamp-2 font-semibold text-[neutral-900] text-base transition-colors group-hover:text-[neutral-500]">
              {item.title}
            </h3>

            {/* Badges - Auto Layout: Horizontal wrap, gap 8px */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Status badge - Auto Layout: Horizontal stack, gap 4px, padding 4px 8px */}
              <span
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-medium text-xs"
                style={{
                  backgroundColor: statusConfig.bgColor,
                  color: statusConfig.color,
                  borderColor: statusConfig.borderColor,
                  borderWidth: "1px",
                }}
              >
                <HugeiconsIcon icon={StatusIcon} size={14} />
                <span>{statusConfig.label}</span>
              </span>

              {/* Category badge - Auto Layout: Horizontal stack, gap 4px, padding 4px 8px */}
              <span className="inline-flex items-center gap-1 rounded-lg border border-[neutral-200] bg-[neutral-50] px-2 py-1 font-medium text-[neutral-400] text-xs">
                <HugeiconsIcon icon={CategoryIcon} size={14} />
                <span>{categoryConfig.label}</span>
              </span>

              {/* Target quarter - Auto Layout: Hug content */}
              {item.target_quarter && (
                <span className="text-[neutral-400] text-xs">
                  {formatTargetQuarter(item.target_quarter)}
                </span>
              )}
            </div>
          </div>

          {/* Description preview - Auto Layout: Fill width, hug height */}
          <div
            className="line-clamp-3 text-[neutral-400] text-sm"
            dangerouslySetInnerHTML={{ __html: sanitizeRichContent(item.description) }}
          />

          {/* Footer - Auto Layout: Horizontal space-between, gap 16px */}
          <div className="flex items-center justify-between gap-4">
            {/* Left side - Auto Layout: Horizontal wrap, gap 12px */}
            <div className="flex items-center gap-3">
              {/* Comment count - Auto Layout: Horizontal stack, gap 6px */}
              {item.comment_count > 0 && (
                <div className="flex items-center gap-1.5 text-[neutral-400] text-sm">
                  <HugeiconsIcon icon={Message01Icon} size={16} />
                  <span>{item.comment_count}</span>
                </div>
              )}

              {/* Tags - Auto Layout: Horizontal wrap, gap 6px */}
              {item.tags && item.tags.length > 0 && (
                <div className="hidden items-center gap-1.5 sm:flex">
                  {item.tags.slice(0, 2).map((tag) => (
                    <span
                      className="rounded-md bg-[neutral-50] px-2 py-0.5 text-[neutral-400] text-xs"
                      key={tag}
                    >
                      #{tag}
                    </span>
                  ))}
                  {item.tags.length > 2 && (
                    <span className="text-[neutral-400] text-xs">+{item.tags.length - 2}</span>
                  )}
                </div>
              )}
            </div>

            {/* Vote button - Auto Layout: Hug content, align right */}
            <div className="flex-shrink-0">
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
