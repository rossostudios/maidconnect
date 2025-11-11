/**
 * Form Modal - COMPATIBILITY WRAPPER
 *
 * This is a temporary wrapper around BaseModal
 * to maintain compatibility during component cleanup.
 *
 * TODO: Migrate all components to use Dialog directly
 */

"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BaseModal, type BaseModalProps } from "./base-modal";

export interface FormModalProps extends Omit<BaseModalProps, "children"> {
  children: ReactNode;
  onSubmit?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  isSubmitting?: boolean; // Alias for isLoading
  isSubmitDisabled?: boolean;
  showActions?: boolean;
  customActions?: ReactNode;
}

export function FormModal({
  children,
  onSubmit,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  isLoading = false,
  isSubmitting = false,
  isSubmitDisabled = false,
  showActions = true,
  customActions,
  onClose,
  ...props
}: FormModalProps) {
  const loading = isLoading || isSubmitting;

  return (
    <BaseModal onClose={onClose} {...props}>
      <div className="space-y-6">
        <div>{children}</div>
        {customActions ? (
          customActions
        ) : showActions ? (
          <div className="flex justify-end gap-3">
            <button
              className={cn(
                "rounded-lg border border-slate-200 bg-white px-4 py-2 font-medium text-slate-900 text-sm",
                "transition-colors hover:bg-slate-50",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
              disabled={loading}
              onClick={onClose}
              type="button"
            >
              {cancelLabel}
            </button>
            {onSubmit && (
              <button
                className={cn(
                  "rounded-lg bg-slate-900 px-4 py-2 font-medium text-sm text-white transition-colors",
                  "hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
                disabled={isSubmitDisabled || loading}
                onClick={onSubmit}
                type="button"
              >
                {loading ? "Loading..." : submitLabel}
              </button>
            )}
          </div>
        ) : null}
      </div>
    </BaseModal>
  );
}
