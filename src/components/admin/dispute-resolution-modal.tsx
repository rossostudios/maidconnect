/**
 * Dispute Resolution Modal Component
 *
 * Allows admins to:
 * - View dispute details (customer, professional, booking info)
 * - Review evidence (photos, messages)
 * - Take resolution actions (refund, warning, suspension)
 * - Add internal notes and customer-facing messages
 *
 * Lia Design: Anthropic rounded corners (rounded-lg), solid backgrounds, refined typography
 */

"use client";

import { BaseModal } from "@/components/shared/base-modal";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useModalForm } from "@/hooks/use-modal-form";

type Dispute = {
  id: string;
  booking_id: string;
  opened_by: string;
  opened_by_role: "customer" | "professional";
  dispute_type: string;
  status: string;
  priority: string;
  description: string;
  created_at: string;
  booking: {
    id: string;
    service_category: string;
    amount_estimated: number;
  };
  opener: {
    id: string;
    full_name: string | null;
    email: string | null;
  };
};

type Props = {
  dispute: Dispute;
  onClose: () => void;
  onComplete: () => void;
};

type ResolutionFormData = {
  resolutionType: "refund" | "warning" | "suspend" | "no_action" | "request_info";
  refundAmount: number;
  actionTaken: string;
  adminNotes: string;
  resolutionMessage: string;
};

export function DisputeResolutionModal({ dispute, onClose, onComplete }: Props) {
  const form = useModalForm<ResolutionFormData>({
    initialData: {
      resolutionType: "no_action",
      refundAmount: 0,
      actionTaken: "",
      adminNotes: "",
      resolutionMessage: "",
    },
    resetOnClose: true,
  });

  const resolveMutation = useApiMutation({
    url: `/api/admin/disputes/${dispute.id}/resolve`,
    method: "POST",
    onSuccess: () => {
      onComplete();
    },
  });

  const handleSubmit = async () => {
    const { resolutionType, refundAmount, actionTaken, adminNotes, resolutionMessage } =
      form.formData;

    if (!actionTaken) {
      form.setError("Action taken is required");
      return;
    }

    if (!resolutionMessage) {
      form.setError("Resolution message is required");
      return;
    }

    if (resolutionType === "refund" && (!refundAmount || refundAmount <= 0)) {
      form.setError("Refund amount must be greater than 0");
      return;
    }

    try {
      await resolveMutation.mutate({
        resolution_type: resolutionType,
        refund_amount: resolutionType === "refund" ? refundAmount : undefined,
        action_taken: actionTaken,
        notes: adminNotes,
        message: resolutionMessage,
      });
    } catch (error) {
      form.setError(error instanceof Error ? error.message : "Failed to resolve dispute");
    }
  };

  return (
    <BaseModal
      description={`Resolve dispute #${dispute.id.slice(0, 8)}`}
      isOpen={true}
      onClose={onClose}
      size="xl"
      title="Dispute Resolution"
    >
      <div className="space-y-6">
        {/* Dispute Details */}
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <h3 className="type-ui-md mb-4 font-medium text-neutral-900">Dispute Details</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="type-body-sm font-medium text-neutral-900">Customer</p>
              <p className="type-body-sm text-neutral-700">
                {dispute.opener.full_name || "Unnamed"}
              </p>
              <p className="type-body-sm text-neutral-600">{dispute.opener.email}</p>
            </div>

            <div>
              <p className="type-body-sm font-medium text-neutral-900">Booking</p>
              <p className="type-body-sm text-neutral-700">{dispute.booking.service_category}</p>
              <p className="type-body-sm text-neutral-600">
                ${dispute.booking.amount_estimated.toFixed(2)}
              </p>
            </div>

            <div>
              <p className="type-body-sm font-medium text-neutral-900">Dispute Type</p>
              <p className="type-body-sm text-neutral-700 capitalize">
                {dispute.dispute_type.replace(/_/g, " ")}
              </p>
            </div>

            <div>
              <p className="type-body-sm font-medium text-neutral-900">Priority</p>
              <p className="type-body-sm text-neutral-700 capitalize">{dispute.priority}</p>
            </div>
          </div>

          <div className="mt-4 border-neutral-200 border-t pt-4">
            <p className="type-body-sm mb-2 font-medium text-neutral-900">Dispute Reason</p>
            <p className="type-body-sm text-neutral-700">{dispute.description}</p>
          </div>
        </div>

        {/* Resolution Type */}
        <div>
          <label className="type-ui-sm mb-2 block font-medium text-neutral-900">
            Resolution Type
          </label>
          <select
            className="w-full rounded-lg border border-neutral-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-500"
            onChange={(e) =>
              form.updateField(
                "resolutionType",
                e.target.value as ResolutionFormData["resolutionType"]
              )
            }
            value={form.formData.resolutionType}
          >
            <option value="no_action">No Action</option>
            <option value="refund">Issue Refund</option>
            <option value="warning">Issue Warning to Professional</option>
            <option value="suspend">Suspend Professional</option>
            <option value="request_info">Request More Information</option>
          </select>
        </div>

        {/* Refund Amount (conditional) */}
        {form.formData.resolutionType === "refund" && (
          <div>
            <label className="type-ui-sm mb-2 block font-medium text-neutral-900">
              Refund Amount ($)
            </label>
            <input
              className="w-full rounded-lg border border-neutral-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-500"
              max={dispute.booking.amount_estimated}
              min={0}
              onChange={(e) =>
                form.updateField("refundAmount", Number.parseFloat(e.target.value) || 0)
              }
              step={0.01}
              type="number"
              value={form.formData.refundAmount}
            />
            <p className="type-body-sm mt-1 text-neutral-600">
              Max refund: ${dispute.booking.amount_estimated.toFixed(2)}
            </p>
          </div>
        )}

        {/* Action Taken */}
        <div>
          <label className="type-ui-sm mb-2 block font-medium text-neutral-900">
            Action Taken <span className="text-red-600">*</span>
          </label>
          <textarea
            className="w-full resize-none rounded-lg border border-neutral-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neutral-500"
            onChange={(e) => form.updateField("actionTaken", e.target.value)}
            placeholder="Describe the action taken to resolve this dispute..."
            rows={3}
            value={form.formData.actionTaken}
          />
        </div>

        {/* Admin Notes (internal only) */}
        <div>
          <label className="type-ui-sm mb-2 block font-medium text-neutral-900">
            Admin Notes (Internal Only)
          </label>
          <textarea
            className="w-full resize-none rounded-lg border border-neutral-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neutral-500"
            onChange={(e) => form.updateField("adminNotes", e.target.value)}
            placeholder="Internal notes (not visible to users)..."
            rows={3}
            value={form.formData.adminNotes}
          />
        </div>

        {/* Resolution Message (sent to users) */}
        <div>
          <label className="type-ui-sm mb-2 block font-medium text-neutral-900">
            Resolution Message (Sent to Both Parties) <span className="text-red-600">*</span>
          </label>
          <textarea
            className="w-full resize-none rounded-lg border border-neutral-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neutral-500"
            onChange={(e) => form.updateField("resolutionMessage", e.target.value)}
            placeholder="This message will be sent to both the customer and professional..."
            rows={4}
            value={form.formData.resolutionMessage}
          />
        </div>

        {/* Error Message */}
        {form.error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="type-body-sm text-red-700">{form.error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 border-neutral-200 border-t pt-4">
          <button
            className="type-ui-sm flex-1 rounded-lg border border-neutral-200 px-6 py-3 font-medium text-neutral-900 transition hover:border-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={resolveMutation.isLoading}
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="type-ui-sm flex-1 rounded-lg bg-neutral-900 px-6 py-3 font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={resolveMutation.isLoading}
            onClick={handleSubmit}
            type="button"
          >
            {resolveMutation.isLoading ? "Resolving..." : "Resolve Dispute"}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
