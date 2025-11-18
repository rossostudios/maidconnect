"use client";

import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { geistSans } from "@/app/fonts";
import { formatCurrency } from "@/lib/format";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

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

  const activeCount = rules.filter((rule) => rule.is_active).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p
          className={cn(
            "font-medium text-[11px] text-neutral-500 tracking-[0.3em]",
            geistSans.className
          )}
        >
          {activeCount} active rules · {rules.length} total
        </p>
        <button
          className={cn(
            "inline-flex items-center gap-2 rounded-lg border border-neutral-900 bg-neutral-900 px-4 py-2 font-medium text-white text-xs tracking-[0.3em] transition hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2",
            geistSans.className
          )}
          onClick={() => setIsCreating(true)}
        >
          <HugeiconsIcon className="h-4 w-4" icon={ArrowUpRight01Icon} />
          Create Rule
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full">
          <thead className="bg-neutral-50">
            <tr>
              {["Scope", "Commission", "Price Range", "Effective", "Status", "Actions"].map(
                (heading) => (
                  <th
                    className={cn(
                      "px-6 py-4 text-left font-medium text-[11px] text-neutral-600 tracking-[0.3em]",
                      geistSans.className
                    )}
                    key={heading}
                  >
                    {heading}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {rules.length === 0 ? (
              <tr>
                <td className="px-6 py-10 text-center" colSpan={6}>
                  <p className={cn("text-neutral-600 text-sm", geistSans.className)}>
                    No pricing rules configured yet.
                  </p>
                </td>
              </tr>
            ) : (
              rules.map((rule) => (
                <tr className={rule.is_active ? "" : "opacity-60"} key={rule.id}>
                  <td className="px-6 py-4 align-top">
                    <p className={cn("font-medium text-neutral-900 text-sm", geistSans.className)}>
                      {rule.service_category || "All Categories"}
                    </p>
                    <p className={cn("text-neutral-600 text-xs", geistSans.className)}>
                      {rule.city || "All Cities"}
                    </p>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <p className={cn("text-lg text-neutral-900", geistSans.className)}>
                      {(rule.commission_rate * 100).toFixed(1)}%
                    </p>
                    {rule.background_check_fee_cop > 0 && (
                      <p className={cn("text-neutral-600 text-xs", geistSans.className)}>
                        +{formatCurrency(rule.background_check_fee_cop, { currency: "COP" })} BG
                        check
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 align-top">
                    {rule.min_price_cop || rule.max_price_cop ? (
                      <p className={cn("text-neutral-900 text-sm", geistSans.className)}>
                        {rule.min_price_cop
                          ? formatCurrency(rule.min_price_cop, { currency: "COP" })
                          : "—"}
                        <span className="mx-2 text-neutral-500">to</span>
                        {rule.max_price_cop
                          ? formatCurrency(rule.max_price_cop, { currency: "COP" })
                          : "—"}
                      </p>
                    ) : (
                      <p className={cn("text-neutral-500 text-sm", geistSans.className)}>
                        No limits
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 align-top">
                    <p className={cn("text-neutral-900 text-sm", geistSans.className)}>
                      {new Date(rule.effective_from).toLocaleDateString()}
                    </p>
                    {rule.effective_until && (
                      <p className={cn("text-neutral-600 text-xs", geistSans.className)}>
                        until {new Date(rule.effective_until).toLocaleDateString()}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 align-top">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full border px-3 py-1 font-medium text-xs tracking-[0.25em]",
                        geistSans.className,
                        rule.is_active
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-neutral-200 bg-neutral-100 text-neutral-600"
                      )}
                    >
                      {rule.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="flex flex-col gap-2 text-left">
                      <button
                        className={cn(
                          "font-medium text-neutral-900 text-xs tracking-[0.3em] underline-offset-2 hover:underline",
                          geistSans.className
                        )}
                        onClick={() => setEditingRule(rule)}
                      >
                        Edit
                      </button>
                      <button
                        className={cn(
                          "font-medium text-neutral-500 text-xs tracking-[0.3em] underline-offset-2 hover:underline",
                          geistSans.className
                        )}
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <p
            className={cn(
              "font-medium text-[11px] text-neutral-500 tracking-[0.3em]",
              geistSans.className
            )}
          >
            Rule Priority
          </p>
          <ol
            className={cn(
              "mt-3 list-inside list-decimal space-y-1 text-neutral-700 text-sm",
              geistSans.className
            )}
          >
            <li>Category + City match</li>
            <li>Category only</li>
            <li>City only</li>
            <li>Default (all)</li>
          </ol>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <p
            className={cn(
              "font-medium text-[11px] text-neutral-500 tracking-[0.3em]",
              geistSans.className
            )}
          >
            Commission Range
          </p>
          <p className={cn("mt-3 text-neutral-700 text-sm", geistSans.className)}>
            Platform standard: 15-20%
            <br />
            Current default: 18%
            <br />
            Allowed band: 10-30%
          </p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <p
            className={cn(
              "font-medium text-[11px] text-neutral-500 tracking-[0.3em]",
              geistSans.className
            )}
          >
            Late Cancel Policy
          </p>
          <p className={cn("mt-3 text-neutral-700 text-sm", geistSans.className)}>
            Default: 24 hours notice · Fee: 50% of booking · Override per rule.
          </p>
        </div>
      </div>

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

function PricingRuleModalSkeleton() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
      <div className="my-8 w-full max-w-3xl rounded-lg border border-neutral-200 bg-white p-8">
        <div className="mb-6 h-8 w-48 animate-pulse rounded-lg bg-neutral-200" />
        <div className="space-y-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6" key={i}>
              <div className="mb-4 h-5 w-32 animate-pulse rounded-lg bg-neutral-200" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-12 animate-pulse rounded-lg bg-neutral-200" />
                <div className="h-12 animate-pulse rounded-lg bg-neutral-200" />
              </div>
            </div>
          ))}
          <div className="flex justify-end gap-3 pt-4">
            <div className="h-12 w-24 animate-pulse rounded-lg bg-neutral-200" />
            <div className="h-12 w-32 animate-pulse rounded-lg bg-neutral-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
