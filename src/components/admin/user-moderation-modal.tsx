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
        <div className="border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[neutral-200]">
              <span className="type-ui-md font-medium text-neutral-600 dark:text-neutral-400">
                {((user.full_name || "?").charAt(0) || "?").toUpperCase()}
              </span>
            </div>
            <div>
              <p className="type-ui-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {user.full_name || "Unnamed User"}
              </p>
              <p className="type-body-sm text-neutral-600 dark:text-neutral-400">{user.email}</p>
              <p className="type-body-sm text-neutral-600 capitalize dark:text-neutral-400">
                Role: {user.role}
              </p>
            </div>
          </div>

          {user.suspension && (
            <div className="mt-4 border-neutral-200 border-t pt-4 dark:border-neutral-800">
              <p className="type-ui-sm mb-2 font-medium text-neutral-900 dark:text-neutral-100">
                Current Suspension:
              </p>
              <p className="type-body-sm text-neutral-600 dark:text-neutral-400">
                Type:{" "}
                {user.suspension.type === "permanent" ? "Permanent Ban" : "Temporary Suspension"}
              </p>
              <p className="type-body-sm mt-1 text-neutral-600 dark:text-neutral-400">
                Reason: {user.suspension.reason}
              </p>
              {user.suspension.expires_at && (
                <p className="type-body-sm mt-1 text-neutral-600 dark:text-neutral-400">
                  Expires: {new Date(user.suspension.expires_at).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </div>

        {!user.suspension && (
          <div>
            <label className="type-ui-sm mb-2 block font-medium text-neutral-900 dark:text-neutral-100">
              Action
            </label>
            <div className="flex gap-3">
              <button
                className={
                  "type-ui-sm flex-1 border-2 px-4 py-3 font-medium transition" +
                  (form.formData.action === "suspend"
                    ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100/10 dark:text-neutral-100"
                    : "border-neutral-200 bg-white text-neutral-900 hover:border-neutral-900 dark:border-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100")
                }
                onClick={() => form.updateField("action", "suspend")}
                type="button"
              >
                Suspend (Temporary)
              </button>
              <button
                className={
                  "type-ui-sm flex-1 border-2 px-4 py-3 font-medium transition" +
                  (form.formData.action === "ban"
                    ? "border-neutral-900 bg-neutral-100 text-neutral-900 dark:border-neutral-100 dark:bg-neutral-800 dark:text-neutral-100"
                    : "border-neutral-200 bg-white text-neutral-900 hover:border-neutral-900 dark:border-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100")
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
            <label className="type-ui-sm mb-2 block font-medium text-neutral-900 dark:text-neutral-100">
              Duration (days)
            </label>
            <select
              className="w-full border border-neutral-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-500 dark:border-neutral-800 dark:focus:ring-neutral-400"
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
            <label className="type-ui-sm mb-2 block font-medium text-neutral-900 dark:text-neutral-100">
              Reason <span className="text-neutral-900 dark:text-neutral-100">*</span>
            </label>
            <textarea
              className="w-full resize-none border border-neutral-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neutral-500 dark:border-neutral-800 dark:focus:ring-neutral-400"
              onChange={(e) => form.updateField("reason", e.target.value)}
              placeholder="Provide a clear reason for this action..."
              rows={4}
              value={form.formData.reason}
            />
          </div>
        )}

        {isUnsuspending && (
          <div>
            <label className="type-ui-sm mb-2 block font-medium text-neutral-900 dark:text-neutral-100">
              Reason for Lifting Suspension{" "}
              <span className="text-neutral-900 dark:text-neutral-100">*</span>
            </label>
            <textarea
              className="w-full resize-none border border-neutral-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neutral-500 dark:border-neutral-800 dark:focus:ring-neutral-400"
              onChange={(e) => form.updateField("liftReason", e.target.value)}
              placeholder="Why is this suspension being lifted?"
              rows={4}
              value={form.formData.liftReason}
            />
          </div>
        )}

        <div>
          <label className="type-ui-sm mb-2 block font-medium text-neutral-900 dark:text-neutral-100">
            Additional Notes (optional)
          </label>
          <textarea
            className="w-full resize-none border border-neutral-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neutral-500 dark:border-neutral-800 dark:focus:ring-neutral-400"
            onChange={(e) => form.updateField("details", e.target.value)}
            placeholder="Any additional context or notes..."
            rows={3}
            value={form.formData.details}
          />
        </div>

        {form.error && (
          <div className="border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
            <p className="type-body-sm text-red-700 dark:text-red-200">{form.error}</p>
          </div>
        )}

        {isBanning && (
          <div className="border border-neutral-900 bg-neutral-900 p-4 dark:border-neutral-100/50 dark:bg-neutral-100/10">
            <p className="type-ui-sm mb-1 font-medium text-neutral-900 dark:text-neutral-100">
              Warning:
            </p>
            <p className="type-body-sm text-red-700 dark:text-red-200">
              Banning a user is a permanent action. The user will not be able to access their
              account unless an admin manually lifts the ban.
            </p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            className="type-ui-sm flex-1 border-2 border-neutral-200 px-6 py-3 font-semibold text-neutral-900 transition hover:border-neutral-900 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-100 dark:border-neutral-800 dark:text-neutral-100 dark:text-neutral-100"
            disabled={moderationMutation.isLoading}
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className={
              "type-ui-sm flex-1 px-6 py-3 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 dark:text-neutral-950" +
              (isBanning
                ? "bg-neutral-900 hover:bg-neutral-900 dark:bg-neutral-100 dark:bg-neutral-100"
                : "bg-neutral-900 hover:bg-neutral-900 dark:bg-neutral-100 dark:bg-neutral-100")
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
