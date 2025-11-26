import { NextResponse } from "next/server";
import {
  enrichProfessionalData,
  groupDocumentsByProfessional,
  groupProfessionalsByStatus,
  groupReviewsByProfessional,
} from "@/lib/admin/professional-queue-helpers";
import { requireAdmin } from "@/lib/admin-helpers";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

// Raw professional profile with joined profile data from Supabase
type RawProfessionalProfile = {
  profile_id: string;
  full_name: string | null;
  status: string | null;
  bio: string | null;
  primary_services: string[] | null;
  experience_years: number | null;
  rate_expectations: string | null;
  languages: string[] | null;
  references_data: Record<string, unknown> | null;
  consent_background_check: boolean | null;
  stripe_connect_account_id: string | null;
  stripe_connect_onboarding_status: string | null;
  created_at: string;
  updated_at: string | null;
  profile:
    | {
        id: string;
        role: string;
        onboarding_status: string | null;
        phone: string | null;
        country: string | null;
        city: string | null;
        created_at: string;
      }
    | {
        id: string;
        role: string;
        onboarding_status: string | null;
        phone: string | null;
        country: string | null;
        city: string | null;
        created_at: string;
      }[]
    | null;
};

// Transformed professional with profile as object (not array)
type TransformedProfessional = Omit<RawProfessionalProfile, "profile"> & {
  profile: {
    id: string;
    role: string;
    onboarding_status: string | null;
    phone: string | null;
    country: string | null;
    city: string | null;
    created_at: string;
  } | null;
};

/**
 * Get professional vetting queue
 * GET /api/admin/professionals/queue
 *
 * Returns professionals awaiting review grouped by status:
 * - application_in_review: Submitted applications needing review
 * - approved: Approved but not yet active
 * - application_pending: Signed up but haven't submitted application
 *
 * Includes professional profile data, documents, and review history
 */
export async function GET(request: Request) {
  try {
    // Verify admin access
    await requireAdmin();

    const supabase = await createSupabaseServerClient();
    const url = new URL(request.url);
    const status = url.searchParams.get("status"); // Filter by specific status

    // Build query for professionals
    const professionalsQuery = supabase
      .from("professional_profiles")
      .select(
        `
        profile_id,
        full_name,
        status,
        bio,
        primary_services,
        experience_years,
        rate_expectations,
        languages,
        references_data,
        consent_background_check,
        stripe_connect_account_id,
        stripe_connect_onboarding_status,
        created_at,
        updated_at,
        profile:profiles!professional_profiles_profile_id_fkey(
          id,
          role,
          onboarding_status,
          phone,
          country,
          city,
          created_at
        )
      `
      )
      .order("created_at", { ascending: true });

    // If status filter is provided, filter by onboarding_status in profiles table
    // Otherwise, get all non-active professionals
    if (status) {
      // We need to filter by profile.onboarding_status
      // For now, fetch all and filter in memory
    }

    const { data: professionals, error: profError } = await professionalsQuery;

    if (profError) {
      return NextResponse.json({ error: "Failed to fetch professionals" }, { status: 500 });
    }

    // Transform profile from array to object (Supabase joins return arrays)
    const transformedProfessionals = ((professionals || []) as RawProfessionalProfile[]).map(
      (prof): TransformedProfessional => ({
        ...prof,
        profile: Array.isArray(prof.profile) ? prof.profile[0] : prof.profile,
      })
    );

    // Filter by onboarding_status if needed
    let filteredProfessionals = transformedProfessionals;
    if (status) {
      filteredProfessionals = filteredProfessionals.filter(
        (p) => p.profile?.onboarding_status === status
      );
    } else {
      // Only show professionals not yet active
      filteredProfessionals = filteredProfessionals.filter(
        (p) => p.profile?.onboarding_status !== "active"
      );
    }

    // Fetch documents for all professionals
    const professionalIds = filteredProfessionals.map((p) => p.profile_id);

    const { data: allDocuments } = await supabase
      .from("professional_documents")
      .select("profile_id, document_type, status, uploaded_at, metadata")
      .in("profile_id", professionalIds);

    // Fetch latest reviews for all professionals
    const { data: allReviews } = await supabase
      .from("admin_professional_reviews")
      .select(
        `
        id,
        professional_id,
        review_type,
        status,
        documents_verified,
        background_check_passed,
        references_verified,
        notes,
        rejection_reason,
        reviewed_at,
        created_at
      `
      )
      .in("professional_id", professionalIds)
      .order("created_at", { ascending: false });

    // Group data using helpers to reduce complexity
    const documentsMap = groupDocumentsByProfessional(allDocuments);
    const reviewsMap = groupReviewsByProfessional(allReviews);

    // Enrich professional data using helper
    const enrichedProfessionals = enrichProfessionalData(
      filteredProfessionals,
      documentsMap,
      reviewsMap
    );

    // Group by status using helper
    const grouped = groupProfessionalsByStatus(enrichedProfessionals);

    return NextResponse.json({
      professionals: enrichedProfessionals,
      grouped,
      counts: {
        application_in_review: grouped.application_in_review.length,
        approved: grouped.approved.length,
        application_pending: grouped.application_pending.length,
        total: enrichedProfessionals.length,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch vetting queue";
    const status = message === "Not authenticated" ? 401 : 403;
    return NextResponse.json({ error: message }, { status });
  }
}
