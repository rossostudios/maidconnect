"use client";

import {
  BubbleChatIcon,
  Clock01Icon,
  Location01Icon,
  MagicWand01Icon,
  SecurityCheckIcon,
  StarIcon,
} from "hugeicons-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import type { WizardData } from "../match-wizard";

type ResultsStepProps = {
  data: WizardData;
  onBack: () => void;
  onRestart: () => void;
};

type MatchedProfessional = {
  id: string;
  name: string;
  photo: string;
  service: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  experienceYears: number;
  languages: string[];
  location: string;
  distance: string;
  verificationLevel: "basic" | "enhanced" | "background-check";
  onTimeRate: number;
  responseTime: string;
  matchScore: number;
  availableToday: boolean;
};

export function ResultsStep({ data: _data, onBack, onRestart }: ResultsStepProps) {
  const t = useTranslations("matchWizard.results");
  const [matches, setMatches] = useState<MatchedProfessional[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to get matched professionals
    // In production, this would call /api/match-wizard with the wizard data
    const fetchMatches = async () => {
      setLoading(true);

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock data - in production, this comes from the API
      const mockMatches: MatchedProfessional[] = [
        {
          id: "1",
          name: "María González",
          photo:
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
          service: "House Cleaning",
          rating: 4.9,
          reviewCount: 47,
          hourlyRate: 35_000,
          experienceYears: 5,
          languages: ["English", "Spanish"],
          location: "Chapinero, Bogotá",
          distance: "1.2 km away",
          verificationLevel: "background-check",
          onTimeRate: 98,
          responseTime: "< 1 hour",
          matchScore: 98,
          availableToday: true,
        },
        {
          id: "2",
          name: "Camila Rodríguez",
          photo:
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
          service: "House Cleaning",
          rating: 4.8,
          reviewCount: 32,
          hourlyRate: 32_000,
          experienceYears: 3,
          languages: ["English", "Spanish"],
          location: "Usaquén, Bogotá",
          distance: "2.5 km away",
          verificationLevel: "enhanced",
          onTimeRate: 95,
          responseTime: "< 2 hours",
          matchScore: 94,
          availableToday: true,
        },
        {
          id: "3",
          name: "Ana López",
          photo:
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop",
          service: "House Cleaning",
          rating: 4.7,
          reviewCount: 28,
          hourlyRate: 30_000,
          experienceYears: 4,
          languages: ["Spanish"],
          location: "Chapinero, Bogotá",
          distance: "0.8 km away",
          verificationLevel: "enhanced",
          onTimeRate: 93,
          responseTime: "< 3 hours",
          matchScore: 89,
          availableToday: false,
        },
      ];

      setMatches(mockMatches);
      setLoading(false);
    };

    fetchMatches();
  }, []);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);

  const getVerificationBadge = (level: string) => {
    const badges = {
      "background-check": { label: "Background Check", color: "bg-green-100 text-green-800" },
      enhanced: { label: "Enhanced Verified", color: "bg-blue-100 text-blue-800" },
      basic: { label: "Verified", color: "bg-gray-100 text-gray-800" },
    };
    return badges[level as keyof typeof badges] || badges.basic;
  };

  if (loading) {
    return (
      <div className="space-y-6 py-12 text-center">
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#ebe5d8] border-t-[var(--foreground)]" />
          </div>
        </div>
        <div>
          <h2 className="font-semibold text-2xl text-[var(--foreground)]">
            {t("searching", { defaultValue: "Finding your perfect matches..." })}
          </h2>
          <p className="mt-2 text-[#7a6d62]">
            {t("searchingDescription", {
              defaultValue:
                "We're analyzing hundreds of professionals to find the best fit for you",
            })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <MagicWand01Icon className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <h2 className="font-semibold text-2xl text-[var(--foreground)]">
          {t("title", {
            defaultValue: "We found {count} perfect matches!",
            count: matches.length,
          })}
        </h2>
        <p className="mt-2 text-[#7a6d62]">
          {t("description", {
            defaultValue: "Based on your preferences, here are our top recommendations",
          })}
        </p>
      </div>

      {/* Matches */}
      <div className="space-y-4">
        {matches.map((match, index) => {
          const verificationBadge = getVerificationBadge(match.verificationLevel);

          return (
            <div
              className="overflow-hidden rounded-2xl border border-[#ebe5d8] bg-white shadow-sm transition hover:shadow-md"
              key={match.id}
            >
              {/* Match Score Badge */}
              {index === 0 && (
                <div className="bg-gradient-to-r from-[var(--red)] to-[var(--red-hover)] px-4 py-2 text-center font-semibold text-sm text-white">
                  ⭐ {t("topMatch", { defaultValue: "Top Match" })} - {match.matchScore}%{" "}
                  {t("compatibility", { defaultValue: "Compatibility" })}
                </div>
              )}

              <div className="p-6">
                <div className="flex gap-4">
                  {/* Photo */}
                  <div className="relative h-20 w-20 shrink-0">
                    <Image
                      alt={match.name}
                      className="rounded-full object-cover"
                      fill
                      src={match.photo}
                    />
                    {match.availableToday && (
                      <div className="-right-1 -top-1 absolute h-6 w-6 rounded-full border-2 border-white bg-green-500" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-[var(--foreground)] text-lg">
                          {match.name}
                        </h3>
                        <p className="text-[#7a6d62] text-sm">{match.service}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[var(--foreground)] text-lg">
                          {formatCurrency(match.hourlyRate)}/hr
                        </p>
                        <p className="text-[#7a6d62] text-xs">{match.experienceYears} years exp.</p>
                      </div>
                    </div>

                    {/* Confidence Badges */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {/* Verification */}
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 font-medium text-xs ${verificationBadge.color}`}
                      >
                        <SecurityCheckIcon className="h-3 w-3" />
                        {verificationBadge.label}
                      </span>

                      {/* Rating */}
                      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-1 font-medium text-xs text-yellow-800">
                        <StarIcon className="h-3 w-3 fill-current" />
                        {match.rating} ({match.reviewCount})
                      </span>

                      {/* On-Time Rate */}
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 font-medium text-blue-800 text-xs">
                        <Clock01Icon className="h-3 w-3" />
                        {match.onTimeRate}% on-time
                      </span>

                      {/* Response Time */}
                      <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-1 font-medium text-purple-800 text-xs">
                        <BubbleChatIcon className="h-3 w-3" />
                        {match.responseTime}
                      </span>
                    </div>

                    {/* Location & Languages */}
                    <div className="mt-3 flex flex-wrap gap-3 text-[#7a6d62] text-sm">
                      <span className="inline-flex items-center gap-1">
                        <Location01Icon className="h-4 w-4" />
                        {match.distance}
                      </span>
                      <span>•</span>
                      <span>{match.languages.join(", ")}</span>
                      {match.availableToday && (
                        <>
                          <span>•</span>
                          <span className="font-medium text-green-600">Available Today</span>
                        </>
                      )}
                    </div>

                    {/* Action */}
                    <div className="mt-4">
                      <Link
                        className="inline-flex w-full items-center justify-center rounded-xl bg-[var(--foreground)] px-4 py-2.5 font-semibold text-sm text-white transition hover:bg-[#2d2822]"
                        href={`/professionals/${match.id}`}
                      >
                        {t("viewProfile", { defaultValue: "View Profile & Book" })}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="space-y-3 pt-4">
        <Link
          className="block w-full rounded-xl bg-white px-6 py-3 text-center font-semibold text-[var(--foreground)] transition hover:bg-[#fbfafa]"
          href="/professionals"
        >
          {t("browseAll", { defaultValue: "Browse All Professionals" })}
        </Link>
        <div className="flex gap-3">
          <button
            className="flex-1 rounded-xl border border-[#ebe5d8] bg-white px-6 py-3 font-semibold text-[#7a6d62] transition hover:border-[var(--foreground)] hover:text-[var(--foreground)]"
            onClick={onBack}
            type="button"
          >
            {t("refineSearch", { defaultValue: "Refine Search" })}
          </button>
          <button
            className="flex-1 rounded-xl border border-[#ebe5d8] bg-white px-6 py-3 font-semibold text-[#7a6d62] transition hover:border-[var(--foreground)] hover:text-[var(--foreground)]"
            onClick={onRestart}
            type="button"
          >
            {t("startOver", { defaultValue: "Start Over" })}
          </button>
        </div>
      </div>
    </div>
  );
}
