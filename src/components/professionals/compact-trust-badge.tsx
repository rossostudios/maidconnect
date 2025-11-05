/**
 * Compact Trust Badge Component
 *
 * Single-line trust indicator for professional profiles
 * Format: "✅ ID verified · ✅ Background checked · 🗣️ Spanish & English · ★ 4.9 (126 jobs) · 🧽 Services"
 *
 * Sprint 1: Trust & Conversion improvement
 */

import type { VerificationLevel } from "./verification-badge";

type CompactTrustBadgeProps = {
  verificationLevel: VerificationLevel;
  languages: string[];
  rating: number;
  reviewCount: number;
  services?: string[];
};

export function CompactTrustBadge({
  verificationLevel,
  languages,
  rating,
  reviewCount,
  services = [],
}: CompactTrustBadgeProps) {
  const badges: string[] = [];

  // Verification status
  if (verificationLevel === "background-check") {
    badges.push("✅ ID verified");
    badges.push("✅ Background checked");
  } else if (verificationLevel === "enhanced" || verificationLevel === "basic") {
    badges.push("✅ ID verified");
  }

  // Languages
  if (languages.length > 0) {
    const languageNames = languages
      .map((lang) => {
        switch (lang.toLowerCase()) {
          case "en":
          case "english":
            return "English";
          case "es":
          case "spanish":
          case "español":
            return "Spanish";
          default:
            return lang;
        }
      })
      .join(" & ");
    badges.push(`🗣️ ${languageNames}`);
  }

  // Rating
  if (reviewCount > 0) {
    badges.push(
      `⭐ ${rating.toFixed(1)} (${reviewCount} ${reviewCount === 1 ? "review" : "reviews"})`
    );
  }

  // Services (show first 2-3)
  if (services.length > 0) {
    const serviceList = services.slice(0, 2).join(", ");
    const moreCount = services.length > 2 ? ` +${services.length - 2}` : "";
    badges.push(`🧽 ${serviceList}${moreCount}`);
  }

  if (badges.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-[#5a5549] text-sm">
      {badges.map((badge, index) => (
        <span key={index}>
          {badge}
          {index < badges.length - 1 && <span className="mx-2 text-[#9d9383]">·</span>}
        </span>
      ))}
    </div>
  );
}
