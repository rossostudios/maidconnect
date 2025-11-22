/**
 * Job Alerts Service
 *
 * Handles finding and notifying professionals about new job opportunities in their area.
 * Part of PWA engagement features to increase professional retention.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { notifyNearbyProfessionalsNewJob } from "@/lib/notifications";

export type JobAlertBooking = {
  id: string;
  serviceName: string;
  cityId: string;
  cityName: string;
  scheduledStart: string;
  estimatedPay: number;
  currency: string;
  professionalId: string; // Exclude the assigned professional
};

export type NearbyProfessional = {
  profile_id: string;
  city_id: string;
  services_offered: string[] | null;
  status: string;
};

/**
 * Find professionals in the same city who offer similar services
 * Excludes the already-assigned professional
 */
export async function findNearbyProfessionals(
  supabase: SupabaseClient,
  cityId: string,
  serviceName: string,
  excludeProfileId: string
): Promise<NearbyProfessional[]> {
  try {
    // Query active professionals in the same city
    const { data: professionals, error } = await supabase
      .from("professional_profiles")
      .select("profile_id, city_id, services_offered, status")
      .eq("city_id", cityId)
      .eq("status", "active")
      .neq("profile_id", excludeProfileId)
      .limit(50); // Cap to prevent notification spam

    if (error) {
      console.error("[job-alerts] Error finding nearby professionals:", error);
      return [];
    }

    if (!professionals || professionals.length === 0) {
      return [];
    }

    // Filter to professionals who offer similar services
    // Match if services_offered contains the service name (case-insensitive)
    const serviceNameLower = serviceName.toLowerCase();
    const matchingProfessionals = professionals.filter((pro) => {
      if (!(pro.services_offered && Array.isArray(pro.services_offered))) {
        // Include professionals without specific services (they may be generalists)
        return true;
      }

      // Check if any of their services match the booking service
      return pro.services_offered.some(
        (service) =>
          service.toLowerCase().includes(serviceNameLower) ||
          serviceNameLower.includes(service.toLowerCase())
      );
    });

    return matchingProfessionals;
  } catch (error) {
    console.error("[job-alerts] Unexpected error finding professionals:", error);
    return [];
  }
}

/**
 * Send job alert notifications to nearby professionals
 * Fire-and-forget - doesn't fail booking creation if notifications fail
 */
export async function sendJobAlertNotifications(
  supabase: SupabaseClient,
  booking: JobAlertBooking
): Promise<{ sent: number; failed: number }> {
  try {
    const professionals = await findNearbyProfessionals(
      supabase,
      booking.cityId,
      booking.serviceName,
      booking.professionalId
    );

    if (professionals.length === 0) {
      return { sent: 0, failed: 0 };
    }

    const professionalIds = professionals.map((p) => p.profile_id);

    const result = await notifyNearbyProfessionalsNewJob(professionalIds, {
      serviceName: booking.serviceName,
      cityName: booking.cityName,
      scheduledDate: booking.scheduledStart,
      estimatedPay: booking.estimatedPay,
      currency: booking.currency,
    });

    console.log(
      `[job-alerts] Sent ${result.successful}/${result.total} notifications for booking ${booking.id}`
    );

    return { sent: result.successful, failed: result.failed };
  } catch (error) {
    console.error("[job-alerts] Failed to send job alerts:", error);
    return { sent: 0, failed: 0 };
  }
}

/**
 * Get city name from city ID
 */
export async function getCityName(supabase: SupabaseClient, cityId: string): Promise<string> {
  try {
    const { data: city } = await supabase.from("cities").select("name").eq("id", cityId).single();

    return city?.name || "your area";
  } catch {
    return "your area";
  }
}
