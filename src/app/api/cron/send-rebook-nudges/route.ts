/**
 * Cron Job: Send Rebook Nudges (Sprint 2)
 *
 * Scheduled to run every hour (recommended)
 * Sends email + push notifications to customers 24h or 72h after booking completion
 * A/B test: 50% get 24h nudge, 50% get 72h nudge
 */

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/send";
import * as templates from "@/lib/email/templates";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { notifyCustomerRebookNudge } from "@/lib/notifications";

// Verify cron authentication
function verifyCronAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET) {
    console.error("[rebook-nudges] CRON_SECRET not configured");
    return false;
  }

  return authHeader === expectedAuth;
}

export async function GET(request: NextRequest) {
  try {
    // 1. Verify authentication
    if (!verifyCronAuth(request)) {
      console.warn("[rebook-nudges] Unauthorized cron attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Check if feature is enabled
    if (!isFeatureEnabled("rebook_nudge_system")) {
      return NextResponse.json({
        success: true,
        message: "Rebook nudge system is disabled via feature flag",
        sent: 0,
      });
    }

    // 3. Create Supabase client with service role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const results = {
      total_processed: 0,
      emails_sent: 0,
      push_sent: 0,
      errors: 0,
    };

    // 4. Process both variants (24h and 72h)
    const variants: Array<{ hours: number; variant: "24h" | "72h" }> = [
      { hours: 24, variant: "24h" },
      { hours: 72, variant: "72h" },
    ];

    for (const { hours, variant } of variants) {
      // Calculate target time window (with 1-hour buffer for flexibility)
      const targetTime = new Date();
      targetTime.setHours(targetTime.getHours() - hours);
      const windowStart = new Date(targetTime.getTime() - 3_600_000); // 1 hour before
      const windowEnd = new Date(targetTime.getTime() + 3_600_000); // 1 hour after

      // 5. Find completed bookings ready for rebook nudge
      const { data: bookings, error: fetchError } = await supabase
        .from("bookings")
        .select(
          `
          id,
          customer_id,
          professional_id,
          service_name,
          scheduled_date,
          actual_end_time,
          rebook_nudge_variant,
          rebook_nudge_sent,
          customer:profiles!bookings_customer_id_fkey(
            id,
            email,
            full_name
          ),
          professional:profiles!bookings_professional_id_fkey(
            id,
            full_name
          )
        `
        )
        .eq("status", "completed")
        .eq("rebook_nudge_sent", false)
        .eq("rebook_nudge_variant", variant)
        .gte("actual_end_time", windowStart.toISOString())
        .lte("actual_end_time", windowEnd.toISOString())
        .not("actual_end_time", "is", null);

      if (fetchError) {
        console.error(`[rebook-nudges] Error fetching ${variant} bookings:`, fetchError);
        results.errors++;
        continue;
      }

      if (!bookings || bookings.length === 0) {
        console.log(`[rebook-nudges] No bookings ready for ${variant} nudge`);
        continue;
      }

      console.log(`[rebook-nudges] Processing ${bookings.length} bookings for ${variant} nudge`);

      // 6. Process each booking
      for (const booking of bookings) {
        try {
          results.total_processed++;

          const customer = Array.isArray(booking.customer) ? booking.customer[0] : booking.customer;
          const professional = Array.isArray(booking.professional)
            ? booking.professional[0]
            : booking.professional;

          if (!(customer?.email && customer?.full_name && professional?.full_name)) {
            console.warn(`[rebook-nudges] Missing data for booking ${booking.id}`);
            results.errors++;
            continue;
          }

          // 7. Send email
          try {
            await sendEmail(
              customer.email,
              `Ready for Your Next Service? - ${booking.service_name}`,
              templates.rebookNudgeEmail(
                {
                  customerName: customer.full_name,
                  professionalName: professional.full_name,
                  professionalId: booking.professional_id,
                  serviceName: booking.service_name,
                  scheduledDate: new Date(booking.scheduled_date).toLocaleDateString(),
                  scheduledTime: "",
                  duration: "",
                  address: "",
                  bookingId: booking.id,
                },
                variant,
                process.env.NEXT_PUBLIC_BASE_URL || "https://casaora.co"
              )
            );
            results.emails_sent++;
          } catch (emailError) {
            console.error(`[rebook-nudges] Email error for booking ${booking.id}:`, emailError);
            results.errors++;
          }

          // 8. Send push notification
          try {
            await notifyCustomerRebookNudge(booking.customer_id, {
              id: booking.id,
              serviceName: booking.service_name,
              professionalName: professional.full_name,
              professionalId: booking.professional_id,
            });
            results.push_sent++;
          } catch (pushError) {
            console.error(`[rebook-nudges] Push error for booking ${booking.id}:`, pushError);
            results.errors++;
          }

          // 9. Update experiment tracking
          const now = new Date().toISOString();
          await supabase.from("rebook_nudge_experiments").upsert(
            {
              booking_id: booking.id,
              customer_id: booking.customer_id,
              variant,
              email_sent_at: now,
              push_sent_at: now,
              updated_at: now,
            },
            { onConflict: "booking_id" }
          );

          // 10. Mark booking as nudge sent
          await supabase
            .from("bookings")
            .update({
              rebook_nudge_sent: true,
              rebook_nudge_sent_at: now,
            })
            .eq("id", booking.id);
        } catch (bookingError) {
          console.error(`[rebook-nudges] Error processing booking ${booking.id}:`, bookingError);
          results.errors++;
        }
      }
    }

    // 11. Return summary
    console.log("[rebook-nudges] Cron job completed:", results);
    return NextResponse.json({
      success: true,
      ...results,
    });
  } catch (error) {
    console.error("[rebook-nudges] Cron job failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
