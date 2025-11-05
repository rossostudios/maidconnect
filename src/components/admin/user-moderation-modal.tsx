"use client";

import { BaseModal } from "@/components/shared/base-modal";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useModalForm } from "@/hooks/use-modal-form";

type User = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  suspension: {
    type: "temporary" | "permanent";
    reason: string;
    expires_at: string | null;
  } | null;
};

type Props = {
  user: User;
  onClose: () => void;
  onComplete: () => void;
};

type ModerationAction = "suspend" | "ban" | "unsuspend";

type ModerationFormData = {
  action: ModerationAction;
  reason: string;
  liftReason: string;
  durationDays: number;
  details: string;
};

export function UserModerationModal({ user, onClose, onComplete }: Props) {
  const form = useModalForm<ModerationFormData>({
    initialData: {
      action: user.suspension ? "unsuspend" : "suspend",
      reason: "",
      liftReason: "",
      durationDays: 7,
      details: "",
    },
    resetOnClose: true,
  });

  const moderationMutation = useApiMutation({
    url: "/api/admin/users/moderate",
    method: "POST",
    onSuccess: () => {
      onComplete();
    },
  });

  const handleSubmit = async () => {
    const action = form.formData.action;

    if ((action === "suspend" || action === "ban") && !form.formData.reason) {
      form.setError("Reason is required");
      return;
    }

    if (action === "unsuspend" && !form.formData.liftReason) {
      form.setError("Reason for lifting suspension is required");
      return;
    }

    try {
      await moderationMutation.mutate({
        userId: user.id,
        action: form.formData.action,
        reason: form.formData.reason,
        liftReason: form.formData.liftReason,
        durationDays: action === "suspend" ? form.formData.durationDays : undefined,
        details: form.formData.details ? { notes: form.formData.details } : undefined,
      });
    } catch (error) {
      form.setError(error instanceof Error ? error.message : "Failed to moderate user");
    }
  };

  const isUnsuspending = form.formData.action === "unsuspend";
  const isBanning = form.formData.action === "ban";

  return (
    <BaseModal
      description={`Moderate ${user.full_name || user.email}`}
      isOpen={true}
      onClose={onClose}
      size="lg"
      title={isUnsuspending ? "Lift Suspension" : isBanning ? "Ban User" : "Suspend User"}
    >
      <div className="space-y-6">
        <div className="rounded-lg border border-[#EBE5D8] bg-[#FDFCFA] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EBE5D8]">
              <span className="type-ui-md font-medium text-[#8A8985]">
                {((user.full_name || "?").charAt(0) || "?").toUpperCase()}
              </span>
            </div>
            <div>
              <p className="type-ui-sm font-semibold text-[#121110]">
                {user.full_name || "Unnamed User"}
              </p>
              <p className="type-body-sm text-[#8A8985]">{user.email}</p>
              <p className="type-body-sm text-[#8A8985] capitalize">Role: {user.role}</p>
            </div>
          </div>

          {user.suspension && (
            <div className="mt-4 border-[#EBE5D8] border-t pt-4">
              <p className="type-ui-sm mb-2 font-medium text-[#121110]">Current Suspension:</p>
              <p className="type-body-sm text-[#8A8985]">
                Type:{" "}
                {user.suspension.type === "permanent" ? "Permanent Ban" : "Temporary Suspension"}
              </p>
              <p className="type-body-sm mt-1 text-[#8A8985]">Reason: {user.suspension.reason}</p>
              {user.suspension.expires_at && (
                <p className="type-body-sm mt-1 text-[#8A8985]">
                  Expires: {new Date(user.suspension.expires_at).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </div>

        {!user.suspension && (
          <div>
            <label className="type-ui-sm mb-2 block font-medium text-[#121110]">Action</label>
            <div className="flex gap-3">
              <button
                className={
                  "type-ui-sm flex-1 rounded-lg border-2 px-4 py-3 font-medium transition" +
                  (form.formData.action === "suspend"
                    ? "border-[#FF5D46] bg-[#FFE8D9] text-[#FF5D46]"
                    : "border-[#EBE5D8] bg-white text-[#121110] hover:border-[#FF5D46]")
                }
                onClick={() => form.updateField("action", "suspend")}
                type="button"
              >
                Suspend (Temporary)
              </button>
              <button
                className={
                  "type-ui-sm flex-1 rounded-lg border-2 px-4 py-3 font-medium transition" +
                  (form.formData.action === "ban"
                    ? "border-red-600 bg-red-50 text-red-700"
                    : "border-[#EBE5D8] bg-white text-[#121110] hover:border-red-600")
                }
                onClick={() => form.updateField("action", "ban")}
                type="button"
              >
                Ban (Permanent)
              </button>
            </div>
          </div>
        )}

        {form.formData.action === "suspend" && (
          <div>
            <label className="type-ui-sm mb-2 block font-medium text-[#121110]">
              Duration (days)
            </label>
            <select
              className="w-full rounded-lg border border-[#EBE5D8] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF5D46]"
              onChange={(e) =>
                form.updateField("durationDays", Number.parseInt(e.target.value, 10))
              }
              value={form.formData.durationDays}
            >
              <option value="1">1 day</option>
              <option value="3">3 days</option>
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
            </select>
          </div>
        )}

        {!isUnsuspending && (
          <div>
            <label className="type-ui-sm mb-2 block font-medium text-[#121110]">
              Reason <span className="text-red-600">*</span>
            </label>
            <textarea
              className="w-full resize-none rounded-lg border border-[#EBE5D8] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FF5D46]"
              onChange={(e) => form.updateField("reason", e.target.value)}
              placeholder="Provide a clear reason for this action..."
              rows={4}
              value={form.formData.reason}
            />
          </div>
        )}

        {isUnsuspending && (
          <div>
            <label className="type-ui-sm mb-2 block font-medium text-[#121110]">
              Reason for Lifting Suspension <span className="text-red-600">*</span>
            </label>
            <textarea
              className="w-full resize-none rounded-lg border border-[#EBE5D8] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FF5D46]"
              onChange={(e) => form.updateField("liftReason", e.target.value)}
              placeholder="Why is this suspension being lifted?"
              rows={4}
              value={form.formData.liftReason}
            />
          </div>
        )}

        <div>
          <label className="type-ui-sm mb-2 block font-medium text-[#121110]">
            Additional Notes (optional)
          </label>
          <textarea
            className="w-full resize-none rounded-lg border border-[#EBE5D8] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FF5D46]"
            onChange={(e) => form.updateField("details", e.target.value)}
            placeholder="Any additional context or notes..."
            rows={3}
            value={form.formData.details}
          />
        </div>

        {form.error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="type-body-sm text-red-700">{form.error}</p>
          </div>
        )}

        {isBanning && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-4">
            <p className="type-ui-sm mb-1 font-medium text-red-800">Warning:</p>
            <p className="type-body-sm text-red-700">
              Banning a user is a permanent action. The user will not be able to access their
              account unless an admin manually lifts the ban.
            </p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            className="type-ui-sm flex-1 rounded-full border-2 border-[#EBE5D8] px-6 py-3 font-semibold text-[#121110] transition hover:border-[#FF5D46] hover:text-[#FF5D46] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={moderationMutation.isLoading}
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className={
              "type-ui-sm flex-1 rounded-full px-6 py-3 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50" +
              (isBanning ? "bg-red-600 hover:bg-red-700" : "bg-[#FF5D46] hover:bg-[#E54A35]")
            }
            disabled={moderationMutation.isLoading}
            onClick={handleSubmit}
            type="button"
          >
            {moderationMutation.isLoading
              ? "Processing..."
              : isUnsuspending
                ? "Lift Suspension"
                : isBanning
                  ? "Ban User"
                  : "Suspend User"}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
