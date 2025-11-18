"use client";

/**
 * Review Moderation Queue
 *
 * AI-powered review moderation interface for admin content management.
 * Automatically analyzes reviews for sentiment, flags, and safety concerns.
 *
 * Features:
 * - Pending review queue with real-time analysis
 * - Sentiment detection and categorization
 * - Safety flag identification
 * - Auto-publish recommendations
 * - Bulk moderation actions
 * - Admin override for AI decisions
 */

import {
  AlertCircleIcon,
  CheckmarkCircle02Icon,
  EyeIcon,
  Loading03Icon,
  SentIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ReviewAnalysis } from "@/lib/integrations/amara/schemas";

interface Review {
  id: string;
  bookingId: string;
  professionalId: string;
  professionalName: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
}

interface ReviewWithAnalysis extends Review {
  analysis?: ReviewAnalysis;
  analyzing?: boolean;
  analysisError?: string;
}

export function ReviewModerationQueue() {
  const [reviews, setReviews] = useState<ReviewWithAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<ReviewWithAnalysis | null>(null);

  useEffect(() => {
    fetchPendingReviews();
  }, []);

  const fetchPendingReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/reviews/pending");
      if (!response.ok) throw new Error("Failed to fetch reviews");

      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeReview = async (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, analyzing: true, analysisError: undefined } : r))
    );

    try {
      const review = reviews.find((r) => r.id === reviewId);
      if (!review) return;

      const response = await fetch("/api/admin/reviews/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewText: review.comment,
          rating: review.rating,
          locale: "en", // TODO: Detect from user/professional locale
        }),
      });

      if (!response.ok) throw new Error("Analysis failed");

      const analysis: ReviewAnalysis = await response.json();

      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, analysis, analyzing: false } : r))
      );
    } catch (error) {
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? {
                ...r,
                analyzing: false,
                analysisError: error instanceof Error ? error.message : "Analysis failed",
              }
            : r
        )
      );
    }
  };

  const handleModeration = async (reviewId: string, action: "approve" | "reject" | "clarify") => {
    try {
      const response = await fetch("/api/admin/reviews/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, action }),
      });

      if (!response.ok) throw new Error("Moderation failed");

      // Remove from queue
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      setSelectedReview(null);
    } catch (error) {
      console.error("Moderation failed:", error);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "text-green-700 bg-green-50 border-green-200";
      case "negative":
        return "text-red-700 bg-red-50 border-red-200";
      case "neutral":
        return "text-neutral-700 bg-neutral-50 border-neutral-200";
      default:
        return "text-neutral-700 bg-neutral-50 border-neutral-200";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-700 bg-red-50 border-red-200";
      case "high":
        return "text-orange-700 bg-orange-50 border-orange-200";
      case "medium":
        return "text-yellow-700 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-neutral-700 bg-neutral-50 border-neutral-200";
      default:
        return "text-neutral-700 bg-neutral-50 border-neutral-200";
    }
  };

  if (loading) {
    return (
      <Card className="flex items-center justify-center border-neutral-200 bg-white p-12">
        <div className="flex items-center gap-3">
          <HugeiconsIcon className="h-5 w-5 animate-spin text-orange-500" icon={Loading03Icon} />
          <span className="text-neutral-700">Loading reviews...</span>
        </div>
      </Card>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card className="border-neutral-200 bg-white p-12 text-center">
        <HugeiconsIcon
          className="mx-auto mb-4 h-12 w-12 text-neutral-400"
          icon={CheckmarkCircle02Icon}
          strokeWidth={1.5}
        />
        <h3 className="mb-2 font-semibold text-lg text-neutral-900">All caught up!</h3>
        <p className="text-neutral-600">No pending reviews to moderate</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-2xl text-neutral-900">Review Moderation Queue</h2>
          <p className="text-neutral-600 text-sm">
            {reviews.length} pending {reviews.length === 1 ? "review" : "reviews"}
          </p>
        </div>
        <Button
          onClick={() =>
            reviews.forEach((r) => {
              if (!(r.analysis || r.analyzing)) {
                analyzeReview(r.id);
              }
            })
          }
          variant="outline"
        >
          Analyze All
        </Button>
      </div>

      {/* Review List */}
      <div className="grid gap-4 lg:grid-cols-2">
        {reviews.map((review) => (
          <Card
            className="border-neutral-200 bg-white p-6 transition-all hover:border-orange-500"
            key={review.id}
          >
            {/* Review Header */}
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-neutral-900">{review.professionalName}</h3>
                <p className="text-neutral-600 text-sm">by {review.customerName}</p>
                <p className="text-neutral-500 text-xs">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    className={star <= review.rating ? "text-orange-500" : "text-neutral-300"}
                    key={star}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            {/* Review Comment */}
            <p className="mb-4 border-neutral-200 border-l-4 bg-neutral-50 px-4 py-3 text-neutral-700 text-sm italic">
              "{review.comment}"
            </p>

            {/* Analysis Results */}
            {review.analyzing && (
              <div className="mb-4 flex items-center gap-3 border border-orange-200 bg-orange-50 px-4 py-3">
                <HugeiconsIcon
                  className="h-5 w-5 animate-spin text-orange-500"
                  icon={Loading03Icon}
                />
                <span className="text-neutral-700 text-sm">Analyzing review...</span>
              </div>
            )}

            {review.analysisError && (
              <div className="mb-4 border border-red-200 bg-red-50 px-4 py-3">
                <div className="flex items-start gap-2">
                  <HugeiconsIcon
                    className="mt-0.5 h-4 w-4 text-red-700"
                    icon={AlertCircleIcon}
                    strokeWidth={1.5}
                  />
                  <span className="text-red-700 text-sm">{review.analysisError}</span>
                </div>
              </div>
            )}

            {review.analysis && (
              <div className="mb-4 space-y-3 border border-neutral-200 bg-neutral-50 p-4">
                {/* Sentiment & Categories */}
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`inline-flex border px-3 py-1 font-medium text-xs ${getSentimentColor(review.analysis.sentiment)}`}
                  >
                    {review.analysis.sentiment.toUpperCase()}
                  </span>
                  {review.analysis.categories.map((category) => (
                    <span
                      className="inline-flex border border-neutral-200 bg-white px-3 py-1 text-neutral-700 text-xs"
                      key={category}
                    >
                      {category}
                    </span>
                  ))}
                </div>

                {/* Safety Flags */}
                {review.analysis.flags && review.analysis.flags.length > 0 && (
                  <div className="border-yellow-200 border-t pt-3">
                    <div className="mb-2 flex items-center gap-2">
                      <HugeiconsIcon
                        className="h-4 w-4 text-yellow-700"
                        icon={AlertCircleIcon}
                        strokeWidth={1.5}
                      />
                      <span className="font-medium text-sm text-yellow-900">Safety Flags</span>
                    </div>
                    <ul className="ml-6 space-y-1 text-xs text-yellow-700">
                      {review.analysis.flags.map((flag, index) => (
                        <li key={index}>• {flag}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Severity & Action Required */}
                <div className="flex items-center justify-between border-neutral-200 border-t pt-3">
                  <span
                    className={`inline-flex border px-3 py-1 font-medium text-xs ${getSeverityColor(review.analysis.severity)}`}
                  >
                    {review.analysis.severity.toUpperCase()}
                  </span>
                  {review.analysis.actionRequired && (
                    <span className="font-medium text-orange-600 text-xs">ACTION REQUIRED</span>
                  )}
                </div>

                {/* Recommended Action */}
                {review.analysis.recommendedAction && (
                  <div className="border-orange-200 border-t pt-3">
                    <p className="text-neutral-700 text-sm">
                      <strong>Recommended:</strong> {review.analysis.recommendedAction}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              {review.analysis || review.analyzing ? (
                <>
                  <Button
                    className="flex-1"
                    onClick={() => handleModeration(review.id, "approve")}
                    variant="default"
                  >
                    <HugeiconsIcon className="mr-2 h-4 w-4" icon={ThumbsUpIcon} strokeWidth={1.5} />
                    Approve
                  </Button>
                  <Button onClick={() => handleModeration(review.id, "reject")} variant="outline">
                    <HugeiconsIcon className="h-4 w-4" icon={ThumbsDownIcon} strokeWidth={1.5} />
                  </Button>
                  <Button onClick={() => handleModeration(review.id, "clarify")} variant="outline">
                    <HugeiconsIcon className="h-4 w-4" icon={SentIcon} strokeWidth={1.5} />
                  </Button>
                </>
              ) : (
                <Button
                  className="flex-1"
                  onClick={() => analyzeReview(review.id)}
                  variant="outline"
                >
                  <HugeiconsIcon className="mr-2 h-4 w-4" icon={EyeIcon} strokeWidth={1.5} />
                  Analyze
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
