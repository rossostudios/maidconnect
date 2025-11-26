"use client";

import { useState } from "react";
import { submitProfessionalReviewAction } from "@/app/actions/submit-professional-review";
import { FormModal } from "@/components/shared/form-modal";
import { useModalForm } from "@/hooks/use-modal-form";
import { cn } from "@/lib/utils";

type CustomerReviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  professionalId: string;
  professionalName: string;
  bookingId: string;
};

type ReviewFormData = {
  rating: number;
  title: string;
  comment: string;
};

// Star Rating Component
function StarRating({
  value,
  onChange,
  disabled = false,
}: {
  value: number;
  onChange: (val: number) => void;
  disabled?: boolean;
}) {
  const [hoveredRating, setHoveredRating] = useState(0);
  const displayRating = hoveredRating || value;

  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          className={cn(
            "text-3xl transition-all hover:scale-110 disabled:cursor-not-allowed disabled:opacity-60",
            star <= displayRating ? "text-yellow-500" : "text-neutral-300"
          )}
          disabled={disabled}
          key={star}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHoveredRating(star)}
          onMouseLeave={() => setHoveredRating(0)}
          type="button"
        >
          ★
        </button>
      ))}
    </div>
  );
}

export function CustomerReviewModal({
  isOpen,
  onClose,
  professionalId,
  professionalName,
  bookingId,
}: CustomerReviewModalProps) {
  const form = useModalForm<ReviewFormData>({
    initialData: {
      rating: 0,
      title: "",
      comment: "",
    },
    resetOnClose: true,
  });

  const handleSubmit = async () => {
    if (form.formData.rating === 0) {
      form.setError("Please select a rating");
      return;
    }

    const formData = new FormData();
    formData.append("professionalId", professionalId);
    formData.append("bookingId", bookingId);
    formData.append("rating", form.formData.rating.toString());
    if (form.formData.title) {
      formData.append("title", form.formData.title);
    }
    if (form.formData.comment) {
      formData.append("comment", form.formData.comment);
    }

    try {
      const result = await submitProfessionalReviewAction({ status: "idle" }, formData);

      if (result.status === "success") {
        form.setMessage(result.message || "Review submitted!", "success");
        setTimeout(() => {
          onClose();
          // Refresh the page to update the lists
          window.location.reload();
        }, 1500);
      } else {
        form.setError(result.message || "Failed to submit review");
      }
    } catch (_error) {
      form.setError("Failed to submit review");
    }
  };

  const ratingLabels: Record<number, string> = {
    1: "Poor",
    2: "Fair",
    3: "Good",
    4: "Very Good",
    5: "Excellent",
  };

  return (
    <FormModal
      cancelLabel="Cancel"
      closeOnBackdropClick={!form.isSubmitting}
      closeOnEscape={!form.isSubmitting}
      description="Your feedback helps other customers and rewards great professionals."
      isOpen={isOpen}
      isSubmitDisabled={form.formData.rating === 0}
      isSubmitting={form.isSubmitting}
      onClose={onClose}
      onSubmit={handleSubmit}
      size="lg"
      submitLabel={form.isSubmitting ? "Submitting..." : "Submit Review"}
      title={`Rate ${professionalName}`}
    >
      {/* Overall Rating */}
      <div>
        <div className="mb-3 block font-medium text-neutral-900 text-sm">
          How was your experience? *
        </div>
        <div className="flex items-center gap-4">
          <StarRating
            disabled={form.isSubmitting}
            onChange={(val) => form.updateField("rating", val)}
            value={form.formData.rating}
          />
          {form.formData.rating > 0 && (
            <span className="rounded-full bg-rausch-50 px-3 py-1 font-medium text-rausch-600 text-sm">
              {ratingLabels[form.formData.rating]}
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="mb-2 block font-medium text-neutral-900 text-sm" htmlFor="review-title">
          Review Title (optional)
        </label>
        <input
          className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-sm transition-all focus:border-rausch-500 focus:outline-none focus:ring-2 focus:ring-rausch-500/20"
          disabled={form.isSubmitting}
          id="review-title"
          onChange={(e) => form.updateField("title", e.target.value)}
          placeholder="Sum up your experience in a few words"
          type="text"
          value={form.formData.title}
        />
      </div>

      {/* Comment */}
      <div>
        <label className="mb-2 block font-medium text-neutral-900 text-sm" htmlFor="review-comment">
          Your Review (optional)
        </label>
        <textarea
          className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-sm transition-all focus:border-rausch-500 focus:outline-none focus:ring-2 focus:ring-rausch-500/20"
          disabled={form.isSubmitting}
          id="review-comment"
          onChange={(e) => form.updateField("comment", e.target.value)}
          placeholder="Tell others about your experience. What did the professional do well? Would you recommend them?"
          rows={4}
          value={form.formData.comment}
        />
      </div>

      {/* Message */}
      {form.message && (
        <div
          className={cn(
            "rounded-lg p-3 text-sm",
            form.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          )}
        >
          {form.message}
        </div>
      )}
    </FormModal>
  );
}
