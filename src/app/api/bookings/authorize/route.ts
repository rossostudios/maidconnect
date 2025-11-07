/**
 * REFACTORED VERSION - Customer authorizes booking payment
 * POST /api/bookings/authorize
 *
 * BEFORE: 163 lines, complexity 31
 * AFTER: Reduced complexity through helper extraction
 */

import { z } from "zod";
import { ok, requireCustomerOwnership, withCustomer } from "@/lib/api";
import { sendNewBookingRequestEmail } from "@/lib/email/send";
import { BusinessRuleError } from "@/lib/errors";
import { notifyCustomerBookingConfirmed, notifyProfessionalNewBooking } from "@/lib/notifications";
import { createRateLimitResponse, rateLimit } from "@/lib/rate-limit";
import { stripe } from "@/lib/stripe";

const authorizeSchema = z.object({
  bookingId: z.string().uuid("Invalid booking ID format"),
  paymentIntentId: z.string().min(1, "Payment intent ID is required"),
});

// Helper: Validate payment intent
async function validatePaymentIntent(paymentIntentId: string, bookingId: string) {
  const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (intent.metadata?.booking_id !== bookingId) {
    throw new BusinessRuleError("Payment intent does not match booking", "PAYMENT_MISMATCH");
  }

  if (intent.status !== "requires_capture") {
    throw new BusinessRuleError("Payment is not in an authorized state", "INVALID_PAYMENT_STATUS");
  }

  return intent;
}

// Helper: Format booking address
function formatBookingAddress(address: any): string {
  if (!address) {
    return "Not specified";
  }
  if (typeof address === "object" && "formatted" in address) {
    return String(address.formatted);
  }
  return JSON.stringify(address);
}

// Helper: Format booking details for notifications
function formatBookingDetails(fullBooking: any) {
  const scheduledDate = fullBooking.scheduled_start
    ? new Date(fullBooking.scheduled_start).toLocaleDateString()
    : "TBD";
  const scheduledTime = fullBooking.scheduled_start
    ? new Date(fullBooking.scheduled_start).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "TBD";
  const duration = fullBooking.duration_minutes ? `${fullBooking.duration_minutes} minutes` : "TBD";
  const address = formatBookingAddress(fullBooking.address);
  const amount = fullBooking.amount_authorized
    ? `${new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: fullBooking.currency || "COP",
      }).format(fullBooking.amount_authorized / 100)}`
    : undefined;

  return { scheduledDate, scheduledTime, duration, address, amount };
}

// Helper: Send notifications to professional
async function notifyProfessional(options: {
  supabase: any;
  fullBooking: any;
  professionalUser: any;
  professionalProfile: any;
  customerUser: any;
}) {
  if (!options.professionalUser?.user?.email) {
    return;
  }

  const details = formatBookingDetails(options.fullBooking);

  await sendNewBookingRequestEmail(options.professionalUser.user.email, {
    professionalName: options.professionalProfile?.full_name || "there",
    customerName: options.customerUser?.user?.user_metadata?.full_name || "A customer",
    serviceName: options.fullBooking.service_name || "Service",
    ...details,
    bookingId: options.fullBooking.id,
  });

  await notifyProfessionalNewBooking(options.fullBooking.professional_id, {
    id: options.fullBooking.id,
    serviceName: options.fullBooking.service_name || "Service",
    customerName: options.customerUser?.user?.user_metadata?.full_name || "A customer",
    scheduledStart: options.fullBooking.scheduled_start || new Date().toISOString(),
  });
}

// Helper: Send notifications to customer
async function notifyCustomer(fullBooking: any, customerUser: any, professionalProfile: any) {
  if (!customerUser?.user) {
    return;
  }

  await notifyCustomerBookingConfirmed(fullBooking.customer_id, {
    id: fullBooking.id,
    serviceName: fullBooking.service_name || "Service",
    scheduledStart: fullBooking.scheduled_start || new Date().toISOString(),
    professionalName: professionalProfile?.full_name || "Your professional",
  });
}

// Helper: Fetch users for notifications
async function fetchUsersForNotifications(
  supabase: any,
  professionalId: string,
  customerId: string
) {
  const [professionalUserResult, professionalProfileResult, customerUserResult] = await Promise.all(
    [
      supabase.auth.admin.getUserById(professionalId),
      supabase
        .from("professional_profiles")
        .select("full_name")
        .eq("profile_id", professionalId)
        .single(),
      supabase.auth.admin.getUserById(customerId),
    ]
  );

  return {
    professionalUser: professionalUserResult.data,
    professionalProfile: professionalProfileResult.data,
    customerUser: customerUserResult.data,
  };
}

// Helper: Send all booking authorization notifications
async function sendAuthorizationNotifications(supabase: any, bookingId: string) {
  try {
    const { data: fullBooking } = await supabase
      .from("bookings")
      .select(
        "id, professional_id, customer_id, service_name, scheduled_start, duration_minutes, amount_authorized, currency, address"
      )
      .eq("id", bookingId)
      .single();

    if (!fullBooking) {
      return;
    }

    const { professionalUser, professionalProfile, customerUser } =
      await fetchUsersForNotifications(
        supabase,
        fullBooking.professional_id,
        fullBooking.customer_id
      );

    await Promise.all([
      notifyProfessional({
        supabase,
        fullBooking,
        professionalUser,
        professionalProfile,
        customerUser,
      }),
      notifyCustomer(fullBooking, customerUser, professionalProfile),
    ]);
  } catch (_emailError) {
    // Don't fail request if notifications fail
  }
}

export const POST = withCustomer(async ({ user, supabase }, request: Request) => {
  // Rate limiting: 10 payment authorizations per hour per user
  const rateLimitResult = await rateLimit(request, "booking");
  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult);
  }

  const body = await request.json();
  const { bookingId, paymentIntentId } = authorizeSchema.parse(body);

  await requireCustomerOwnership(supabase, user.id, bookingId);

  const intent = await validatePaymentIntent(paymentIntentId, bookingId);

  await supabase
    .from("bookings")
    .update({
      status: "authorized",
      stripe_payment_status: intent.status,
      amount_authorized: intent.amount ?? intent.amount_received ?? null,
    })
    .eq("id", bookingId);

  await sendAuthorizationNotifications(supabase, bookingId);

  return ok({ success: true });
});
