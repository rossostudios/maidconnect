/**
 * Price Limits Fields Component
 *
 * Optional minimum and maximum price constraints for pricing rules.
 * All fields optional - blank values mean no limits.
 *
 * Precision Design: Sharp corners, neutral borders, orange focus states
 */

import type { FieldUpdateFn, PricingRuleFormData } from "@/types/pricing";

type PriceLimitsFieldsProps = {
  formData: PricingRuleFormData;
  updateField: FieldUpdateFn;
};

export function PriceLimitsFields({ formData, updateField }: PriceLimitsFieldsProps) {
  return (
    <div className="border border-neutral-200 bg-white p-6">
      <h3 className="mb-4 font-semibold text-neutral-900">Price Limits (Optional)</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            className="mb-2 block font-medium text-neutral-900 text-sm"
            htmlFor="pricing-min-price"
          >
            Minimum Price (COP)
          </label>
          <input
            className="w-full border border-neutral-200 bg-white px-4 py-3 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            id="pricing-min-price"
            min="0"
            onChange={(e) =>
              updateField(
                "min_price_cop",
                e.target.value ? Number.parseInt(e.target.value, 10) : null
              )
            }
            placeholder="No minimum"
            step="1000"
            type="number"
            value={formData.min_price_cop ?? ""}
          />
        </div>
        <div>
          <label
            className="mb-2 block font-medium text-neutral-900 text-sm"
            htmlFor="pricing-max-price"
          >
            Maximum Price (COP)
          </label>
          <input
            className="w-full border border-neutral-200 bg-white px-4 py-3 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            id="pricing-max-price"
            min="0"
            onChange={(e) =>
              updateField(
                "max_price_cop",
                e.target.value ? Number.parseInt(e.target.value, 10) : null
              )
            }
            placeholder="No maximum"
            step="1000"
            type="number"
            value={formData.max_price_cop ?? ""}
          />
        </div>
      </div>
    </div>
  );
}
