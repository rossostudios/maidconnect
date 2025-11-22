import { z } from "zod";
import { created, ok, withProfessional } from "@/lib/api";

const addonSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().nullable(),
  price_cop: z.number().nonnegative(),
  duration_minutes: z.number().nonnegative(),
  is_active: z.boolean().optional().default(true),
});

export const GET = withProfessional(async ({ supabase, user }) => {
  const { data, error } = await supabase
    .from("service_addons")
    .select("*")
    .eq("professional_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return ok({ addons: data ?? [] });
});

export const POST = withProfessional(async ({ supabase, user }, request: Request) => {
  const body = await request.json();
  const parsed = addonSchema.parse(body);

  const { data, error } = await supabase
    .from("service_addons")
    .insert({
      professional_id: user.id,
      name: parsed.name,
      description: parsed.description ?? null,
      price_cop: parsed.price_cop,
      duration_minutes: parsed.duration_minutes,
      is_active: parsed.is_active ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return created({ addon: data });
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
