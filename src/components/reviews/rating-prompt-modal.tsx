"use client";

import { useState, useEffect } from "react";
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
    if (title) formData.append("title", title);
    if (comment) formData.append("comment", comment);
    if (punctualityRating > 0) formData.append("punctualityRating", punctualityRating.toString());
    if (communicationRating > 0) formData.append("communicationRating", communicationRating.toString());
    if (respectfulnessRating > 0) formData.append("respectfulnessRating", respectfulnessRating.toString());

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
    } catch (error) {
      setMessage({ type: "error", text: "Failed to submit review" });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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
        {label && <span className="text-sm text-[#7a6d62]">{label}:</span>}
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              onMouseEnter={() => (onHover ? onHover(star) : setLocalHover(star))}
              onMouseLeave={() => (onHover ? onHover(0) : setLocalHover(0))}
              className="text-2xl transition-transform hover:scale-110"
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
        <h2 className="text-xl font-semibold text-[#211f1a]">
          Rate Your Experience with {customerName}
        </h2>
        <p className="mt-2 text-sm text-[#7a6d62]">
          Your feedback helps maintain a trusted community. This review is private and only visible
          to you and the customer.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Overall Rating */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#211f1a]">
              Overall Rating *
            </label>
            <StarRating
              value={rating}
              onHover={setHoveredRating}
              onChange={setRating}
            />
          </div>

          {/* Category Ratings */}
          <div className="space-y-2 rounded-lg border border-[#ebe5d8] bg-[#fbfafa] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#7a6d62]">
              Optional: Rate by category
            </p>
            <StarRating
              value={punctualityRating}
              onChange={setPunctualityRating}
              label="Punctuality"
            />
            <StarRating
              value={communicationRating}
              onChange={setCommunicationRating}
              label="Communication"
            />
            <StarRating
              value={respectfulnessRating}
              onChange={setRespectfulnessRating}
              label="Respectfulness"
            />
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="mb-2 block text-sm font-medium text-[#211f1a]">
              Title (optional)
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Sum up your experience in one line"
              className="w-full rounded-lg border border-[#ebe5d8] px-3 py-2 text-sm focus:border-[#ff5d46] focus:outline-none focus:ring-2 focus:ring-[#ff5d46]/20"
            />
          </div>

          {/* Comment */}
          <div>
            <label htmlFor="comment" className="mb-2 block text-sm font-medium text-[#211f1a]">
              Comment (optional)
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share details about your experience (e.g., were they on time? responsive? respectful of your time?)"
              rows={4}
              className="w-full rounded-lg border border-[#ebe5d8] px-3 py-2 text-sm focus:border-[#ff5d46] focus:outline-none focus:ring-2 focus:ring-[#ff5d46]/20"
            />
          </div>

          {/* Message */}
          {message && (
            <div
              className={`rounded-lg p-3 text-sm ${
                message.type === "success"
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-lg border border-[#ebe5d8] bg-white px-4 py-2 font-semibold text-[#7a6d62] transition hover:border-[#ff5d46] hover:text-[#ff5d46] disabled:cursor-not-allowed disabled:opacity-70"
            >
              Skip for now
            </button>
            <button
              type="submit"
              disabled={loading || rating === 0}
              className="flex-1 rounded-lg bg-[#ff5d46] px-4 py-2 font-semibold text-white transition hover:bg-[#eb6c65] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
