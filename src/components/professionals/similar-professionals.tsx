"use client";

import { Sparkles, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import type { MatchedProfessional } from "@/lib/matching/smart-match";

interface SimilarProfessionalsProps {
  currentProfessionalId: string;
  currentProfessionalName: string;
}

function formatCurrencyCOP(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

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
  }, [_currentProfessionalId]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-48 rounded bg-[#ebe5d8]" />
        <div className="flex gap-4">
          {[1, 2, 3].map((i) => (
            <div className="h-32 w-64 rounded-2xl bg-[#ebe5d8]" key={i} />
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
      <div className="flex items-center gap-2 text-[#211f1a]">
        <Sparkles className="h-5 w-5 text-[#ff5d46]" />
        <h2 className="font-semibold text-lg">
          Similar to {currentProfessionalName}
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {similar.map((pro) => (
          <Link
            className="group rounded-2xl border border-[#ebe5d8] bg-white p-6 shadow-[0_10px_40px_rgba(18,17,15,0.04)] transition hover:border-[#ff5d46] hover:shadow-[0_20px_50px_rgba(18,17,15,0.08)]"
            href={`/professionals/${pro.id}`}
            key={pro.id}
          >
            <div className="space-y-4">
              {/* Match Score Badge */}
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-green-100 px-3 py-1 font-semibold text-green-700 text-xs">
                  {pro.matchScore}% Match
                </span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-[#211f1a] text-sm">
                    {pro.rating.toFixed(1)}
                  </span>
                  <span className="text-[#7d7566] text-xs">
                    ({pro.reviewCount})
                  </span>
                </div>
              </div>

              {/* Service Info */}
              <div>
                <p className="font-semibold text-[#211f1a]">
                  {pro.services[0]}
                </p>
                <p className="mt-1 font-semibold text-[#ff5d46] text-lg">
                  {formatCurrencyCOP(pro.hourlyRate)}
                  <span className="font-normal text-[#7d7566] text-sm">/hr</span>
                </p>
              </div>

              {/* Match Reasons */}
              <div className="space-y-1">
                {pro.matchReasons.slice(0, 3).map((reason, i) => (
                  <p className="text-[#7d7566] text-xs" key={i}>
                    • {reason}
                  </p>
                ))}
              </div>

              {/* CTA */}
              <button
                className="w-full rounded-full bg-[#ebe5d8] py-2 font-semibold text-[#211f1a] text-sm transition group-hover:bg-[#ff5d46] group-hover:text-white"
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
