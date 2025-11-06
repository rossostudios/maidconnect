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
import { formatCurrency } from "@/lib/format";
import { toast } from "@/lib/toast";

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
  currency: string;
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
      <div className="flex gap-2 border-[#ebe5d8] border-b">
        <button
          className={`border-b-2 px-6 py-3 font-medium text-sm transition ${
            filter === "all"
              ? "border-[#E85D48] text-[#E85D48]"
              : "border-transparent text-[#7d7566] hover:text-gray-900"
          }`}
          onClick={() => setFilter("all")}
        >
          All ({activeCount + pausedCount})
        </button>
        <button
          className={`border-b-2 px-6 py-3 font-medium text-sm transition ${
            filter === "active"
              ? "border-[#E85D48] text-[#E85D48]"
              : "border-transparent text-[#7d7566] hover:text-gray-900"
          }`}
          onClick={() => setFilter("active")}
        >
          Active ({activeCount})
        </button>
        <button
          className={`border-b-2 px-6 py-3 font-medium text-sm transition ${
            filter === "paused"
              ? "border-[#E85D48] text-[#E85D48]"
              : "border-transparent text-[#7d7566] hover:text-gray-900"
          }`}
          onClick={() => setFilter("paused")}
        >
          Paused ({pausedCount})
        </button>
      </div>

      {/* Plans Grid */}
      {filteredPlans.length === 0 ? (
        <div className="rounded-2xl border border-[#ebe5d8] bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#ebe5d8]">
            <HugeiconsIcon className="h-8 w-8 text-[#7d7566]" icon={Calendar03Icon} />
          </div>
          <h3 className="font-semibold text-gray-900 text-xl">
            {filter === "active"
              ? "No active recurring plans"
              : filter === "paused"
                ? "No paused plans"
                : "No recurring plans yet"}
          </h3>
          <p className="mt-2 text-[#7d7566]">
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
    <div className="rounded-2xl border border-[#ebe5d8] bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-start gap-6">
        {/* Professional Avatar */}
        <div className="flex-shrink-0">
          {plan.professional?.avatar_url ? (
            <img
              alt={plan.professional.full_name}
              className="h-16 w-16 rounded-full object-cover"
              src={plan.professional.avatar_url}
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E85D48] font-bold text-white text-xl">
              {plan.professional?.full_name?.charAt(0).toUpperCase() || "?"}
            </div>
          )}
        </div>

        {/* Plan Details */}
        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h3 className="mb-1 font-bold text-gray-900 text-xl">{plan.service_name}</h3>
              <div className="flex items-center gap-2 text-[#7d7566] text-sm">
                <span>with {plan.professional?.full_name || "Unknown Professional"}</span>
              </div>
            </div>

            {/* Status Badge */}
            <span
              className={`inline-flex rounded-full px-3 py-1 font-semibold text-xs ${
                plan.status === "active"
                  ? "bg-green-100 text-green-700"
                  : plan.status === "paused"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-600"
              }`}
            >
              {plan.status === "active"
                ? "Active"
                : plan.status === "paused"
                  ? "Paused"
                  : "Cancelled"}
            </span>
          </div>

          {/* Plan Info Grid */}
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex items-center gap-2 text-sm">
              <HugeiconsIcon className="h-5 w-5 text-[#E85D48]" icon={Calendar02Icon} />
              <div>
                <p className="font-medium text-gray-900">{FREQUENCY_LABELS[plan.frequency]}</p>
                {plan.day_of_week !== null && (
                  <p className="text-[#7d7566] text-xs">
                    {DAY_NAMES[plan.day_of_week]} at {plan.preferred_time}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <HugeiconsIcon className="h-5 w-5 text-[#E85D48]" icon={Clock01Icon} />
              <div>
                <p className="font-medium text-gray-900">{plan.duration_minutes} minutes</p>
                <p className="text-[#7d7566] text-xs">Duration</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 font-bold text-green-600 text-xs">
                $
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {formatCurrency(plan.final_amount, { currency: plan.currency as any })}
                </p>
                <p className="text-green-600 text-xs">
                  Save {plan.discount_percentage}% (
                  {formatCurrency(savingsPerBooking, { currency: plan.currency as any })})
                </p>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="mb-4 flex items-start gap-2 text-sm">
            <HugeiconsIcon
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#7d7566]"
              icon={LocationIcon}
            />
            <p className="text-[#7d7566]">{plan.address}</p>
          </div>

          {/* Stats */}
          <div className="mb-4 rounded-lg bg-[#fbfafa] p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[#7d7566] text-xs">Next booking</p>
                <p className="font-medium text-gray-900">
                  {new Date(plan.next_booking_date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-[#7d7566] text-xs">Completed bookings</p>
                <p className="font-medium text-gray-900">{plan.total_bookings_completed}</p>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="flex items-center justify-between text-[#9d9383] text-xs">
            <span>
              Created {formatDistanceToNow(new Date(plan.created_at), { addSuffix: true })}
            </span>
            <span>ID: {plan.id.slice(0, 8)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-3 border-[#ebe5d8] border-t pt-6">
        {plan.status === "active" && (
          <>
            <button
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-[#e5dfd4] bg-white px-6 py-3 font-semibold text-gray-900 transition hover:border-yellow-500 hover:text-yellow-600 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isProcessing}
              onClick={() => setShowPauseModal(true)}
            >
              <HugeiconsIcon className="h-5 w-5" icon={PauseIcon} />
              Pause Plan
            </button>
            <button
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-[#e5dfd4] bg-white px-6 py-3 font-semibold text-gray-900 transition hover:border-[#E85D48]/100 hover:text-[#E85D48] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isProcessing}
              onClick={handleCancel}
            >
              <HugeiconsIcon className="h-5 w-5" icon={Cancel01Icon} />
              Cancel Plan
            </button>
          </>
        )}

        {plan.status === "paused" && (
          <>
            <button
              className="flex-1 rounded-lg bg-[#E85D48] px-6 py-3 font-semibold text-white transition hover:bg-[#D64A36] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isProcessing}
              onClick={handleResume}
            >
              {isProcessing ? "Processing..." : "Resume Plan"}
            </button>
            <button
              className="flex-1 rounded-lg border-2 border-[#e5dfd4] bg-white px-6 py-3 font-semibold text-gray-900 transition hover:border-[#E85D48]/100 hover:text-[#E85D48] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isProcessing}
              onClick={handleCancel}
            >
              Cancel Plan
            </button>
          </>
        )}
      </div>

      {/* Pause Modal (simplified - would typically be a proper modal component) */}
      {showPauseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6">
            <h3 className="mb-4 font-bold text-xl">Pause Recurring Plan</h3>
            <p className="mb-6 text-[#7d7566]">
              Your plan will be paused for 30 days. You won't be charged during this time.
            </p>
            <div className="flex gap-3">
              <button
                className="flex-1 rounded-lg border-2 border-[#e5dfd4] px-4 py-2 font-semibold"
                onClick={() => setShowPauseModal(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 rounded-lg bg-[#E85D48] px-4 py-2 font-semibold text-white disabled:opacity-50"
                disabled={isProcessing}
                onClick={handlePause}
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
