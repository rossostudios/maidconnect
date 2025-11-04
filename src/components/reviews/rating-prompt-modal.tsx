"use client";

import { useState } from "react";
import { FormModal } from "@/components/shared/form-modal";
import { useModalForm } from "@/hooks/use-modal-form";
import { submitCustomerReviewAction } from "@/app/actions/submit-customer-review";

type RatingPromptModalProps = {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  customerName: string;
  bookingId: string;
};

type RatingFormData = {
  rating: number;
  title: string;
  comment: string;
  punctualityRating: number;
  communicationRating: number;
  respectfulnessRating: number;
};

// Star Rating Component
const StarRating = ({
  value,
  onChange,
  label,
  disabled = false,
}: {
  value: number;
  onChange: (val: number) => void;
  label?: string;
  disabled?: boolean;
}) => {
  const [hoveredRating, setHoveredRating] = useState(0);
  const displayRating = hoveredRating || value;

  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-[#7a6d62] text-sm">{label}:</span>}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            className="text-2xl transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={disabled}
            key={star}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            type="button"
          >
            {star <= displayRating ? "⭐" : "☆"}
          </button>
        ))}
      </div>
    </div>
  );
};

export function RatingPromptModal({
  isOpen,
  onClose,
  customerId,
  customerName,
  bookingId,
}: RatingPromptModalProps) {
  const form = useModalForm<RatingFormData>({
    initialData: {
      rating: 0,
      title: "",
      comment: "",
      punctualityRating: 0,
      communicationRating: 0,
      respectfulnessRating: 0,
    },
    resetOnClose: true,
  });

  const handleSubmit = async () => {
    if (form.formData.rating === 0) {
      form.setError("Please select a rating");
      return;
    }

    const formData = new FormData();
    formData.append("customerId", customerId);
    formData.append("bookingId", bookingId);
    formData.append("rating", form.formData.rating.toString());
    if (form.formData.title) {
      formData.append("title", form.formData.title);
    }
    if (form.formData.comment) {
      formData.append("comment", form.formData.comment);
    }
    if (form.formData.punctualityRating > 0) {
      formData.append("punctualityRating", form.formData.punctualityRating.toString());
    }
    if (form.formData.communicationRating > 0) {
      formData.append("communicationRating", form.formData.communicationRating.toString());
    }
    if (form.formData.respectfulnessRating > 0) {
      formData.append("respectfulnessRating", form.formData.respectfulnessRating.toString());
    }

    try {
      const result = await submitCustomerReviewAction({ status: "idle" }, formData);

      if (result.status === "success") {
        form.setMessage(result.message || "Review submitted!", "success");
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        form.setError(result.message || "Failed to submit review");
      }
    } catch (error) {
      form.setError("Failed to submit review");
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Rate Your Experience with ${customerName}`}
      description="Your feedback helps maintain a trusted community. This review is private and only visible to you and the customer."
      size="lg"
      onSubmit={handleSubmit}
      submitLabel={form.isSubmitting ? "Submitting..." : "Submit Review"}
      cancelLabel="Skip for now"
      isSubmitting={form.isSubmitting}
      submitDisabled={form.formData.rating === 0}
      closeOnBackdropClick={!form.isSubmitting}
      closeOnEscape={!form.isSubmitting}
    >
      {/* Overall Rating */}
      <div>
        <label className="mb-2 block font-medium text-[#211f1a] text-sm">
          Overall Rating *
        </label>
        <StarRating
          onChange={(val) => form.updateField("rating", val)}
          value={form.formData.rating}
          disabled={form.isSubmitting}
        />
      </div>

      {/* Category Ratings */}
      <div className="space-y-2 rounded-lg border border-[#ebe5d8] bg-[#fbfafa] p-4">
        <p className="font-semibold text-[#7a6d62] text-xs uppercase tracking-wide">
          Optional: Rate by category
        </p>
        <StarRating
          label="Punctuality"
          onChange={(val) => form.updateField("punctualityRating", val)}
          value={form.formData.punctualityRating}
          disabled={form.isSubmitting}
        />
        <StarRating
          label="Communication"
          onChange={(val) => form.updateField("communicationRating", val)}
          value={form.formData.communicationRating}
          disabled={form.isSubmitting}
        />
        <StarRating
          label="Respectfulness"
          onChange={(val) => form.updateField("respectfulnessRating", val)}
          value={form.formData.respectfulnessRating}
          disabled={form.isSubmitting}
        />
      </div>

      {/* Title */}
      <div>
        <label className="mb-2 block font-medium text-[#211f1a] text-sm" htmlFor="title">
          Title (optional)
        </label>
        <input
          className="w-full rounded-lg border border-[#ebe5d8] px-3 py-2 text-sm focus:border-[#8B7355] focus:outline-none focus:ring-2 focus:ring-[#8B7355]/20"
          id="title"
          onChange={(e) => form.updateField("title", e.target.value)}
          placeholder="Sum up your experience in one line"
          type="text"
          value={form.formData.title}
          disabled={form.isSubmitting}
        />
      </div>

      {/* Comment */}
      <div>
        <label className="mb-2 block font-medium text-[#211f1a] text-sm" htmlFor="comment">
          Comment (optional)
        </label>
        <textarea
          className="w-full rounded-lg border border-[#ebe5d8] px-3 py-2 text-sm focus:border-[#8B7355] focus:outline-none focus:ring-2 focus:ring-[#8B7355]/20"
          id="comment"
          onChange={(e) => form.updateField("comment", e.target.value)}
          placeholder="Share details about your experience (e.g., were they on time? responsive? respectful of your time?)"
          rows={4}
          value={form.formData.comment}
          disabled={form.isSubmitting}
        />
      </div>

      {/* Message */}
      {form.message && (
        <div
          className={`rounded-lg p-3 text-sm ${
            form.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}
        >
          {form.message}
        </div>
      )}
    </FormModal>
  );
}
