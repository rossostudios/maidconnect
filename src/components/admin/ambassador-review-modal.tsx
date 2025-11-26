"use client";

/**
 * Ambassador Review Modal
 *
 * Modal for reviewing and approving/rejecting ambassador applications.
 * Uses useModalForm for form state and useApiMutation for API calls.
 *
 * Refactored: Phase 1 complexity reduction - extracted hooks and helpers
 */

import {
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Mail01Icon,
  SmartPhone01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useModalForm } from "@/hooks/use-modal-form";
import type { AmbassadorApplication } from "./ambassador-review-dashboard";

// --- Helper Functions (extracted for reduced complexity) ---

function formatProfession(profession: string | null): string {
  if (!profession) {
    return "Not specified";
  }
  return profession
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatApplicationDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getSubmitButtonText(isLoading: boolean, action: "approve" | "reject" | null): string {
  if (isLoading) {
    return "Processing...";
  }
  if (action === "approve") {
    return "Approve Ambassador";
  }
  if (action === "reject") {
    return "Reject Application";
  }
  return "Select Action";
}

function getActionButtonClassName(isSelected: boolean, variant: "approve" | "reject"): string {
  const baseClasses =
    "flex flex-1 items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all";

  if (variant === "approve") {
    return isSelected
      ? `${baseClasses} border-green-500 bg-green-50 text-green-700`
      : `${baseClasses} border-neutral-200 hover:border-green-300 hover:bg-green-50/50`;
  }

  return isSelected
    ? `${baseClasses} border-red-500 bg-red-50 text-red-700`
    : `${baseClasses} border-neutral-200 hover:border-red-300 hover:bg-red-50/50`;
}

function formatLocation(city: string | null, country: string | null): string {
  if (city && country) {
    return `${city}, ${country}`;
  }
  return "Not specified";
}

// --- Types ---

type AmbassadorReviewFormData = {
  action: "approve" | "reject" | null;
  rejectionReason: string;
};

type AmbassadorReviewModalProps = {
  ambassador: AmbassadorApplication;
  onClose: () => void;
  onComplete: () => void;
};

// --- Component ---

export function AmbassadorReviewModal({
  ambassador,
  onClose,
  onComplete,
}: AmbassadorReviewModalProps) {
  const form = useModalForm<AmbassadorReviewFormData>({
    initialData: {
      action: null,
      rejectionReason: "",
    },
    resetOnClose: true,
  });

  const reviewMutation = useApiMutation({
    url: `/api/admin/ambassadors/${ambassador.id}/review`,
    method: "POST",
    onSuccess: onComplete,
  });

  const handleSubmit = async () => {
    if (!form.formData.action) {
      return;
    }

    if (form.formData.action === "reject" && !form.formData.rejectionReason.trim()) {
      form.setError("Please provide a rejection reason");
      return;
    }

    try {
      await reviewMutation.mutate({
        action: form.formData.action,
        rejectionReason:
          form.formData.action === "reject" ? form.formData.rejectionReason : undefined,
      });
    } catch {
      // Error is handled by the mutation hook
    }
  };

  const isLoading = reviewMutation.isLoading;
  const error = reviewMutation.error || form.error;

  return (
    <Dialog onOpenChange={(open) => !open && onClose()} open>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Ambassador Application Review</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Applicant Info */}
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
            <h3 className="mb-4 font-semibold text-neutral-900">Applicant Information</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-neutral-500 text-xs uppercase">Full Name</p>
                <p className="font-medium text-neutral-900">{ambassador.full_name || "N/A"}</p>
              </div>
              <div>
                <p className="mb-1 text-neutral-500 text-xs uppercase">Applied On</p>
                <p className="font-medium text-neutral-900">
                  {formatApplicationDate(ambassador.applied_at)}
                </p>
              </div>
              <div>
                <p className="mb-1 text-neutral-500 text-xs uppercase">Email</p>
                <div className="flex items-center gap-2">
                  <HugeiconsIcon className="h-4 w-4 text-neutral-500" icon={Mail01Icon} />
                  <p className="font-medium text-neutral-900">{ambassador.email}</p>
                </div>
              </div>
              <div>
                <p className="mb-1 text-neutral-500 text-xs uppercase">Phone</p>
                <div className="flex items-center gap-2">
                  <HugeiconsIcon className="h-4 w-4 text-neutral-500" icon={SmartPhone01Icon} />
                  <p className="font-medium text-neutral-900">{ambassador.phone || "N/A"}</p>
                </div>
              </div>
              <div>
                <p className="mb-1 text-neutral-500 text-xs uppercase">Location</p>
                <p className="font-medium text-neutral-900">
                  {formatLocation(ambassador.city, ambassador.country)}
                </p>
              </div>
              <div>
                <p className="mb-1 text-neutral-500 text-xs uppercase">Referral Code</p>
                <p className="font-bold font-mono text-rausch-600">{ambassador.referral_code}</p>
              </div>
            </div>
          </div>

          {/* Professional Info */}
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
            <h3 className="mb-4 font-semibold text-neutral-900">Professional Background</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-neutral-500 text-xs uppercase">Profession</p>
                <p className="font-medium text-neutral-900">
                  {formatProfession(ambassador.profession)}
                </p>
              </div>
              <div>
                <p className="mb-1 text-neutral-500 text-xs uppercase">Company</p>
                <p className="font-medium text-neutral-900">{ambassador.company_name || "N/A"}</p>
              </div>
              <div>
                <p className="mb-1 text-neutral-500 text-xs uppercase">Estimated Referral Reach</p>
                <p className="font-bold text-2xl text-neutral-900">
                  {ambassador.referral_reach || "N/A"}
                  <span className="ml-1 font-normal text-neutral-500 text-sm">
                    professionals/month
                  </span>
                </p>
              </div>
              {ambassador.social_media_links && ambassador.social_media_links.length > 0 && (
                <div>
                  <p className="mb-1 text-neutral-500 text-xs uppercase">Social Media</p>
                  {ambassador.social_media_links.map((link, i) => (
                    <a
                      className="block truncate text-babu-600 text-sm hover:underline"
                      href={link}
                      key={i}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {link}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Motivation */}
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
            <h3 className="mb-2 font-semibold text-neutral-900">Why they want to join</h3>
            <p className="whitespace-pre-wrap text-neutral-700 text-sm">
              {ambassador.motivation || "No motivation provided."}
            </p>
          </div>

          {/* Performance stats for approved ambassadors */}
          {ambassador.status === "approved" && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <h3 className="mb-4 font-semibold text-green-800">Performance</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="mb-1 text-green-700 text-xs uppercase">Total Referrals</p>
                  <p className="font-bold text-2xl text-green-800">{ambassador.total_referrals}</p>
                </div>
                <div>
                  <p className="mb-1 text-green-700 text-xs uppercase">Successful</p>
                  <p className="font-bold text-2xl text-green-800">
                    {ambassador.successful_referrals}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-green-700 text-xs uppercase">Earnings</p>
                  <p className="font-bold text-2xl text-green-800">
                    ${(ambassador.total_earnings_cents / 100).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Selection */}
          {ambassador.status === "pending" && (
            <div className="space-y-4">
              <h3 className="font-semibold text-neutral-900">Decision</h3>
              <div className="flex gap-4">
                <button
                  className={getActionButtonClassName(
                    form.formData.action === "approve",
                    "approve"
                  )}
                  onClick={() => form.updateField("action", "approve")}
                  type="button"
                >
                  <HugeiconsIcon className="h-5 w-5" icon={CheckmarkCircle02Icon} />
                  <span className="font-semibold">Approve</span>
                </button>
                <button
                  className={getActionButtonClassName(form.formData.action === "reject", "reject")}
                  onClick={() => form.updateField("action", "reject")}
                  type="button"
                >
                  <HugeiconsIcon className="h-5 w-5" icon={Cancel01Icon} />
                  <span className="font-semibold">Reject</span>
                </button>
              </div>

              {/* Rejection Reason */}
              {form.formData.action === "reject" && (
                <div className="space-y-2">
                  <Label htmlFor="rejectionReason">Rejection Reason *</Label>
                  <Textarea
                    id="rejectionReason"
                    onChange={(e) => form.updateField("rejectionReason", e.target.value)}
                    placeholder="Please provide a reason for rejecting this application..."
                    rows={3}
                    value={form.formData.rejectionReason}
                  />
                </div>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button disabled={isLoading} onClick={onClose} variant="outline">
            {ambassador.status === "pending" ? "Cancel" : "Close"}
          </Button>
          {ambassador.status === "pending" && (
            <Button
              disabled={!form.formData.action || isLoading}
              onClick={handleSubmit}
              variant={form.formData.action === "reject" ? "destructive" : "default"}
            >
              {getSubmitButtonText(isLoading, form.formData.action)}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
