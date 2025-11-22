/**
 * Professional Card Actions (Client Component)
 *
 * Client Component wrapper for interactive elements in Professional Card.
 * Handles click events and PostHog tracking.
 */

"use client";

import { useState } from "react";
import type { Professional } from "../rsc/professional-card";

type ProfessionalCardActionsProps = {
  professional: Professional;
};

/**
 * Book Now button with click tracking
 */
export function ProfessionalCardActions({ professional }: ProfessionalCardActionsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleBookClick = async () => {
    setIsLoading(true);

    try {
      // Track PostHog event
      if (typeof window !== "undefined" && (window as any).posthog) {
        (window as any).posthog.capture("amara_component_clicked", {
          component_type: "professional_card",
          action: "book_now",
          professional_id: professional.id,
          professional_name: professional.name,
          timestamp: new Date().toISOString(),
        });
      }

      // TODO: Trigger availability check in chat
      // This will be handled by sending a message back to Amara
      // For now, just log the action
      console.log("Book professional:", professional.id);
    } catch (error) {
      console.error("Error tracking book click:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className="rounded-lg bg-orange-500 px-6 py-2.5 font-medium text-sm text-white transition-colors hover:bg-orange-600 active:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
      disabled={isLoading}
      onClick={handleBookClick}
      type="button"
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg aria-hidden="true" className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              fill="currentColor"
            />
          </svg>
          Loading...
        </span>
      ) : (
        "Book Now"
      )}
    </button>
  );
}
