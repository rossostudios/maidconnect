import type {
  Professional,
  ProfessionalListResponse,
  ProfessionalSearchParams,
} from "@/types/api/professional";
import { supabase } from "../supabase";

/**
 * Search and fetch professionals
 */
export async function searchProfessionals(
  params: ProfessionalSearchParams = {}
): Promise<ProfessionalListResponse> {
  try {
    const {
      service,
      city,
      country_code,
      min_rating,
      max_hourly_rate_cents,
      verified_only = false,
      limit = 20,
      offset = 0,
    } = params;

    let query = supabase
      .from("professional_profiles")
      .select("*", { count: "exact" })
      .eq("status", "active")
      .order("rating", { ascending: false });

    // Apply filters
    if (service) {
      query = query.contains("services", [service]);
    }

    if (city) {
      query = query.eq("city", city);
    }

    if (country_code) {
      query = query.eq("country_code", country_code);
    }

    if (min_rating) {
      query = query.gte("rating", min_rating);
    }

    if (max_hourly_rate_cents) {
      query = query.lte("hourly_rate_cents", max_hourly_rate_cents);
    }

    if (verified_only) {
      query = query.eq("verified", true);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      professionals: (data || []) as Professional[],
      total_count: count || 0,
      has_more: count ? offset + limit < count : false,
    };
  } catch (error) {
    console.error("[searchProfessionals] Error:", error);
    throw error;
  }
}

/**
 * Get professional by ID
 */
export async function getProfessionalById(id: string): Promise<Professional | null> {
  try {
    const { data, error } = await supabase
      .from("professional_profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return data as Professional;
  } catch (error) {
    console.error("[getProfessionalById] Error:", error);
    throw error;
  }
}

/**
 * Get featured professionals
 */
export async function getFeaturedProfessionals(limit = 10): Promise<Professional[]> {
  try {
    const { data, error } = await supabase
      .from("professional_profiles")
      .select("*")
      .eq("status", "active")
      .eq("verified", true)
      .gte("rating", 4.5)
      .order("rating", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []) as Professional[];
  } catch (error) {
    console.error("[getFeaturedProfessionals] Error:", error);
    return [];
  }
}
