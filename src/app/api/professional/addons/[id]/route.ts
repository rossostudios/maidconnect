/**
 * REFACTORED VERSION - Individual service add-on management
 * PATCH/DELETE /api/professional/addons/[id]
 *
 * BEFORE: 102 lines (2 handlers)
 * AFTER: 70 lines (2 handlers) (31% reduction)
 */

import { withProfessional, ok, notFound, noContent, requireResourceOwnership } from "@/lib/api";
import { ValidationError } from "@/lib/errors";
import { z } from "zod";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const updateAddonSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  price_cop: z.number().nonnegative().optional(),
  duration_minutes: z.number().nonnegative().optional(),
  is_active: z.boolean().optional(),
});

/**
 * Update a specific service add-on
 */
export const PATCH = withProfessional(
  async ({ user, supabase }, request: Request, context: RouteContext) => {
    const { id: addonId } = await context.params;

    // Verify ownership
    await requireResourceOwnership(
      supabase,
      "service_addons",
      addonId,
      "professional_id",
      user.id
    );

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateAddonSchema.parse(body);

    const { data: addon, error } = await supabase
      .from("service_addons")
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", addonId)
      .select()
      .single();

    if (error) {
      throw new ValidationError("Failed to update add-on");
    }

    return ok({ addon });
  }
);

/**
 * Delete a specific service add-on
 */
export const DELETE = withProfessional(
  async ({ user, supabase }, _request: Request, context: RouteContext) => {
    const { id: addonId } = await context.params;

    // Verify ownership
    await requireResourceOwnership(
      supabase,
      "service_addons",
      addonId,
      "professional_id",
      user.id
    );

    const { error } = await supabase.from("service_addons").delete().eq("id", addonId);

    if (error) {
      throw new ValidationError("Failed to delete add-on");
    }

    return noContent();
  }
);
