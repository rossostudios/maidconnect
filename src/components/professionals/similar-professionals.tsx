"use client";

import { MagicWand01Icon, StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { formatCOP } from "@/lib/format";
import type { MatchedProfessional } from "@/lib/matching/smart-match";

type SimilarProfessionalsProps = {
  currentProfessionalId: string;
  currentProfessionalName: string;
};

/**
 * Similar Professionals Component
 * Displays recommended professionals based on the current profile
 * Uses the smart matching algorithm to find similar professionals
 */
export function SimilarProfessionals({
  currentProfessionalId: _currentProfessionalId,
  currentProfessionalName,
}: SimilarProfessionalsProps) {
  const [similar, setSimilar] = useState<MatchedProfessional[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch similar professionals
    // In production, this would call /api/professionals/[id]/similar
    const fetchSimilar = async () => {
      setLoading(true);

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Mock data - in production, this comes from the API using getSimilarProfessionals()
      const mockSimilar: MatchedProfessional[] = [
        {
          id: "sim-1",
          services: ["House Cleaning"],
          location: { lat: 4.6097, lng: -74.0817 },
          hourlyRate: 33_000,
          languages: ["English", "Spanish"],
          rating: 4.8,
          reviewCount: 35,
          experienceYears: 4,
          verificationLevel: "enhanced",
          availability: {
            morning: true,
            afternoon: true,
            evening: false,
          },
          responseTimeMinutes: 45,
          onTimeRate: 96,
          matchScore: 92,
          matchReasons: ["Similar service", "Nearby", "Within budget"],
        },
        {
          id: "sim-2",
          services: ["House Cleaning"],
          location: { lat: 4.6097, lng: -74.0817 },
          hourlyRate: 35_000,
          languages: ["English", "Spanish"],
          rating: 4.9,
          reviewCount: 42,
          experienceYears: 6,
          verificationLevel: "background-check",
          availability: {
            morning: true,
            afternoon: true,
            evening: true,
          },
          responseTimeMinutes: 30,
          onTimeRate: 98,
          matchScore: 95,
          matchReasons: ["Highly rated", "Background checked", "Quick to respond"],
        },
        {
          id: "sim-3",
          services: ["House Cleaning"],
          location: { lat: 4.6097, lng: -74.0817 },
          hourlyRate: 31_000,
          languages: ["Spanish"],
          rating: 4.7,
          reviewCount: 28,
          experienceYears: 3,
          verificationLevel: "enhanced",
          availability: {
            morning: true,
            afternoon: false,
            evening: false,
          },
          responseTimeMinutes: 60,
          onTimeRate: 94,
          matchScore: 88,
          matchReasons: ["Budget-friendly", "Good rating"],
        },
      ];

      setSimilar(mockSimilar);
      setLoading(false);
    };

    fetchSimilar();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-48 rounded bg-[neutral-200]" />
        <div className="flex gap-4">
          {[1, 2, 3].map((i) => (
            <div className="h-32 w-64 bg-[neutral-200]" key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (similar.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-[neutral-900]">
        <HugeiconsIcon className="h-5 w-5 text-[neutral-500]" icon={MagicWand01Icon} />
        <h2 className="font-semibold text-lg">Similar to {currentProfessionalName}</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {similar.map((pro) => (
          <Link
            className="group border border-[neutral-200] bg-[neutral-50] p-6 shadow-[0_10px_40px_rgba(22,22,22,0.04)] transition hover:border-[neutral-500] hover:shadow-[0_20px_50px_rgba(22,22,22,0.08)]"
            href={`/professionals/${pro.id}`}
            key={pro.id}
          >
            <div className="space-y-4">
              {/* Match Score Badge */}
              <div className="flex items-center justify-between">
                <span className="bg-[neutral-500]/10 px-3 py-1 font-semibold text-[neutral-500] text-xs">
                  {pro.matchScore}% Match
                </span>
                <div className="flex items-center gap-1">
                  <HugeiconsIcon
                    className="h-4 w-4 fill-[neutral-500] text-[neutral-500]"
                    icon={StarIcon}
                  />
                  <span className="font-semibold text-[neutral-900] text-sm">
                    {pro.rating.toFixed(1)}
                  </span>
                  <span className="text-[neutral-400] text-xs">({pro.reviewCount})</span>
                </div>
              </div>

              {/* Service Info */}
              <div>
                <p className="font-semibold text-[neutral-900]">{pro.services[0]}</p>
                <p className="mt-1 font-semibold text-[neutral-500] text-lg">
                  {formatCOP(pro.hourlyRate)}
                  <span className="font-normal text-[neutral-400] text-sm">/hr</span>
                </p>
              </div>

              {/* Match Reasons */}
              <div className="space-y-1">
                {pro.matchReasons.slice(0, 3).map((reason, i) => (
                  <p className="text-[neutral-400] text-xs" key={i}>
                    • {reason}
                  </p>
                ))}
              </div>

              {/* CTA */}
              <button
                className="w-full bg-[neutral-200] py-2 font-semibold text-[neutral-900] text-sm transition group-hover:bg-[neutral-500] group-hover:text-[neutral-50]"
                type="button"
              >
                View Profile
              </button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
