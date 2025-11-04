"use client";

import { BaseModal, BaseModalProps } from "./base-modal";

export type FormModalProps = Omit<BaseModalProps, "children"> & {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void | Promise<void>;
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  submitDisabled?: boolean;
  showActions?: boolean;
  customActions?: React.ReactNode;
  formId?: string;
};

/**
 * FormModal - Modal with integrated form handling
 *
 * Features:
 * - Built-in form submission handling
 * - Consistent action buttons (Cancel/Submit)
 * - Loading states
 * - Custom action buttons support
 * - Auto-disabled submit during loading
 */
export function FormModal({
  isOpen,
  onClose,
  children,
  title,
  description,
  size = "md",
  onSubmit,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  isSubmitting = false,
  submitDisabled = false,
  showActions = true,
  customActions,
  formId = "form-modal",
  ...baseModalProps
}: FormModalProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      await onSubmit(e);
    }
  };

  return (
    <BaseModal
      description={description}
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      title={title}
      {...baseModalProps}
    >
      <form id={formId} onSubmit={handleSubmit}>
        {/* Form Content */}
        <div className="space-y-6">{children}</div>

        {/* Action Buttons */}
        {showActions && (
          <div className="mt-8 flex gap-3">
            {customActions || (
              <>
                <button
                  className="flex-1 rounded-full border-2 border-[#ebe5d8] bg-white px-6 py-3 font-semibold text-base text-[#211f1a] transition hover:border-[#8B7355] hover:text-[#8B7355] disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isSubmitting}
                  onClick={onClose}
                  type="button"
                >
                  {cancelLabel}
                </button>
                <button
                  className="flex-1 rounded-full bg-[#8B7355] px-6 py-3 font-semibold text-base text-white transition hover:bg-[#9B8B7E] disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isSubmitting || submitDisabled}
                  type="submit"
                >
                  {isSubmitting ? "Loading..." : submitLabel}
                </button>
              </>
            )}
          </div>
        )}
      </form>
    </BaseModal>
  );
}
