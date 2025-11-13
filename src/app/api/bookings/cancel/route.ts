/**
 * Customer cancels a booking
 * POST /api/bookings/cancel
 *
 * REFACTORED: Complexity 29 → <15
 * - Extracted business logic to cancellation-service.ts
 * - Route now focuses on orchestration
 */

import { z } from "zod";
import { ok, requireCustomerOwnership, withCustomer } from "@/lib/api";
import type { CancellationBookingData } from "@/lib/bookings/cancellation-service";
import {
  cancelBookingInDatabase,
  formatRefundAmount,
  processStripeRefund,
  sendCancellationNotifications,
  validateCancellationEligibility,
  validateCancellationPolicy,
} from "@/lib/bookings/cancellation-service";
import { calculateRefundAmount } from "@/lib/cancellation-policy";
import { BusinessRuleError, ValidationError } from "@/lib/errors";
import { trackBookingCancelledServer } from "@/lib/integrations/posthog/server";

const cancelBookingSchema = z.object({
  bookingId: z.string().uuid("Invalid booking ID format"),
  reason: z.string().optional(),
});

export const POST = withCustomer(async ({ user, supabase }, request: Request) => {
  // Parse and validate request body
  const body = await request.json();
  const { bookingId, reason } = cancelBookingSchema.parse(body);

  // Verify customer owns this booking and get full booking data
  const booking = (await requireCustomerOwnership(
    supabase,
    user.id,
    bookingId
  )) as CancellationBookingData;

  // Validate booking can be canceled using service
  const eligibilityResult = validateCancellationEligibility(booking);
  if (!eligibilityResult.success) {
    if (eligibilityResult.errorCode === "INVALID_BOOKING_STATUS") {
      throw new BusinessRuleError(
        eligibilityResult.error || "Cannot cancel booking",
        eligibilityResult.errorCode
      );
    }
    throw new ValidationError(eligibilityResult.error || "Cannot cancel booking");
  }

  // Validate cancellation policy using service
  const policyResult = validateCancellationPolicy(booking.scheduled_start!, booking.status);
  if (!policyResult.success) {
    throw new BusinessRuleError(
      policyResult.error || "Cannot cancel booking",
      "CANCELLATION_NOT_ALLOWED",
      { policy: policyResult.policy }
    );
  }

  const policy = policyResult.policy;

  // Calculate refund amount
  const refundAmount = calculateRefundAmount(
    booking.amount_authorized || 0,
    policy.refundPercentage
  );

  // Process Stripe refund/cancellation using service
  const refundResult = await processStripeRefund(booking.stripe_payment_intent_id, refundAmount);
  if (!refundResult.success) {
    throw new ValidationError(
      refundResult.error || "Failed to process refund. Please contact support."
    );
  }

  // Update booking to canceled using service
  const cancellationResult = await cancelBookingInDatabase(supabase, bookingId, user.id, reason);
  if (!cancellationResult.success) {
    throw new ValidationError(
      cancellationResult.error || "Failed to cancel booking. Please contact support."
    );
  }

  // Send cancellation notifications using service
  const customerName = user.user_metadata?.full_name || "Customer";
  await sendCancellationNotifications(supabase, booking, customerName, reason);

  // Track booking cancellation
  await trackBookingCancelledServer(user.id, {
    bookingId: booking.id,
    cancelledBy: "customer",
    reason,
    refundAmount,
  });

  return ok(
    {
      booking: {
        id: cancellationResult.booking.id,
        status: cancellationResult.booking.status,
        canceled_at: cancellationResult.booking.canceled_at,
      },
      refund: {
        policy: policy.reason,
        refund_percentage: policy.refundPercentage,
        refund_amount: refundAmount,
        formatted_refund: formatRefundAmount(refundAmount, booking.currency),
        stripe_status: refundResult.stripeStatus,
      },
    },
    "Booking canceled successfully"
  );
});
