import { NextResponse } from "next/server";
import { checkRateLimit, getClientIdentifier, RateLimiters } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export const dynamic = "force-dynamic";

/**
 * Data Export API - Required by Ley 1581 de 2012 (Colombian Data Protection Law)
 *
 * Users have the right to access all their personal data stored in the platform.
 * This endpoint exports all user data in JSON format for download.
 *
 * GET /api/account/export-data
 *
 * Returns: JSON file with all user data
 */
export async function GET(request: Request) {
  try {
    // Rate limiting check (sensitive operation)
    const identifier = getClientIdentifier(request);
    const rateLimit = checkRateLimit(`export:${identifier}`, RateLimiters.sensitive);

    if (!rateLimit.allowed) {
      return NextResponse.json({ error: rateLimit.message }, { status: 429 });
    }

    const supabase = await createSupabaseServerClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    // Gather all user data from various tables
    const exportData: Record<string, unknown> = {
      export_date: new Date().toISOString(),
      user_id: userId,
      export_version: "1.0",
    };

    // 1. Profile data
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single();

    if (profile) {
      exportData.profile = {
        id: profile.id,
        role: profile.role,
        locale: profile.locale,
        onboarding_status: profile.onboarding_status,
        stripe_customer_id: profile.stripe_customer_id,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        // Consent records (Ley 1581 compliance)
        consents: {
          privacy_policy: {
            accepted: profile.privacy_policy_accepted,
            accepted_at: profile.privacy_policy_accepted_at,
          },
          terms_of_service: {
            accepted: profile.terms_accepted,
            accepted_at: profile.terms_accepted_at,
          },
          data_processing: {
            accepted: profile.data_processing_consent,
            accepted_at: profile.data_processing_consent_at,
          },
          marketing: {
            accepted: profile.marketing_consent,
            accepted_at: profile.marketing_consent_at,
          },
        },
      };
    }

    // 2. Customer profile data (if applicable)
    const { data: customerProfile } = await supabase
      .from("customer_profiles")
      .select("*")
      .eq("profile_id", userId)
      .single();

    if (customerProfile) {
      exportData.customer_profile = {
        profile_id: customerProfile.profile_id,
        property_preferences: customerProfile.property_preferences,
        saved_addresses: customerProfile.saved_addresses,
        favorite_professionals: customerProfile.favorite_professionals,
        created_at: customerProfile.created_at,
        updated_at: customerProfile.updated_at,
      };
    }

    // 3. Professional profile data (if applicable)
    const { data: professionalProfile } = await supabase
      .from("professional_profiles")
      .select("*")
      .eq("profile_id", userId)
      .single();

    if (professionalProfile) {
      exportData.professional_profile = {
        profile_id: professionalProfile.profile_id,
        full_name: professionalProfile.full_name,
        bio: professionalProfile.bio,
        phone_number: professionalProfile.phone_number,
        city: professionalProfile.city,
        languages: professionalProfile.languages,
        hourly_rate: professionalProfile.hourly_rate,
        years_experience: professionalProfile.years_experience,
        primary_services: professionalProfile.primary_services,
        additional_services: professionalProfile.additional_services,
        service_addons: professionalProfile.service_addons,
        availability_schedule: professionalProfile.availability_schedule,
        portfolio_images: professionalProfile.portfolio_images,
        verification_status: professionalProfile.verification_status,
        rating_average: professionalProfile.rating_average,
        rating_count: professionalProfile.rating_count,
        stripe_account_id: professionalProfile.stripe_account_id,
        stripe_onboarding_complete: professionalProfile.stripe_onboarding_complete,
        avatar_url: professionalProfile.avatar_url,
        created_at: professionalProfile.created_at,
        updated_at: professionalProfile.updated_at,
      };
    }

    // 4. Bookings (as customer)
    const { data: bookingsAsCustomer } = await supabase
      .from("bookings")
      .select("*")
      .eq("customer_id", userId);

    if (bookingsAsCustomer && bookingsAsCustomer.length > 0) {
      exportData.bookings_as_customer = bookingsAsCustomer.map((booking) => ({
        id: booking.id,
        professional_id: booking.professional_id,
        service_name: booking.service_name,
        service_date: booking.service_date,
        service_time: booking.service_time,
        duration_hours: booking.duration_hours,
        total_price: booking.total_price,
        status: booking.status,
        address: booking.address,
        special_requests: booking.special_requests,
        check_in_time: booking.check_in_time,
        check_out_time: booking.check_out_time,
        actual_duration_hours: booking.actual_duration_hours,
        created_at: booking.created_at,
        updated_at: booking.updated_at,
      }));
    }

    // 5. Bookings (as professional)
    const { data: bookingsAsProfessional } = await supabase
      .from("bookings")
      .select("*")
      .eq("professional_id", userId);

    if (bookingsAsProfessional && bookingsAsProfessional.length > 0) {
      exportData.bookings_as_professional = bookingsAsProfessional.map((booking) => ({
        id: booking.id,
        customer_id: booking.customer_id,
        service_name: booking.service_name,
        service_date: booking.service_date,
        service_time: booking.service_time,
        duration_hours: booking.duration_hours,
        total_price: booking.total_price,
        status: booking.status,
        address: booking.address,
        special_requests: booking.special_requests,
        check_in_time: booking.check_in_time,
        check_out_time: booking.check_out_time,
        actual_duration_hours: booking.actual_duration_hours,
        created_at: booking.created_at,
        updated_at: booking.updated_at,
      }));
    }

    // 6. Reviews written by user (as customer)
    const { data: reviewsWritten } = await supabase
      .from("customer_reviews")
      .select("*")
      .eq("customer_id", userId);

    if (reviewsWritten && reviewsWritten.length > 0) {
      exportData.reviews_written = reviewsWritten.map((review) => ({
        id: review.id,
        booking_id: review.booking_id,
        professional_id: review.professional_id,
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at,
      }));
    }

    // 7. Reviews received (as professional)
    const { data: reviewsReceived } = await supabase
      .from("customer_reviews")
      .select("*")
      .eq("professional_id", userId);

    if (reviewsReceived && reviewsReceived.length > 0) {
      exportData.reviews_received = reviewsReceived.map((review) => ({
        id: review.id,
        booking_id: review.booking_id,
        customer_id: review.customer_id,
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at,
      }));
    }

    // 8. Messages/Conversations
    const { data: conversations } = await supabase
      .from("conversations")
      .select("*, messages(*)")
      .or(`customer_id.eq.${userId},professional_id.eq.${userId}`);

    if (conversations && conversations.length > 0) {
      exportData.conversations = conversations.map((conv) => ({
        id: conv.id,
        customer_id: conv.customer_id,
        professional_id: conv.professional_id,
        last_message_at: conv.last_message_at,
        created_at: conv.created_at,
        messages: conv.messages
          ? conv.messages.map(
              (msg: {
                id: string;
                sender_id: string;
                content: string;
                read_at: string | null;
                created_at: string;
              }) => ({
                id: msg.id,
                sender_id: msg.sender_id,
                content: msg.content,
                read_at: msg.read_at,
                created_at: msg.created_at,
              })
            )
          : [],
      }));
    }

    // 9. Payouts (for professionals)
    const { data: payouts } = await supabase
      .from("payouts")
      .select("*")
      .eq("professional_id", userId);

    if (payouts && payouts.length > 0) {
      exportData.payouts = payouts.map((payout) => ({
        id: payout.id,
        booking_id: payout.booking_id,
        amount: payout.amount,
        platform_fee: payout.platform_fee,
        net_amount: payout.net_amount,
        status: payout.status,
        stripe_transfer_id: payout.stripe_transfer_id,
        processed_at: payout.processed_at,
        created_at: payout.created_at,
      }));
    }

    // 10. Notification history
    const { data: notifications } = await supabase
      .from("notifications_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100); // Last 100 notifications

    if (notifications && notifications.length > 0) {
      exportData.recent_notifications = notifications.map((notif) => ({
        id: notif.id,
        type: notif.type,
        title: notif.title,
        body: notif.body,
        read_at: notif.read_at,
        created_at: notif.created_at,
      }));
    }

    // 11. Auth metadata (from Supabase Auth)
    exportData.auth_metadata = {
      email: user.email,
      email_confirmed: user.email_confirmed_at !== null,
      phone: user.phone,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      app_metadata: user.app_metadata,
      user_metadata: user.user_metadata,
    };

    // Return as downloadable JSON file
    const filename = `maidconnect_data_export_${userId}_${Date.now()}.json`;

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Data export error:", error);
    return NextResponse.json(
      { error: "Failed to export data. Please try again later." },
      { status: 500 }
    );
  }
}
