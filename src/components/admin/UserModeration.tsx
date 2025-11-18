"use client";

import { BaseModal } from "@/components/shared/base-modal";
import { type UseModalFormReturn, useModalForm } from "@/hooks/use";
import { useApiMutation } from "@/hooks/useMutation";

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
  const handleSubmit = useUserModerationSubmit({
    form,
    moderationMutation,
    userId: user.id,
  });

  const isUnsuspending = form.formData.action === "unsuspend";
  const isBanning = form.formData.action === "ban";

  return (
    <BaseModal
      description={`Moderate ${user.full_name || user.email}`}
      isOpen={true}
      onClose={onClose}
      size="lg"
      title={getModerationTitle(form.formData.action)}
    >
      <div className="space-y-6">
        <UserSummaryCard user={user} />
        {!user.suspension && (
          <ModerationActionSelector
            action={form.formData.action}
            onSelect={(value) => form.updateField("action", value)}
          />
        )}
        {form.formData.action === "suspend" && (
          <DurationSelector
            onChange={(value) => form.updateField("durationDays", value)}
            value={form.formData.durationDays}
          />
        )}
        {!isUnsuspending && (
          <ReasonField
            onChange={(value) => form.updateField("reason", value)}
            value={form.formData.reason}
          />
        )}
        {isUnsuspending && (
          <LiftReasonField
            onChange={(value) => form.updateField("liftReason", value)}
            value={form.formData.liftReason}
          />
        )}
        <AdditionalNotesField
          onChange={(value) => form.updateField("details", value)}
          value={form.formData.details}
        />
        {form.error && <ModerationError message={form.error} />}
        {isBanning && <ModerationWarning />}
        <ModerationFooter
          action={form.formData.action}
          isLoading={moderationMutation.isLoading}
          onCancel={onClose}
          onSubmit={handleSubmit}
        />
      </div>
    </BaseModal>
  );
}

type ModerationFormHandle = UseModalFormReturn<ModerationFormData>;
type ModerationMutation = ReturnType<typeof useApiMutation>;

function UserSummaryCard({ user }: { user: User }) {
  return (
    <div className="border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center bg-[neutral-200]">
          <span className="type-ui-md font-medium text-neutral-600 dark:text-neutral-300">
            {((user.full_name || "?").charAt(0) || "?").toUpperCase()}
          </span>
        </div>
        <div>
          <p className="type-ui-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {user.full_name || "Unnamed User"}
          </p>
          <p className="type-body-sm text-neutral-600 dark:text-neutral-300">{user.email}</p>
          <p className="type-body-sm text-neutral-600 capitalize dark:text-neutral-300">
            Role: {user.role}
          </p>
        </div>
      </div>
      {user.suspension && (
        <div className="mt-4 border-neutral-200 border-t pt-4 dark:border-neutral-800">
          <p className="type-ui-sm mb-2 font-medium text-neutral-900 dark:text-neutral-100">
            Current Suspension:
          </p>
          <p className="type-body-sm text-neutral-600 dark:text-neutral-300">
            Type: {user.suspension.type === "permanent" ? "Permanent Ban" : "Temporary Suspension"}
          </p>
          <p className="type-body-sm mt-1 text-neutral-600 dark:text-neutral-300">
            Reason: {user.suspension.reason}
          </p>
          {user.suspension.expires_at && (
            <p className="type-body-sm mt-1 text-neutral-600 dark:text-neutral-300">
              Expires: {new Date(user.suspension.expires_at).toLocaleDateString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function ModerationActionSelector({
  action,
  onSelect,
}: {
  action: ModerationAction;
  onSelect: (value: ModerationAction) => void;
}) {
  const buttons: { label: string; value: ModerationAction; description: string }[] = [
    { label: "Suspend (Temporary)", value: "suspend", description: "Temporary" },
    { label: "Ban (Permanent)", value: "ban", description: "Permanent" },
  ];

  return (
    <div>
      <p className="type-ui-sm mb-2 font-medium text-neutral-900 dark:text-neutral-100">Action</p>
      <div className="flex gap-3">
        {buttons.map((btn) => (
          <button
            className={
              "type-ui-sm flex-1 border-2 px-4 py-3 font-medium transition" +
              (action === btn.value
                ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100/10 dark:text-neutral-100"
                : "border-neutral-200 bg-white text-neutral-900 hover:border-neutral-900 dark:border-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100")
            }
            key={btn.value}
            onClick={() => onSelect(btn.value)}
            type="button"
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function DurationSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const options = [1, 3, 7, 14, 30, 90];
  const selectId = "moderation-duration";
  return (
    <div>
      <label
        className="type-ui-sm mb-2 block font-medium text-neutral-900 dark:text-neutral-100"
        htmlFor={selectId}
      >
        Duration (days)
      </label>
      <select
        className="w-full border border-neutral-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-500 dark:border-neutral-800 dark:focus:ring-neutral-400"
        id={selectId}
        onChange={(e) => onChange(Number.parseInt(e.target.value, 10))}
        value={value}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option} day{option > 1 ? "s" : ""}
          </option>
        ))}
      </select>
    </div>
  );
}

function ReasonField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <TextAreaField
      id="moderation-reason"
      label="Reason"
      onChange={onChange}
      placeholder="Provide a clear reason for this action..."
      required
      rows={4}
      value={value}
    />
  );
}

function LiftReasonField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <TextAreaField
      id="moderation-lift-reason"
      label="Reason for Lifting Suspension"
      onChange={onChange}
      placeholder="Why is this suspension being lifted?"
      required
      rows={4}
      value={value}
    />
  );
}

function AdditionalNotesField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <TextAreaField
      id="moderation-notes"
      label="Additional Notes (optional)"
      onChange={onChange}
      placeholder="Any additional context or notes..."
      rows={3}
      value={value}
    />
  );
}

function TextAreaField({
  id,
  label,
  value,
  onChange,
  placeholder,
  rows,
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  rows: number;
  required?: boolean;
}) {
  return (
    <div>
      <label
        className="type-ui-sm mb-2 block font-medium text-neutral-900 dark:text-neutral-100"
        htmlFor={id}
      >
        {label} {required && <span className="text-neutral-900 dark:text-neutral-100">*</span>}
      </label>
      <textarea
        className="w-full resize-none border border-neutral-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neutral-500 dark:border-neutral-800 dark:focus:ring-neutral-400"
        id={id}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        rows={rows}
        value={value}
      />
    </div>
  );
}

function ModerationError({ message }: { message: string }) {
  return (
    <div className="border border-neutral-300 bg-neutral-100 p-4 dark:border-red-800 dark:bg-red-950">
      <p className="type-body-sm text-neutral-800 dark:text-neutral-300">{message}</p>
    </div>
  );
}

function ModerationWarning() {
  return (
    <div className="border border-neutral-900 bg-neutral-900 p-4 dark:border-neutral-100/50 dark:bg-neutral-100/10">
      <p className="type-ui-sm mb-1 font-medium text-neutral-900 dark:text-neutral-100">Warning:</p>
      <p className="type-body-sm text-neutral-800 dark:text-neutral-300">
        Banning a user is a permanent action. The user will not be able to access their account
        unless an admin manually lifts the ban.
      </p>
    </div>
  );
}

function ModerationFooter({
  action,
  isLoading,
  onCancel,
  onSubmit,
}: {
  action: ModerationAction;
  isLoading: boolean;
  onCancel: () => void;
  onSubmit: () => Promise<void> | void;
}) {
  return (
    <div className="flex gap-3 pt-4">
      <button
        className="type-ui-sm flex-1 border-2 border-neutral-200 px-6 py-3 font-semibold text-neutral-900 transition hover:border-neutral-900 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-100 dark:border-neutral-800 dark:text-neutral-100"
        disabled={isLoading}
        onClick={onCancel}
        type="button"
      >
        Cancel
      </button>
      <button
        className="type-ui-sm flex-1 bg-neutral-900 px-6 py-3 font-semibold text-white transition hover:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-950"
        disabled={isLoading}
        onClick={onSubmit}
        type="button"
      >
        {isLoading ? "Processing..." : getSubmitLabel(action)}
      </button>
    </div>
  );
}

function getSubmitLabel(action: ModerationAction) {
  switch (action) {
    case "unsuspend":
      return "Lift Suspension";
    case "ban":
      return "Ban User";
    default:
      return "Suspend User";
  }
}

function getModerationTitle(action: ModerationAction) {
  switch (action) {
    case "unsuspend":
      return "Lift Suspension";
    case "ban":
      return "Ban User";
    default:
      return "Suspend User";
  }
}

function useUserModerationSubmit({
  form,
  moderationMutation,
  userId,
}: {
  form: ModerationFormHandle;
  moderationMutation: ModerationMutation;
  userId: string;
}) {
  return async () => {
    const action = form.formData.action;
    const validationError = validateModerationForm(action, form.formData);

    if (validationError) {
      form.setError(validationError);
      return;
    }

    try {
      await moderationMutation.mutate({
        userId,
        action,
        reason: form.formData.reason,
        liftReason: form.formData.liftReason,
        durationDays: action === "suspend" ? form.formData.durationDays : undefined,
        details: form.formData.details ? { notes: form.formData.details } : undefined,
      });
    } catch (error) {
      form.setError(error instanceof Error ? error.message : "Failed to moderate user");
    }
  };
}

function validateModerationForm(action: ModerationAction, formData: ModerationFormData) {
  if ((action === "suspend" || action === "ban") && !formData.reason) {
    return "Reason is required";
  }

  if (action === "unsuspend" && !formData.liftReason) {
    return "Reason for lifting suspension is required";
  }

  return null;
}
