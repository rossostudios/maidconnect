/**
 * Scope Fields Component
 *
 * Service category and city selection fields for pricing rules.
 * Allows targeting specific services and locations or "All" (blank).
 *
 * Lia Design: Sharp corners, neutral borders, orange focus states
 */

import type { FieldUpdateFn, PricingRuleFormData } from "@/types/pricing";
import { CITIES, SERVICE_CATEGORIES } from "@/types/pricing";

type ScopeFieldsProps = {
  formData: PricingRuleFormData;
  updateField: FieldUpdateFn;
};

export function ScopeFields({ formData, updateField }: ScopeFieldsProps) {
  return (
    <div className="border border-neutral-200 bg-neutral-50 p-6">
      <h3 className="mb-4 font-semibold text-neutral-900">Scope (leave blank for "All")</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            className="mb-2 block font-medium text-neutral-900 text-sm"
            htmlFor="pricing-service-category"
          >
            Service Category
          </label>
          <select
            className="w-full border border-neutral-200 bg-white px-4 py-3 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            id="pricing-service-category"
            onChange={(e) => updateField("service_category", e.target.value)}
            value={formData.service_category}
          >
            <option value="">All Categories</option>
            {SERVICE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block font-medium text-neutral-900 text-sm" htmlFor="pricing-city">
            City
          </label>
          <select
            className="w-full border border-neutral-200 bg-white px-4 py-3 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            id="pricing-city"
            onChange={(e) => updateField("city", e.target.value)}
            value={formData.city}
          >
            <option value="">All Cities</option>
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
