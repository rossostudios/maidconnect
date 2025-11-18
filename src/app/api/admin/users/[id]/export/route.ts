/**
 * Admin User Data Export API
 * POST /api/admin/users/[id]/export - Export all user data as JSON
 *
 * Rate Limit: 5 requests per minute (admin tier - reduced for export operations)
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-helpers";
import { withRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

async function handleExportUserData(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireAdmin();
    const supabase = await createSupabaseServerClient();
    const userId = id;

    // Fetch comprehensive user data
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single();

    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isProfessional = profile.role === "professional";
    const isCustomer = profile.role === "customer";

    // Fetch professional data
    let professionalData = null;
    if (isProfessional) {
      const { data: professionalProfile } = await supabase
        .from("professional_profiles")
        .select("*")
        .eq("id", userId)
        .single();

      const { data: verification } = await supabase
        .from("professional_verifications")
        .select("*")
        .eq("professional_id", userId);

      const { data: services } = await supabase
        .from("professional_services")
        .select("*")
        .eq("professional_id", userId);

      const { data: portfolio } = await supabase
        .from("portfolio_items")
        .select("*")
        .eq("professional_id", userId);

      const { data: payouts } = await supabase
        .from("professional_payouts")
        .select("*")
        .eq("professional_id", userId);

      const { data: transactions } = await supabase
        .from("professional_transactions")
        .select("*")
        .eq("professional_id", userId);

      professionalData = {
        profile: professionalProfile,
        verification,
        services,
        portfolio,
        payouts,
        transactions,
      };
    }

    // Fetch customer data
    let customerData = null;
    if (isCustomer) {
      const { data: addresses } = await supabase
        .from("customer_addresses")
        .select("*")
        .eq("customer_id", userId);

      const { data: paymentMethods } = await supabase
        .from("customer_payment_methods")
        .select("*")
        .eq("customer_id", userId);

      const { data: favorites } = await supabase
        .from("favorite_professionals")
        .select("*")
        .eq("customer_id", userId);

      customerData = {
        addresses,
        paymentMethods,
        favorites,
      };
    }

    // Fetch common data
    const { data: bookings } = await supabase
      .from("bookings")
      .select("*")
      .or(`customer_id.eq.${userId},professional_id.eq.${userId}`);

    const { data: reviews } = await supabase
      .from("reviews")
      .select("*")
      .or(`customer_id.eq.${userId},professional_id.eq.${userId}`);

    const { data: payments } = await supabase
      .from("payments")
      .select("*")
      .eq("customer_id", userId);

    const { data: suspensions } = await supabase
      .from("user_suspensions")
      .select("*")
      .eq("user_id", userId);

    // Compile export data
    const exportData = {
      exported_at: new Date().toISOString(),
      user: {
        profile,
        professional: professionalData,
        customer: customerData,
      },
      activity: {
        bookings,
        reviews,
        payments,
        suspensions,
      },
    };

    // Return as JSON download
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="user-${userId}-export.json"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to export user data" },
      { status: error.message === "Not authenticated" ? 401 : 500 }
    );
  }
}

// Apply rate limiting: 5 requests per minute (reduced for export operations)
export const POST = withRateLimit(handleExportUserData, "admin");
