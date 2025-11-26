/**
 * Pricing Rule Modal Component
 *
 * Modal for creating/editing pricing rules in the admin dashboard.
 * Uses usePricingRuleForm hook for state management, validation, and submission.
 *
 * Refactored: Phase 1 complexity reduction - integrated existing hook
 */

"use client";

import { usePricingRuleForm } from "@/hooks/usePricingRuleForm";
import { getModalFooterLabel } from "@/lib/utils/pricing/payload";
import type { PricingRule } from "@/types/pricing";
import { CITIES, SERVICE_CATEGORIES } from "@/types/pricing";

type PricingRuleModalProps = {
  rule: PricingRule | null;
  onClose: () => void;
  onSave: (rule: PricingRule) => void;
};

export function PricingRuleModal({ rule, onClose, onSave }: PricingRuleModalProps) {
  const { formData, updateField, handleSubmit, isLoading } = usePricingRuleForm({
    initialRule: rule,
    onSave,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
      <div className="my-8 w-full max-w-3xl rounded-lg border border-neutral-200 bg-white p-8">
        <h2 className="mb-6 font-medium text-2xl text-gray-900">
          {rule ? "Edit" : "Create"} Pricing Rule
        </h2>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Scope Section */}
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6">
            <h3 className="mb-4 font-medium text-gray-900">Scope (leave blank for "All")</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className="mb-2 block font-medium text-gray-900 text-sm"
                  htmlFor="service_category"
                >
                  Service Category
                </label>
                <select
                  className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm focus:border-rausch-500 focus:outline-none focus:ring-2 focus:ring-rausch-500/20"
                  id="service_category"
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
                <label className="mb-2 block font-medium text-gray-900 text-sm" htmlFor="city">
                  City
                </label>
                <select
                  className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm focus:border-rausch-500 focus:outline-none focus:ring-2 focus:ring-rausch-500/20"
                  id="city"
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

          {/* Commission Section */}
          <div className="rounded-lg border border-neutral-200 p-6">
            <h3 className="mb-4 font-medium text-gray-900">Commission & Fees</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className="mb-2 block font-medium text-gray-900 text-sm"
                  htmlFor="commission_rate"
                >
                  Commission Rate (%) *
                </label>
                <input
                  className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm focus:border-rausch-500 focus:outline-none focus:ring-2 focus:ring-rausch-500/20"
                  id="commission_rate"
                  max="30"
                  min="10"
                  onChange={(e) =>
                    updateField("commission_rate", Number.parseFloat(e.target.value))
                  }
                  required
                  step="0.1"
                  type="number"
                  value={formData.commission_rate}
                />
                <p className="mt-1 text-neutral-600 text-xs">Range: 10-30%</p>
              </div>

              <div>
                <label
                  className="mb-2 block font-medium text-gray-900 text-sm"
                  htmlFor="background_check_fee_cop"
                >
                  Background Check Fee (COP)
                </label>
                <input
                  className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm focus:border-rausch-500 focus:outline-none focus:ring-2 focus:ring-rausch-500/20"
                  id="background_check_fee_cop"
                  min="0"
                  onChange={(e) =>
                    updateField(
                      "background_check_fee_cop",
                      Number.parseInt(e.target.value, 10) || 0
                    )
                  }
                  step="1000"
                  type="number"
                  value={formData.background_check_fee_cop}
                />
              </div>
            </div>
          </div>

          {/* Price Range Section */}
          <div className="rounded-lg border border-neutral-200 p-6">
            <h3 className="mb-4 font-medium text-gray-900">Price Limits (Optional)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className="mb-2 block font-medium text-gray-900 text-sm"
                  htmlFor="min_price_cop"
                >
                  Minimum Price (COP)
                </label>
                <input
                  className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm focus:border-rausch-500 focus:outline-none focus:ring-2 focus:ring-rausch-500/20"
                  id="min_price_cop"
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
                  value={formData.min_price_cop || ""}
                />
              </div>

              <div>
                <label
                  className="mb-2 block font-medium text-gray-900 text-sm"
                  htmlFor="max_price_cop"
                >
                  Maximum Price (COP)
                </label>
                <input
                  className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm focus:border-rausch-500 focus:outline-none focus:ring-2 focus:ring-rausch-500/20"
                  id="max_price_cop"
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
                  value={formData.max_price_cop || ""}
                />
              </div>
            </div>
          </div>

          {/* Deposit & Cancellation Section */}
          <div className="rounded-lg border border-neutral-200 p-6">
            <h3 className="mb-4 font-medium text-gray-900">Deposit & Cancellation Policy</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label
                  className="mb-2 block font-medium text-gray-900 text-sm"
                  htmlFor="deposit_percentage"
                >
                  Deposit (%)
                </label>
                <input
                  className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm focus:border-rausch-500 focus:outline-none focus:ring-2 focus:ring-rausch-500/20"
                  id="deposit_percentage"
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
                  value={formData.deposit_percentage || ""}
                />
              </div>

              <div>
                <label
                  className="mb-2 block font-medium text-gray-900 text-sm"
                  htmlFor="late_cancel_hours"
                >
                  Late Cancel (hours)
                </label>
                <input
                  className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm focus:border-rausch-500 focus:outline-none focus:ring-2 focus:ring-rausch-500/20"
                  id="late_cancel_hours"
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
                  className="mb-2 block font-medium text-gray-900 text-sm"
                  htmlFor="late_cancel_fee_percentage"
                >
                  Late Cancel Fee (%)
                </label>
                <input
                  className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm focus:border-rausch-500 focus:outline-none focus:ring-2 focus:ring-rausch-500/20"
                  id="late_cancel_fee_percentage"
                  max="100"
                  min="0"
                  onChange={(e) =>
                    updateField(
                      "late_cancel_fee_percentage",
                      Number.parseFloat(e.target.value) || 50
                    )
                  }
                  step="5"
                  type="number"
                  value={formData.late_cancel_fee_percentage}
                />
              </div>
            </div>
          </div>

          {/* Effective Dates Section */}
          <div className="rounded-lg border border-neutral-200 p-6">
            <h3 className="mb-4 font-medium text-gray-900">Effective Dates</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className="mb-2 block font-medium text-gray-900 text-sm"
                  htmlFor="effective_from"
                >
                  Effective From *
                </label>
                <input
                  className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm focus:border-rausch-500 focus:outline-none focus:ring-2 focus:ring-rausch-500/20"
                  id="effective_from"
                  onChange={(e) => updateField("effective_from", e.target.value)}
                  required
                  type="date"
                  value={formData.effective_from}
                />
              </div>

              <div>
                <label
                  className="mb-2 block font-medium text-gray-900 text-sm"
                  htmlFor="effective_until"
                >
                  Effective Until
                </label>
                <input
                  className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm focus:border-rausch-500 focus:outline-none focus:ring-2 focus:ring-rausch-500/20"
                  id="effective_until"
                  onChange={(e) => updateField("effective_until", e.target.value)}
                  placeholder="No end date"
                  type="date"
                  value={formData.effective_until}
                />
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div>
            <label className="mb-2 block font-medium text-gray-900 text-sm" htmlFor="notes">
              Notes (Optional)
            </label>
            <textarea
              className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm focus:border-rausch-500 focus:outline-none focus:ring-2 focus:ring-rausch-500/20"
              id="notes"
              onChange={(e) => updateField("notes", e.target.value)}
              placeholder="Internal notes about this pricing rule..."
              rows={3}
              value={formData.notes}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              className="rounded-lg border border-neutral-200 px-6 py-3 font-medium text-gray-900 transition hover:border-rausch-500 disabled:opacity-50"
              disabled={isLoading}
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="rounded-lg bg-rausch-500 px-6 py-3 font-medium text-white transition hover:bg-rausch-600 disabled:opacity-50"
              disabled={isLoading}
              type="submit"
            >
              {getModalFooterLabel(isLoading, Boolean(rule))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
