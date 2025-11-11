"use client";

import { Message01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

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
      toast.error("Failed to open conversation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 text-sm shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      disabled={loading}
      onClick={handleClick}
      type="button"
    >
      <HugeiconsIcon className="h-4 w-4" icon={Message01Icon} />
      {loading ? "Opening..." : label}
    </button>
  );
}
