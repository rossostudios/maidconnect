"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FavoriteButton } from "./favorite-button";
import { ListSkeleton } from "@/components/ui/skeleton";

type FavoriteProfessional = {
  profile_id: string;
  business_name: string;
  bio: string;
  hourly_rate_cop: number;
  rating: number | null;
  total_reviews: number;
  verified: boolean;
  profile: {
    full_name: string;
    avatar_url?: string;
  };
};

export function FavoritesList() {
  const [favorites, setFavorites] = useState<FavoriteProfessional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await fetch("/api/customer/favorites");
      if (!response.ok) throw new Error("Failed to fetch favorites");
      const data = await response.json();
      setFavorites(data.favorites || []);
    } catch (err) {
      console.error("Failed to fetch favorites:", err);
      setError("Failed to load favorites");
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteRemoved = (professionalId: string) => {
    // Remove from local state immediately for better UX
    setFavorites((prev) =>
      prev.filter((pro) => pro.profile_id !== professionalId)
    );
  };

  if (loading) {
    return <ListSkeleton count={3} />;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-base text-red-600">
        {error}
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="rounded-2xl border border-[#ebe5d8] bg-white p-12 text-center">
        <p className="text-4xl">🤍</p>
        <p className="mt-4 text-lg font-semibold text-[#211f1a]">
          No favorites yet
        </p>
        <p className="mt-2 text-base leading-relaxed text-[#5d574b]">
          Click the heart icon on any professional to save them here for quick
          access.
        </p>
        <Link
          href="/professionals"
          className="mt-6 inline-flex rounded-full bg-[#ff5d46] px-8 py-4 text-base font-semibold text-white shadow-[0_6px_18px_rgba(255,93,70,0.22)] transition hover:bg-[#eb6c65]"
        >
          Browse Professionals
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#211f1a]">
          Your Favorites ({favorites.length})
        </h2>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {favorites.map((pro) => (
          <ProfessionalCard
            key={pro.profile_id}
            professional={pro}
            onRemove={() => handleFavoriteRemoved(pro.profile_id)}
          />
        ))}
      </div>
    </div>
  );
}

function ProfessionalCard({
  professional,
  onRemove,
}: {
  professional: FavoriteProfessional;
  onRemove: () => void;
}) {
  const priceFormatted = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(professional.hourly_rate_cop);

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#ebe5d8] bg-white shadow-sm transition hover:shadow-md">
      <Link href={`/professionals/${professional.profile_id}`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start gap-4">
            {/* Avatar */}
            {professional.profile.avatar_url ? (
              <img
                src={professional.profile.avatar_url}
                alt={professional.profile.full_name}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ff5d46] text-xl font-semibold text-white">
                {professional.profile.full_name.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-lg font-semibold text-[#211f1a]">
                  {professional.business_name ||
                    professional.profile.full_name}
                </h3>
                {professional.verified && (
                  <span className="text-base" title="Verified">
                    ✓
                  </span>
                )}
              </div>
              {professional.rating !== null && (
                <div className="mt-1 flex items-center gap-1 text-sm text-[#5d574b]">
                  <span>⭐</span>
                  <span className="font-semibold">
                    {professional.rating.toFixed(1)}
                  </span>
                  <span>({professional.total_reviews})</span>
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          {professional.bio && (
            <p className="mt-4 line-clamp-2 text-base leading-relaxed text-[#5d574b]">
              {professional.bio}
            </p>
          )}

          {/* Footer */}
          <div className="mt-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#7d7566]">Starting at</p>
              <p className="mt-1 text-lg font-semibold text-[#ff5d46]">{priceFormatted}/hr</p>
            </div>
            <span className="text-base font-semibold text-[#5d574b] group-hover:text-[#ff5d46]">
              View profile →
            </span>
          </div>
        </div>
      </Link>

      {/* Favorite Button (Positioned absolutely) */}
      <div className="absolute right-3 top-3">
        <div onClick={(e) => e.preventDefault()}>
          <FavoriteButton
            professionalId={professional.profile_id}
            initialIsFavorite={true}
            size="sm"
          />
        </div>
      </div>
    </div>
  );
}
