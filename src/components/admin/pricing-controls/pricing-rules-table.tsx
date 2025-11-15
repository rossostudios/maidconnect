/**
 * Pricing Rules Table Component
 *
 * Table wrapper displaying all pricing rules with sortable columns.
 * Handles empty state when no rules exist.
 *
 * Precision Design: Neutral borders, clean typography, orange accents
 */

import type { PricingRule } from "@/types/pricing";
import { PricingRuleRow } from "./pricing-rule-row";

type PricingRulesTableProps = {
  rules: PricingRule[];
  onEdit: (rule: PricingRule) => void;
  onToggleActive: (ruleId: string, currentState: boolean) => void;
};

export function PricingRulesTable({ rules, onEdit, onToggleActive }: PricingRulesTableProps) {
  // Empty state
  if (rules.length === 0) {
    return (
      <div className="overflow-hidden border border-neutral-200 bg-white">
        <table className="w-full">
          <tbody>
            <tr>
              <td className="px-6 py-12 text-center text-neutral-600" colSpan={6}>
                No pricing rules configured
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-hidden border border-neutral-200 bg-white">
      <table className="w-full">
        <thead className="bg-neutral-50">
          <tr>
            <th className="px-6 py-4 text-left font-semibold text-neutral-900 text-sm">Scope</th>
            <th className="px-6 py-4 text-left font-semibold text-neutral-900 text-sm">
              Commission
            </th>
            <th className="px-6 py-4 text-left font-semibold text-neutral-900 text-sm">
              Price Range
            </th>
            <th className="px-6 py-4 text-left font-semibold text-neutral-900 text-sm">
              Effective
            </th>
            <th className="px-6 py-4 text-left font-semibold text-neutral-900 text-sm">Status</th>
            <th className="px-6 py-4 text-left font-semibold text-neutral-900 text-sm">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {rules.map((rule) => (
            <PricingRuleRow
              key={rule.id}
              onEdit={onEdit}
              onToggleActive={onToggleActive}
              rule={rule}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
