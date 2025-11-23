/**
 * Moderation Alerts Component
 *
 * Real-time notifications for critical moderation flags
 * - Toast notifications for critical flags
 * - Badge count on admin sidebar
 * - Supabase Realtime subscriptions
 *
 * Lia Design: Anthropic rounded corners, solid backgrounds
 */

"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

type ModerationAlert = {
  id: string;
  user_id: string;
  flag_type: string;
  severity: "critical" | "high" | "medium" | "low";
  reason: string;
  created_at: string;
  user?: {
    full_name: string | null;
    email: string | null;
  };
};

export function ModerationAlerts() {
  const [alerts, setAlerts] = useState<ModerationAlert[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [latestAlert, setLatestAlert] = useState<ModerationAlert | null>(null);

  useEffect(() => {
    const supabase = createBrowserClient();

    // Subscribe to new critical flags
    const channel = supabase
      .channel("moderation_flags_realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "moderation_flags",
          filter: "severity=eq.critical",
        },
        (payload) => {
          const newFlag = payload.new as ModerationAlert;
          setAlerts((prev) => [newFlag, ...prev]);
          setLatestAlert(newFlag);
          setShowToast(true);

          // Auto-hide toast after 5 seconds
          setTimeout(() => setShowToast(false), 5000);
        }
      )
      .subscribe();

    // Load initial critical flags
    async function loadCriticalFlags() {
      const { data } = await supabase
        .from("moderation_flags")
        .select(
          `
          id,
          user_id,
          flag_type,
          severity,
          reason,
          created_at,
          user:profiles!moderation_flags_user_id_fkey(full_name, email)
        `
        )
        .eq("severity", "critical")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(10);

      if (data) {
        setAlerts(data as ModerationAlert[]);
      }
    }

    loadCriticalFlags();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <>
      {/* Badge Count (for sidebar) */}
      {alerts.length > 0 && (
        <span className="type-body-sm ml-2 rounded-full bg-red-600 px-2 py-1 font-semibold text-white">
          {alerts.length}
        </span>
      )}

      {/* Toast Notification */}
      {showToast && latestAlert && (
        <div className="fixed top-4 right-4 z-50 w-96 rounded-lg border border-red-600 bg-red-600 p-4 shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="type-ui-sm mb-1 font-semibold text-white">
                🚨 Critical Moderation Alert
              </p>
              <p className="type-body-sm text-white">{latestAlert.reason}</p>
              <p className="type-body-sm mt-2 text-white">
                User: {latestAlert.user?.full_name || latestAlert.user?.email || "Unknown"}
              </p>
              <p className="type-body-sm text-white">
                Type: {latestAlert.flag_type.replace(/_/g, " ")}
              </p>
            </div>
            <button
              className="type-body-sm text-white hover:text-neutral-200"
              onClick={() => setShowToast(false)}
              type="button"
            >
              ✕
            </button>
          </div>
          <div className="mt-3 flex gap-2">
            <a
              className="type-ui-sm rounded-lg border border-white px-3 py-1 font-medium text-white transition hover:bg-white hover:text-red-600"
              href="/admin/moderation"
            >
              View Queue
            </a>
            <button
              className="type-ui-sm px-3 py-1 font-medium text-white transition hover:text-neutral-200"
              onClick={() => setShowToast(false)}
              type="button"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Badge component for displaying pending count
 * Use in admin sidebar next to "Moderation" link
 */
export function ModerationBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const supabase = createBrowserClient();

    async function loadCount() {
      const { count: pendingCount } = await supabase
        .from("moderation_flags")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending")
        .in("severity", ["critical", "high"]);

      setCount(pendingCount || 0);
    }

    loadCount();

    // Subscribe to changes
    const channel = supabase
      .channel("moderation_badge_realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "moderation_flags",
        },
        () => {
          loadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (count === 0) {
    return null;
  }

  return (
    <span className="type-body-sm ml-2 rounded-full bg-red-600 px-2 py-1 font-semibold text-white">
      {count}
    </span>
  );
}
