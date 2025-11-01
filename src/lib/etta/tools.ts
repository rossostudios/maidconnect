/**
 * Etta AI Tools
 *
 * Defines the tools/functions that Etta can use to interact with
 * the MaidConnect platform (search professionals, check availability, etc.)
 */

import { tool } from "ai";
import { z } from "zod";
import { formatLocation, parseServices } from "@/lib/professionals/transformers";
import { createSupabaseAnonClient } from "@/lib/supabase/server-client";

/**
 * Tool: Search for cleaning professionals
 *
 * Searches the MaidConnect database for professionals matching the criteria.
 * Returns top 3 matches with basic info, ratings, and pricing.
 */
export const searchProfessionalsTool = tool({
  description:
    "Search for cleaning professionals in Colombia based on service type, location, budget, and other criteria. Returns top 3 matches.",
  inputSchema: z.object({
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
    maxBudgetCop: z
      .number()
      .optional()
      .describe("Maximum budget in Colombian Pesos (COP) per hour"),
    minRating: z.number().min(0).max(5).optional().describe("Minimum average rating (0-5)"),
    languages: z
      .array(z.string())
      .optional()
      .describe('Preferred languages (e.g., ["English", "Spanish"])'),
  }),
  execute: async ({ serviceType, city, maxBudgetCop, minRating, languages }) => {
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
        };
      }

      if (!data || data.length === 0) {
        return {
          success: true,
          message: "No professionals found matching your criteria",
          professionals: [],
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
          name: row.full_name || "MaidConnect Professional",
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
        if (b.rating !== a.rating) return b.rating - a.rating;
        return b.reviewCount - a.reviewCount;
      });

      const topProfessionals = professionals.slice(0, 3);

      return {
        success: true,
        count: topProfessionals.length,
        totalFound: professionals.length,
        professionals: topProfessionals,
      };
    } catch (error) {
      console.error("Error in searchProfessionalsTool:", error);
      return {
        success: false,
        error: "An unexpected error occurred while searching",
        professionals: [],
      };
    }
  },
});

/**
 * Tool: Check professional availability
 *
 * Checks a specific professional's availability for a date range.
 */
export const checkAvailabilityTool = tool({
  description:
    "Check availability for a specific professional on specific dates. Returns available dates and time slots.",
  inputSchema: z.object({
    professionalId: z.string().describe("The professional ID to check availability for"),
    startDate: z.string().describe('Start date in YYYY-MM-DD format (e.g., "2025-01-15")'),
    endDate: z
      .string()
      .optional()
      .describe(
        'End date in YYYY-MM-DD format (e.g., "2025-01-22"). Defaults to 7 days from start.'
      ),
  }),
  execute: async ({ professionalId, startDate, endDate }) => {
    try {
      // Calculate end date if not provided (7 days from start)
      const end =
        endDate ||
        new Date(new Date(startDate).getTime() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];

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
      console.error("Error in checkAvailabilityTool:", error);
      return {
        success: false,
        error: "An unexpected error occurred while checking availability",
      };
    }
  },
});

/**
 * Tool: Create booking draft
 *
 * Creates a draft booking for the user to review and confirm.
 * Does NOT actually create the booking - just returns all the details.
 */
export const createBookingDraftTool = tool({
  description:
    "Create a draft booking with all details for the user to review. This does NOT create the actual booking - it just prepares the information.",
  inputSchema: z.object({
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
  }),
  execute: async ({
    professionalId,
    professionalName,
    serviceName,
    scheduledStart,
    durationHours,
    hourlyRateCop,
    address,
    specialInstructions,
  }) => {
    try {
      // Calculate total cost
      const durationMinutes = durationHours * 60;
      const estimatedCostCop = hourlyRateCop * durationHours;

      // Calculate end time
      const startDate = new Date(scheduledStart);
      const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

      // Format for display
      const formattedDate = startDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const formattedTime = startDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

      return {
        success: true,
        isDraft: true, // Important: This is just a draft
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
          // Formatted display values
          display: {
            date: formattedDate,
            time: formattedTime,
            duration: `${durationHours} hour${durationHours > 1 ? "s" : ""}`,
            cost: `${estimatedCostCop.toLocaleString("en-US")} COP`,
            hourlyRate: `${hourlyRateCop.toLocaleString("en-US")} COP/hour`,
          },
        },
        nextSteps: [
          "Review all booking details carefully",
          "Provide or confirm the service address",
          'Click "Confirm Booking" to proceed to payment authorization',
          "You will authorize payment (not charged until service is complete)",
          "Receive confirmation and professional contact details",
        ],
      };
    } catch (error) {
      console.error("Error in createBookingDraftTool:", error);
      return {
        success: false,
        error: "Failed to create booking draft",
      };
    }
  },
});

/**
 * Export all tools as a collection
 */
export const ettaTools = {
  searchProfessionals: searchProfessionalsTool,
  checkAvailability: checkAvailabilityTool,
  createBookingDraft: createBookingDraftTool,
};
