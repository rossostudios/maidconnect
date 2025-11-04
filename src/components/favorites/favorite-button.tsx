"use client";

import { useState } from "react";
import { toast } from "@/lib/toast";

type Props = {
  professionalId: string;
  initialIsFavorite?: boolean;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
};

/**
 * Button to add/remove professional from favorites
 * Heart icon that fills when favorited
 */
export function FavoriteButton({
  professionalId,
  initialIsFavorite = false,
  size = "md",
  showLabel = false,
}: Props) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/customer/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professionalId,
          action: isFavorite ? "remove" : "add",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update favorites");
      }

      const data = await response.json();
      setIsFavorite(data.isFavorite);
    } catch (error) {
      console.error("Failed to update favorites:", error);
      toast.error("Failed to update favorites. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: "h-8 w-8 text-base",
    md: "h-10 w-10 text-lg",
    lg: "h-12 w-12 text-xl",
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full transition ${
        isFavorite
          ? "bg-[#8B7355] text-white hover:bg-[#9B8B7E]"
          : "border border-[#e5dfd4] bg-white text-[#7a6d62] hover:border-[#8B7355] hover:text-[#8B7355]"
      } ${sizeClasses[size]} disabled:cursor-not-allowed disabled:opacity-50`}
      disabled={loading}
      onClick={handleToggle}
      title={isFavorite ? "Remove from favorites" : "Add to favorites"}
      type="button"
    >
      <span className={loading ? "animate-pulse" : ""}>{isFavorite ? "❤️" : "🤍"}</span>
      {showLabel && (
        <span className="font-semibold text-sm">{isFavorite ? "Favorited" : "Favorite"}</span>
      )}
    </button>
  );
}
