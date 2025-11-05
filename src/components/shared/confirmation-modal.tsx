"use client";

import {
  Alert01Icon,
  AlertCircleIcon,
  CheckmarkCircle01Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { BaseModal } from "./base-modal";

export type ConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "danger" | "success" | "warning" | "info";
  isLoading?: boolean;
};

const variantConfig = {
  default: {
    icon: InformationCircleIcon,
    iconColor: "text-[var(--red)]",
    confirmButton: "bg-[var(--red)] hover:bg-[var(--red-hover)]",
  },
  danger: {
    icon: AlertCircleIcon,
    iconColor: "text-red-600",
    confirmButton: "bg-red-600 hover:bg-red-700",
  },
  success: {
    icon: CheckmarkCircle01Icon,
    iconColor: "text-green-600",
    confirmButton: "bg-green-600 hover:bg-green-700",
  },
  warning: {
    icon: Alert01Icon,
    iconColor: "text-yellow-600",
    confirmButton: "bg-yellow-600 hover:bg-yellow-700",
  },
  info: {
    icon: InformationCircleIcon,
    iconColor: "text-blue-600",
    confirmButton: "bg-blue-600 hover:bg-blue-700",
  },
};

/**
 * ConfirmationModal - Simple confirm/cancel modal
 *
 * Features:
 * - Variant support (default, danger, success, warning, info)
 * - Icon indicators
 * - Loading state handling
 * - Consistent action buttons
 */
export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  isLoading = false,
}: ConfirmationModalProps) {
  const config = variantConfig[variant];

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <BaseModal
      closeOnBackdropClick={!isLoading}
      closeOnEscape={!isLoading}
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      size="sm"
    >
      <div className="text-center">
        {/* Icon */}
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <HugeiconsIcon className={`h-6 w-6 ${config.iconColor}`} icon={config.icon} />
        </div>

        {/* Title */}
        <h3 className="mb-2 font-semibold text-[var(--foreground)] text-lg">{title}</h3>

        {/* Message */}
        <p className="mb-6 text-[#7a6d62] text-sm leading-relaxed">{message}</p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            className="flex-1 rounded-full border-2 border-[#ebe5d8] bg-white px-6 py-3 font-semibold text-[var(--foreground)] text-base transition hover:border-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isLoading}
            onClick={onClose}
            type="button"
          >
            {cancelLabel}
          </button>
          <button
            className={`flex-1 rounded-full px-6 py-3 font-semibold text-base text-white transition disabled:cursor-not-allowed disabled:opacity-70 ${config.confirmButton}`}
            disabled={isLoading}
            onClick={handleConfirm}
            type="button"
          >
            {isLoading ? "Loading..." : confirmLabel}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
