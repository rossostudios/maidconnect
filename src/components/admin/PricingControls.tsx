/**
 * Pricing Controls Manager Component
 *
 * Admin interface for managing pricing rules with Precision design.
 * Supports creating, editing, and deactivating rules.
 *
 * Architecture:
 * - Main orchestrator component (this file)
 * - Table/modal components from ./pricing-controls
 * - Form field components from ./pricing-controls/form-fields
 * - Custom hook from @/hooks/usePricingRuleForm
 * - Types and helpers from @/types/pricing and @/lib/utils/pricing
 */

"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browserClient";
import { toast } from "@/lib/toast";
import type { PricingRule } from "@/types/pricing";
import { PricingRuleModal, PricingRulesTable } from "./pricing-controls";

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

  const handleSave = (newRule: PricingRule) => {
    if (editingRule) {
      setRules(rules.map((r) => (r.id === newRule.id ? newRule : r)));
    } else {
      setRules([newRule, ...rules]);
    }
    setIsCreating(false);
    setEditingRule(null);
  };

  const handleCloseModal = () => {
    setIsCreating(false);
    setEditingRule(null);
  };

  return (
    <div className="space-y-6">
      {/* Header - Precision Design */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-neutral-600 text-sm">
            {rules.filter((r) => r.is_active).length} active rules · {rules.length} total
          </p>
        </div>
        <button
          className="bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600"
          onClick={() => setIsCreating(true)}
          type="button"
        >
          + Create New Rule
        </button>
      </div>

      {/* Rules Table */}
      <PricingRulesTable
        onEdit={setEditingRule}
        onToggleActive={handleToggleActive}
        rules={rules}
      />

      {/* Info Cards - Precision Design */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="border border-neutral-200 bg-white p-6">
          <h3 className="mb-2 font-semibold text-neutral-900">Rule Priority</h3>
          <ol className="list-inside list-decimal space-y-1 text-neutral-600 text-sm">
            <li>Category + City match</li>
            <li>Category only</li>
            <li>City only</li>
            <li>Default (all)</li>
          </ol>
        </div>

        <div className="border border-neutral-200 bg-white p-6">
          <h3 className="mb-2 font-semibold text-neutral-900">Commission Range</h3>
          <p className="text-neutral-600 text-sm">
            Platform standard: 15-20%
            <br />
            Current default: 18%
            <br />
            Allowed: 10-30%
          </p>
        </div>

        <div className="border border-neutral-200 bg-white p-6">
          <h3 className="mb-2 font-semibold text-neutral-900">Late Cancel Policy</h3>
          <p className="text-neutral-600 text-sm">
            Default: 24 hours
            <br />
            Fee: 50% of booking
            <br />
            Configurable per rule
          </p>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(isCreating || editingRule) && (
        <PricingRuleModal onClose={handleCloseModal} onSave={handleSave} rule={editingRule} />
      )}
    </div>
  );
}
