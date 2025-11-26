"use client";

import { StarIcon, UserCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { geistSans } from "@/app/fonts";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type SubmittedReview = {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  created_at: string;
  professional: {
    profile_id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

type Props = {
  reviews: SubmittedReview[];
};

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          className={cn("text-lg", star <= rating ? "text-yellow-500" : "text-neutral-300")}
          key={star}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export function CustomerSubmittedReviews({ reviews }: Props) {
  if (reviews.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
          <HugeiconsIcon className="h-6 w-6 text-neutral-400" icon={StarIcon} />
        </div>
        <p className={cn("font-medium text-neutral-900", geistSans.className)}>No reviews yet</p>
        <p className="mt-1 text-neutral-600 text-sm">Your submitted reviews will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => {
        const date = new Date(review.created_at).toLocaleDateString("en-US", {
          dateStyle: "medium",
        });

        return (
          <div className="rounded-lg border border-neutral-200 bg-white p-6" key={review.id}>
            <div className="flex items-start justify-between">
              {/* Professional Info */}
              <div className="flex items-start gap-4">
                {review.professional?.avatar_url ? (
                  <Image
                    alt={review.professional.full_name ?? "Professional"}
                    className="h-12 w-12 rounded-lg border border-neutral-200 object-cover"
                    height={48}
                    src={review.professional.avatar_url}
                    width={48}
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50">
                    <HugeiconsIcon className="h-6 w-6 text-neutral-400" icon={UserCircleIcon} />
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    {review.professional ? (
                      <Link
                        className={cn(
                          "font-semibold text-neutral-900 hover:text-rausch-600",
                          geistSans.className
                        )}
                        href={`/professionals/${review.professional.profile_id}`}
                      >
                        {review.professional.full_name ?? "Professional"}
                      </Link>
                    ) : (
                      <span className={cn("font-semibold text-neutral-900", geistSans.className)}>
                        Professional
                      </span>
                    )}
                    <span className="text-neutral-400 text-sm">•</span>
                    <span className="text-neutral-500 text-sm">{date}</span>
                  </div>

                  <div className="mt-1">
                    <StarDisplay rating={review.rating} />
                  </div>
                </div>
              </div>
            </div>

            {/* Review Content */}
            {(review.title || review.comment) && (
              <div className="mt-4 rounded-lg border border-neutral-100 bg-neutral-50 p-4">
                {review.title && (
                  <p className={cn("font-semibold text-neutral-900", geistSans.className)}>
                    {review.title}
                  </p>
                )}
                {review.comment && (
                  <p className="mt-1 text-neutral-700 text-sm leading-relaxed">{review.comment}</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
