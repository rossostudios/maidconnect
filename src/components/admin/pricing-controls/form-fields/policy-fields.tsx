/**
 * Policy Fields Component
 *
 * Deposit and cancellation policy configuration for pricing rules.
 * Includes deposit percentage, late cancellation threshold, and fee.
 *
 * Precision Design: Sharp corners, neutral borders, orange focus states
 */

import type { FieldUpdateFn, PricingRuleFormData } from "@/types/pricing";

type PolicyFieldsProps = {
  formData: PricingRuleFormData;
  updateField: FieldUpdateFn;
};

export function PolicyFields({ formData, updateField }: PolicyFieldsProps) {
  return (
    <div className="border border-neutral-200 bg-white p-6">
      <h3 className="mb-4 font-semibold text-neutral-900">Deposit & Cancellation Policy</h3>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label
            className="mb-2 block font-medium text-neutral-900 text-sm"
            htmlFor="pricing-deposit"
          >
            Deposit (%)
          </label>
          <input
            className="w-full border border-neutral-200 bg-white px-4 py-3 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            id="pricing-deposit"
            max="100"
            min="0"
            onChange={(e) =>
              updateField(
                "deposit_percentage",
                e.target.value ? Number.parseFloat(e.target.value) : null
              )
            }
            placeholder="Default"
            step="5"
            type="number"
            value={formData.deposit_percentage ?? ""}
          />
        </div>
        <div>
          <label
            className="mb-2 block font-medium text-neutral-900 text-sm"
            htmlFor="pricing-late-hours"
          >
            Late Cancel (hours)
          </label>
          <input
            className="w-full border border-neutral-200 bg-white px-4 py-3 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            id="pricing-late-hours"
            min="0"
            onChange={(e) =>
              updateField("late_cancel_hours", Number.parseInt(e.target.value, 10) || 24)
            }
            step="1"
            type="number"
            value={formData.late_cancel_hours}
          />
        </div>
        <div>
          <label
            className="mb-2 block font-medium text-neutral-900 text-sm"
            htmlFor="pricing-late-fee"
          >
            Late Cancel Fee (%)
          </label>
          <input
            className="w-full border border-neutral-200 bg-white px-4 py-3 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            id="pricing-late-fee"
            max="100"
            min="0"
            onChange={(e) =>
              updateField("late_cancel_fee_percentage", Number.parseFloat(e.target.value) || 0)
            }
            step="5"
            type="number"
            value={formData.late_cancel_fee_percentage}
          />
        </div>
      </div>
    </div>
  );
}
