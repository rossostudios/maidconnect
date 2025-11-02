"use client";

import { Clock, DollarSign, X } from "lucide-react";
import { useState } from "react";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

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
      setError("Please select a duration");
      return;
    }

    if (currentMinutes > 240) {
      setError("Cannot extend more than 4 hours at a time");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/bookings/extend-time", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          additionalMinutes: currentMinutes,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to extend time");
      }

      const result = await response.json();
      onSuccess(currentMinutes, result.extension.formatted_amount);
      onClose();

      // Reset form
      setSelectedMinutes(null);
      setCustomMinutes("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to extend time");
    } finally {
      setLoading(false);
    }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="font-bold text-[#211f1a] text-xl">Extend Service Time</h2>
            <p className="mt-1 text-[#7a6d62] text-sm">
              Need more time? Select additional duration below.
            </p>
          </div>
          <button
            className="rounded-lg p-2 text-[#7a6d62] transition hover:bg-gray-100"
            onClick={onClose}
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        {/* Preset Options */}
        <div className="mb-6">
          <label className="mb-3 block font-medium text-[#211f1a] text-sm">Quick Options</label>
          <div className="grid grid-cols-2 gap-3">
            {PRESET_OPTIONS.map((option) => {
              const isSelected = selectedMinutes === option.minutes;
              const cost = calculateCost(option.minutes);

              return (
                <button
                  className={`rounded-xl border-2 p-4 text-left transition ${
                    isSelected
                      ? "border-[#ff5d46] bg-[#ff5d46]/5"
                      : "border-[#ebe5d8] hover:border-[#ff5d46]/50"
                  }`}
                  key={option.minutes}
                  onClick={() => handlePresetClick(option.minutes)}
                  type="button"
                >
                  <div className="mb-1 flex items-center gap-2">
                    <Clock className={isSelected ? "text-[#ff5d46]" : "text-[#7a6d62]"} size={16} />
                    <span className="font-semibold text-[#211f1a] text-sm">{option.label}</span>
                  </div>
                  <p className="text-[#7a6d62] text-xs">{formatCurrency(cost)}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Duration */}
        <div className="mb-6">
          <label className="mb-2 block font-medium text-[#211f1a] text-sm" htmlFor="custom">
            Custom Duration (minutes)
          </label>
          <input
            className="w-full rounded-lg border-2 border-[#ebe5d8] px-4 py-3 text-sm focus:border-[#ff5d46] focus:outline-none focus:ring-2 focus:ring-[#ff5d46]/20"
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
                <DollarSign className="text-blue-600" size={20} />
                <span className="font-medium text-blue-900 text-sm">Additional Cost</span>
              </div>
              <span className="font-bold text-blue-900 text-lg">
                {formatCurrency(estimatedCost)}
              </span>
            </div>
            <p className="mt-2 text-blue-700 text-xs">
              This will be added to your final payment at checkout.
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-red-800 text-sm">{error}</div>}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            className="flex-1 rounded-lg border-2 border-[#ebe5d8] px-4 py-3 font-semibold text-[#211f1a] transition hover:border-[#211f1a]"
            disabled={loading}
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="flex-1 rounded-lg bg-[#ff5d46] px-4 py-3 font-semibold text-white transition hover:bg-[#e54d36] disabled:cursor-not-allowed disabled:opacity-70"
            disabled={loading || !currentMinutes || currentMinutes <= 0}
            onClick={handleExtend}
            type="button"
          >
            {loading ? "Extending..." : "Confirm Extension"}
          </button>
        </div>

        {/* Info Note */}
        <p className="mt-4 text-center text-[#7a6d62] text-xs">
          The customer will be notified of the time extension and charged accordingly.
        </p>
      </div>
    </div>
  );
}
