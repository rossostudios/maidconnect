/**
 * Notes Field Component
 *
 * Optional notes textarea for pricing rule documentation.
 * Free-form text for internal context and rule explanations.
 *
 * Lia Design: Sharp corners, neutral borders, orange focus states
 */

import type { FieldUpdateFn, PricingRuleFormData } from "@/types/pricing";

type NotesFieldProps = {
  formData: PricingRuleFormData;
  updateField: FieldUpdateFn;
};

export function NotesField({ formData, updateField }: NotesFieldProps) {
  return (
    <div className="border border-neutral-200 bg-white p-6">
      <h3 className="mb-4 font-semibold text-neutral-900">Notes</h3>
      <textarea
        className="h-24 w-full border border-neutral-200 bg-white px-4 py-3 text-sm focus:border-rausch-500 focus:outline-none focus:ring-2 focus:ring-rausch-500/20"
        onChange={(e) => updateField("notes", e.target.value)}
        placeholder="Optional notes about this rule..."
        value={formData.notes}
      />
    </div>
  );
}
