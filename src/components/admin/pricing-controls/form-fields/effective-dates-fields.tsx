/**
 * Effective Dates Fields Component
 *
 * Date range configuration for pricing rule validity.
 * Effective from is required, effective until is optional.
 *
 * Lia Design: Sharp corners, neutral borders, orange focus states
 */

import type { FieldUpdateFn, PricingRuleFormData } from "@/types/pricing";

type EffectiveDatesFieldsProps = {
  formData: PricingRuleFormData;
  updateField: FieldUpdateFn;
};

export function EffectiveDatesFields({ formData, updateField }: EffectiveDatesFieldsProps) {
  return (
    <div className="border border-neutral-200 bg-white p-6">
      <h3 className="mb-4 font-semibold text-neutral-900">Effective Dates</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            className="mb-2 block font-medium text-neutral-900 text-sm"
            htmlFor="pricing-effective-from"
          >
            Effective From
          </label>
          <input
            className="w-full border border-neutral-200 bg-white px-4 py-3 text-sm focus:border-rausch-500 focus:outline-none focus:ring-2 focus:ring-rausch-500/20"
            id="pricing-effective-from"
            onChange={(e) => updateField("effective_from", e.target.value)}
            type="date"
            value={formData.effective_from}
          />
        </div>
        <div>
          <label
            className="mb-2 block font-medium text-neutral-900 text-sm"
            htmlFor="pricing-effective-until"
          >
            Effective Until (optional)
          </label>
          <input
            className="w-full border border-neutral-200 bg-white px-4 py-3 text-sm focus:border-rausch-500 focus:outline-none focus:ring-2 focus:ring-rausch-500/20"
            id="pricing-effective-until"
            onChange={(e) => updateField("effective_until", e.target.value)}
            type="date"
            value={formData.effective_until}
          />
        </div>
      </div>
    </div>
  );
}
