"use client";

import { FavouriteIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { ListSkeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/routing";
import { FavoriteButton } from "./FavoriteButton";

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
      <div className="rounded-2xl border border-[#64748b]/30 bg-[#64748b]/10 p-6 text-[#64748b] text-base">
        {error || t("errors.loadFailed")}
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-12 text-center">
        <div className="flex justify-center">
          <HugeiconsIcon className="h-12 w-12 text-[#e2e8f0]" icon={FavouriteIcon} />
        </div>
        <p className="mt-4 font-semibold text-[#0f172a] text-lg">{t("empty.title")}</p>
        <p className="mt-2 text-[#94a3b8] text-base leading-relaxed">{t("empty.description")}</p>
        <Link
          className="mt-6 inline-flex rounded-full bg-[#64748b] px-8 py-4 font-semibold text-[#f8fafc] text-base shadow-[0_6px_18px_rgba(244,74,34,0.22)] transition hover:bg-[#64748b]"
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
        <h2 className="font-semibold text-[#0f172a] text-xl">
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
    <div className="group relative overflow-hidden rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] shadow-sm transition hover:shadow-md">
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
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#64748b] font-semibold text-[#f8fafc] text-xl">
                {professional.profile.full_name.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate font-semibold text-[#0f172a] text-lg">
                  {professional.business_name || professional.profile.full_name}
                </h3>
                {professional.verified && (
                  <span className="text-base" title={t("card.verified")}>
                    ✓
                  </span>
                )}
              </div>
              {professional.rating !== null && (
                <div className="mt-1 flex items-center gap-1 text-[#94a3b8] text-sm">
                  <span>⭐</span>
                  <span className="font-semibold">{professional.rating.toFixed(1)}</span>
                  <span>({professional.total_reviews})</span>
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          {professional.bio && (
            <p className="mt-4 line-clamp-2 text-[#94a3b8] text-base leading-relaxed">
              {professional.bio}
            </p>
          )}

          {/* Footer */}
          <div className="mt-6 flex items-center justify-between">
            <div>
              <p className="font-medium text-[#94a3b8] text-sm">{t("card.startingAt")}</p>
              <p className="mt-1 font-semibold text-[#64748b] text-lg">
                {priceFormatted}
                {t("card.perHour")}
              </p>
            </div>
            <span className="font-semibold text-[#94a3b8] text-base group-hover:text-[#64748b]">
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
