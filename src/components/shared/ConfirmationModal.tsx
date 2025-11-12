/**
 * Confirmation Modal - COMPATIBILITY WRAPPER
 *
 * This is a temporary wrapper around BaseModal
 * to maintain compatibility during component cleanup.
 *
 * TODO: Migrate all components to use Dialog directly
 */

"use client";

import { cn } from "@/lib/utils";
import { BaseModal, type BaseModalProps } from "./BaseModal";

export interface ConfirmationModalProps extends Omit<BaseModalProps, "children"> {
  message: string;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "danger";
  isLoading?: boolean;
}

export function ConfirmationModal({
  message,
  onConfirm,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  isLoading = false,
  onClose,
  ...props
}: ConfirmationModalProps) {
  return (
    <BaseModal onClose={onClose} size="sm" {...props}>
      <div className="space-y-6">
        <p className="text-neutral-900">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            className={cn(
              "rounded-lg border border-neutral-200 bg-white px-4 py-2 font-medium text-neutral-900 text-sm",
              "transition-colors hover:bg-neutral-50",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
            disabled={isLoading}
            onClick={onClose}
            type="button"
          >
            {cancelLabel}
          </button>
          <button
            className={cn(
              "rounded-lg px-4 py-2 font-medium text-sm text-white transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              variant === "danger"
                ? "bg-neutral-800 hover:bg-neutral-800 focus:ring-neutral-800"
                : "bg-neutral-900 hover:bg-neutral-800 focus:ring-neutral-500"
            )}
            disabled={isLoading}
            onClick={onConfirm}
            type="button"
          >
            {isLoading ? "Loading..." : confirmLabel}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
