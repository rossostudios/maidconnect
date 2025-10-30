"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  bookingId: string;
  label?: string;
  className?: string;
};

/**
 * Button to start or open a conversation for a booking
 * Creates conversation if it doesn't exist, then redirects to messages page
 */
export function StartConversationButton({ bookingId, label = "Message", className }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/messages/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });

      if (!response.ok) {
        throw new Error("Failed to start conversation");
      }

      const { conversationId } = await response.json();

      // Redirect to messages page with conversation selected
      router.push(`/messages?conversation=${conversationId}`);
    } catch (error) {
      console.error("Failed to start conversation:", error);
      alert("Failed to open conversation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={
        className ||
        "inline-flex items-center gap-2 rounded-md border border-[#e5dfd4] px-4 py-2 font-semibold text-[#7a6d62] text-sm transition hover:border-[#ff5d46] hover:text-[#ff5d46] disabled:cursor-not-allowed disabled:opacity-50"
      }
      disabled={loading}
      onClick={handleClick}
    >
      <span>💬</span>
      {loading ? "Opening..." : label}
    </button>
  );
}
