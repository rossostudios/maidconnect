"use client";

import { Clock01Icon, DollarCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { FormModal } from "@/components/shared/form-modal";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useModalForm } from "@/hooks/use-modal-form";

type TimeExtensionOption = {
  minutes: number;
  label: string;
};

const PRESET_OPTIONS: TimeExtensionOption[] = [
  { minutes: 15, label: "15 min" },
  { minutes: 30, label: "30 min" },
  { minutes: 60, label: "1 hour" },
  { minutes: 120, label: "2 hours" },
];

type Props = {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  hourlyRate: number; // in cents
  currency: string;
  onSuccess: (minutes: number, formattedAmount: string) => void;
};

/**
 * TimeExtensionModal - REFACTORED
 * Uses new modal primitives and hooks for cleaner code
 */
export function TimeExtensionModal({
  isOpen,
  onClose,
  bookingId,
  hourlyRate,
  currency,
  onSuccess,
}: Props) {
  const [selectedMinutes, setSelectedMinutes] = useState<number | null>(null);
  const [customMinutes, setCustomMinutes] = useState<string>("");

  // Form state management
  const form = useModalForm({
    initialData: {},
    resetOnClose: true,
  });

  // API mutation for time extension
  const extendTime = useApiMutation({
    url: "/api/bookings/extend-time",
    method: "POST",
    onSuccess: (result) => {
      const minutes = currentMinutes || 0;
      onSuccess(minutes, result.extension.formatted_amount);
      onClose();
      // Reset state
      setSelectedMinutes(null);
      setCustomMinutes("");
    },
    onError: (error) => {
      form.setError(error.message || "Failed to extend time");
    },
  });

  // Calculate cost for selected time
  const calculateCost = (minutes: number): number => Math.round((hourlyRate / 60) * minutes);

  const formatCurrency = (amountInCents: number): string =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: currency || "COP",
      minimumFractionDigits: 0,
    }).format(amountInCents / 100);

  const currentMinutes = customMinutes ? Number.parseInt(customMinutes, 10) : selectedMinutes;
  const estimatedCost = currentMinutes && currentMinutes > 0 ? calculateCost(currentMinutes) : 0;

  const handleExtend = async () => {
    if (!currentMinutes || currentMinutes <= 0) {
      form.setError("Please select a duration");
      return;
    }

    if (currentMinutes > 240) {
      form.setError("Cannot extend more than 4 hours at a time");
      return;
    }

    await form.handleSubmit(
      async () =>
        await extendTime.mutate({
          bookingId,
          additionalMinutes: currentMinutes,
        })
    );
  };

  const handlePresetClick = (minutes: number) => {
    setSelectedMinutes(minutes);
    setCustomMinutes(""); // Clear custom input when preset is selected
  };

  const handleCustomChange = (value: string) => {
    setCustomMinutes(value);
    setSelectedMinutes(null); // Clear preset when custom is entered
  };

  return (
    <FormModal
      customActions={
        <div className="flex gap-3">
          <button
            className="flex-1 rounded-lg border-2 border-[#ebe5d8] px-4 py-3 font-semibold text-gray-900 transition hover:border-gray-900"
            disabled={form.isSubmitting}
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="flex-1 rounded-lg bg-[#E85D48] px-4 py-3 font-semibold text-white transition hover:bg-[#E85D48] disabled:cursor-not-allowed disabled:opacity-70"
            disabled={form.isSubmitting || !currentMinutes || currentMinutes <= 0}
            onClick={handleExtend}
            type="button"
          >
            {form.isSubmitting ? "Extending..." : "Confirm Extension"}
          </button>
        </div>
      }
      description="Need more time? Select additional duration below."
      isOpen={isOpen}
      onClose={onClose}
      showActions={false}
      size="md"
      title="Extend Service Time"
    >
      {/* Preset Options */}
      <div className="mb-6">
        <div className="mb-3 block font-medium text-gray-900 text-sm">Quick Options</div>
        <div className="grid grid-cols-2 gap-3">
          {PRESET_OPTIONS.map((option) => {
            const isSelected = selectedMinutes === option.minutes;
            const cost = calculateCost(option.minutes);

            return (
              <button
                className={`rounded-xl border-2 p-4 text-left transition ${
                  isSelected
                    ? "border-[#E85D48] bg-[#E85D48]/5"
                    : "border-[#ebe5d8] hover:border-[#E85D48]/50"
                }`}
                key={option.minutes}
                onClick={() => handlePresetClick(option.minutes)}
                type="button"
              >
                <div className="mb-1 flex items-center gap-2">
                  <HugeiconsIcon
                    className={isSelected ? "text-[#E85D48]" : "text-[#7a6d62]"}
                    icon={Clock01Icon}
                    size={16}
                  />
                  <span className="font-semibold text-gray-900 text-sm">{option.label}</span>
                </div>
                <p className="text-[#7a6d62] text-xs">{formatCurrency(cost)}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Duration */}
      <div className="mb-6">
        <label className="mb-2 block font-medium text-gray-900 text-sm" htmlFor="custom">
          Custom Duration (minutes)
        </label>
        <input
          className="w-full rounded-lg border-2 border-[#ebe5d8] px-4 py-3 text-sm focus:border-[#E85D48] focus:outline-none focus:ring-2 focus:ring-[#E85D48]/20"
          id="custom"
          max="240"
          min="1"
          onChange={(e) => handleCustomChange(e.target.value)}
          placeholder="Enter custom minutes (max 240)"
          type="number"
          value={customMinutes}
        />
      </div>

      {/* Cost Preview */}
      {estimatedCost > 0 && (
        <div className="mb-6 rounded-xl bg-blue-50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HugeiconsIcon className="text-blue-600" icon={DollarCircleIcon} size={20} />
              <span className="font-medium text-blue-900 text-sm">Additional Cost</span>
            </div>
            <span className="font-bold text-blue-900 text-lg">{formatCurrency(estimatedCost)}</span>
          </div>
          <p className="mt-2 text-blue-700 text-xs">
            This will be added to your final payment at checkout.
          </p>
        </div>
      )}

      {/* Error Message */}
      {form.error && (
        <div className="mb-4 rounded-lg bg-[#E85D48]/10 p-3 text-red-800 text-sm">{form.error}</div>
      )}

      {/* Info Note */}
      <p className="text-center text-[#7a6d62] text-xs">
        The customer will be notified of the time extension and charged accordingly.
      </p>
    </FormModal>
  );
}
