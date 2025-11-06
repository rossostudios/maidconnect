/**
 * Pricing Controls Manager Component
 *
 * Admin interface for managing pricing rules
 * Supports creating, editing, and deactivating rules
 *
 * Sprint 2: Supply & Ops
 */

"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/format";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { toast } from "@/lib/toast";

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
          className="rounded-lg bg-[#E85D48] px-6 py-3 font-semibold text-white transition hover:bg-[#D64A36]"
          onClick={() => setIsCreating(true)}
        >
          + Create New Rule
        </button>
      </div>

      {/* Rules Table */}
      <div className="overflow-hidden rounded-2xl border border-[#ebe5d8] bg-white">
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
                      <div className="font-semibold text-[#E85D48]">
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
                        className="font-medium text-[#E85D48] text-sm hover:underline"
                        onClick={() => setEditingRule(rule)}
                      >
                        Edit
                      </button>
                      <button
                        className="font-medium text-[#7d7566] text-sm hover:underline"
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
        <div className="rounded-lg border border-[#ebe5d8] bg-white p-6">
          <h3 className="mb-2 font-semibold text-gray-900">Rule Priority</h3>
          <ol className="list-inside list-decimal space-y-1 text-[#7d7566] text-sm">
            <li>Category + City match</li>
            <li>Category only</li>
            <li>City only</li>
            <li>Default (all)</li>
          </ol>
        </div>

        <div className="rounded-lg border border-[#ebe5d8] bg-white p-6">
          <h3 className="mb-2 font-semibold text-gray-900">Commission Range</h3>
          <p className="text-[#7d7566] text-sm">
            Platform standard: 15-20%
            <br />
            Current default: 18%
            <br />
            Allowed: 10-30%
          </p>
        </div>

        <div className="rounded-lg border border-[#ebe5d8] bg-white p-6">
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

      {/* Create/Edit Modal */}
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
 * Modal for creating/editing pricing rules
 */
type PricingRuleModalProps = {
  rule: PricingRule | null;
  onClose: () => void;
  onSave: (rule: PricingRule) => void;
};

function PricingRuleModal({ rule, onClose, onSave }: PricingRuleModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    service_category: rule?.service_category || "",
    city: rule?.city || "",
    commission_rate: rule ? rule.commission_rate * 100 : 18, // Convert to percentage for display
    background_check_fee_cop: rule?.background_check_fee_cop || 0,
    min_price_cop: rule?.min_price_cop || null,
    max_price_cop: rule?.max_price_cop || null,
    deposit_percentage: rule?.deposit_percentage ? rule.deposit_percentage * 100 : null,
    late_cancel_hours: rule?.late_cancel_hours || 24,
    late_cancel_fee_percentage: rule ? rule.late_cancel_fee_percentage * 100 : 50,
    effective_from: rule?.effective_from || new Date().toISOString().split("T")[0],
    effective_until: rule?.effective_until || "",
    notes: rule?.notes || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();

      // Validate commission rate
      if (formData.commission_rate < 10 || formData.commission_rate > 30) {
        toast.error("Commission rate must be between 10% and 30%");
        setIsLoading(false);
        return;
      }

      // Validate price range
      if (
        formData.min_price_cop !== null &&
        formData.max_price_cop !== null &&
        formData.min_price_cop > formData.max_price_cop
      ) {
        toast.error("Minimum price cannot exceed maximum price");
        setIsLoading(false);
        return;
      }

      const payload = {
        service_category: formData.service_category || null,
        city: formData.city || null,
        commission_rate: formData.commission_rate / 100, // Convert back to decimal
        background_check_fee_cop: formData.background_check_fee_cop,
        min_price_cop: formData.min_price_cop,
        max_price_cop: formData.max_price_cop,
        deposit_percentage: formData.deposit_percentage ? formData.deposit_percentage / 100 : null,
        late_cancel_hours: formData.late_cancel_hours,
        late_cancel_fee_percentage: formData.late_cancel_fee_percentage / 100,
        effective_from: formData.effective_from,
        effective_until: formData.effective_until || null,
        notes: formData.notes || null,
        is_active: true,
      };

      if (rule) {
        // Update existing rule
        const { data, error } = await supabase
          .from("pricing_controls")
          .update(payload)
          .eq("id", rule.id)
          .select()
          .single();

        if (error) {
          throw error;
        }
        toast.success("Pricing rule updated");
        onSave(data);
      } else {
        // Create new rule
        const { data, error } = await supabase
          .from("pricing_controls")
          .insert(payload)
          .select()
          .single();

        if (error) {
          throw error;
        }
        toast.success("Pricing rule created");
        onSave(data);
      }
    } catch (error) {
      console.error("Failed to save pricing rule:", error);
      toast.error("Failed to save pricing rule");
      setIsLoading(false);
    }
  };

  const SERVICE_CATEGORIES = [
    "cleaning",
    "cooking",
    "childcare",
    "elderly_care",
    "pet_care",
    "gardening",
    "laundry",
  ];

  const CITIES = [
    "Bogotá",
    "Medellín",
    "Cali",
    "Barranquilla",
    "Cartagena",
    "Bucaramanga",
    "Pereira",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
      <div className="my-8 w-full max-w-3xl rounded-2xl border border-[#ebe5d8] bg-white p-8">
        <h2 className="mb-6 font-bold text-2xl text-gray-900">
          {rule ? "Edit" : "Create"} Pricing Rule
        </h2>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Scope Section */}
          <div className="rounded-lg border border-[#ebe5d8] bg-[#fbfafa] p-6">
            <h3 className="mb-4 font-semibold text-gray-900">Scope (leave blank for "All")</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block font-medium text-gray-900 text-sm">
                  Service Category
                </label>
                <select
                  className="w-full rounded-lg border border-[#e5dfd4] px-4 py-3 text-sm focus:border-[#E85D48] focus:outline-none focus:ring-2 focus:ring-[#E85D48]/20"
                  onChange={(e) => setFormData({ ...formData, service_category: e.target.value })}
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
                <label className="mb-2 block font-medium text-gray-900 text-sm">City</label>
                <select
                  className="w-full rounded-lg border border-[#e5dfd4] px-4 py-3 text-sm focus:border-[#E85D48] focus:outline-none focus:ring-2 focus:ring-[#E85D48]/20"
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
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
          <div className="rounded-lg border border-[#ebe5d8] p-6">
            <h3 className="mb-4 font-semibold text-gray-900">Commission & Fees</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block font-medium text-gray-900 text-sm">
                  Commission Rate (%) *
                </label>
                <input
                  className="w-full rounded-lg border border-[#e5dfd4] px-4 py-3 text-sm focus:border-[#E85D48] focus:outline-none focus:ring-2 focus:ring-[#E85D48]/20"
                  max="30"
                  min="10"
                  onChange={(e) =>
                    setFormData({ ...formData, commission_rate: Number.parseFloat(e.target.value) })
                  }
                  required
                  step="0.1"
                  type="number"
                  value={formData.commission_rate}
                />
                <p className="mt-1 text-[#7d7566] text-xs">Range: 10-30%</p>
              </div>

              <div>
                <label className="mb-2 block font-medium text-gray-900 text-sm">
                  Background Check Fee (COP)
                </label>
                <input
                  className="w-full rounded-lg border border-[#e5dfd4] px-4 py-3 text-sm focus:border-[#E85D48] focus:outline-none focus:ring-2 focus:ring-[#E85D48]/20"
                  min="0"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      background_check_fee_cop: Number.parseInt(e.target.value, 10) || 0,
                    })
                  }
                  step="1000"
                  type="number"
                  value={formData.background_check_fee_cop}
                />
              </div>
            </div>
          </div>

          {/* Price Range Section */}
          <div className="rounded-lg border border-[#ebe5d8] p-6">
            <h3 className="mb-4 font-semibold text-gray-900">Price Limits (Optional)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block font-medium text-gray-900 text-sm">
                  Minimum Price (COP)
                </label>
                <input
                  className="w-full rounded-lg border border-[#e5dfd4] px-4 py-3 text-sm focus:border-[#E85D48] focus:outline-none focus:ring-2 focus:ring-[#E85D48]/20"
                  min="0"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      min_price_cop: e.target.value ? Number.parseInt(e.target.value, 10) : null,
                    })
                  }
                  placeholder="No minimum"
                  step="1000"
                  type="number"
                  value={formData.min_price_cop || ""}
                />
              </div>

              <div>
                <label className="mb-2 block font-medium text-gray-900 text-sm">
                  Maximum Price (COP)
                </label>
                <input
                  className="w-full rounded-lg border border-[#e5dfd4] px-4 py-3 text-sm focus:border-[#E85D48] focus:outline-none focus:ring-2 focus:ring-[#E85D48]/20"
                  min="0"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      max_price_cop: e.target.value ? Number.parseInt(e.target.value, 10) : null,
                    })
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
          <div className="rounded-lg border border-[#ebe5d8] p-6">
            <h3 className="mb-4 font-semibold text-gray-900">Deposit & Cancellation Policy</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="mb-2 block font-medium text-gray-900 text-sm">Deposit (%)</label>
                <input
                  className="w-full rounded-lg border border-[#e5dfd4] px-4 py-3 text-sm focus:border-[#E85D48] focus:outline-none focus:ring-2 focus:ring-[#E85D48]/20"
                  max="100"
                  min="0"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      deposit_percentage: e.target.value ? Number.parseFloat(e.target.value) : null,
                    })
                  }
                  placeholder="Default"
                  step="5"
                  type="number"
                  value={formData.deposit_percentage || ""}
                />
              </div>

              <div>
                <label className="mb-2 block font-medium text-gray-900 text-sm">
                  Late Cancel (hours)
                </label>
                <input
                  className="w-full rounded-lg border border-[#e5dfd4] px-4 py-3 text-sm focus:border-[#E85D48] focus:outline-none focus:ring-2 focus:ring-[#E85D48]/20"
                  min="0"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      late_cancel_hours: Number.parseInt(e.target.value, 10) || 24,
                    })
                  }
                  step="1"
                  type="number"
                  value={formData.late_cancel_hours}
                />
              </div>

              <div>
                <label className="mb-2 block font-medium text-gray-900 text-sm">
                  Late Cancel Fee (%)
                </label>
                <input
                  className="w-full rounded-lg border border-[#e5dfd4] px-4 py-3 text-sm focus:border-[#E85D48] focus:outline-none focus:ring-2 focus:ring-[#E85D48]/20"
                  max="100"
                  min="0"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      late_cancel_fee_percentage: Number.parseFloat(e.target.value) || 50,
                    })
                  }
                  step="5"
                  type="number"
                  value={formData.late_cancel_fee_percentage}
                />
              </div>
            </div>
          </div>

          {/* Effective Dates Section */}
          <div className="rounded-lg border border-[#ebe5d8] p-6">
            <h3 className="mb-4 font-semibold text-gray-900">Effective Dates</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block font-medium text-gray-900 text-sm">
                  Effective From *
                </label>
                <input
                  className="w-full rounded-lg border border-[#e5dfd4] px-4 py-3 text-sm focus:border-[#E85D48] focus:outline-none focus:ring-2 focus:ring-[#E85D48]/20"
                  onChange={(e) => setFormData({ ...formData, effective_from: e.target.value })}
                  required
                  type="date"
                  value={formData.effective_from}
                />
              </div>

              <div>
                <label className="mb-2 block font-medium text-gray-900 text-sm">
                  Effective Until
                </label>
                <input
                  className="w-full rounded-lg border border-[#e5dfd4] px-4 py-3 text-sm focus:border-[#E85D48] focus:outline-none focus:ring-2 focus:ring-[#E85D48]/20"
                  onChange={(e) => setFormData({ ...formData, effective_until: e.target.value })}
                  placeholder="No end date"
                  type="date"
                  value={formData.effective_until}
                />
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div>
            <label className="mb-2 block font-medium text-gray-900 text-sm">Notes (Optional)</label>
            <textarea
              className="w-full rounded-lg border border-[#e5dfd4] px-4 py-3 text-sm focus:border-[#E85D48] focus:outline-none focus:ring-2 focus:ring-[#E85D48]/20"
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Internal notes about this pricing rule..."
              rows={3}
              value={formData.notes}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              className="rounded-lg border border-[#e5dfd4] px-6 py-3 font-semibold text-gray-900 transition hover:border-[#E85D48] disabled:opacity-50"
              disabled={isLoading}
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="rounded-lg bg-[#E85D48] px-6 py-3 font-semibold text-white transition hover:bg-[#D64A36] disabled:opacity-50"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? "Saving..." : rule ? "Update Rule" : "Create Rule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
