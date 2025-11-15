/**
 * usePricingRuleForm Hook
 *
 * Custom hook for managing pricing rule form state, validation, and submission.
 * Handles both creating new rules and editing existing ones.
 */

import { type FormEvent, useCallback, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/integrations/supabase/browser-client";
import { toast } from "@/lib/toast";
import { createInitialFormData } from "@/lib/utils/pricing/initial-data";
import { buildPricingPayload } from "@/lib/utils/pricing/payload";
import { validatePricingRuleForm } from "@/lib/utils/pricing/validation";
import type { PricingRule, PricingRuleFormData } from "@/types/pricing";

type UsePricingRuleFormProps = {
  initialRule: PricingRule | null;
  onSave: (savedRule: PricingRule) => void;
};

type UsePricingRuleFormReturn = {
  formData: PricingRuleFormData;
  updateField: <K extends keyof PricingRuleFormData>(
    field: K,
    value: PricingRuleFormData[K]
  ) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  isLoading: boolean;
};

/**
 * Manage pricing rule form state and submission
 *
 * @param initialRule - Existing rule to edit, or null for new rule
 * @param onSave - Callback when rule is successfully saved
 * @returns Form data, update handler, submit handler, and loading state
 */
export function usePricingRuleForm({
  initialRule,
  onSave,
}: UsePricingRuleFormProps): UsePricingRuleFormReturn {
  const [formData, setFormData] = useState<PricingRuleFormData>(() =>
    createInitialFormData(initialRule)
  );
  const [isLoading, setIsLoading] = useState(false);

  // Reset form data when initialRule changes
  useEffect(() => {
    setFormData(createInitialFormData(initialRule));
  }, [initialRule]);

  /**
   * Update single form field
   */
  const updateField = useCallback(
    <K extends keyof PricingRuleFormData>(field: K, value: PricingRuleFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  /**
   * Handle form submission (create or update)
   */
  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      // Validate form data
      const validationError = validatePricingRuleForm(formData);
      if (validationError) {
        toast.error(validationError);
        return;
      }

      setIsLoading(true);

      try {
        const supabase = createSupabaseBrowserClient();
        const payload = buildPricingPayload(formData);

        if (initialRule) {
          // Update existing rule
          const { data, error } = await supabase
            .from("pricing_controls")
            .update(payload)
            .eq("id", initialRule.id)
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
      } finally {
        setIsLoading(false);
      }
    },
    [formData, onSave, initialRule]
  );

  return {
    formData,
    updateField,
    handleSubmit,
    isLoading,
  };
}
