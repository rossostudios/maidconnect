"use client";

import {
  Calendar01Icon,
  Cancel01Icon,
  CreditCardIcon,
  RefreshIcon,
  Tick01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

type SubscriptionData = {
  id: string;
  planId: string;
  status: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  plan: {
    slug: string;
    name: string;
    planType: string;
    price: string;
    features: string[];
    discountPercentage: number;
    priorityBadge: boolean;
  } | null;
};

type Props = {
  subscription: SubscriptionData | null;
  discount: number;
};

export function SubscriptionManager({ subscription, discount }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleCancel = async () => {
    if (!subscription) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/subscriptions/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriptionId: subscription.id,
          reason: "User requested cancellation",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to cancel subscription");
      }

      toast.success("Subscription will be canceled at the end of the billing period");
      setShowCancelConfirm(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to cancel subscription");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReactivate = async () => {
    if (!subscription) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/subscriptions/reactivate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId: subscription.id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to reactivate subscription");
      }

      toast.success("Subscription reactivated!");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reactivate subscription");
    } finally {
      setIsLoading(false);
    }
  };

  // No subscription state
  if (!subscription?.plan) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-8">
        <div className="mb-6">
          <h3 className="font-semibold text-neutral-900 text-xl">No Active Subscription</h3>
          <p className="mt-1 text-neutral-600 text-sm">
            You&apos;re currently on the free plan. Upgrade to unlock premium features.
          </p>
        </div>

        <Button
          className="rounded-lg bg-rausch-500 hover:bg-rausch-600"
          onClick={() => router.push("/pricing")}
        >
          View Plans
        </Button>
      </div>
    );
  }

  const statusColors: Record<string, { bg: string; text: string }> = {
    active: { bg: "bg-green-100", text: "text-green-700" },
    trialing: { bg: "bg-babu-100", text: "text-babu-700" },
    past_due: { bg: "bg-yellow-100", text: "text-yellow-700" },
    canceled: { bg: "bg-red-100", text: "text-red-700" },
    unpaid: { bg: "bg-red-100", text: "text-red-700" },
  };

  const statusInfo = statusColors[subscription.status] || statusColors.active;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-neutral-900 text-xl">
              {subscription.plan.name} Plan
            </h3>
            <span
              className={cn(
                "inline-flex rounded-full px-3 py-1 font-medium text-xs capitalize",
                statusInfo.bg,
                statusInfo.text
              )}
            >
              {subscription.status.replace("_", " ")}
            </span>
          </div>
          <p className="mt-1 text-neutral-600 text-sm">{subscription.plan.price}</p>
        </div>

        {subscription.plan.priorityBadge && (
          <span className="inline-flex items-center gap-1 rounded-full bg-rausch-100 px-3 py-1 font-medium text-rausch-700 text-xs">
            <HugeiconsIcon className="h-3 w-3" icon={CreditCardIcon} />
            Priority Badge
          </span>
        )}
      </div>

      {/* Billing Period */}
      <div className="mb-6 rounded-lg bg-neutral-50 p-4">
        <div className="flex items-center gap-2 text-neutral-600 text-sm">
          <HugeiconsIcon className="h-4 w-4" icon={Calendar01Icon} />
          <span>
            {subscription.currentPeriodStart && subscription.currentPeriodEnd && (
              <>
                Billing period: {formatDate(subscription.currentPeriodStart)} -{" "}
                {formatDate(subscription.currentPeriodEnd)}
              </>
            )}
          </span>
        </div>

        {subscription.cancelAtPeriodEnd && (
          <div className="mt-2 flex items-center gap-2 text-amber-600 text-sm">
            <HugeiconsIcon className="h-4 w-4" icon={Cancel01Icon} />
            <span>Cancels at end of billing period</span>
          </div>
        )}
      </div>

      {/* Features */}
      <div className="mb-6">
        <h4 className="mb-3 font-medium text-neutral-900 text-sm">Included Features</h4>
        <ul className="grid gap-2 sm:grid-cols-2">
          {subscription.plan.features.map((feature) => (
            <li className="flex items-center gap-2 text-neutral-700 text-sm" key={feature}>
              <HugeiconsIcon
                className="h-4 w-4 flex-shrink-0 text-green-500"
                icon={Tick01Icon}
                strokeWidth={3}
              />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      {/* Discount Info */}
      {discount > 0 && (
        <div className="mb-6 rounded-lg bg-green-50 p-4">
          <p className="text-green-700 text-sm">
            <span className="font-semibold">{discount}% discount</span> on all bookings with your
            subscription!
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {subscription.cancelAtPeriodEnd ? (
          <Button
            className="rounded-lg bg-green-600 hover:bg-green-700"
            disabled={isLoading}
            onClick={handleReactivate}
          >
            <HugeiconsIcon className="mr-2 h-4 w-4" icon={RefreshIcon} />
            {isLoading ? "Processing..." : "Reactivate Subscription"}
          </Button>
        ) : (
          <>
            <Button
              className="rounded-lg"
              onClick={() => router.push("/pricing")}
              variant="outline"
            >
              Change Plan
            </Button>

            {showCancelConfirm ? (
              <div className="flex items-center gap-2">
                <Button
                  className="rounded-lg"
                  disabled={isLoading}
                  onClick={handleCancel}
                  variant="destructive"
                >
                  {isLoading ? "Canceling..." : "Confirm Cancel"}
                </Button>
                <Button
                  className="rounded-lg"
                  onClick={() => setShowCancelConfirm(false)}
                  variant="outline"
                >
                  Keep Plan
                </Button>
              </div>
            ) : (
              <Button
                className="rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => setShowCancelConfirm(true)}
                variant="ghost"
              >
                Cancel Subscription
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
