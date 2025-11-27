/**
 * Recurring Plans Manager Component
 *
 * Allows customers to view, pause, and cancel their recurring service plans
 * Sprint 2: Supply & Ops - Recurring Plans UI
 */

"use client";

import {
  Calendar02Icon,
  Calendar03Icon,
  Cancel01Icon,
  Clock01Icon,
  LocationIcon,
  PauseIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import { type Currency, formatCurrency } from "@/lib/format";

type RecurringPlan = {
  id: string;
  service_name: string;
  duration_minutes: number;
  address: string;
  special_instructions: string | null;
  frequency: "weekly" | "biweekly" | "monthly";
  day_of_week: number | null;
  preferred_time: string;
  base_amount: number;
  discount_percentage: number;
  final_amount: number;
  currency: Currency | string;
  status: "active" | "paused" | "cancelled";
  pause_start_date: string | null;
  pause_end_date: string | null;
  created_at: string;
  next_booking_date: string;
  total_bookings_completed: number;
  professional: {
    user_id: string;
    full_name: string;
    avatar_url: string | null;
  } | null;
};

type RecurringPlansManagerProps = {
  initialPlans: RecurringPlan[];
  userId: string;
};

const FREQUENCY_LABELS: Record<string, string> = {
  weekly: "Weekly",
  biweekly: "Every 2 Weeks",
  monthly: "Monthly",
};

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Lookup objects to replace nested ternaries (Biome noNestedTernary fix)
type PlanStatus = "active" | "paused" | "cancelled";
type FilterType = "all" | "active" | "paused";

const STATUS_LABELS: Record<PlanStatus, string> = {
  active: "Active",
  paused: "Paused",
  cancelled: "Cancelled",
};

const STATUS_BADGE_CLASSES: Record<PlanStatus, string> = {
  active: "border border-green-200 bg-green-50 text-green-600",
  paused: "border border-rausch-200 bg-rausch-50 text-rausch-600",
  cancelled: "border border-neutral-200 bg-neutral-100 text-neutral-500",
};

const EMPTY_STATE_TITLES: Record<FilterType, string> = {
  all: "No recurring plans yet",
  active: "No active recurring plans",
  paused: "No paused plans",
};

export function RecurringPlansManager({
  initialPlans,
  userId: _userId,
}: RecurringPlansManagerProps) {
  const [plans, setPlans] = useState<RecurringPlan[]>(initialPlans);
  const [filter, setFilter] = useState<"all" | "active" | "paused">("all");

  const filteredPlans = plans.filter((plan) => {
    if (filter === "all") {
      return plan.status !== "cancelled";
    }
    if (filter === "active") {
      return plan.status === "active";
    }
    if (filter === "paused") {
      return plan.status === "paused";
    }
    return true;
  });

  const activeCount = plans.filter((p) => p.status === "active").length;
  const pausedCount = plans.filter((p) => p.status === "paused").length;

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex gap-2 border-neutral-200 border-b">
        <button
          className={`border-b-2 px-6 py-3 font-medium text-sm transition ${
            filter === "all"
              ? "border-rausch-500 text-neutral-900"
              : "border-transparent text-neutral-500 hover:text-neutral-900"
          }`}
          onClick={() => setFilter("all")}
          type="button"
        >
          All ({activeCount + pausedCount})
        </button>
        <button
          className={`border-b-2 px-6 py-3 font-medium text-sm transition ${
            filter === "active"
              ? "border-rausch-500 text-neutral-900"
              : "border-transparent text-neutral-500 hover:text-neutral-900"
          }`}
          onClick={() => setFilter("active")}
          type="button"
        >
          Active ({activeCount})
        </button>
        <button
          className={`border-b-2 px-6 py-3 font-medium text-sm transition ${
            filter === "paused"
              ? "border-rausch-500 text-neutral-900"
              : "border-transparent text-neutral-500 hover:text-neutral-900"
          }`}
          onClick={() => setFilter("paused")}
          type="button"
        >
          Paused ({pausedCount})
        </button>
      </div>

      {/* Plans Grid */}
      {filteredPlans.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-neutral-200">
            <HugeiconsIcon className="h-8 w-8 text-neutral-500" icon={Calendar03Icon} />
          </div>
          <h3 className="font-semibold text-neutral-900 text-xl">{EMPTY_STATE_TITLES[filter]}</h3>
          <p className="mt-2 text-neutral-500">
            {filter === "all"
              ? "Create a recurring plan to save up to 15% on regular bookings."
              : "Your plans will appear here."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              onUpdate={(updated) => {
                setPlans(plans.map((p) => (p.id === plan.id ? updated : p)));
              }}
              plan={plan}
            />
          ))}
        </div>
      )}
    </div>
  );
}

type PlanCardProps = {
  plan: RecurringPlan;
  onUpdate: (plan: RecurringPlan) => void;
};

function PlanCard({ plan, onUpdate }: PlanCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);

  const handlePause = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/recurring-plans/${plan.id}/pause`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: new Date().toISOString().split("T")[0],
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to pause plan");
      }

      const { data } = await response.json();
      onUpdate({ ...plan, status: "paused", ...data });
      toast.success("Plan paused successfully");
      setShowPauseModal(false);
    } catch (error) {
      console.error("Failed to pause plan:", error);
      toast.error("Failed to pause plan. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResume = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/recurring-plans/${plan.id}/resume`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to resume plan");
      }

      const { data } = await response.json();
      onUpdate({ ...plan, status: "active", ...data });
      toast.success("Plan resumed successfully");
    } catch (error) {
      console.error("Failed to resume plan:", error);
      toast.error("Failed to resume plan. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (
      !confirm("Are you sure you want to cancel this recurring plan? This action cannot be undone.")
    ) {
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/recurring-plans/${plan.id}/cancel`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to cancel plan");
      }

      onUpdate({ ...plan, status: "cancelled" });
      toast.success("Plan cancelled successfully");
    } catch (error) {
      console.error("Failed to cancel plan:", error);
      toast.error("Failed to cancel plan. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const savingsPerBooking = plan.base_amount - plan.final_amount;

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-start gap-6">
        {/* Professional Avatar */}
        <div className="flex-shrink-0">
          {plan.professional?.avatar_url ? (
            <img
              alt={plan.professional.full_name}
              className="h-16 w-16 rounded-lg object-cover"
              src={plan.professional.avatar_url}
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-rausch-500 font-bold text-white text-xl">
              {plan.professional?.full_name?.charAt(0).toUpperCase() || "?"}
            </div>
          )}
        </div>

        {/* Plan Details */}
        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h3 className="mb-1 font-bold text-neutral-900 text-xl">{plan.service_name}</h3>
              <div className="flex items-center gap-2 text-neutral-500 text-sm">
                <span>with {plan.professional?.full_name || "Unknown Professional"}</span>
              </div>
            </div>

            {/* Status Badge */}
            <span
              className={`inline-flex rounded-full px-3 py-1 font-semibold text-xs ${STATUS_BADGE_CLASSES[plan.status]}`}
            >
              {STATUS_LABELS[plan.status]}
            </span>
          </div>

          {/* Plan Info Grid */}
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex items-center gap-2 text-sm">
              <HugeiconsIcon className="h-5 w-5 text-rausch-500" icon={Calendar02Icon} />
              <div>
                <p className="font-medium text-neutral-900">{FREQUENCY_LABELS[plan.frequency]}</p>
                {plan.day_of_week !== null && (
                  <p className="text-neutral-500 text-xs">
                    {DAY_NAMES[plan.day_of_week]} at {plan.preferred_time}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <HugeiconsIcon className="h-5 w-5 text-rausch-500" icon={Clock01Icon} />
              <div>
                <p className="font-medium text-neutral-900">{plan.duration_minutes} minutes</p>
                <p className="text-neutral-500 text-xs">Duration</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-green-100 font-bold text-green-600 text-xs">
                $
              </div>
              <div>
                <p className="font-medium text-neutral-900">
                  {formatCurrency(plan.final_amount, {
                    currency: (plan.currency === "COP" || plan.currency === "USD"
                      ? plan.currency
                      : "COP") as Currency,
                  })}
                </p>
                <p className="text-green-600 text-xs">
                  Save {plan.discount_percentage}% (
                  {formatCurrency(savingsPerBooking, {
                    currency: (plan.currency === "COP" || plan.currency === "USD"
                      ? plan.currency
                      : "COP") as Currency,
                  })}
                  )
                </p>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="mb-4 flex items-start gap-2 text-sm">
            <HugeiconsIcon
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-neutral-500"
              icon={LocationIcon}
            />
            <p className="text-neutral-700">{plan.address}</p>
          </div>

          {/* Stats */}
          <div className="mb-4 rounded-lg bg-neutral-50 p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-neutral-500 text-xs">Next booking</p>
                <p className="font-medium text-neutral-900">
                  {new Date(plan.next_booking_date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-neutral-500 text-xs">Completed bookings</p>
                <p className="font-medium text-neutral-900">{plan.total_bookings_completed}</p>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span>
              Created {formatDistanceToNow(new Date(plan.created_at), { addSuffix: true })}
            </span>
            <span>ID: {plan.id.slice(0, 8)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-3 border-neutral-200 border-t pt-6">
        {plan.status === "active" && (
          <>
            <button
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-neutral-200 bg-neutral-50 px-6 py-3 font-semibold text-neutral-900 transition hover:border-rausch-500 hover:bg-rausch-50 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isProcessing}
              onClick={() => setShowPauseModal(true)}
              type="button"
            >
              <HugeiconsIcon className="h-5 w-5" icon={PauseIcon} />
              Pause Plan
            </button>
            <button
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-neutral-200 bg-neutral-50 px-6 py-3 font-semibold text-neutral-900 transition hover:border-red-500 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isProcessing}
              onClick={handleCancel}
              type="button"
            >
              <HugeiconsIcon className="h-5 w-5" icon={Cancel01Icon} />
              Cancel Plan
            </button>
          </>
        )}

        {plan.status === "paused" && (
          <>
            <button
              className="flex-1 rounded-lg bg-rausch-500 px-6 py-3 font-semibold text-white transition hover:bg-rausch-600 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isProcessing}
              onClick={handleResume}
              type="button"
            >
              {isProcessing ? "Processing..." : "Resume Plan"}
            </button>
            <button
              className="flex-1 rounded-lg border-2 border-neutral-200 bg-neutral-50 px-6 py-3 font-semibold text-neutral-900 transition hover:border-red-500 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isProcessing}
              onClick={handleCancel}
              type="button"
            >
              Cancel Plan
            </button>
          </>
        )}
      </div>

      {/* Pause Modal (simplified - would typically be a proper modal component) */}
      {showPauseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/80">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 font-bold text-neutral-900 text-xl">Pause Recurring Plan</h3>
            <p className="mb-6 text-neutral-700">
              Your plan will be paused for 30 days. You won't be charged during this time.
            </p>
            <div className="flex gap-3">
              <button
                className="flex-1 rounded-lg border-2 border-neutral-200 bg-neutral-50 px-4 py-2 font-semibold text-neutral-900 transition hover:border-neutral-300"
                onClick={() => setShowPauseModal(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="flex-1 rounded-lg bg-rausch-500 px-4 py-2 font-semibold text-white transition hover:bg-rausch-600 disabled:opacity-50"
                disabled={isProcessing}
                onClick={handlePause}
                type="button"
              >
                {isProcessing ? "Processing..." : "Confirm Pause"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
