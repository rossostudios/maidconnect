"use client";

/**
 * FavoriteButton - Airbnb-style heart button
 *
 * Animated heart icon for favoriting items.
 * Uses stroke when not favorited, filled when favorited.
 */

import { FavouriteIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";

type FavoriteButtonProps = {
  isFavorite: boolean;
  onClick: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
};

export function FavoriteButton({
  isFavorite,
  onClick,
  className,
  size = "md",
}: FavoriteButtonProps) {
  const sizes = {
    sm: "h-7 w-7",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <button
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      className={cn(
        "group/fav flex items-center justify-center rounded-full transition-all",
        "hover:scale-110 active:scale-95",
        sizes[size],
        className
      )}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      type="button"
    >
      {/* Shadow heart for depth effect */}
      <HugeiconsIcon
        className={cn(
          "absolute transition-all duration-200",
          iconSizes[size],
          "text-black/30 blur-[1px]",
          "translate-x-[1px] translate-y-[1px]"
        )}
        icon={FavouriteIcon}
        strokeWidth={2}
      />
      {/* Main heart */}
      <HugeiconsIcon
        className={cn(
          "relative transition-all duration-200",
          iconSizes[size],
          isFavorite
            ? "scale-100 fill-red-500 text-red-500"
            : "fill-black/50 stroke-[2.5px] text-white group-hover/fav:scale-110"
        )}
        icon={FavouriteIcon}
        strokeWidth={isFavorite ? 0 : 2}
      />
    </button>
  );
}
