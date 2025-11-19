/**
 * Professional Card (RSC Component)
 *
 * Server Component that displays professional information inline in Amara chat.
 * Follows Lia Design System (Anthropic rounded corners, Geist fonts, warm neutrals).
 */

import type { ReactNode } from 'react';
import { ProfessionalCardActions } from '../client/professional-card-actions';

/**
 * Professional data type
 */
export type Professional = {
  id: string;
  name: string;
  service: string | null;
  experienceYears: number;
  hourlyRateCop: number | null;
  languages: string[];
  city: string | null;
  country: string | null;
  location: string;
  bio: string | null;
  rating: number;
  reviewCount: number;
  onTimeRate: number;
  totalCompletedBookings: number;
  verificationLevel: string;
  avatar_url?: string | null;
};

type ProfessionalCardProps = {
  professional: Professional;
};

/**
 * Verification badge component
 */
function VerificationBadge({ level }: { level: string }) {
  if (level === 'none') {
    return null;
  }

  const badges: Record<string, { label: string; color: string }> = {
    basic: {
      label: 'ID Verified',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    enhanced: {
      label: 'Background Check',
      color: 'bg-green-50 text-green-700 border-green-200',
    },
    premium: {
      label: 'Premium Verified',
      color: 'bg-orange-50 text-orange-700 border-orange-200',
    },
  };

  const badge = badges[level];
  if (!badge) {
    return null;
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium ${badge.color}`}
    >
      <svg
        className="h-3 w-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      {badge.label}
    </span>
  );
}

/**
 * Rating stars component
 */
function RatingStars({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, index) => {
          const isFilled = index < fullStars;
          const isHalf = index === fullStars && hasHalfStar;

          return (
            <svg
              key={index}
              className={`h-4 w-4 ${isFilled || isHalf ? 'text-orange-500' : 'text-neutral-200'}`}
              fill={isFilled ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          );
        })}
      </div>
      <span className="text-sm font-medium text-neutral-900">{rating.toFixed(1)}</span>
      <span className="text-sm text-neutral-500">({reviewCount})</span>
    </div>
  );
}

/**
 * Professional Card Component (Server Component)
 */
export function ProfessionalCard({ professional }: ProfessionalCardProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
      {/* Header with Avatar and Name */}
      <div className="flex items-start gap-4 bg-neutral-50 px-4 py-4">
        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-200">
          {professional.avatar_url ? (
            <img
              src={professional.avatar_url}
              alt={professional.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-orange-100 text-xl font-medium text-orange-700">
              {professional.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-neutral-900">{professional.name}</h3>
          {professional.service && (
            <p className="mt-0.5 text-sm text-neutral-600">{professional.service}</p>
          )}
          <div className="mt-2">
            <VerificationBadge level={professional.verificationLevel} />
          </div>
        </div>
      </div>

      {/* Body with Details */}
      <div className="space-y-3 px-4 py-4">
        {/* Rating */}
        <RatingStars rating={professional.rating} reviewCount={professional.reviewCount} />

        {/* Location and Experience */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-700">
          {professional.location && (
            <div className="flex items-center gap-1.5">
              <svg
                className="h-4 w-4 text-neutral-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>{professional.location}</span>
            </div>
          )}

          {professional.experienceYears > 0 && (
            <div className="flex items-center gap-1.5">
              <svg
                className="h-4 w-4 text-neutral-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{professional.experienceYears} years exp.</span>
            </div>
          )}
        </div>

        {/* Languages */}
        {professional.languages.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {professional.languages.map((lang) => (
              <span
                key={lang}
                className="inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700"
              >
                {lang}
              </span>
            ))}
          </div>
        )}

        {/* Bio */}
        {professional.bio && (
          <p className="text-sm leading-relaxed text-neutral-600 line-clamp-2">
            {professional.bio}
          </p>
        )}

        {/* Stats */}
        {professional.totalCompletedBookings > 0 && (
          <div className="flex items-center gap-4 rounded-lg bg-neutral-50 px-3 py-2 text-sm">
            <div className="flex items-center gap-1.5">
              <svg
                className="h-4 w-4 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-neutral-700">
                {professional.totalCompletedBookings} completed
              </span>
            </div>
            {professional.onTimeRate > 0 && (
              <div className="text-neutral-600">
                {Math.round(professional.onTimeRate * 100)}% on-time
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer with Pricing and CTA */}
      <div className="flex items-center justify-between border-t border-neutral-200 bg-neutral-50 px-4 py-4">
        <div>
          {professional.hourlyRateCop ? (
            <>
              <div className="text-2xl font-semibold text-orange-600">
                {professional.hourlyRateCop.toLocaleString()} <span className="text-base">COP</span>
              </div>
              <div className="text-sm text-neutral-600">per hour</div>
            </>
          ) : (
            <div className="text-sm text-neutral-600">Contact for pricing</div>
          )}
        </div>

        {/* Client component wrapper for interactive button */}
        <ProfessionalCardActions professional={professional} />
      </div>
    </div>
  );
}
