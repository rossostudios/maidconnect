/**
 * Amara AI Tools (RSC-Compatible)
 *
 * Tools for streamUI that return React components instead of JSON data.
 * These tools render interactive UI elements directly in the chat stream.
 */

import { z } from "zod";
import { formatLocation, parseServices } from "@/lib/professionals/transformers";
import { createSupabaseAnonClient } from "@/lib/supabase/server-client";

/**
 * Type for professional data returned from database
 */
type ProfessionalData = {
  id: string;
  name: string;
  service: string | null;
  experienceYears: number;
  hourlyRateCop: number | null;
  languages: string[];
  city: string | null;
  country: string | null;
  location: string;
  bio: string | null;
  rating: number;
  reviewCount: number;
  onTimeRate: number;
  totalCompletedBookings: number;
  verificationLevel: string;
  avatar_url?: string | null;
};

/**
 * Search professionals tool schema
 */
export const searchProfessionalsSchema = z.object({
  serviceType: z
    .string()
    .optional()
    .describe(
      'Type of cleaning service needed (e.g., "deep cleaning", "regular cleaning", "move-out cleaning")'
    ),
  city: z
    .string()
    .optional()
    .describe('City where service is needed (e.g., "Medellín", "Bogotá", "Cali")'),
  maxBudgetCop: z.number().optional().describe("Maximum budget in Colombian Pesos (COP) per hour"),
  minRating: z.number().min(0).max(5).optional().describe("Minimum average rating (0-5)"),
  languages: z
    .array(z.string())
    .optional()
    .describe('Preferred languages (e.g., ["English", "Spanish"])'),
});

/**
 * Check availability tool schema
 */
export const checkAvailabilitySchema = z.object({
  professionalId: z.string().describe("The professional ID to check availability for"),
  startDate: z.string().describe('Start date in YYYY-MM-DD format (e.g., "2025-01-15")'),
  endDate: z
    .string()
    .optional()
    .describe('End date in YYYY-MM-DD format (e.g., "2025-01-22"). Defaults to 7 days from start.'),
});

/**
 * Create booking draft tool schema
 */
export const createBookingDraftSchema = z.object({
  professionalId: z.string().describe("The professional ID to book"),
  professionalName: z.string().describe("The professional name"),
  serviceName: z.string().describe('Name of the service (e.g., "Deep Cleaning")'),
  scheduledStart: z
    .string()
    .describe("When the service should start (ISO format: YYYY-MM-DDTHH:mm:ssZ)"),
  durationHours: z.number().min(1).max(8).describe("Duration of service in hours (1-8)"),
  hourlyRateCop: z.number().describe("Hourly rate in Colombian Pesos"),
  address: z.string().optional().describe("Service address (street, city, neighborhood)"),
  specialInstructions: z.string().optional().describe("Any special instructions or requirements"),
});

/**
 * Search for professionals (returns professional data)
 */
export async function searchProfessionalsAction({
  serviceType,
  city,
  maxBudgetCop,
  minRating,
  languages,
}: z.infer<typeof searchProfessionalsSchema>): Promise<{
  success: boolean;
  professionals: ProfessionalData[];
  totalFound: number;
  error?: string;
}> {
  "use server";

  try {
    const supabase = createSupabaseAnonClient();

    // Call the list_active_professionals stored procedure
    const { data, error } = await supabase.rpc("list_active_professionals", {
      p_customer_lat: null,
      p_customer_lon: null,
    });

    if (error) {
      console.error("Error searching professionals:", error);
      return {
        success: false,
        error: "Failed to search professionals",
        professionals: [],
        totalFound: 0,
      };
    }

    if (!data || data.length === 0) {
      return {
        success: true,
        professionals: [],
        totalFound: 0,
      };
    }

    // Transform and filter results
    let professionals = data.map((row: any) => {
      const services = parseServices(row.services);
      const primaryService =
        services.find((s) => s.name)?.name || row.primary_services?.[0] || null;
      const hourlyRate =
        services.find((s) => typeof s.hourlyRateCop === "number")?.hourlyRateCop || null;

      return {
        id: row.profile_id,
        name: row.full_name || "Casaora Professional",
        service: primaryService,
        experienceYears: row.experience_years || 0,
        hourlyRateCop: hourlyRate,
        languages: Array.isArray(row.languages) ? row.languages : [],
        city: row.city,
        country: row.country,
        location: formatLocation(row.city, row.country) || "Colombia",
        bio: row.bio,
        rating: row.rating || 0,
        reviewCount: row.review_count || 0,
        onTimeRate: row.on_time_rate || 0,
        totalCompletedBookings: row.total_completed_bookings || 0,
        verificationLevel: row.verification_level || "none",
        avatar_url: row.avatar_url || null,
      };
    });

    // Apply filters
    if (city) {
      professionals = professionals.filter((p: any) =>
        p.city?.toLowerCase().includes(city.toLowerCase())
      );
    }

    if (serviceType) {
      professionals = professionals.filter((p: any) =>
        p.service?.toLowerCase().includes(serviceType.toLowerCase())
      );
    }

    if (maxBudgetCop) {
      professionals = professionals.filter(
        (p: any) => !p.hourlyRateCop || p.hourlyRateCop <= maxBudgetCop
      );
    }

    if (minRating) {
      professionals = professionals.filter((p: any) => p.rating >= minRating);
    }

    if (languages && languages.length > 0) {
      professionals = professionals.filter((p: any) =>
        languages.some((lang: string) =>
          p.languages.some((pLang: string) => pLang.toLowerCase().includes(lang.toLowerCase()))
        )
      );
    }

    // Sort by rating and review count, then take top 3
    professionals.sort((a: any, b: any) => {
      if (b.rating !== a.rating) {
        return b.rating - a.rating;
      }
      return b.reviewCount - a.reviewCount;
    });

    const topProfessionals = professionals.slice(0, 3);

    return {
      success: true,
      professionals: topProfessionals,
      totalFound: professionals.length,
    };
  } catch (error) {
    console.error("Error in searchProfessionalsAction:", error);
    return {
      success: false,
      error: "An unexpected error occurred while searching",
      professionals: [],
      totalFound: 0,
    };
  }
}

/**
 * Check availability (returns availability data)
 */
export async function checkAvailabilityAction({
  professionalId,
  startDate,
  endDate,
}: z.infer<typeof checkAvailabilitySchema>): Promise<{
  success: boolean;
  professionalId: string;
  startDate: string;
  endDate: string;
  availability?: any[];
  instantBooking?: any;
  error?: string;
}> {
  "use server";

  try {
    // Calculate end date if not provided (7 days from start)
    const end =
      endDate ||
      new Date(new Date(startDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    // Fetch availability from the API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/professionals/${professionalId}/availability?startDate=${startDate}&endDate=${end}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      return {
        success: false,
        error: "Failed to fetch availability",
        professionalId,
        startDate,
        endDate: end,
      };
    }

    const data = await response.json();

    return {
      success: true,
      professionalId,
      startDate,
      endDate: end,
      availability: data.availability || [],
      instantBooking: data.instantBooking || null,
    };
  } catch (error) {
    console.error("Error in checkAvailabilityAction:", error);
    return {
      success: false,
      error: "An unexpected error occurred while checking availability",
      professionalId,
      startDate,
      endDate: endDate || startDate,
    };
  }
}

/**
 * Create booking draft (returns draft data)
 */
export async function createBookingDraftAction({
  professionalId,
  professionalName,
  serviceName,
  scheduledStart,
  durationHours,
  hourlyRateCop,
  address,
  specialInstructions,
}: z.infer<typeof createBookingDraftSchema>): Promise<{
  success: boolean;
  isDraft: boolean;
  bookingDraft?: any;
  error?: string;
}> {
  "use server";

  try {
    // Calculate total cost
    const durationMinutes = durationHours * 60;
    const estimatedCostCop = hourlyRateCop * durationHours;

    // Calculate end time
    const startDate = new Date(scheduledStart);
    const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

    return {
      success: true,
      isDraft: true,
      bookingDraft: {
        professionalId,
        professionalName,
        serviceName,
        scheduledStart,
        scheduledEnd: endDate.toISOString(),
        durationHours,
        durationMinutes,
        hourlyRateCop,
        estimatedCostCop,
        address: address || "To be provided",
        specialInstructions: specialInstructions || "None",
      },
    };
  } catch (error) {
    console.error("Error in createBookingDraftAction:", error);
    return {
      success: false,
      isDraft: false,
      error: "Failed to create booking draft",
    };
  }
}

/**
 * Export tool schemas for streamUI
 */
export const amaraToolSchemas = {
  searchProfessionals: searchProfessionalsSchema,
  checkAvailability: checkAvailabilitySchema,
  createBookingDraft: createBookingDraftSchema,
};

/**
 * Export tool actions
 */
export const amaraToolActions = {
  searchProfessionals: searchProfessionalsAction,
  checkAvailability: checkAvailabilityAction,
  createBookingDraft: createBookingDraftAction,
};
