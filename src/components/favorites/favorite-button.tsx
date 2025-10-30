"use client";

import { useState } from "react";

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
      console.error("Failed to toggle favorite:", error);
      alert("Failed to update favorites. Please try again.");
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
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center justify-center gap-2 rounded-full transition ${
        isFavorite
          ? "bg-[#ff5d46] text-white hover:bg-[#eb6c65]"
          : "border border-[#e5dfd4] bg-white text-[#7a6d62] hover:border-[#ff5d46] hover:text-[#ff5d46]"
      } ${sizeClasses[size]} disabled:cursor-not-allowed disabled:opacity-50`}
      title={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <span className={loading ? "animate-pulse" : ""}>
        {isFavorite ? "❤️" : "🤍"}
      </span>
      {showLabel && (
        <span className="text-sm font-semibold">
          {isFavorite ? "Favorited" : "Favorite"}
        </span>
      )}
    </button>
  );
}
