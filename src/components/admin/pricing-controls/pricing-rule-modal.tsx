/**
 * Pricing Rule Modal Component
 *
 * Modal dialog for creating and editing pricing rules.
 * Integrates all form field components and manages form state via custom hook.
 *
 * Lia Design: Neutral background overlay, white modal, orange CTAs
 */

import { usePricingRuleForm } from "@/hooks/usePricingRuleForm";
import type { PricingRule } from "@/types/pricing";
import {
  CommissionFields,
  EffectiveDatesFields,
  ModalFooter,
  NotesField,
  PolicyFields,
  PriceLimitsFields,
  ScopeFields,
} from "./form-fields";

type PricingRuleModalProps = {
  rule: PricingRule | null;
  onClose: () => void;
  onSave: (rule: PricingRule) => void;
};

export function PricingRuleModal({ rule, onClose, onSave }: PricingRuleModalProps) {
  const { formData, handleSubmit, isLoading, updateField } = usePricingRuleForm({
    initialRule: rule,
    onSave,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
      <div className="my-8 w-full max-w-3xl border border-neutral-200 bg-white p-8">
        <h2 className="mb-6 font-bold text-2xl text-neutral-900">
          {rule ? "Edit" : "Create"} Pricing Rule
        </h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <ScopeFields formData={formData} updateField={updateField} />
          <CommissionFields formData={formData} updateField={updateField} />
          <PriceLimitsFields formData={formData} updateField={updateField} />
          <PolicyFields formData={formData} updateField={updateField} />
          <EffectiveDatesFields formData={formData} updateField={updateField} />
          <NotesField formData={formData} updateField={updateField} />
          <ModalFooter isEditing={Boolean(rule)} isLoading={isLoading} onClose={onClose} />
        </form>
      </div>
    </div>
  );
}
