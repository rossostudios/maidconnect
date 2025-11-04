"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type {
  WorkingHours,
  TravelBuffer,
  CalendarHealth,
  UpdateWorkingHoursResponse,
  UpdateTravelBufferResponse,
  GetCalendarHealthResponse,
  CheckAvailabilityResponse,
  DayOfWeek,
} from "@/types";

/**
 * Update working hours for a specific day
 */
export async function updateWorkingHours(
  profileId: string,
  dayOfWeek: DayOfWeek,
  startTime: string,
  endTime: string,
  isAvailable: boolean
): Promise<UpdateWorkingHoursResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    // Upsert working hours (insert or update)
    const { data, error } = await supabase
      .from("professional_working_hours")
      .upsert(
        {
          profile_id: profileId,
          day_of_week: dayOfWeek,
          start_time: startTime,
          end_time: endTime,
          is_available: isAvailable,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "profile_id,day_of_week",
        }
      )
      .select()
      .single();

    if (error) {
      console.error("Error updating working hours:", error);
      return { success: false, error: error.message };
    }

    const workingHours: WorkingHours = {
      id: data.id,
      profileId: data.profile_id,
      dayOfWeek: data.day_of_week as DayOfWeek,
      isAvailable: data.is_available,
      startTime: data.start_time,
      endTime: data.end_time,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return {
      success: true,
      workingHours,
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get all working hours for a professional
 */
export async function getWorkingHours(
  profileId: string
): Promise<{ success: boolean; workingHours?: WorkingHours[]; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("professional_working_hours")
      .select("*")
      .eq("profile_id", profileId)
      .order("day_of_week");

    if (error) {
      console.error("Error getting working hours:", error);
      return { success: false, error: error.message };
    }

    const workingHours: WorkingHours[] = data.map((item) => ({
      id: item.id,
      profileId: item.profile_id,
      dayOfWeek: item.day_of_week as DayOfWeek,
      isAvailable: item.is_available,
      startTime: item.start_time,
      endTime: item.end_time,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));

    return {
      success: true,
      workingHours,
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update travel buffer settings
 */
export async function updateTravelBuffer(
  profileId: string,
  serviceRadiusKm: number,
  serviceLat: number,
  serviceLng: number,
  travelBufferBeforeMinutes: number,
  travelBufferAfterMinutes: number,
  avgTravelSpeedKmh: number = 30
): Promise<UpdateTravelBufferResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    // Upsert travel buffer
    const { data, error } = await supabase
      .from("professional_travel_buffers")
      .upsert(
        {
          profile_id: profileId,
          service_radius_km: serviceRadiusKm,
          service_location: `POINT(${serviceLng} ${serviceLat})`, // PostGIS format: POINT(lng lat)
          travel_buffer_before_minutes: travelBufferBeforeMinutes,
          travel_buffer_after_minutes: travelBufferAfterMinutes,
          avg_travel_speed_kmh: avgTravelSpeedKmh,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "profile_id",
        }
      )
      .select()
      .single();

    if (error) {
      console.error("Error updating travel buffer:", error);
      return { success: false, error: error.message };
    }

    // Parse geography type (simplified - real implementation would use PostGIS functions)
    const travelBuffer: TravelBuffer = {
      id: data.id,
      profileId: data.profile_id,
      serviceRadiusKm: data.service_radius_km,
      serviceLocation: {
        lat: serviceLat,
        lng: serviceLng,
      },
      travelBufferBeforeMinutes: data.travel_buffer_before_minutes,
      travelBufferAfterMinutes: data.travel_buffer_after_minutes,
      avgTravelSpeedKmh: data.avg_travel_speed_kmh,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return {
      success: true,
      travelBuffer,
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get calendar health metrics for a professional
 */
export async function getCalendarHealth(
  profileId: string
): Promise<GetCalendarHealthResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    // Get working hours count
    const { data: workingHoursData, error: workingHoursError } = await supabase
      .from("professional_working_hours")
      .select("*")
      .eq("profile_id", profileId);

    if (workingHoursError) {
      return { success: false, error: workingHoursError.message };
    }

    // Get travel buffer
    const { data: travelBufferData, error: travelBufferError } = await supabase
      .from("professional_travel_buffers")
      .select("*")
      .eq("profile_id", profileId)
      .single();

    if (travelBufferError && travelBufferError.code !== "PGRST116") {
      // PGRST116 = no rows returned
      return { success: false, error: travelBufferError.message };
    }

    const hasWorkingHours = workingHoursData && workingHoursData.length > 0;
    const hasServiceRadius = !!travelBufferData?.service_radius_km;
    const hasTravelBuffers =
      !!travelBufferData?.travel_buffer_before_minutes &&
      !!travelBufferData?.travel_buffer_after_minutes;

    const availableDaysCount = workingHoursData
      ? workingHoursData.filter((h) => h.is_available).length
      : 0;

    // Calculate health score
    let healthScore = 0;
    if (hasWorkingHours) healthScore += 40;
    if (hasServiceRadius) healthScore += 30;
    if (hasTravelBuffers) healthScore += 30;

    // Generate recommendations
    const recommendations: string[] = [];
    if (!hasWorkingHours) {
      recommendations.push("Set your working hours to let customers know when you're available");
    }
    if (!hasServiceRadius) {
      recommendations.push("Define your service area to appear in location-based searches");
    }
    if (!hasTravelBuffers) {
      recommendations.push(
        "Set travel buffers to prevent double-bookings and account for travel time"
      );
    }
    if (availableDaysCount < 5) {
      recommendations.push("Add more available days to increase booking opportunities");
    }

    const health: CalendarHealth = {
      hasWorkingHours,
      hasServiceRadius,
      hasTravelBuffers,
      availableDaysCount,
      healthScore,
      recommendations,
    };

    return {
      success: true,
      health,
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Check if a professional is available at a specific time
 */
export async function checkAvailability(
  profileId: string,
  startTime: string,
  _durationMinutes: number
): Promise<CheckAvailabilityResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    const startDate = new Date(startTime);
    const dayOfWeek = startDate.getDay() as DayOfWeek;
    const timeString = startDate.toTimeString().slice(0, 5); // HH:MM

    // Check working hours
    const { data: workingHours, error: workingHoursError } = await supabase
      .from("professional_working_hours")
      .select("*")
      .eq("profile_id", profileId)
      .eq("day_of_week", dayOfWeek)
      .eq("is_available", true)
      .single();

    if (workingHoursError || !workingHours) {
      return {
        success: true,
        available: false,
        conflicts: ["Not available on this day of the week"],
      };
    }

    // Check if time falls within working hours
    if (timeString < workingHours.start_time || timeString > workingHours.end_time) {
      return {
        success: true,
        available: false,
        conflicts: ["Requested time is outside working hours"],
      };
    }

    // TODO: Check for booking conflicts (would require bookings table query)

    return {
      success: true,
      available: true,
      conflicts: [],
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
