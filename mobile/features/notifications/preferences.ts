import { supabase } from "@/lib/supabase";

export type CustomerNotificationPreferenceKey =
  | "bookingConfirmed"
  | "bookingAccepted"
  | "bookingDeclined"
  | "serviceStarted"
  | "serviceCompleted"
  | "newMessage"
  | "reviewReminder";

export type ProfessionalNotificationPreferenceKey =
  | "newBookingRequest"
  | "bookingCanceled"
  | "paymentReceived"
  | "newMessage"
  | "reviewReceived";

export type NotificationPreferences = Record<string, boolean>;

export type UserRole = "customer" | "professional" | "admin";

type PreferencesResponse = {
  notification_preferences: Record<string, unknown> | null;
};

const DEFAULT_CUSTOMER_PREFERENCES: Record<CustomerNotificationPreferenceKey, boolean> = {
  bookingConfirmed: true,
  bookingAccepted: true,
  bookingDeclined: true,
  serviceStarted: true,
  serviceCompleted: true,
  newMessage: true,
  reviewReminder: true,
};

const DEFAULT_PROFESSIONAL_PREFERENCES: Record<ProfessionalNotificationPreferenceKey, boolean> = {
  newBookingRequest: true,
  bookingCanceled: true,
  paymentReceived: true,
  newMessage: true,
  reviewReceived: true,
};

function normalizePreferences(
  source: Record<string, unknown> | null,
  role: UserRole
): NotificationPreferences {
  if (!source) {
    return role === "professional"
      ? { ...DEFAULT_PROFESSIONAL_PREFERENCES }
      : { ...DEFAULT_CUSTOMER_PREFERENCES };
  }

  const defaults =
    role === "professional" ? DEFAULT_PROFESSIONAL_PREFERENCES : DEFAULT_CUSTOMER_PREFERENCES;

  return Object.entries(defaults).reduce<Record<string, boolean>>((acc, [key, fallback]) => {
    const value = source[key];
    acc[key] = typeof value === "boolean" ? value : fallback;
    return acc;
  }, {});
}

export async function fetchNotificationPreferences(
  role: UserRole
): Promise<NotificationPreferences> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }

  if (!session?.user) {
    return {};
  }

  if (role === "admin") {
    return {};
  }

  const table = role === "professional" ? "professional_profiles" : "customer_profiles";

  const { data, error } = await supabase
    .from(table)
    .select("notification_preferences")
    .eq(role === "professional" ? "profile_id" : "profile_id", session.user.id)
    .maybeSingle<PreferencesResponse>();

  if (error) {
    throw error;
  }

  return normalizePreferences(data?.notification_preferences ?? null, role);
}

export async function updateNotificationPreferences(
  role: UserRole,
  preferences: NotificationPreferences
) {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }

  if (!session?.user || role === "admin") {
    return;
  }

  const table = role === "professional" ? "professional_profiles" : "customer_profiles";

  const { error } = await supabase
    .from(table)
    .update({
      notification_preferences: preferences,
    })
    .eq("profile_id", session.user.id);

  if (error) {
    throw error;
  }
}
