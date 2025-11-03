"use client";

import { useEffect, useState } from "react";
import { submitCustomerReviewAction } from "@/app/actions/submit-customer-review";

type RatingPromptModalProps = {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  customerName: string;
  bookingId: string;
};

export function RatingPromptModal({
  isOpen,
  onClose,
  customerId,
  customerName,
  bookingId,
}: RatingPromptModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [punctualityRating, setPunctualityRating] = useState(0);
  const [communicationRating, setCommunicationRating] = useState(0);
  const [respectfulnessRating, setRespectfulnessRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setRating(0);
      setHoveredRating(0);
      setTitle("");
      setComment("");
      setPunctualityRating(0);
      setCommunicationRating(0);
      setRespectfulnessRating(0);
      setMessage(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      setMessage({ type: "error", text: "Please select a rating" });
      return;
    }

    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("customerId", customerId);
    formData.append("bookingId", bookingId);
    formData.append("rating", rating.toString());
    if (title) {
      formData.append("title", title);
    }
    if (comment) {
      formData.append("comment", comment);
    }
    if (punctualityRating > 0) {
      formData.append("punctualityRating", punctualityRating.toString());
    }
    if (communicationRating > 0) {
      formData.append("communicationRating", communicationRating.toString());
    }
    if (respectfulnessRating > 0) {
      formData.append("respectfulnessRating", respectfulnessRating.toString());
    }

    try {
      const result = await submitCustomerReviewAction({ status: "idle" }, formData);

      if (result.status === "success") {
        setMessage({ type: "success", text: result.message || "Review submitted!" });
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setMessage({ type: "error", text: result.message || "Failed to submit review" });
      }
    } catch (_error) {
      setMessage({ type: "error", text: "Failed to submit review" });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  const StarRating = ({
    value,
    onHover,
    onChange,
    label,
  }: {
    value: number;
    onHover?: (val: number) => void;
    onChange: (val: number) => void;
    label?: string;
  }) => {
    const [localHover, setLocalHover] = useState(0);
    const displayRating = onHover ? hoveredRating : localHover || value;

    return (
      <div className="flex items-center gap-2">
        {label && <span className="text-[#7a6d62] text-sm">{label}:</span>}
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              className="text-2xl transition-transform hover:scale-110"
              key={star}
              onClick={() => onChange(star)}
              onMouseEnter={() => (onHover ? onHover(star) : setLocalHover(star))}
              onMouseLeave={() => (onHover ? onHover(0) : setLocalHover(0))}
              type="button"
            >
              {star <= displayRating ? "⭐" : "☆"}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="font-semibold text-[#211f1a] text-xl">
          Rate Your Experience with {customerName}
        </h2>
        <p className="mt-2 text-[#7a6d62] text-sm">
          Your feedback helps maintain a trusted community. This review is private and only visible
          to you and the customer.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {/* Overall Rating */}
          <div>
            <label className="mb-2 block font-medium text-[#211f1a] text-sm">
              Overall Rating *
            </label>
            <StarRating onChange={setRating} onHover={setHoveredRating} value={rating} />
          </div>

          {/* Category Ratings */}
          <div className="space-y-2 rounded-lg border border-[#ebe5d8] bg-[#fbfafa] p-4">
            <p className="font-semibold text-[#7a6d62] text-xs uppercase tracking-wide">
              Optional: Rate by category
            </p>
            <StarRating
              label="Punctuality"
              onChange={setPunctualityRating}
              value={punctualityRating}
            />
            <StarRating
              label="Communication"
              onChange={setCommunicationRating}
              value={communicationRating}
            />
            <StarRating
              label="Respectfulness"
              onChange={setRespectfulnessRating}
              value={respectfulnessRating}
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
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Sum up your experience in one line"
              type="text"
              value={title}
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
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share details about your experience (e.g., were they on time? responsive? respectful of your time?)"
              rows={4}
              value={comment}
            />
          </div>

          {/* Message */}
          {message && (
            <div
              className={`rounded-lg p-3 text-sm ${
                message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              className="flex-1 rounded-lg border border-[#ebe5d8] bg-white px-4 py-2 font-semibold text-[#7a6d62] transition hover:border-[#8B7355] hover:text-[#8B7355] disabled:cursor-not-allowed disabled:opacity-70"
              disabled={loading}
              onClick={onClose}
              type="button"
            >
              Skip for now
            </button>
            <button
              className="flex-1 rounded-lg bg-[#8B7355] px-4 py-2 font-semibold text-white transition hover:bg-[#9B8B7E] disabled:cursor-not-allowed disabled:opacity-70"
              disabled={loading || rating === 0}
              type="submit"
            >
              {loading ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
