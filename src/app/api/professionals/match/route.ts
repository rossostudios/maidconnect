/**
 * Smart Professional Matching API
 *
 * POST /api/professionals/match
 *
 * Converts natural language requirements into structured matching criteria
 * and returns best matching professionals.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAnonClient } from "@/lib/integrations/supabase/serverClient";
import {
  calculateMatchScore,
  criteriaToFilters,
  parseMatchingCriteria,
} from "@/lib/services/matching/smart-matching-service";

const requestSchema = z.object({
  query: z.string().min(1).describe("Natural language requirements"),
  locale: z.enum(["en", "es"]).optional().default("en"),
  limit: z.number().min(1).max(20).optional().default(10),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = requestSchema.parse(body);

    // Parse natural language into structured criteria
    const criteria = await parseMatchingCriteria(validated.query, validated.locale);

    // Convert to database filters
    const filters = criteriaToFilters(criteria);

    // Fetch professionals from database
    const supabase = createSupabaseAnonClient();

    let query = supabase
      .from("professional_profiles")
      .select(
        `
        id,
        full_name,
        bio,
        experience_years,
        average_rating,
        total_bookings,
        hourly_rate_cop,
        city,
        languages,
        services,
        verification_level,
        special_capabilities
      `
      )
      .eq("is_active", true);

    // Apply filters
    if (filters.city) {
      query = query.ilike("city", `%${filters.city}%`);
    }

    if (filters.minExperienceYears) {
      query = query.gte("experience_years", filters.minExperienceYears);
    }

    if (filters.maxHourlyRate) {
      query = query.lte("hourly_rate_cop", filters.maxHourlyRate);
    }

    if (filters.minRating) {
      query = query.gte("average_rating", filters.minRating);
    }

    const { data: professionals, error } = await query;

    if (error) {
      throw error;
    }

    if (!professionals || professionals.length === 0) {
      return NextResponse.json({
        success: true,
        criteria,
        matches: [],
        message: "No professionals found matching your criteria",
      });
    }

    // Calculate match scores for each professional
    const scored = professionals.map((prof) => {
      const score = calculateMatchScore(criteria, {
        skills: prof.services || [],
        languages: prof.languages || [],
        experienceYears: prof.experience_years || 0,
        rating: prof.average_rating || 0,
        hourlyRateCop: prof.hourly_rate_cop || 0,
        verificationLevel: prof.verification_level || "basic",
        specialCapabilities: prof.special_capabilities || {},
      });

      return {
        ...prof,
        matchScore: score.score,
        matchBreakdown: score.breakdown,
      };
    });

    // Sort by match score (highest first)
    scored.sort((a, b) => b.matchScore - a.matchScore);

    // Return top N matches
    const topMatches = scored.slice(0, validated.limit);

    return NextResponse.json({
      success: true,
      criteria,
      totalFound: professionals.length,
      matches: topMatches,
    });
  } catch (error) {
    console.error("Professional matching error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to match professionals" },
      { status: 500 }
    );
  }
}
