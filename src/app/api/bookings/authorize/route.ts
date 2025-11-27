/**
 * REFACTORED VERSION - Customer authorizes booking payment
 * POST /api/bookings/authorize
 *
 * BEFORE: 163 lines, complexity 31
 * AFTER: Reduced complexity through helper extraction
 */

import type { SupabaseClient, User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ok, requireCustomerOwnership, withCustomer } from "@/lib/api";
import { sendNewBookingRequestEmail } from "@/lib/email/send";
import { BusinessRuleError } from "@/lib/errors";
import { notifyCustomerBookingConfirmed, notifyProfessionalNewBooking } from "@/lib/notifications";
import { createRateLimitResponse, rateLimit } from "@/lib/rate-limit";
import { stripe } from "@/lib/stripe";
import { type Currency, formatFromMinorUnits } from "@/lib/utils/format";
import type { Database } from "@/types/supabase";

// Type-safe Supabase client alias
type TypedSupabaseClient = SupabaseClient<Database>;

// Booking data used for notifications (matches the select query)
type NotificationBookingData = {
  id: string;
  professional_id: string;
  customer_id: string | null;
  service_name: string | null;
  scheduled_start: string | null;
  duration_minutes: number | null;
  amount_authorized: number | null;
  currency: string | null;
  address: string | null;
};

// Address structure that may contain a formatted field
type BookingAddress =
  | {
      formatted?: string;
      [key: string]: unknown;
    }
  | string
  | null;

// Professional profile data from the select query
type ProfessionalProfile = {
  full_name: string | null;
};

// User data returned from Supabase Auth admin API
type AuthUserData = {
  user: User | null;
};

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
function formatBookingAddress(address: BookingAddress): string {
  if (!address) {
    return "Not specified";
  }
  if (typeof address === "object" && "formatted" in address && address.formatted) {
    return String(address.formatted);
  }
  if (typeof address === "string") {
    return address;
  }
  return JSON.stringify(address);
}

// Helper: Format booking details for notifications
function formatBookingDetails(fullBooking: NotificationBookingData) {
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
  const address = formatBookingAddress(fullBooking.address as BookingAddress);
  const amount = fullBooking.amount_authorized
    ? formatFromMinorUnits(
        fullBooking.amount_authorized,
        (fullBooking.currency || "COP") as Currency
      )
    : undefined;

  return { scheduledDate, scheduledTime, duration, address, amount };
}

// Helper: Send notifications to professional
async function notifyProfessional(options: {
  fullBooking: NotificationBookingData;
  professionalUser: AuthUserData | null;
  professionalProfile: ProfessionalProfile | null;
  customerUser: AuthUserData | null;
}) {
  if (!options.professionalUser?.user?.email) {
    return;
  }

  const details = formatBookingDetails(options.fullBooking);
  const customerName =
    (options.customerUser?.user?.user_metadata?.full_name as string | undefined) || "A customer";

  await sendNewBookingRequestEmail(options.professionalUser.user.email, {
    professionalName: options.professionalProfile?.full_name || "there",
    customerName,
    serviceName: options.fullBooking.service_name || "Service",
    ...details,
    bookingId: options.fullBooking.id,
  });

  await notifyProfessionalNewBooking(options.fullBooking.professional_id, {
    id: options.fullBooking.id,
    serviceName: options.fullBooking.service_name || "Service",
    customerName,
    scheduledStart: options.fullBooking.scheduled_start || new Date().toISOString(),
  });
}

// Helper: Send notifications to customer
async function notifyCustomer(
  fullBooking: NotificationBookingData,
  customerUser: AuthUserData | null,
  professionalProfile: ProfessionalProfile | null
) {
  if (!(customerUser?.user && fullBooking.customer_id)) {
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
  supabase: TypedSupabaseClient,
  professionalId: string,
  customerId: string
): Promise<{
  professionalUser: AuthUserData | null;
  professionalProfile: ProfessionalProfile | null;
  customerUser: AuthUserData | null;
}> {
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
    professionalUser: professionalUserResult.data as AuthUserData | null,
    professionalProfile: professionalProfileResult.data as ProfessionalProfile | null,
    customerUser: customerUserResult.data as AuthUserData | null,
  };
}

// Helper: Send all booking authorization notifications
async function sendAuthorizationNotifications(supabase: TypedSupabaseClient, bookingId: string) {
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

    // Type assertion: we know the shape from the select query
    const typedBooking = fullBooking as NotificationBookingData;

    // Guard against missing customer_id (shouldn't happen but type safety)
    if (!typedBooking.customer_id) {
      return;
    }

    const { professionalUser, professionalProfile, customerUser } =
      await fetchUsersForNotifications(
        supabase,
        typedBooking.professional_id,
        typedBooking.customer_id
      );

    await Promise.all([
      notifyProfessional({
        fullBooking: typedBooking,
        professionalUser,
        professionalProfile,
        customerUser,
      }),
      notifyCustomer(typedBooking, customerUser, professionalProfile),
    ]);
  } catch (_emailError) {
    // Don't fail request if notifications fail
  }
}

export const POST = withCustomer(
  async ({ user, supabase }, request: Request): Promise<NextResponse> => {
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
  }
);
