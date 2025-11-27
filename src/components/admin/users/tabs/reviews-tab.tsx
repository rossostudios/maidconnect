/**
 * User Details - Reviews Tab
 *
 * Displays reviews received (professionals) and reviews given (customers)
 */

"use client";

import { memo } from "react";
import { MetricCard, SectionCard } from "./shared-components";
import { ReviewsSkeleton } from "./skeletons";
import type { BaseUser } from "./types";

type ReviewsTabProps = {
  user: BaseUser;
  data?: unknown;
};

type RatingBreakdownBarProps = {
  stars: number;
  count: number;
  total: number;
};

type ReviewCardProps = {
  name: string;
  rating: number;
  comment: string;
  date: string;
  service: string;
  response?: string | null;
  type: "received" | "given";
};

/**
 * RatingBreakdownBar - Displays rating distribution
 */
function RatingBreakdownBar({ stars, count, total }: RatingBreakdownBarProps) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="flex items-center gap-4">
      <span className="w-16 font-[family-name:var(--font-geist-sans)] text-neutral-900 text-sm">
        {stars} ★
      </span>
      <div className="h-2 flex-1 rounded-lg bg-neutral-100">
        <div className="h-full rounded-lg bg-rausch-500" style={{ width: `${percentage}%` }} />
      </div>
      <span className="w-12 text-right font-[family-name:var(--font-geist-sans)] text-neutral-600 text-sm tabular-nums">
        {count}
      </span>
    </div>
  );
}

/**
 * ReviewCard - Memoized to prevent re-renders in review lists
 */
const ReviewCard = memo(function ReviewCard({
  name,
  rating,
  comment,
  date,
  service,
  response,
  type,
}: ReviewCardProps) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="mb-1 font-[family-name:var(--font-geist-sans)] font-medium text-neutral-900">
            {type === "received" ? `From: ${name}` : `To: ${name}`}
          </p>
          <p className="text-neutral-600 text-sm">{service}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-[family-name:var(--font-geist-sans)] font-medium text-lg text-neutral-900 tabular-nums">
            {rating.toFixed(1)}
          </span>
          <span className="text-rausch-500 text-xl">★</span>
        </div>
      </div>

      <p className="mb-3 text-neutral-700 leading-relaxed">{comment}</p>

      <p className="text-neutral-600 text-sm">{new Date(date).toLocaleDateString()}</p>

      {response && (
        <div className="mt-4 border-rausch-500 border-l-2 bg-white py-2 pl-4">
          <p className="mb-1 font-[family-name:var(--font-geist-sans)] font-medium text-neutral-900 text-xs tracking-wider">
            Professional Response
          </p>
          <p className="text-neutral-700 text-sm">{response}</p>
        </div>
      )}
    </div>
  );
});

/**
 * ReviewsTab - Lia Design System
 * Professional reviews received and customer reviews given
 * Memoized to prevent re-renders when other tabs change
 */
export const ReviewsTab = memo(function ReviewsTab({ user, data }: ReviewsTabProps) {
  if (!data) {
    return <ReviewsSkeleton />;
  }

  const isProfessional = user.role === "professional";
  const isCustomer = user.role === "customer";

  // Extract API data
  const apiData = data as any;
  const professionalReviews =
    isProfessional && apiData?.professional
      ? {
          stats: apiData.professional.stats || {
            averageRating: 0,
            totalReviews: 0,
            responseRate: 0,
          },
          ratingBreakdown: apiData.professional.ratingBreakdown || [],
          reviews: apiData.professional.reviews || [],
        }
      : null;

  const customerReviews =
    isCustomer && apiData?.customer
      ? {
          stats: {
            averageRatingGiven: apiData.customer.stats?.averageRating || 0,
            totalReviewsGiven: apiData.customer.stats?.totalReviews || 0,
          },
          reviews: apiData.customer.reviews || [],
        }
      : null;

  return (
    <div className="space-y-6">
      {/* Professional Content */}
      {isProfessional && professionalReviews && (
        <>
          {/* Rating Overview */}
          <SectionCard title="Rating Overview">
            <div className="grid gap-6 md:grid-cols-3">
              <MetricCard
                label="Average Rating"
                value={`${professionalReviews.stats.averageRating.toFixed(1)} ★`}
              />
              <MetricCard
                label="Total Reviews"
                value={professionalReviews.stats.totalReviews.toString()}
              />
              <MetricCard
                label="Response Rate"
                value={`${professionalReviews.stats.responseRate}%`}
              />
            </div>
          </SectionCard>

          {/* Rating Breakdown */}
          <SectionCard title="Rating Breakdown">
            <div className="space-y-3">
              {professionalReviews.ratingBreakdown.map((item: any) => (
                <RatingBreakdownBar
                  count={item.count}
                  key={item.stars}
                  stars={item.stars}
                  total={professionalReviews.stats.totalReviews}
                />
              ))}
              {professionalReviews.ratingBreakdown.length === 0 && (
                <p className="text-neutral-600 text-sm">No ratings yet</p>
              )}
            </div>
          </SectionCard>

          {/* Reviews List */}
          <SectionCard title="Recent Reviews">
            <div className="space-y-6">
              {professionalReviews.reviews.map((review: any) => (
                <ReviewCard
                  comment={review.comment}
                  date={review.date}
                  key={review.id}
                  name={review.customer_name}
                  rating={review.rating}
                  response={review.response}
                  service={review.service}
                  type="received"
                />
              ))}
              {professionalReviews.reviews.length === 0 && (
                <p className="text-neutral-600 text-sm">No reviews yet</p>
              )}
            </div>
          </SectionCard>
        </>
      )}

      {/* Customer Content */}
      {isCustomer && customerReviews && (
        <>
          {/* Rating Stats */}
          <SectionCard title="Review Stats">
            <div className="grid gap-6 md:grid-cols-2">
              <MetricCard
                label="Average Rating Given"
                value={`${customerReviews.stats.averageRatingGiven.toFixed(1)} ★`}
              />
              <MetricCard
                label="Total Reviews"
                value={customerReviews.stats.totalReviewsGiven.toString()}
              />
            </div>
          </SectionCard>

          {/* Reviews List */}
          <SectionCard title="Reviews Given">
            <div className="space-y-6">
              {customerReviews.reviews.map((review: any) => (
                <ReviewCard
                  comment={review.comment}
                  date={review.date}
                  key={review.id}
                  name={review.professional_name}
                  rating={review.rating}
                  service={review.service}
                  type="given"
                />
              ))}
              {customerReviews.reviews.length === 0 && (
                <p className="text-neutral-600 text-sm">No reviews given</p>
              )}
            </div>
          </SectionCard>
        </>
      )}
    </div>
  );
});
