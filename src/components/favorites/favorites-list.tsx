"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { ListSkeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/routing";
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

  const fetchFavorites = async () => {
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
  };

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
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-base text-red-600">
        {error || t("errors.loadFailed")}
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="rounded-2xl border border-[#ebe5d8] bg-white p-12 text-center">
        <p className="text-4xl">🤍</p>
        <p className="mt-4 font-semibold text-[#211f1a] text-lg">{t("empty.title")}</p>
        <p className="mt-2 text-[#5d574b] text-base leading-relaxed">{t("empty.description")}</p>
        <Link
          className="mt-6 inline-flex rounded-full bg-[#8B7355] px-8 py-4 font-semibold text-base text-white shadow-[0_6px_18px_rgba(255,93,70,0.22)] transition hover:bg-[#9B8B7E]"
          href="/professionals"
        >
          {t("empty.browseProfessionals")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-[#211f1a] text-xl">
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
              /* Using img instead of Next.js Image because avatar_url is user-generated content from Supabase Storage with dynamic URLs */
              <img
                alt={professional.profile.full_name}
                className="h-16 w-16 rounded-full object-cover"
                src={professional.profile.avatar_url}
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#8B7355] font-semibold text-white text-xl">
                {professional.profile.full_name.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate font-semibold text-[#211f1a] text-lg">
                  {professional.business_name || professional.profile.full_name}
                </h3>
                {professional.verified && (
                  <span className="text-base" title={t("card.verified")}>
                    ✓
                  </span>
                )}
              </div>
              {professional.rating !== null && (
                <div className="mt-1 flex items-center gap-1 text-[#5d574b] text-sm">
                  <span>⭐</span>
                  <span className="font-semibold">{professional.rating.toFixed(1)}</span>
                  <span>({professional.total_reviews})</span>
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          {professional.bio && (
            <p className="mt-4 line-clamp-2 text-[#5d574b] text-base leading-relaxed">
              {professional.bio}
            </p>
          )}

          {/* Footer */}
          <div className="mt-6 flex items-center justify-between">
            <div>
              <p className="font-medium text-[#7d7566] text-sm">{t("card.startingAt")}</p>
              <p className="mt-1 font-semibold text-[#8B7355] text-lg">
                {priceFormatted}
                {t("card.perHour")}
              </p>
            </div>
            <span className="font-semibold text-[#5d574b] text-base group-hover:text-[#8B7355]">
              {t("card.viewProfile")}
            </span>
          </div>
        </div>
      </Link>

      {/* Favorite Button (Positioned absolutely) */}
      <div className="absolute top-3 right-3">
        <div onClick={(e) => e.preventDefault()}>
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
