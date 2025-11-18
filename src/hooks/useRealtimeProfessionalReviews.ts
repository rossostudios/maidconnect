"use client";

/**
 * useRealtimeProfessionalReviews Hook
 *
 * Subscribes to real-time updates for professional review/interview queue via Supabase Realtime.
 * Uses PostgreSQL CDC (Change Data Capture) - NOT manual WebSocket management.
 *
 * Features:
 * - Live updates for interview scheduling, scoring, recommendations
 * - Optional filtering by review status
 * - Optimistic UI support for instant feedback
 * - Automatic reconnection handling
 */

import type { RealtimeChannel } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import {
  CHANNEL_CONFIGS,
  isDeleteEvent,
  isInsertEvent,
  isUpdateEvent,
  type ProfessionalReviewPayload,
} from "@/lib/realtime/admin-channels";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

export interface ProfessionalReview {
  id: string;
  professional_id: string;
  status: "pending" | "interview_scheduled" | "interview_completed" | "approved" | "rejected";
  interview_date: string | null;
  interview_scores: {
    professionalism?: number;
    communication?: number;
    technical_knowledge?: number;
    customer_service?: number;
  } | null;
  interview_average_score: number | null;
  recommendation: "approve" | "reject" | "second_interview" | null;
  interviewer_name: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  professional?: {
    full_name: string | null;
    email: string | null;
  };
}

interface UseRealtimeProfessionalReviewsOptions {
  initialReviews?: ProfessionalReview[];
  filterByStatus?: string;
  enabled?: boolean;
}

interface UseRealtimeProfessionalReviewsReturn {
  reviews: ProfessionalReview[];
  isConnected: boolean;
  error: Error | null;
  updateOptimisticReview: (id: string, updates: Partial<ProfessionalReview>) => void;
}

/**
 * Hook to subscribe to real-time professional review updates
 *
 * @example
 * ```tsx
 * const { reviews, isConnected, updateOptimisticReview } = useRealtimeProfessionalReviews({
 *   initialReviews: serverData,
 *   filterByStatus: 'interview_scheduled',
 *   enabled: true
 * });
 *
 * // Optimistic UI update when interviewer submits scores
 * updateOptimisticReview('review-123', {
 *   interview_scores: { professionalism: 5, communication: 4 },
 *   recommendation: 'approve'
 * });
 * await submitInterviewScoresAction('review-123', scores);
 * ```
 */
export function useRealtimeProfessionalReviews({
  initialReviews = [],
  filterByStatus,
  enabled = true,
}: UseRealtimeProfessionalReviewsOptions = {}): UseRealtimeProfessionalReviewsReturn {
  const [reviews, setReviews] = useState<ProfessionalReview[]>(initialReviews);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Optimistic UI: Update a review immediately
  const updateOptimisticReview = useCallback((id: string, updates: Partial<ProfessionalReview>) => {
    setReviews((prev) =>
      prev.map((review) =>
        review.id === id ? { ...review, ...updates, updated_at: new Date().toISOString() } : review
      )
    );
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const supabase = createSupabaseBrowserClient();
    let channel: RealtimeChannel | null = null;

    const setupSubscription = async () => {
      try {
        const config = filterByStatus
          ? CHANNEL_CONFIGS.professionalReviewsByStatus(filterByStatus)
          : CHANNEL_CONFIGS.professionalReviews();

        channel = supabase
          .channel(config.channelName)
          .on(
            "postgres_changes",
            {
              event: config.event,
              schema: config.schema || "public",
              table: config.table,
              filter: config.filter,
            },
            (payload: ProfessionalReviewPayload) => {
              handleRealtimeUpdate(payload);
            }
          )
          .subscribe((status) => {
            if (status === "SUBSCRIBED") {
              setIsConnected(true);
              setError(null);
            } else if (status === "CHANNEL_ERROR") {
              setIsConnected(false);
              setError(new Error("Failed to subscribe to real-time professional review updates"));
            } else if (status === "TIMED_OUT") {
              setIsConnected(false);
              setError(new Error("Professional review subscription timed out"));
            }
          });
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
        setIsConnected(false);
      }
    };

    const handleRealtimeUpdate = (payload: ProfessionalReviewPayload) => {
      if (isInsertEvent(payload)) {
        // New professional review created
        const newReview = payload.new as ProfessionalReview;
        setReviews((prev) => {
          // Avoid duplicates
          if (prev.some((r) => r.id === newReview.id)) {
            return prev.map((r) => (r.id === newReview.id ? newReview : r));
          }
          return [newReview, ...prev];
        });
      } else if (isUpdateEvent(payload)) {
        // Review updated (interview scheduled, scores submitted, etc.)
        const updatedReview = payload.new as ProfessionalReview;
        setReviews((prev) =>
          prev.map((review) => (review.id === updatedReview.id ? updatedReview : review))
        );
      } else if (isDeleteEvent(payload)) {
        // Review deleted (rare)
        const deletedReview = payload.old as ProfessionalReview;
        setReviews((prev) => prev.filter((review) => review.id !== deletedReview.id));
      }
    };

    setupSubscription();

    // Cleanup function - unsubscribe when component unmounts or filter changes
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
        setIsConnected(false);
      }
    };
  }, [enabled, filterByStatus]);

  // Sync initial reviews when they change
  useEffect(() => {
    setReviews(initialReviews);
  }, [initialReviews]);

  return {
    reviews,
    isConnected,
    error,
    updateOptimisticReview,
  };
}
