import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { PricingPlan } from "@/types/pricing";

/**
 * GET /api/pricing/plans
 * Fetch all visible pricing plans from the database
 * Public endpoint - no authentication required
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetAudience = searchParams.get("audience"); // 'customer', 'professional', or null for 'both'

    const supabase = await createSupabaseServerClient();

    // Build query for visible pricing plans
    let query = supabase
      .from("pricing_plans")
      .select("*")
      .eq("is_visible", true)
      .order("display_order", { ascending: true });

    // Filter by target audience if specified
    if (targetAudience && (targetAudience === "customer" || targetAudience === "professional")) {
      query = query.or(`target_audience.eq.${targetAudience},target_audience.eq.both`);
    }

    const { data: plans, error } = await query;

    if (error) {
      console.error("Error fetching pricing plans:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch pricing plans" },
        { status: 500 }
      );
    }

    // Transform database records to PricingPlan type
    const pricingPlans: PricingPlan[] = (plans || []).map((plan) => ({
      id: plan.id,
      name: plan.name,
      slug: plan.slug,
      description: plan.description,
      price_monthly: plan.price_monthly ? Number(plan.price_monthly) : null,
      price_annual: plan.price_annual ? Number(plan.price_annual) : null,
      currency: plan.currency || "USD",
      billing_period: plan.billing_period || "monthly",
      features: plan.features || [],
      highlight_as_popular: plan.highlight_as_popular,
      recommended_for: plan.recommended_for,
      cta_text: plan.cta_text || "Get Started",
      cta_url: plan.cta_url,
      target_audience: plan.target_audience || "both",
      display_order: plan.display_order || 0,
      is_visible: plan.is_visible ?? true,
      metadata: plan.metadata || {},
      created_at: plan.created_at,
      updated_at: plan.updated_at,
    }));

    return NextResponse.json({
      success: true,
      data: pricingPlans,
    });
  } catch (error) {
    console.error("Error in GET /api/pricing/plans:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
