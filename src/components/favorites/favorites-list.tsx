"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { EmptyState, EmptyStateLink } from "@/components/shared/empty-state";
import { ListSkeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/routing";
import { formatCOP } from "@/lib/utils/format";
import { FavoriteButton } from "./favorite-button";

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
  const t = useTranslations("dashboard.customer.favoritesList");
  const [favorites, setFavorites] = useState<FavoriteProfessional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = useCallback(async () => {
    try {
      const response = await fetch("/api/customer/favorites");
      if (!response.ok) {
        throw new Error(t("errors.fetchFailed"));
      }
      const data = await response.json();
      setFavorites(data.favorites || []);
    } catch (_err) {
      setError(t("errors.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleFavoriteRemoved = (professionalId: string) => {
    // Remove from local state immediately for better UX
    setFavorites((prev) => prev.filter((pro) => pro.profile_id !== professionalId));
  };

  if (loading) {
    return <ListSkeleton count={3} />;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-base text-red-700">
        {error || t("errors.loadFailed")}
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <EmptyState
        action={
          <EmptyStateLink href="/professionals">{t("empty.browseProfessionals")}</EmptyStateLink>
        }
        description={t("empty.description")}
        title={t("empty.title")}
        variant="favorites"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-neutral-900 text-xl">
          {t("title", { count: favorites.length })}
        </h2>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {favorites.map((pro) => (
          <ProfessionalCard
            key={pro.profile_id}
            onRemove={() => handleFavoriteRemoved(pro.profile_id)}
            professional={pro}
          />
        ))}
      </div>
    </div>
  );
}

function ProfessionalCard({
  professional,
  onRemove: _onRemove,
}: {
  professional: FavoriteProfessional;
  onRemove: () => void;
}) {
  const t = useTranslations("dashboard.customer.favoritesList");
  const priceFormatted = formatCOP(professional.hourly_rate_cop);

  return (
    <div className="group relative overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm transition hover:border-rausch-300 hover:shadow-md">
      <Link href={`/professionals/${professional.profile_id}`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start gap-4">
            {/* Avatar */}
            {professional.profile.avatar_url ? (
              <Image
                alt={professional.profile.full_name}
                className="h-16 w-16 rounded-full object-cover"
                height={64}
                loading="lazy"
                src={professional.profile.avatar_url}
                width={64}
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rausch-100 font-semibold text-rausch-600 text-xl">
                {professional.profile.full_name.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate font-semibold text-lg text-neutral-900">
                  {professional.business_name || professional.profile.full_name}
                </h3>
                {professional.verified && (
                  <span
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-600 text-xs"
                    title={t("card.verified")}
                  >
                    ✓
                  </span>
                )}
              </div>
              {professional.rating !== null && (
                <div className="mt-1 flex items-center gap-1 text-neutral-500 text-sm">
                  <span className="text-amber-500">⭐</span>
                  <span className="font-semibold text-neutral-900">
                    {professional.rating.toFixed(1)}
                  </span>
                  <span className="text-neutral-400">({professional.total_reviews})</span>
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          {professional.bio && (
            <p className="mt-4 line-clamp-2 text-neutral-500 text-sm leading-relaxed">
              {professional.bio}
            </p>
          )}

          {/* Footer */}
          <div className="mt-6 flex items-center justify-between border-neutral-100 border-t pt-4">
            <div>
              <p className="font-medium text-neutral-400 text-xs uppercase tracking-wide">
                {t("card.startingAt")}
              </p>
              <p className="mt-0.5 font-semibold text-lg text-neutral-900">
                {priceFormatted}
                <span className="font-normal text-neutral-500 text-sm">{t("card.perHour")}</span>
              </p>
            </div>
            <span className="rounded-full bg-neutral-100 px-3 py-1.5 font-medium text-neutral-600 text-sm transition group-hover:bg-rausch-500 group-hover:text-white">
              {t("card.viewProfile")}
            </span>
          </div>
        </div>
      </Link>

      {/* Favorite Button (Positioned absolutely) */}
      <div className="absolute top-3 right-3">
        <div
          onClick={(e) => e.preventDefault()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
            }
          }}
          role="button"
          tabIndex={0}
        >
          <FavoriteButton
            initialIsFavorite={true}
            professionalId={professional.profile_id}
            size="sm"
          />
        </div>
      </div>
    </div>
  );
}
