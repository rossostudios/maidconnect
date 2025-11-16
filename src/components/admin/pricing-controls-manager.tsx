/**
 * Pricing Controls Manager Component
 *
 * Admin interface for managing pricing rules
 * Supports creating, editing, and deactivating rules
 *
 * Sprint 2: Supply & Ops
 * Week 2 Optimization: Dynamic import for PricingRuleModal
 */

"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { formatCurrency } from "@/lib/format";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { toast } from "@/lib/toast";

// Dynamic import for modal (lazy load on demand)
const PricingRuleModal = dynamic(
  () => import("./pricing-rule-modal").then((mod) => ({ default: mod.PricingRuleModal })),
  {
    loading: () => <PricingRuleModalSkeleton />,
    ssr: false,
  }
);

type PricingRule = {
  id: string;
  service_category: string | null;
  city: string | null;
  country: string;
  commission_rate: number;
  background_check_fee_cop: number;
  min_price_cop: number | null;
  max_price_cop: number | null;
  deposit_percentage: number | null;
  late_cancel_hours: number;
  late_cancel_fee_percentage: number;
  effective_from: string;
  effective_until: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
};

type PricingControlsManagerProps = {
  initialRules: PricingRule[];
};

export function PricingControlsManager({ initialRules }: PricingControlsManagerProps) {
  const [rules, setRules] = useState<PricingRule[]>(initialRules);
  const [isCreating, setIsCreating] = useState(false);
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);

  const handleToggleActive = async (ruleId: string, currentState: boolean) => {
    const supabase = createSupabaseBrowserClient();

    const { error } = await supabase
      .from("pricing_controls")
      .update({ is_active: !currentState })
      .eq("id", ruleId);

    if (error) {
      toast.error("Failed to update rule");
      return;
    }

    setRules(rules.map((r) => (r.id === ruleId ? { ...r, is_active: !currentState } : r)));
    toast.success(currentState ? "Rule deactivated" : "Rule activated");
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[#7d7566] text-sm">
            {rules.filter((r) => r.is_active).length} active rules · {rules.length} total
          </p>
        </div>
        <button
          className="bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600"
          onClick={() => setIsCreating(true)}
        >
          + Create New Rule
        </button>
      </div>

      {/* Rules Table */}
      <div className="-2xl overflow-hidden border border-[#ebe5d8] bg-white">
        <table className="w-full">
          <thead className="bg-[#fbfafa]">
            <tr>
              <th className="px-6 py-4 text-left font-semibold text-gray-900 text-sm">Scope</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-900 text-sm">
                Commission
              </th>
              <th className="px-6 py-4 text-left font-semibold text-gray-900 text-sm">
                Price Range
              </th>
              <th className="px-6 py-4 text-left font-semibold text-gray-900 text-sm">Effective</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-900 text-sm">Status</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-900 text-sm">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ebe5d8]">
            {rules.length === 0 ? (
              <tr>
                <td className="px-6 py-12 text-center text-[#7d7566]" colSpan={6}>
                  No pricing rules configured
                </td>
              </tr>
            ) : (
              rules.map((rule) => (
                <tr className={rule.is_active ? "" : "opacity-50"} key={rule.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        {rule.service_category || (
                          <span className="text-[#9d9383]">All Categories</span>
                        )}
                      </div>
                      <div className="text-[#7d7566]">
                        {rule.city || <span className="text-[#9d9383]">All Cities</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-semibold text-[#FF5200]">
                        {(rule.commission_rate * 100).toFixed(1)}%
                      </div>
                      {rule.background_check_fee_cop > 0 && (
                        <div className="text-[#7d7566]">
                          +{formatCurrency(rule.background_check_fee_cop, { currency: "COP" })} BG
                          check
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#7d7566] text-sm">
                    {rule.min_price_cop || rule.max_price_cop ? (
                      <>
                        {rule.min_price_cop
                          ? formatCurrency(rule.min_price_cop, { currency: "COP" })
                          : "—"}{" "}
                        to{" "}
                        {rule.max_price_cop
                          ? formatCurrency(rule.max_price_cop, { currency: "COP" })
                          : "—"}
                      </>
                    ) : (
                      <span className="text-[#9d9383]">No limits</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-[#7d7566] text-sm">
                    <div>{new Date(rule.effective_from).toLocaleDateString()}</div>
                    {rule.effective_until && (
                      <div className="text-xs">
                        until {new Date(rule.effective_until).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 font-semibold text-xs ${
                        rule.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {rule.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        className="font-medium text-[#FF5200] text-sm"
                        onClick={() => setEditingRule(rule)}
                      >
                        Edit
                      </button>
                      <button
                        className="font-medium text-[#7d7566] text-sm"
                        onClick={() => handleToggleActive(rule.id, rule.is_active)}
                      >
                        {rule.is_active ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="border border-[#ebe5d8] bg-white p-6">
          <h3 className="mb-2 font-semibold text-gray-900">Rule Priority</h3>
          <ol className="list-inside list-decimal space-y-1 text-[#7d7566] text-sm">
            <li>Category + City match</li>
            <li>Category only</li>
            <li>City only</li>
            <li>Default (all)</li>
          </ol>
        </div>

        <div className="border border-[#ebe5d8] bg-white p-6">
          <h3 className="mb-2 font-semibold text-gray-900">Commission Range</h3>
          <p className="text-[#7d7566] text-sm">
            Platform standard: 15-20%
            <br />
            Current default: 18%
            <br />
            Allowed: 10-30%
          </p>
        </div>

        <div className="border border-[#ebe5d8] bg-white p-6">
          <h3 className="mb-2 font-semibold text-gray-900">Late Cancel Policy</h3>
          <p className="text-[#7d7566] text-sm">
            Default: 24 hours
            <br />
            Fee: 50% of booking
            <br />
            Configurable per rule
          </p>
        </div>
      </div>

      {/* Create/Edit Modal - Dynamically loaded */}
      {(isCreating || editingRule) && (
        <PricingRuleModal
          onClose={() => {
            setIsCreating(false);
            setEditingRule(null);
          }}
          onSave={(newRule) => {
            if (editingRule) {
              setRules(rules.map((r) => (r.id === newRule.id ? newRule : r)));
            } else {
              setRules([newRule, ...rules]);
            }
            setIsCreating(false);
            setEditingRule(null);
          }}
          rule={editingRule}
        />
      )}
    </div>
  );
}

/**
 * Loading skeleton for PricingRuleModal
 * Shown while modal component is being lazy-loaded
 */
function PricingRuleModalSkeleton() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
      <div className="my-8 w-full max-w-3xl border border-[#ebe5d8] bg-white p-8">
        <div className="mb-6 h-8 w-48 animate-pulse bg-neutral-200" />
        <div className="space-y-6">
          {/* Form sections skeleton */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div className="border border-[#ebe5d8] bg-[#fbfafa] p-6" key={i}>
              <div className="mb-4 h-5 w-32 animate-pulse bg-neutral-200" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-12 animate-pulse bg-neutral-200" />
                <div className="h-12 animate-pulse bg-neutral-200" />
              </div>
            </div>
          ))}
          {/* Buttons skeleton */}
          <div className="flex justify-end gap-3 pt-4">
            <div className="h-12 w-24 animate-pulse bg-neutral-200" />
            <div className="h-12 w-32 animate-pulse bg-neutral-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
