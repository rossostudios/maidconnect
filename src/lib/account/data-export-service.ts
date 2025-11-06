// Data export service - Colombian Data Protection Law (Ley 1581 de 2012) compliance

import type { SupabaseClient } from "@supabase/supabase-js";

type ExportData = Record<string, unknown>;

/**
 * Export profile data including consent records
 */
export async function exportProfileData(
  supabase: SupabaseClient,
  userId: string
): Promise<ExportData> {
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single();

  if (!profile) {
    return {};
  }

  return {
    profile: {
      id: profile.id,
      role: profile.role,
      locale: profile.locale,
      onboarding_status: profile.onboarding_status,
      stripe_customer_id: profile.stripe_customer_id,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
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
    },
  };
}

/**
 * Export customer profile data
 */
export async function exportCustomerProfileData(
  supabase: SupabaseClient,
  userId: string
): Promise<ExportData> {
  const { data } = await supabase
    .from("customer_profiles")
    .select("*")
    .eq("profile_id", userId)
    .single();

  if (!data) {
    return {};
  }

  return {
    customer_profile: {
      profile_id: data.profile_id,
      property_preferences: data.property_preferences,
      saved_addresses: data.saved_addresses,
      favorite_professionals: data.favorite_professionals,
      created_at: data.created_at,
      updated_at: data.updated_at,
    },
  };
}

/**
 * Export professional profile data
 */
export async function exportProfessionalProfileData(
  supabase: SupabaseClient,
  userId: string
): Promise<ExportData> {
  const { data } = await supabase
    .from("professional_profiles")
    .select("*")
    .eq("profile_id", userId)
    .single();

  if (!data) {
    return {};
  }

  return {
    professional_profile: {
      profile_id: data.profile_id,
      full_name: data.full_name,
      bio: data.bio,
      phone_number: data.phone_number,
      city: data.city,
      languages: data.languages,
      hourly_rate: data.hourly_rate,
      years_experience: data.years_experience,
      primary_services: data.primary_services,
      additional_services: data.additional_services,
      service_addons: data.service_addons,
      availability_schedule: data.availability_schedule,
      portfolio_images: data.portfolio_images,
      verification_status: data.verification_status,
      rating_average: data.rating_average,
      rating_count: data.rating_count,
      stripe_account_id: data.stripe_account_id,
      stripe_onboarding_complete: data.stripe_onboarding_complete,
      avatar_url: data.avatar_url,
      created_at: data.created_at,
      updated_at: data.updated_at,
    },
  };
}

/**
 * Export bookings data (both as customer and professional)
 */
export async function exportBookingsData(
  supabase: SupabaseClient,
  userId: string
): Promise<ExportData> {
  const result: ExportData = {};

  // Bookings as customer
  const { data: asCustomer } = await supabase
    .from("bookings")
    .select("*")
    .eq("customer_id", userId);

  if (asCustomer && asCustomer.length > 0) {
    result.bookings_as_customer = asCustomer.map((b) => ({
      id: b.id,
      professional_id: b.professional_id,
      service_name: b.service_name,
      service_date: b.service_date,
      service_time: b.service_time,
      duration_hours: b.duration_hours,
      total_price: b.total_price,
      status: b.status,
      address: b.address,
      special_requests: b.special_requests,
      check_in_time: b.check_in_time,
      check_out_time: b.check_out_time,
      actual_duration_hours: b.actual_duration_hours,
      created_at: b.created_at,
      updated_at: b.updated_at,
    }));
  }

  // Bookings as professional
  const { data: asProfessional } = await supabase
    .from("bookings")
    .select("*")
    .eq("professional_id", userId);

  if (asProfessional && asProfessional.length > 0) {
    result.bookings_as_professional = asProfessional.map((b) => ({
      id: b.id,
      customer_id: b.customer_id,
      service_name: b.service_name,
      service_date: b.service_date,
      service_time: b.service_time,
      duration_hours: b.duration_hours,
      total_price: b.total_price,
      status: b.status,
      address: b.address,
      special_requests: b.special_requests,
      check_in_time: b.check_in_time,
      check_out_time: b.check_out_time,
      actual_duration_hours: b.actual_duration_hours,
      created_at: b.created_at,
      updated_at: b.updated_at,
    }));
  }

  return result;
}

/**
 * Export reviews data (written and received)
 */
export async function exportReviewsData(
  supabase: SupabaseClient,
  userId: string
): Promise<ExportData> {
  const result: ExportData = {};

  // Reviews written
  const { data: written } = await supabase
    .from("customer_reviews")
    .select("*")
    .eq("customer_id", userId);

  if (written && written.length > 0) {
    result.reviews_written = written.map((r) => ({
      id: r.id,
      booking_id: r.booking_id,
      professional_id: r.professional_id,
      rating: r.rating,
      comment: r.comment,
      created_at: r.created_at,
    }));
  }

  // Reviews received
  const { data: received } = await supabase
    .from("customer_reviews")
    .select("*")
    .eq("professional_id", userId);

  if (received && received.length > 0) {
    result.reviews_received = received.map((r) => ({
      id: r.id,
      booking_id: r.booking_id,
      customer_id: r.customer_id,
      rating: r.rating,
      comment: r.comment,
      created_at: r.created_at,
    }));
  }

  return result;
}

/**
 * Export conversations and messages
 */
export async function exportConversationsData(
  supabase: SupabaseClient,
  userId: string
): Promise<ExportData> {
  const { data: conversations } = await supabase
    .from("conversations")
    .select("*, messages(*)")
    .or(`customer_id.eq.${userId},professional_id.eq.${userId}`);

  if (!conversations || conversations.length === 0) {
    return {};
  }

  return {
    conversations: conversations.map((conv) => ({
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
    })),
  };
}

/**
 * Export payouts data for professionals
 */
export async function exportPayoutsData(
  supabase: SupabaseClient,
  userId: string
): Promise<ExportData> {
  const { data: payouts } = await supabase
    .from("payouts")
    .select("*")
    .eq("professional_id", userId);

  if (!payouts || payouts.length === 0) {
    return {};
  }

  return {
    payouts: payouts.map((p) => ({
      id: p.id,
      booking_id: p.booking_id,
      amount: p.amount,
      platform_fee: p.platform_fee,
      net_amount: p.net_amount,
      status: p.status,
      stripe_transfer_id: p.stripe_transfer_id,
      processed_at: p.processed_at,
      created_at: p.created_at,
    })),
  };
}

/**
 * Export notification history (last 100)
 */
export async function exportNotificationsData(
  supabase: SupabaseClient,
  userId: string
): Promise<ExportData> {
  const { data: notifications } = await supabase
    .from("notifications_history")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (!notifications || notifications.length === 0) {
    return {};
  }

  return {
    recent_notifications: notifications.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body,
      read_at: n.read_at,
      created_at: n.created_at,
    })),
  };
}

/**
 * Export auth metadata from Supabase Auth
 */
export function exportAuthMetadata(user: {
  email?: string;
  email_confirmed_at?: string | null;
  phone?: string;
  created_at: string;
  last_sign_in_at?: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
}): ExportData {
  return {
    auth_metadata: {
      email: user.email,
      email_confirmed: user.email_confirmed_at !== null,
      phone: user.phone,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      app_metadata: user.app_metadata,
      user_metadata: user.user_metadata,
    },
  };
}
