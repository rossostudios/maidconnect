"use client";

import { useState } from "react";

export type ModalFormState<TFormData = Record<string, any>> = {
  formData: TFormData;
  isSubmitting: boolean;
  error: string | null;
  success: boolean;
  message: string | null;
};

export type UseModalFormOptions<TFormData> = {
  initialData: TFormData;
  resetOnClose?: boolean;
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
};

export type UseModalFormReturn<TFormData> = {
  formData: TFormData;
  setFormData: React.Dispatch<React.SetStateAction<TFormData>>;
  updateField: <K extends keyof TFormData>(field: K, value: TFormData[K]) => void;
  isSubmitting: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  success: boolean;
  message: string | null;
  setMessage: (message: string | null, type?: "success" | "error") => void;
  reset: () => void;
  handleSubmit: (
    submitFn: (data: TFormData) => Promise<any>,
    options?: { successMessage?: string }
  ) => Promise<void>;
};

/**
 * useModalForm - Comprehensive form state management for modals
 *
 * Features:
 * - Form data state management
 * - Loading/error/success states
 * - Auto-reset on modal close (optional)
 * - Success/error callbacks
 * - Field-level updates
 * - Generic type support
 *
 * @example
 * ```tsx
 * const form = useModalForm({
 *   initialData: { reason: "", notes: "" },
 *   resetOnClose: true,
 * });
 *
 * const handleSubmit = () => form.handleSubmit(async (data) => {
 *   await fetch("/api/submit", { body: JSON.stringify(data) });
 * });
 * ```
 */
export function useModalForm<TFormData extends Record<string, any>>({
  initialData,
  resetOnClose = true,
  onSuccess,
  onError,
}: UseModalFormOptions<TFormData>): UseModalFormReturn<TFormData> {
  const [formData, setFormData] = useState<TFormData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [message, setMessageState] = useState<string | null>(null);

  // Reset form data to initial state
  const reset = () => {
    setFormData(initialData);
    setIsSubmitting(false);
    setError(null);
    setSuccess(false);
    setMessageState(null);
  };

  // Update a single form field
  const updateField = <K extends keyof TFormData>(field: K, value: TFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Set message with type
  const setMessage = (msg: string | null, type: "success" | "error" = "success") => {
    setMessageState(msg);
    if (type === "success") {
      setSuccess(true);
      setError(null);
    } else {
      setError(msg);
      setSuccess(false);
    }
  };

  // Handle form submission with loading/error states
  const handleSubmit = async (
    submitFn: (data: TFormData) => Promise<any>,
    options?: { successMessage?: string }
  ) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    setMessageState(null);

    try {
      const result = await submitFn(formData);

      setSuccess(true);
      if (options?.successMessage) {
        setMessageState(options.successMessage);
      }

      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      setMessageState(errorMessage);

      if (onError && err instanceof Error) {
        onError(err);
      }

      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    setFormData,
    updateField,
    isSubmitting,
    error,
    setError,
    success,
    message,
    setMessage,
    reset,
    handleSubmit,
  };
}

/**
 * useModalState - Simple modal open/close state management
 *
 * @example
 * ```tsx
 * const modal = useModalState();
 * <Button onClick={modal.open}>Open Modal</Button>
 * <Modal isOpen={modal.isOpen} onClose={modal.close} />
 * ```
 */
export function useModalState(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  };
}
