"use client";

import { StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useActionState } from "react";
import { submitProfessionalReviewAction } from "@/app/actions/submit-professional-review";
import type { ProfessionalReviewSummary } from "@/components/professionals/types";
import { Link } from "@/i18n/routing";
import type { AppUser } from "@/lib/auth/types";

type Props = {
  professionalId: string;
  reviews: ProfessionalReviewSummary[];
  viewer: AppUser | null;
};

const REVIEW_ACTION_INITIAL_STATE = {
  status: "idle" as const,
  message: undefined as string | undefined,
};

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
    <li className="space-y-2 rounded-2xl border border-[neutral-200] bg-[neutral-50] p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-[neutral-900] text-sm">
          <HugeiconsIcon
            aria-hidden="true"
            className="h-4 w-4 fill-[neutral-500] text-[neutral-500]"
            icon={StarIcon}
          />
          <span>{review.rating.toFixed(1)}</span>
        </div>
        <p className="text-[neutral-400] text-xs">{formatDate(review.createdAt)}</p>
      </div>
      {review.title ? (
        <p className="font-semibold text-[neutral-900] text-sm">{review.title}</p>
      ) : null}
      {review.comment ? (
        <p className="text-[neutral-400] text-sm leading-relaxed">{review.comment}</p>
      ) : null}
      <p className="font-semibold text-[neutral-400] text-xs uppercase tracking-[0.24em]">
        {review.reviewerName ?? "Verified household"}
      </p>
    </li>
  );
}

export function ProfessionalReviewsSection({ professionalId, reviews, viewer }: Props) {
  const [state, formAction, pending] = useActionState(
    submitProfessionalReviewAction,
    REVIEW_ACTION_INITIAL_STATE
  );
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : null;

  const canSubmit = viewer?.role === "customer";

  return (
    <section className="rounded-[32px] border border-[neutral-200] bg-[neutral-50] p-6 shadow-[0_24px_60px_rgba(22,22,22,0.06)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="font-semibold text-[neutral-900] text-lg">Reviews</h3>
          <p className="text-[neutral-400] text-sm">
            Hear from households who have worked with this professional. Reviews are verified after
            each completed visit.
          </p>
        </div>
        {averageRating ? (
          <div className="flex items-center gap-2 rounded-full border border-[neutral-200] bg-[neutral-50] px-4 py-2 font-semibold text-[neutral-900] text-sm">
            <HugeiconsIcon
              aria-hidden="true"
              className="h-4 w-4 fill-[neutral-500] text-[neutral-500]"
              icon={StarIcon}
            />
            {averageRating.toFixed(1)}{" "}
            <span className="text-[neutral-400] text-xs">({reviews.length})</span>
          </div>
        ) : null}
      </div>

      {canSubmit ? (
        <form
          action={formAction}
          className="mt-5 space-y-3 rounded-2xl border border-[neutral-200] bg-[neutral-50] p-4"
        >
          <input name="professionalId" type="hidden" value={professionalId} />
          <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
            <label className="flex items-center gap-2 font-medium text-[neutral-900] text-sm">
              Rating
              <select
                className="rounded-full border border-[neutral-200] bg-[neutral-50] px-3 py-1 font-medium text-[neutral-900] text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[neutral-500] focus-visible:outline-offset-2"
                defaultValue="5"
                name="rating"
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
              className="w-full rounded-full border border-[neutral-200] bg-[neutral-50] px-4 py-2 text-[neutral-900] text-sm focus:border-[neutral-500] focus:outline-none focus:ring-2 focus:ring-[neutral-500]/15"
              name="title"
              placeholder="Headline"
              type="text"
            />
          </div>
          <textarea
            className="w-full rounded-2xl border border-[neutral-200] bg-[neutral-50] px-4 py-3 text-[neutral-900] text-sm focus:border-[neutral-500] focus:outline-none focus:ring-2 focus:ring-[neutral-500]/15"
            name="comment"
            placeholder="Share the experience, what went well, and anything future households should know."
            required
            rows={3}
          />
          {state.status === "error" && state.message ? (
            <p className="text-[neutral-500] text-sm">{state.message}</p>
          ) : null}
          {state.status === "success" ? (
            <p className="text-[neutral-500] text-sm">
              Thank you! Your review will appear once it&apos;s verified.
            </p>
          ) : null}
          <div className="flex justify-end">
            <button
              className="inline-flex items-center justify-center rounded-full border border-[neutral-900] bg-[neutral-900] px-5 py-2 font-semibold text-[neutral-50] text-sm shadow-sm transition hover:border-[neutral-500] hover:bg-[neutral-900] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={pending}
              type="submit"
            >
              {pending ? "Submitting…" : "Post review"}
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-5 rounded-2xl border border-[neutral-200] border-dashed bg-[neutral-50] p-4 text-[neutral-400] text-sm">
          <p>
            Sign in as a customer to share your experience after a completed booking.{" "}
            <Link className="font-semibold text-[neutral-900]" href="/auth/sign-in">
              Login now
            </Link>
            .
          </p>
        </div>
      )}

      <ul className="mt-6 space-y-4">
        {reviews.length === 0 ? (
          <li className="rounded-2xl border border-[neutral-200] bg-[neutral-50] p-5 text-[neutral-400] text-sm">
            No reviews yet. Be the first household to share feedback after a completed visit.
          </li>
        ) : (
          reviews.map((review) => <ReviewCard key={review.id} review={review} />)
        )}
      </ul>
    </section>
  );
}
