"use client";

import {
  BubbleChatIcon,
  Clock01Icon,
  Location01Icon,
  MagicWand01Icon,
  SecurityCheckIcon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
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
      "background-check": {
        label: "Background Check",
        color: "bg-[neutral-500]/10 text-[neutral-500]",
      },
      enhanced: { label: "Enhanced Verified", color: "bg-[neutral-50] text-[neutral-500]" },
      basic: { label: "Verified", color: "bg-[neutral-200]/30 text-[neutral-900]" },
    };
    return badges[level as keyof typeof badges] || badges.basic;
  };

  if (loading) {
    return (
      <div className="space-y-6 py-12 text-center">
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-[neutral-200] border-t-gray-900" />
          </div>
        </div>
        <div>
          <h2 className="font-semibold text-2xl text-[neutral-900]">
            {t("searching", { defaultValue: "Finding your perfect matches..." })}
          </h2>
          <p className="mt-2 text-[neutral-400]">
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
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[neutral-500]/10">
            <HugeiconsIcon className="h-8 w-8 text-[neutral-500]" icon={MagicWand01Icon} />
          </div>
        </div>
        <h2 className="font-semibold text-2xl text-[neutral-900]">
          {t("title", {
            defaultValue: "We found {count} perfect matches!",
            count: matches.length,
          })}
        </h2>
        <p className="mt-2 text-[neutral-400]">
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
              className="overflow-hidden rounded-2xl border border-[neutral-200] bg-[neutral-50] shadow-sm transition hover:shadow-md"
              key={match.id}
            >
              {/* Match Score Badge */}
              {index === 0 && (
                <div className="bg-gradient-to-r from-[neutral-500] to-[var(--red-hover)] px-4 py-2 text-center font-semibold text-[neutral-50] text-sm">
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
                      <div className="-right-1 -top-1 absolute h-6 w-6 rounded-full border-2 border-[neutral-50] bg-[neutral-500]/100" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-[neutral-900] text-lg">{match.name}</h3>
                        <p className="text-[neutral-400] text-sm">{match.service}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[neutral-900] text-lg">
                          {formatCurrency(match.hourlyRate)}/hr
                        </p>
                        <p className="text-[neutral-400] text-xs">
                          {match.experienceYears} years exp.
                        </p>
                      </div>
                    </div>

                    {/* Confidence Badges */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {/* Verification */}
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 font-medium text-xs ${verificationBadge.color}`}
                      >
                        <HugeiconsIcon className="h-3 w-3" icon={SecurityCheckIcon} />
                        {verificationBadge.label}
                      </span>

                      {/* Rating */}
                      <span className="inline-flex items-center gap-1 rounded-full bg-[neutral-500]/5 px-2 py-1 font-medium text-[neutral-500] text-xs">
                        <HugeiconsIcon className="h-3 w-3 fill-current" icon={StarIcon} />
                        {match.rating} ({match.reviewCount})
                      </span>

                      {/* On-Time Rate */}
                      <span className="inline-flex items-center gap-1 rounded-full bg-[neutral-50] px-2 py-1 font-medium text-[neutral-500] text-xs">
                        <HugeiconsIcon className="h-3 w-3" icon={Clock01Icon} />
                        {match.onTimeRate}% on-time
                      </span>

                      {/* Response Time */}
                      <span className="inline-flex items-center gap-1 rounded-full bg-[neutral-500]/10 px-2 py-1 font-medium text-[neutral-500] text-xs">
                        <HugeiconsIcon className="h-3 w-3" icon={BubbleChatIcon} />
                        {match.responseTime}
                      </span>
                    </div>

                    {/* Location & Languages */}
                    <div className="mt-3 flex flex-wrap gap-3 text-[neutral-400] text-sm">
                      <span className="inline-flex items-center gap-1">
                        <HugeiconsIcon className="h-4 w-4" icon={Location01Icon} />
                        {match.distance}
                      </span>
                      <span>•</span>
                      <span>{match.languages.join(", ")}</span>
                      {match.availableToday && (
                        <>
                          <span>•</span>
                          <span className="font-medium text-[neutral-500]">Available Today</span>
                        </>
                      )}
                    </div>

                    {/* Action */}
                    <div className="mt-4">
                      <Link
                        className="inline-flex w-full items-center justify-center rounded-xl bg-[neutral-900] px-4 py-2.5 font-semibold text-[neutral-50] text-sm transition hover:bg-[neutral-900]"
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
          className="block w-full rounded-xl bg-[neutral-50] px-6 py-3 text-center font-semibold text-[neutral-900] transition hover:bg-[neutral-50]"
          href="/professionals"
        >
          {t("browseAll", { defaultValue: "Browse All Professionals" })}
        </Link>
        <div className="flex gap-3">
          <button
            className="flex-1 rounded-xl border border-[neutral-200] bg-[neutral-50] px-6 py-3 font-semibold text-[neutral-400] transition hover:border-[neutral-900] hover:text-[neutral-900]"
            onClick={onBack}
            type="button"
          >
            {t("refineSearch", { defaultValue: "Refine Search" })}
          </button>
          <button
            className="flex-1 rounded-xl border border-[neutral-200] bg-[neutral-50] px-6 py-3 font-semibold text-[neutral-400] transition hover:border-[neutral-900] hover:text-[neutral-900]"
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
