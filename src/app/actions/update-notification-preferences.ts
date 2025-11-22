"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type NotificationPreferences = {
  email_booking_updates: boolean;
  email_messages: boolean;
  email_promotions: boolean;
  push_booking_updates: boolean;
  push_messages: boolean;
  push_reminders: boolean;
  sms_booking_updates: boolean;
  sms_reminders: boolean;
};

export async function updateNotificationPreferencesAction(
  preferences: NotificationPreferences
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Please sign in to update preferences" };
    }

    // Get user's role to determine which table to update
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return { success: false, error: "Unable to find your profile" };
    }

    // Update the appropriate profile table based on role
    if (profile.role === "customer") {
      const { error: updateError } = await supabase
        .from("customer_profiles")
        .update({ notification_preferences: preferences })
        .eq("profile_id", user.id);

      if (updateError) {
        console.error("[NotificationPreferences] Customer update error:", updateError);
        return { success: false, error: "Failed to save preferences" };
      }
    } else if (profile.role === "professional") {
      const { error: updateError } = await supabase
        .from("professional_profiles")
        .update({ notification_preferences: preferences })
        .eq("profile_id", user.id);

      if (updateError) {
        console.error("[NotificationPreferences] Professional update error:", updateError);
        return { success: false, error: "Failed to save preferences" };
      }
    }

    // Also update SMS preference on the main profiles table if it has the field
    if (preferences.sms_booking_updates || preferences.sms_reminders) {
      await supabase.from("profiles").update({ sms_notifications_enabled: true }).eq("id", user.id);
    } else {
      await supabase
        .from("profiles")
        .update({ sms_notifications_enabled: false })
        .eq("id", user.id);
    }

    revalidatePath("/dashboard/customer/settings");
    revalidatePath("/dashboard/pro/settings");

    return { success: true };
  } catch (error) {
    console.error("[NotificationPreferences] Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
