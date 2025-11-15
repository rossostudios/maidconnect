/**
 * Modal Footer Component
 *
 * Form action buttons for pricing rule modal (Cancel/Save).
 * Handles loading states and dynamic button labels.
 *
 * Lia Design: Sharp corners, neutral borders, orange primary button
 */

import { getModalFooterLabel } from "@/lib/utils/pricing/payload";

type ModalFooterProps = {
  isEditing: boolean;
  isLoading: boolean;
  onClose: () => void;
};

export function ModalFooter({ isEditing, isLoading, onClose }: ModalFooterProps) {
  const submitLabel = getModalFooterLabel(isLoading, isEditing);

  return (
    <div className="flex justify-end gap-3">
      <button
        className="border border-neutral-200 bg-white px-6 py-2 font-semibold text-neutral-700 text-sm transition hover:bg-neutral-50 disabled:opacity-50"
        disabled={isLoading}
        onClick={onClose}
        type="button"
      >
        Cancel
      </button>
      <button
        className="bg-orange-500 px-6 py-2 font-semibold text-sm text-white transition hover:bg-orange-600 disabled:opacity-50"
        disabled={isLoading}
        type="submit"
      >
        {submitLabel}
      </button>
    </div>
  );
}
