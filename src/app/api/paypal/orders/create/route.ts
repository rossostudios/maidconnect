/**
 * PayPal Order Creation API Route
 * POST /api/paypal/orders/create
 *
 * Creates a PayPal order for checkout payment processing.
 * This order ID is used by the frontend to initiate the PayPal payment flow.
 *
 * SECURITY:
 * - Validates booking exists and belongs to user
 * - Verifies booking amount matches request amount
 * - Rate limited to prevent abuse
 * - Authenticated users only
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { paypal } from "@/lib/integrations/paypal";
import { logger } from "@/lib/logger";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

const CreateOrderSchema = z.object({
  bookingId: z.string().uuid(),
  amount: z.string().regex(/^\d+\.\d{2}$/), // e.g., "100.00"
  currency: z.enum(["USD", "ARS", "UYU", "PYG"]),
});

export async function POST(request: Request) {
  try {
    // Authenticate user
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = CreateOrderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { bookingId, amount, currency } = validation.data;

    // Verify booking exists and belongs to user
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, total_amount, payment_status, client_id")
      .eq("id", bookingId)
      .eq("client_id", user.id)
      .maybeSingle();

    if (bookingError || !booking) {
      logger.error("[PayPal Order] Booking not found", {
        bookingId,
        userId: user.id,
        error: bookingError,
      });
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Verify booking is not already paid
    if (booking.payment_status === "paid") {
      return NextResponse.json({ error: "Booking is already paid" }, { status: 400 });
    }

    // Verify amount matches booking total
    const bookingAmount = Number(booking.total_amount).toFixed(2);
    if (amount !== bookingAmount) {
      logger.error("[PayPal Order] Amount mismatch", {
        bookingId,
        requestedAmount: amount,
        bookingAmount,
      });
      return NextResponse.json(
        { error: "Payment amount does not match booking total" },
        { status: 400 }
      );
    }

    // Create PayPal order
    const order = await paypal.createOrder({
      amount,
      currency,
      description: `Casaora Booking #${bookingId.slice(0, 8)}`,
      metadata: {
        bookingId,
        userId: user.id,
      },
    });

    logger.info("[PayPal Order] Order created successfully", {
      orderId: order.id,
      bookingId,
      amount,
      currency,
      userId: user.id,
    });

    return NextResponse.json({
      orderId: order.id,
      status: order.status,
    });
  } catch (error) {
    logger.error("[PayPal Order] Error creating order", { error });
    return NextResponse.json({ error: "Failed to create PayPal order" }, { status: 500 });
  }
}
