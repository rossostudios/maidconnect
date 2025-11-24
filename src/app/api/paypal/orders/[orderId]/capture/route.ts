/**
 * PayPal Order Capture API Route
 * POST /api/paypal/orders/[orderId]/capture
 *
 * Captures payment for an approved PayPal order and updates booking status.
 * This completes the payment flow after the user approves the payment.
 *
 * SECURITY:
 * - Verifies order belongs to authenticated user
 * - Validates booking exists and matches order metadata
 * - Prevents double-capture via idempotency checks
 * - Updates booking payment status atomically
 */

import { NextResponse } from "next/server";
import { paypal } from "@/lib/integrations/paypal";
import { logger } from "@/lib/logger";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

// Type for PayPal order response with purchase units
type PayPalOrderWithUnits = {
  purchase_units?: Array<{
    custom_id?: string;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
};

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    // Authenticate user
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get order details to extract booking metadata
    const orderDetails = await paypal.getOrder(orderId);

    // Parse metadata from custom_id
    let bookingId: string | undefined;
    try {
      const orderWithUnits = orderDetails as PayPalOrderWithUnits;
      const customId = orderWithUnits.purchase_units?.[0]?.custom_id;
      if (customId) {
        const metadata = JSON.parse(customId);
        bookingId = metadata.bookingId;

        // Verify order belongs to authenticated user
        if (metadata.userId !== user.id) {
          logger.error("[PayPal Capture] Order user mismatch", {
            orderId,
            orderUserId: metadata.userId,
            requestUserId: user.id,
          });
          return NextResponse.json({ error: "Order does not belong to user" }, { status: 403 });
        }
      }
    } catch (error) {
      logger.error("[PayPal Capture] Failed to parse order metadata", {
        orderId,
        error,
      });
    }

    if (!bookingId) {
      return NextResponse.json(
        { error: "Invalid order metadata - booking ID not found" },
        { status: 400 }
      );
    }

    // Verify booking exists and is not already paid
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, payment_status, client_id")
      .eq("id", bookingId)
      .eq("client_id", user.id)
      .maybeSingle();

    if (bookingError || !booking) {
      logger.error("[PayPal Capture] Booking not found", {
        bookingId,
        userId: user.id,
        error: bookingError,
      });
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.payment_status === "paid") {
      logger.warn("[PayPal Capture] Booking already paid (idempotency)", {
        bookingId,
        orderId,
      });
      return NextResponse.json({
        success: true,
        alreadyCaptured: true,
        bookingId,
      });
    }

    // Capture the PayPal order
    const captureResult = await paypal.captureOrder(orderId);

    if (captureResult.status !== "COMPLETED") {
      logger.error("[PayPal Capture] Order capture incomplete", {
        orderId,
        status: captureResult.status,
        bookingId,
      });
      return NextResponse.json(
        { error: "Payment capture failed or incomplete", status: captureResult.status },
        { status: 400 }
      );
    }

    // Update booking payment status
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        payment_status: "paid",
        payment_method: "paypal",
        paypal_order_id: orderId,
        paypal_capture_id: captureResult.captureId,
        paid_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    if (updateError) {
      logger.error("[PayPal Capture] Failed to update booking", {
        bookingId,
        orderId,
        error: updateError,
      });
      return NextResponse.json(
        { error: "Failed to update booking payment status" },
        { status: 500 }
      );
    }

    logger.info("[PayPal Capture] Payment captured successfully", {
      orderId,
      bookingId,
      captureId: captureResult.captureId,
      amount: captureResult.amount,
      userId: user.id,
    });

    return NextResponse.json({
      success: true,
      orderId: captureResult.id,
      captureId: captureResult.captureId,
      bookingId,
      amount: captureResult.amount,
    });
  } catch (error) {
    logger.error("[PayPal Capture] Error capturing payment", { error });
    return NextResponse.json({ error: "Failed to capture PayPal payment" }, { status: 500 });
  }
}
