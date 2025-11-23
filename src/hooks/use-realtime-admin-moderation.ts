/**
 * Multiplexed Real-time Admin Moderation Hook
 *
 * Optimized hook that multiplexes 3 admin moderation channels into a single
 * WebSocket connection, reducing overhead for admin moderation workflows.
 *
 * **Optimization Impact:**
 * - Before: 3 separate channels (disputes, professional_reviews, moderation_flags)
 * - After: 1 multiplexed channel with 3 postgres_changes listeners
 * - Reduction: 2 fewer WebSocket channels per admin session
 *
 * **Moderation Workflows Covered:**
 * 1. Booking Disputes - Customer/professional conflict resolution
 * 2. Professional Reviews - Interview scheduling, scoring, recommendations
 * 3. Moderation Flags - User/content safety flags
 *
 * Week 2: Realtime Optimization - Task 2 (Channel Multiplexing)
 *
 * @example
 * ```tsx
 * function AdminModerationDashboard() {
 *   const { disputes, reviews, moderationFlags, isLoading } = useRealtimeAdminModeration();
 *
 *   return (
 *     <div>
 *       <DisputesTable disputes={disputes} />
 *       <ReviewQueue reviews={reviews} />
 *       <ModerationFlags flags={moderationFlags} />
 *     </div>
 *   );
 * }
 * ```
 */

import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import { realtimeEvents } from "@/lib/integrations/posthog/realtime-events";
import { getConnectionManager } from "@/lib/integrations/supabase/realtime-connection-manager";
import {
  type DisputePayload,
  isDeleteEvent,
  isInsertEvent,
  isUpdateEvent,
  type ProfessionalReviewPayload,
} from "@/lib/realtime/admin-channels";

/**
 * Dispute record structure
 */
export type Dispute = {
  id: string;
  booking_id: string;
  filed_by: string;
  respondent_id: string;
  dispute_type: string;
  status: "pending" | "in_progress" | "resolved" | "escalated";
  priority: "low" | "medium" | "high" | "urgent";
  description: string;
  resolution: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
};

/**
 * Professional review record structure
 */
export type ProfessionalReview = {
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
};

/**
 * Moderation flag record structure
 */
export type ModerationFlag = {
  id: string;
  user_id: string;
  flag_type: string;
  severity: "low" | "medium" | "high" | "critical";
  reason: string;
  auto_detected: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  reviewed_at: string | null;
  status: "pending" | "reviewed" | "dismissed" | "action_taken";
  user?: {
    id: string;
    full_name: string | null;
    email: string | null;
    role: string;
  };
  reviewer?: {
    id: string;
    full_name: string | null;
  } | null;
};

/**
 * Hook options
 */
type AdminModerationOptions = {
  /** Enable all subscriptions */
  enabled?: boolean;
  /** Filter disputes by status */
  disputeStatus?: string;
  /** Filter reviews by status */
  reviewStatus?: string;
  /** Filter moderation flags by status */
  flagStatus?: string;
};

/**
 * Hook return type
 */
type AdminModerationReturn = {
  /** Booking disputes list */
  disputes: Dispute[];
  /** Professional reviews list */
  reviews: ProfessionalReview[];
  /** Moderation flags list */
  moderationFlags: ModerationFlag[];
  /** Connection state */
  isConnected: boolean;
  /** Error state */
  error: Error | null;
  /** Optimistic update for disputes */
  updateOptimisticDispute: (id: string, updates: Partial<Dispute>) => void;
  /** Optimistic update for reviews */
  updateOptimisticReview: (id: string, updates: Partial<ProfessionalReview>) => void;
  /** Optimistic update for moderation flags */
  updateOptimisticFlag: (id: string, updates: Partial<ModerationFlag>) => void;
};

/**
 * Multiplexed Real-time Admin Moderation Hook
 *
 * Subscribes to 3 admin moderation tables using a single multiplexed realtime
 * channel. This reduces WebSocket connection overhead and improves performance
 * for admin moderation dashboards.
 *
 * **Channel Multiplexing Strategy:**
 * 1. Single channel: "admin-moderation-{timestamp}"
 * 2. Three postgres_changes listeners on that channel:
 *    - Disputes table (all events)
 *    - Admin professional reviews table (all events)
 *    - Moderation flags table (all events)
 *
 * @param options - Hook configuration
 * @returns Moderation data, connection state, and optimistic update functions
 */
export function useRealtimeAdminModeration(
  options: AdminModerationOptions = {}
): AdminModerationReturn {
  const { enabled = true, disputeStatus, reviewStatus, flagStatus } = options;

  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [reviews, setReviews] = useState<ProfessionalReview[]>([]);
  const [moderationFlags, setModerationFlags] = useState<ModerationFlag[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Optimistic update for disputes
  const updateOptimisticDispute = useCallback((id: string, updates: Partial<Dispute>) => {
    setDisputes((prev) =>
      prev.map((dispute) =>
        dispute.id === id
          ? { ...dispute, ...updates, updated_at: new Date().toISOString() }
          : dispute
      )
    );
  }, []);

  // Optimistic update for reviews
  const updateOptimisticReview = useCallback((id: string, updates: Partial<ProfessionalReview>) => {
    setReviews((prev) =>
      prev.map((review) =>
        review.id === id ? { ...review, ...updates, updated_at: new Date().toISOString() } : review
      )
    );
  }, []);

  // Optimistic update for moderation flags
  const updateOptimisticFlag = useCallback((id: string, updates: Partial<ModerationFlag>) => {
    setModerationFlags((prev) =>
      prev.map((flag) => (flag.id === id ? { ...flag, ...updates } : flag))
    );
  }, []);

  // Subscribe to multiplexed realtime updates
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const manager = getConnectionManager();

    try {
      // Create a single multiplexed channel with 3 postgres_changes listeners
      const subscription = manager.createSubscription(
        `admin-moderation-${Date.now()}`,
        (channel) => {
          // Listener 1: Disputes table
          channel.on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "disputes",
              filter: disputeStatus ? `status=eq.${disputeStatus}` : undefined,
            },
            (payload: DisputePayload) => {
              if (isInsertEvent(payload)) {
                const newDispute = payload.new as Dispute;
                setDisputes((prev) => {
                  // Avoid duplicates
                  if (prev.some((d) => d.id === newDispute.id)) {
                    return prev.map((d) => (d.id === newDispute.id ? newDispute : d));
                  }
                  return [newDispute, ...prev];
                });
              } else if (isUpdateEvent(payload)) {
                const updatedDispute = payload.new as Dispute;
                setDisputes((prev) =>
                  prev.map((dispute) =>
                    dispute.id === updatedDispute.id ? updatedDispute : dispute
                  )
                );
              } else if (isDeleteEvent(payload)) {
                const deletedDispute = payload.old as Dispute;
                setDisputes((prev) => prev.filter((dispute) => dispute.id !== deletedDispute.id));
              }
            }
          );

          // Listener 2: Admin professional reviews table
          channel.on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "admin_professional_reviews",
              filter: reviewStatus ? `status=eq.${reviewStatus}` : undefined,
            },
            (payload: ProfessionalReviewPayload) => {
              if (isInsertEvent(payload)) {
                const newReview = payload.new as ProfessionalReview;
                setReviews((prev) => {
                  // Avoid duplicates
                  if (prev.some((r) => r.id === newReview.id)) {
                    return prev.map((r) => (r.id === newReview.id ? newReview : r));
                  }
                  return [newReview, ...prev];
                });
              } else if (isUpdateEvent(payload)) {
                const updatedReview = payload.new as ProfessionalReview;
                setReviews((prev) =>
                  prev.map((review) => (review.id === updatedReview.id ? updatedReview : review))
                );
              } else if (isDeleteEvent(payload)) {
                const deletedReview = payload.old as ProfessionalReview;
                setReviews((prev) => prev.filter((review) => review.id !== deletedReview.id));
              }
            }
          );

          // Listener 3: Moderation flags table
          channel.on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "moderation_flags",
              filter: flagStatus ? `status=eq.${flagStatus}` : undefined,
            },
            (payload: RealtimePostgresChangesPayload<ModerationFlag>) => {
              if (isInsertEvent(payload)) {
                const newFlag = payload.new as ModerationFlag;
                setModerationFlags((prev) => {
                  // Avoid duplicates
                  if (prev.some((f) => f.id === newFlag.id)) {
                    return prev.map((f) => (f.id === newFlag.id ? newFlag : f));
                  }
                  return [newFlag, ...prev];
                });
              } else if (isUpdateEvent(payload)) {
                const updatedFlag = payload.new as ModerationFlag;
                setModerationFlags((prev) =>
                  prev.map((flag) => (flag.id === updatedFlag.id ? updatedFlag : flag))
                );
              } else if (isDeleteEvent(payload)) {
                const deletedFlag = payload.old as ModerationFlag;
                setModerationFlags((prev) => prev.filter((flag) => flag.id !== deletedFlag.id));
              }
            }
          );

          return channel;
        }
      );

      // Monitor connection state
      const unsubscribeHealth = manager.onConnectionChange((health) => {
        setIsConnected(health.state === "connected");
        if (health.errors.length > 0) {
          setError(new Error(health.errors.at(-1) || "Unknown error"));
        } else {
          setError(null);
        }
      });

      console.info(
        "[Admin Moderation] Multiplexed subscription created (3 listeners on 1 channel)"
      );

      // Track multiplexing optimization impact
      realtimeEvents.multiplexingImpact({
        hookName: "useRealtimeAdminModeration",
        channelsBefore: 3,
        channelsAfter: 1,
        reduction: 2,
        reductionPercentage: 66.67,
      });

      // Cleanup on unmount
      return () => {
        subscription.unsubscribe();
        unsubscribeHealth();
        console.info("[Admin Moderation] Multiplexed subscription cleaned up");
      };
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      setIsConnected(false);
    }
  }, [enabled, disputeStatus, reviewStatus, flagStatus]);

  return {
    disputes,
    reviews,
    moderationFlags,
    isConnected,
    error,
    updateOptimisticDispute,
    updateOptimisticReview,
    updateOptimisticFlag,
  };
}
