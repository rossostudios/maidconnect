/**
 * Moderation Queue Dashboard Component
 *
 * Features:
 * - Severity-based tabs (Critical, High, Medium, Low, Reviewed)
 * - Flag type filters
 * - User cards with quick actions
 * - Real-time risk scoring
 *
 * Lia Design: Anthropic rounded corners, solid backgrounds, 4px grid
 */

"use client";

import { useEffect, useState } from "react";
import { UserModerationModal } from "./user-moderation-modal";

type ModerationFlag = {
  id: string;
  user_id: string;
  flag_type: string;
  severity: "low" | "medium" | "high" | "critical";
  reason: string;
  auto_detected: boolean;
  metadata: Record<string, any>;
  created_at: string;
  reviewed_at: string | null;
  status: "pending" | "reviewed" | "dismissed" | "action_taken";
  user: {
    id: string;
    full_name: string | null;
    email: string | null;
    role: string;
    avatar_url: string | null;
  };
  reviewer: {
    id: string;
    full_name: string | null;
  } | null;
};

export function ModerationQueueDashboard() {
  const [flags, setFlags] = useState<ModerationFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("pending");
  const [selectedFlagType, setSelectedFlagType] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  useEffect(() => {
    loadFlags();
  }, [selectedSeverity, selectedStatus, selectedFlagType]);

  async function loadFlags() {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (selectedSeverity) params.set("severity", selectedSeverity);
      if (selectedStatus) params.set("status", selectedStatus);
      if (selectedFlagType) params.set("flagType", selectedFlagType);

      const response = await fetch(`/api/admin/moderation/flags?${params}`);
      if (!response.ok) throw new Error("Failed to fetch flags");

      const data = await response.json();
      setFlags(data.flags || []);
    } catch (error) {
      console.error("Error loading flags:", error);
      setFlags([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDismiss(flagId: string) {
    try {
      const response = await fetch(`/api/admin/moderation/flags/${flagId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "dismissed" }),
      });

      if (!response.ok) throw new Error("Failed to dismiss flag");

      loadFlags();
    } catch (error) {
      console.error("Error dismissing flag:", error);
    }
  }

  async function handleMarkReviewed(flagId: string) {
    try {
      const response = await fetch(`/api/admin/moderation/flags/${flagId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "reviewed" }),
      });

      if (!response.ok) throw new Error("Failed to mark as reviewed");

      loadFlags();
    } catch (error) {
      console.error("Error marking as reviewed:", error);
    }
  }

  const severityCounts = flags.reduce(
    (acc, flag) => {
      acc[flag.severity] = (acc[flag.severity] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const severityColors = {
    critical: "bg-red-600 text-white",
    high: "bg-orange-600 text-white",
    medium: "bg-orange-500 text-white",
    low: "bg-neutral-600 text-white",
  };

  return (
    <div className="space-y-6">
      {/* Severity Tabs */}
      <div className="rounded-lg border border-neutral-200 bg-white">
        <div className="flex border-neutral-200 border-b">
          <button
            className={
              "type-ui-sm flex-1 border-neutral-200 border-r px-6 py-4 font-medium transition" +
              (selectedStatus === "pending" && !selectedSeverity
                ? "bg-neutral-900 text-white"
                : "bg-white text-neutral-900 hover:bg-neutral-50")
            }
            onClick={() => {
              setSelectedStatus("pending");
              setSelectedSeverity(null);
            }}
            type="button"
          >
            All Pending
            {selectedStatus === "pending" && !selectedSeverity && (
              <span className="type-body-sm ml-2">({flags.length})</span>
            )}
          </button>
          <button
            className={
              "type-ui-sm flex-1 border-neutral-200 border-r px-6 py-4 font-medium transition" +
              (selectedSeverity === "critical"
                ? "bg-red-600 text-white"
                : "bg-white text-neutral-900 hover:bg-neutral-50")
            }
            onClick={() => {
              setSelectedStatus("pending");
              setSelectedSeverity("critical");
            }}
            type="button"
          >
            Critical
            <span className="type-body-sm ml-2">({severityCounts.critical || 0})</span>
          </button>
          <button
            className={
              "type-ui-sm flex-1 border-neutral-200 border-r px-6 py-4 font-medium transition" +
              (selectedSeverity === "high"
                ? "bg-orange-600 text-white"
                : "bg-white text-neutral-900 hover:bg-neutral-50")
            }
            onClick={() => {
              setSelectedStatus("pending");
              setSelectedSeverity("high");
            }}
            type="button"
          >
            High
            <span className="type-body-sm ml-2">({severityCounts.high || 0})</span>
          </button>
          <button
            className={
              "type-ui-sm flex-1 border-neutral-200 border-r px-6 py-4 font-medium transition" +
              (selectedSeverity === "medium"
                ? "bg-orange-500 text-white"
                : "bg-white text-neutral-900 hover:bg-neutral-50")
            }
            onClick={() => {
              setSelectedStatus("pending");
              setSelectedSeverity("medium");
            }}
            type="button"
          >
            Medium
            <span className="type-body-sm ml-2">({severityCounts.medium || 0})</span>
          </button>
          <button
            className={
              "type-ui-sm flex-1 px-6 py-4 font-medium transition" +
              (selectedStatus === "reviewed"
                ? "bg-neutral-900 text-white"
                : "bg-white text-neutral-900 hover:bg-neutral-50")
            }
            onClick={() => {
              setSelectedStatus("reviewed");
              setSelectedSeverity(null);
            }}
            type="button"
          >
            Reviewed
          </button>
        </div>
      </div>

      {/* Flag Type Filters */}
      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <label className="type-ui-sm mb-2 block font-medium text-neutral-900">Filter by Type</label>
        <div className="flex gap-2">
          <button
            className={
              "type-ui-sm rounded-lg border px-4 py-2 transition" +
              (selectedFlagType
                ? "border-neutral-200 text-neutral-900 hover:border-neutral-900"
                : "border-neutral-900 bg-neutral-900 text-white")
            }
            onClick={() => setSelectedFlagType(null)}
            type="button"
          >
            All Types
          </button>
          <button
            className={
              "type-ui-sm rounded-lg border px-4 py-2 transition" +
              (selectedFlagType === "booking_pattern"
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-200 text-neutral-900 hover:border-neutral-900")
            }
            onClick={() => setSelectedFlagType("booking_pattern")}
            type="button"
          >
            Booking Pattern
          </button>
          <button
            className={
              "type-ui-sm rounded-lg border px-4 py-2 transition" +
              (selectedFlagType === "review_manipulation"
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-200 text-neutral-900 hover:border-neutral-900")
            }
            onClick={() => setSelectedFlagType("review_manipulation")}
            type="button"
          >
            Review Manipulation
          </button>
          <button
            className={
              "type-ui-sm rounded-lg border px-4 py-2 transition" +
              (selectedFlagType === "account_anomaly"
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-200 text-neutral-900 hover:border-neutral-900")
            }
            onClick={() => setSelectedFlagType("account_anomaly")}
            type="button"
          >
            Account Anomaly
          </button>
        </div>
      </div>

      {/* Flags List */}
      {isLoading ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center">
          <p className="type-body-md text-neutral-600">Loading flags...</p>
        </div>
      ) : flags.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center">
          <p className="type-body-md text-neutral-600">No flags found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {flags.map((flag) => (
            <div className="rounded-lg border border-neutral-200 bg-white p-6" key={flag.id}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-200">
                    <span className="type-ui-md font-medium text-neutral-600">
                      {(flag.user.full_name || "?").charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="type-ui-sm font-semibold text-neutral-900">
                      {flag.user.full_name || "Unnamed User"}
                    </p>
                    <p className="type-body-sm text-neutral-600">{flag.user.email}</p>
                    <p className="type-body-sm text-neutral-600 capitalize">
                      Role: {flag.user.role}
                    </p>
                  </div>
                </div>

                <span
                  className={
                    "type-ui-sm rounded-full px-3 py-1 font-medium" + severityColors[flag.severity]
                  }
                >
                  {flag.severity.charAt(0).toUpperCase() + flag.severity.slice(1)}
                </span>
              </div>

              <div className="mt-4 border-neutral-200 border-t pt-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="type-ui-sm font-medium text-neutral-900">
                    {flag.flag_type
                      .replace(/_/g, " ")
                      .split(" ")
                      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(" ")}
                  </span>
                  {flag.auto_detected && (
                    <span className="type-body-sm rounded-lg border border-neutral-200 px-2 py-1 text-neutral-600">
                      Auto-detected
                    </span>
                  )}
                </div>
                <p className="type-body-sm text-neutral-700">{flag.reason}</p>

                {flag.metadata && Object.keys(flag.metadata).length > 0 && (
                  <div className="mt-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                    <p className="type-body-sm mb-1 font-medium text-neutral-900">Details:</p>
                    {Object.entries(flag.metadata).map(([key, value]) => (
                      <p className="type-body-sm text-neutral-700" key={key}>
                        {key}: {String(value)}
                      </p>
                    ))}
                  </div>
                )}

                <p className="type-body-sm mt-2 text-neutral-600">
                  Created: {new Date(flag.created_at).toLocaleString()}
                </p>
              </div>

              <div className="mt-4 flex gap-3 border-neutral-200 border-t pt-4">
                <button
                  className="type-ui-sm flex-1 rounded-lg border border-neutral-900 bg-neutral-900 px-4 py-2 font-medium text-white transition hover:bg-neutral-800"
                  onClick={() => {
                    setSelectedUser({
                      id: flag.user.id,
                      full_name: flag.user.full_name,
                      email: flag.user.email,
                      role: flag.user.role,
                      suspension: null,
                    });
                  }}
                  type="button"
                >
                  View User / Take Action
                </button>
                <button
                  className="type-ui-sm rounded-lg border border-neutral-200 px-4 py-2 font-medium text-neutral-900 transition hover:border-neutral-900"
                  onClick={() => handleMarkReviewed(flag.id)}
                  type="button"
                >
                  Mark Reviewed
                </button>
                <button
                  className="type-ui-sm rounded-lg border border-neutral-200 px-4 py-2 font-medium text-neutral-900 transition hover:border-neutral-900"
                  onClick={() => handleDismiss(flag.id)}
                  type="button"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* User Moderation Modal */}
      {selectedUser && (
        <UserModerationModal
          onClose={() => setSelectedUser(null)}
          onComplete={() => {
            setSelectedUser(null);
            loadFlags();
          }}
          user={selectedUser}
        />
      )}
    </div>
  );
}
