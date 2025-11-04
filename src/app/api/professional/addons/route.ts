/**
 * REFACTORED VERSION - Professional service add-ons management
 * GET/POST/PUT /api/professional/addons
 *
 * BEFORE: 157 lines (3 handlers)
 * AFTER: 122 lines (3 handlers) (22% reduction)
 */

import { withProfessional, ok, created, } from "@/lib/api";
import { ValidationError } from "@/lib/errors";
import { z } from "zod";

const createAddonSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price_cop: z.number().nonnegative(),
  duration_minutes: z.number().nonnegative().default(0),
  is_active: z.boolean().default(true),
});

const addonUpdateSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  price_cop: z.number().nonnegative(),
  duration_minutes: z.number().nonnegative(),
  is_active: z.boolean(),
});

const bulkUpdateSchema = z.object({
  addons: z.array(addonUpdateSchema),
});

/**
 * Get professional's service add-ons
 */
export const GET = withProfessional(async ({ user, supabase }) => {
  const { data: addons, error } = await supabase
    .from("service_addons")
    .select("*")
    .eq("professional_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new ValidationError("Failed to fetch add-ons");
  }

  return ok({ addons: addons || [] });
});

/**
 * Create a new service add-on
 */
export const POST = withProfessional(async ({ user, supabase }, request: Request) => {
  // Parse and validate request body
  const body = await request.json();
  const validatedData = createAddonSchema.parse(body);

  const { data: addon, error } = await supabase
    .from("service_addons")
    .insert({
      professional_id: user.id,
      name: validatedData.name,
      description: validatedData.description || null,
      price_cop: validatedData.price_cop,
      duration_minutes: validatedData.duration_minutes,
      is_active: validatedData.is_active,
    })
    .select()
    .single();

  if (error) {
    throw new ValidationError("Failed to create add-on");
  }

  return created({ addon });
});

/**
 * Update service add-ons (bulk)
 */
export const PUT = withProfessional(async ({ user, supabase }, request: Request) => {
  // Parse and validate request body
  const body = await request.json();
  const { addons } = bulkUpdateSchema.parse(body);

  // Get existing add-ons
  const { data: existingAddons } = await supabase
    .from("service_addons")
    .select("id")
    .eq("professional_id", user.id);

  const existingIds = new Set(existingAddons?.map((a) => a.id) || []);
  const incomingIds = new Set(addons.map((a) => a.id).filter(Boolean));

  // Delete add-ons not in incoming list
  const toDelete = [...existingIds].filter((id) => !incomingIds.has(id));
  if (toDelete.length > 0) {
    await supabase.from("service_addons").delete().in("id", toDelete);
  }

  // Upsert all incoming add-ons
  const { data: updatedAddons, error } = await supabase
    .from("service_addons")
    .upsert(
      addons.map((addon) => ({
        id: addon.id,
        professional_id: user.id,
        name: addon.name,
        description: addon.description,
        price_cop: addon.price_cop,
        duration_minutes: addon.duration_minutes,
        is_active: addon.is_active,
        updated_at: new Date().toISOString(),
      })),
      { onConflict: "id" }
    )
    .select();

  if (error) {
    throw new ValidationError("Failed to update add-ons");
  }

  return ok({ addons: updatedAddons || [] });
});
