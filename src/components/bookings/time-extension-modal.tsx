"use client";

import { Clock01Icon, DollarCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { toast } from "sonner";
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
      toast.success(
        `Service extended by ${minutes} minutes. ${result.extension.formatted_amount}`,
        {
          duration: 5000,
        }
      );
      onSuccess(minutes, result.extension.formatted_amount);
      onClose();
      // Reset state
      setSelectedMinutes(null);
      setCustomMinutes("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to extend time");
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
            className="flex-1 border-2 border-[neutral-200] px-4 py-3 font-semibold text-[neutral-900] transition hover:border-[neutral-900]"
            disabled={form.isSubmitting}
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="flex-1 bg-[neutral-500] px-4 py-3 font-semibold text-[neutral-50] transition hover:bg-[neutral-500] disabled:cursor-not-allowed disabled:opacity-70"
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
        <div className="mb-3 block font-medium text-[neutral-900] text-sm">Quick Options</div>
        <div className="grid grid-cols-2 gap-3">
          {PRESET_OPTIONS.map((option) => {
            const isSelected = selectedMinutes === option.minutes;
            const cost = calculateCost(option.minutes);

            return (
              <button
                className={`border-2 p-4 text-left transition ${
                  isSelected
                    ? "border-[neutral-500] bg-[neutral-500]/5"
                    : "border-[neutral-200] hover:border-[neutral-500]/50"
                }`}
                key={option.minutes}
                onClick={() => handlePresetClick(option.minutes)}
                type="button"
              >
                <div className="mb-1 flex items-center gap-2">
                  <HugeiconsIcon
                    className={isSelected ? "text-[neutral-500]" : "text-[neutral-400]"}
                    icon={Clock01Icon}
                    size={16}
                  />
                  <span className="font-semibold text-[neutral-900] text-sm">{option.label}</span>
                </div>
                <p className="text-[neutral-400] text-xs">{formatCurrency(cost)}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Duration */}
      <div className="mb-6">
        <label className="mb-2 block font-medium text-[neutral-900] text-sm" htmlFor="custom">
          Custom Duration (minutes)
        </label>
        <input
          className="w-full border-2 border-[neutral-200] px-4 py-3 text-sm focus:border-[neutral-500] focus:outline-none focus:ring-2 focus:ring-[neutral-500]/20"
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
        <div className="mb-6 bg-[neutral-50] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HugeiconsIcon className="text-[neutral-500]" icon={DollarCircleIcon} size={20} />
              <span className="font-medium text-[neutral-500] text-sm">Additional Cost</span>
            </div>
            <span className="font-bold text-[neutral-500] text-lg">
              {formatCurrency(estimatedCost)}
            </span>
          </div>
          <p className="mt-2 text-[neutral-500] text-xs">
            This will be added to your final payment at checkout.
          </p>
        </div>
      )}

      {/* Error Message */}
      {form.error && (
        <div className="mb-4 border border-red-200 bg-red-50 p-3 text-red-700 text-sm dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          {form.error}
        </div>
      )}

      {/* Info Note */}
      <p className="text-center text-[neutral-400] text-xs">
        The customer will be notified of the time extension and charged accordingly.
      </p>
    </FormModal>
  );
}
