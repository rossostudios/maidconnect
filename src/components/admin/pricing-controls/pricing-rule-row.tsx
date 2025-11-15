/**
 * Pricing Rule Row Component
 *
 * Individual table row displaying a single pricing rule.
 * Shows scope, commission, price range, effective dates, status, and actions.
 *
 * Lia Design: Neutral colors, orange accents, sharp corners
 */

import { formatCurrency } from "@/lib/utils/format";
import type { PricingRule } from "@/types/pricing";

type PricingRuleRowProps = {
  rule: PricingRule;
  onEdit: (rule: PricingRule) => void;
  onToggleActive: (ruleId: string, currentState: boolean) => void;
};

export function PricingRuleRow({ rule, onEdit, onToggleActive }: PricingRuleRowProps) {
  return (
    <tr className={rule.is_active ? "" : "opacity-50"}>
      {/* Scope (Category + City) */}
      <td className="px-6 py-4">
        <div className="text-sm">
          <div className="font-medium text-neutral-900">
            {rule.service_category || <span className="text-neutral-500">All Categories</span>}
          </div>
          <div className="text-neutral-600">
            {rule.city || <span className="text-neutral-500">All Cities</span>}
          </div>
        </div>
      </td>

      {/* Commission Rate + BG Check Fee */}
      <td className="px-6 py-4">
        <div className="text-sm">
          <div className="font-semibold text-orange-600">
            {(rule.commission_rate * 100).toFixed(1)}%
          </div>
          {rule.background_check_fee_cop > 0 && (
            <div className="text-neutral-600">
              +{formatCurrency(rule.background_check_fee_cop, { currency: "COP" })} BG check
            </div>
          )}
        </div>
      </td>

      {/* Price Range */}
      <td className="px-6 py-4 text-neutral-600 text-sm">
        {rule.min_price_cop || rule.max_price_cop ? (
          <>
            {rule.min_price_cop ? formatCurrency(rule.min_price_cop, { currency: "COP" }) : "—"} to{" "}
            {rule.max_price_cop ? formatCurrency(rule.max_price_cop, { currency: "COP" }) : "—"}
          </>
        ) : (
          <span className="text-neutral-500">No limits</span>
        )}
      </td>

      {/* Effective Dates */}
      <td className="px-6 py-4 text-neutral-600 text-sm">
        <div>{new Date(rule.effective_from).toLocaleDateString()}</div>
        {rule.effective_until && (
          <div className="text-xs">until {new Date(rule.effective_until).toLocaleDateString()}</div>
        )}
      </td>

      {/* Status Badge */}
      <td className="px-6 py-4">
        <span
          className={`inline-flex px-3 py-1 font-semibold text-xs ${
            rule.is_active
              ? "border border-neutral-200 bg-white text-neutral-700"
              : "border border-neutral-200 bg-neutral-100 text-neutral-600"
          }`}
        >
          {rule.is_active ? "Active" : "Inactive"}
        </span>
      </td>

      {/* Actions */}
      <td className="px-6 py-4">
        <div className="flex gap-2">
          <button
            className="font-medium text-orange-600 text-sm"
            onClick={() => onEdit(rule)}
            type="button"
          >
            Edit
          </button>
          <button
            className="font-medium text-neutral-600 text-sm"
            onClick={() => onToggleActive(rule.id, rule.is_active)}
            type="button"
          >
            {rule.is_active ? "Deactivate" : "Activate"}
          </button>
        </div>
      </td>
    </tr>
  );
}
