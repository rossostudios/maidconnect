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
        <p className="text-stone-900">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            className={cn(
              "rounded-lg border border-stone-200 bg-white px-4 py-2 font-medium text-sm text-stone-900",
              "transition-colors hover:bg-stone-50",
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
                ? "bg-stone-800 hover:bg-stone-800 focus:ring-stone-800"
                : "bg-stone-900 hover:bg-stone-800 focus:ring-stone-500"
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
