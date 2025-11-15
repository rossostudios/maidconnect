/**
 * Commission Fields Component
 *
 * Commission rate and background check fee inputs for pricing rules.
 * Commission rate is required (10-30%), BG check fee is optional.
 *
 * Lia Design: Sharp corners, neutral borders, orange focus states
 */

import type { FieldUpdateFn, PricingRuleFormData } from "@/types/pricing";

type CommissionFieldsProps = {
  formData: PricingRuleFormData;
  updateField: FieldUpdateFn;
};

export function CommissionFields({ formData, updateField }: CommissionFieldsProps) {
  return (
    <div className="border border-neutral-200 bg-white p-6">
      <h3 className="mb-4 font-semibold text-neutral-900">Commission & Fees</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            className="mb-2 block font-medium text-neutral-900 text-sm"
            htmlFor="pricing-commission-rate"
          >
            Commission Rate (%) *
          </label>
          <input
            className="w-full border border-neutral-200 bg-white px-4 py-3 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            id="pricing-commission-rate"
            max="30"
            min="10"
            onChange={(e) => updateField("commission_rate", Number.parseFloat(e.target.value))}
            required
            step="0.1"
            type="number"
            value={formData.commission_rate}
          />
          <p className="mt-1 text-neutral-600 text-xs">Range: 10-30%</p>
        </div>
        <div>
          <label
            className="mb-2 block font-medium text-neutral-900 text-sm"
            htmlFor="pricing-background-fee"
          >
            Background Check Fee (COP)
          </label>
          <input
            className="w-full border border-neutral-200 bg-white px-4 py-3 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            id="pricing-background-fee"
            min="0"
            onChange={(e) =>
              updateField("background_check_fee_cop", Number.parseInt(e.target.value, 10) || 0)
            }
            step="1000"
            type="number"
            value={formData.background_check_fee_cop}
          />
        </div>
      </div>
    </div>
  );
}
