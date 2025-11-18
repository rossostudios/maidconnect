/**
 * Admin User Finances Tab API
 * GET /api/admin/users/[id]/finances - Get finances tab data (lazy loaded)
 *
 * Rate Limit: 10 requests per minute (admin tier)
 */

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { requireAdmin } from "@/lib/admin-helpers";
import { withRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-11-20.acacia",
    })
  : null;

async function handleGetFinances(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireAdmin();
    const supabase = await createSupabaseServerClient();
    const userId = id;

    // Parse query params for pagination
    const url = new URL(request.url);
    const limit = Number.parseInt(url.searchParams.get("limit") || "10", 10);
    const offset = Number.parseInt(url.searchParams.get("offset") || "0", 10);

    // Fetch profile to determine role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isProfessional = profile.role === "professional";
    const isCustomer = profile.role === "customer";

    // Fetch professional finances
    let professionalFinances = null;
    if (isProfessional) {
      professionalFinances = await fetchProfessionalFinances(supabase, userId, limit, offset);
    }

    // Fetch customer finances
    let customerFinances = null;
    if (isCustomer) {
      customerFinances = await fetchCustomerFinances(supabase, userId, limit, offset);
    }

    return NextResponse.json({
      professional: professionalFinances,
      customer: customerFinances,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch finances data" },
      { status: error.message === "Not authenticated" ? 401 : 500 }
    );
  }
}

async function fetchProfessionalFinances(
  supabase: SupabaseServerClient,
  userId: string,
  limit: number,
  offset: number
) {
  // Fetch earnings summary
  const { data: completedBookings } = await supabase
    .from("bookings")
    .select("final_price, status")
    .eq("professional_id", userId)
    .in("status", ["completed", "pending_payment"]);

  const totalEarnings =
    completedBookings
      ?.filter((b) => b.status === "completed")
      .reduce((sum, b) => sum + b.final_price, 0) || 0;
  const pendingEarnings =
    completedBookings
      ?.filter((b) => b.status === "pending_payment")
      .reduce((sum, b) => sum + b.final_price, 0) || 0;

  // Fetch Stripe account status
  const { data: professionalProfile } = await supabase
    .from("professional_profiles")
    .select("stripe_account_id")
    .eq("id", userId)
    .single();

  let stripeStatus = null;
  if (stripe && professionalProfile?.stripe_account_id) {
    try {
      const account = await stripe.accounts.retrieve(professionalProfile.stripe_account_id);
      stripeStatus = {
        connected: true,
        verified: account.details_submitted && account.charges_enabled,
        account_id: account.id,
      };
    } catch {
      stripeStatus = { connected: false, verified: false, account_id: null };
    }
  } else {
    stripeStatus = { connected: false, verified: false, account_id: null };
  }

  // Fetch payouts
  const { data: payouts } = await supabase
    .from("professional_payouts")
    .select("id, amount, status, payout_date, stripe_payout_id")
    .eq("professional_id", userId)
    .order("payout_date", { ascending: false })
    .range(offset, offset + limit - 1);

  // Fetch transactions
  const { data: transactions } = await supabase
    .from("professional_transactions")
    .select("id, transaction_type, description, amount, transaction_date, status")
    .eq("professional_id", userId)
    .order("transaction_date", { ascending: false })
    .range(offset, offset + limit - 1);

  return {
    earnings: {
      total: totalEarnings,
      pending: pendingEarnings,
      completed: totalEarnings - pendingEarnings,
    },
    stripe: stripeStatus,
    payouts: payouts || [],
    transactions: transactions || [],
  };
}

async function fetchCustomerFinances(
  supabase: SupabaseServerClient,
  userId: string,
  limit: number,
  offset: number
) {
  // Fetch spending summary
  const { data: payments } = await supabase
    .from("payments")
    .select("amount, status")
    .eq("customer_id", userId);

  const totalSpent =
    payments?.filter((p) => p.status === "succeeded").reduce((sum, p) => sum + p.amount, 0) || 0;
  const pendingPayments =
    payments?.filter((p) => p.status === "pending").reduce((sum, p) => sum + p.amount, 0) || 0;

  // Fetch payment methods
  const { data: paymentMethods } = await supabase
    .from("customer_payment_methods")
    .select("id, type, last4, brand, exp_month, exp_year, is_default")
    .eq("customer_id", userId)
    .eq("is_deleted", false)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  // Fetch spending by category
  const { data: bookings } = await supabase
    .from("bookings")
    .select("service_type, final_price")
    .eq("customer_id", userId)
    .eq("status", "completed");

  const spendingByCategory =
    bookings?.reduce((acc: Record<string, number>, booking) => {
      const category = booking.service_type || "Other";
      acc[category] = (acc[category] || 0) + booking.final_price;
      return acc;
    }, {}) || {};

  // Fetch recent transactions
  const { data: transactions } = await supabase
    .from("payments")
    .select("id, amount, status, created_at, description, booking_id")
    .eq("customer_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  return {
    spending: {
      total: totalSpent,
      pending: pendingPayments,
    },
    paymentMethods: paymentMethods || [],
    spendingByCategory,
    transactions: transactions || [],
  };
}

// Apply rate limiting: 10 requests per minute
export const GET = withRateLimit(handleGetFinances, "admin");
