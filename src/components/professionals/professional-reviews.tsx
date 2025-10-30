"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";

import { submitProfessionalReviewAction } from "@/app/actions/submit-professional-review";
import type { AppUser } from "@/lib/auth/types";
import type { ProfessionalReviewSummary } from "@/components/professionals/types";

type Props = {
  professionalId: string;
  reviews: ProfessionalReviewSummary[];
  viewer: AppUser | null;
};

const REVIEW_ACTION_INITIAL_STATE = { status: "idle" as const, message: undefined as string | undefined };

function formatDate(value: string) {
  const date = new Date(value);
  return date.toLocaleDateString("es-CO", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ReviewCard({ review }: { review: ProfessionalReviewSummary }) {
  return (
    <li className="space-y-2 rounded-2xl border border-[#efe7dc] bg-[#fbfafa] p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#211f1a]">
          <Star className="h-4 w-4 fill-[#ff5d46] text-[#ff5d46]" aria-hidden="true" />
          <span>{review.rating.toFixed(1)}</span>
        </div>
        <p className="text-xs text-[#7a6d62]">{formatDate(review.createdAt)}</p>
      </div>
      {review.title ? <p className="text-sm font-semibold text-[#211f1a]">{review.title}</p> : null}
      {review.comment ? <p className="text-sm leading-relaxed text-[#5d574b]">{review.comment}</p> : null}
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#a49c90]">
        {review.reviewerName ?? "Verified household"}
      </p>
    </li>
  );
}

export function ProfessionalReviewsSection({ professionalId, reviews, viewer }: Props) {
  const [state, formAction, pending] = useActionState(submitProfessionalReviewAction, REVIEW_ACTION_INITIAL_STATE);
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : null;

  const canSubmit = viewer?.role === "customer";

  return (
    <section className="rounded-[32px] border border-[#ebe5d8] bg-white p-6 shadow-[0_24px_60px_rgba(18,17,15,0.06)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#211f1a]">Reviews</h3>
          <p className="text-sm text-[#7a6d62]">
            Hear from households who have worked with this professional. Reviews are verified after each completed visit.
          </p>
        </div>
        {averageRating ? (
          <div className="flex items-center gap-2 rounded-full border border-[#efe7dc] bg-[#fbfafa] px-4 py-2 text-sm font-semibold text-[#211f1a]">
            <Star className="h-4 w-4 fill-[#ff5d46] text-[#ff5d46]" aria-hidden="true" />
            {averageRating.toFixed(1)} <span className="text-xs text-[#7a6d62]">({reviews.length})</span>
          </div>
        ) : null}
      </div>

      {canSubmit ? (
        <form action={formAction} className="mt-5 space-y-3 rounded-2xl border border-[#efe7dc] bg-[#fbfafa] p-4">
          <input type="hidden" name="professionalId" value={professionalId} />
          <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
            <label className="flex items-center gap-2 text-sm font-medium text-[#211f1a]">
              Rating
              <select
                name="rating"
                defaultValue="5"
                className="rounded-full border border-[#e5dfd4] bg-white px-3 py-1 text-sm font-medium text-[#211f1a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff5d46]"
                required
              >
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value} {value === 1 ? "star" : "stars"}
                  </option>
                ))}
              </select>
            </label>
            <input
              name="title"
              type="text"
              placeholder="Headline"
              className="w-full rounded-full border border-[#e5dfd4] bg-white px-4 py-2 text-sm text-[#211f1a] focus:border-[#ff5d46] focus:outline-none focus:ring-2 focus:ring-[#ff5d4626]"
            />
          </div>
          <textarea
            name="comment"
            rows={3}
            placeholder="Share the experience, what went well, and anything future households should know."
            className="w-full rounded-2xl border border-[#e5dfd4] bg-white px-4 py-3 text-sm text-[#211f1a] focus:border-[#ff5d46] focus:outline-none focus:ring-2 focus:ring-[#ff5d4626]"
            required
          />
          {state.status === "error" && state.message ? (
            <p className="text-sm text-red-600">{state.message}</p>
          ) : null}
          {state.status === "success" ? (
            <p className="text-sm text-green-700">Thank you! Your review will appear once it&apos;s verified.</p>
          ) : null}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center justify-center rounded-full border border-[#211f1a] bg-[#211f1a] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:border-[#ff5d46] hover:bg-[#2b2624] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Submitting…" : "Post review"}
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-[#efe7dc] bg-[#fbfafa] p-4 text-sm text-[#7a6d62]">
          <p>
            Sign in as a customer to share your experience after a completed booking.{" "}
            <Link href="/auth/sign-in" className="font-semibold text-[#211f1a] underline-offset-4 hover:underline">
              Login now
            </Link>
            .
          </p>
        </div>
      )}

      <ul className="mt-6 space-y-4">
        {reviews.length === 0 ? (
          <li className="rounded-2xl border border-[#efe7dc] bg-[#fbfafa] p-5 text-sm text-[#7a6d62]">
            No reviews yet. Be the first household to share feedback after a completed visit.
          </li>
        ) : (
          reviews.map((review) => <ReviewCard key={review.id} review={review} />)
        )}
      </ul>
    </section>
  );
}
