import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-helpers";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export const runtime = "edge";
export const dynamic = "force-dynamic";

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

    // Filter by onboarding_status if needed
    let filteredProfessionals = professionals || [];
    if (status) {
      filteredProfessionals = filteredProfessionals.filter(
        (p: any) => p.profile?.onboarding_status === status
      );
    } else {
      // Only show professionals not yet active
      filteredProfessionals = filteredProfessionals.filter(
        (p: any) => p.profile?.onboarding_status !== "active"
      );
    }

    // Fetch documents for all professionals
    const professionalIds = filteredProfessionals.map((p: any) => p.profile_id);

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

    // Group data by professional
    const documentsMap = new Map<string, any[]>();
    for (const doc of allDocuments || []) {
      if (!documentsMap.has(doc.profile_id)) {
        documentsMap.set(doc.profile_id, []);
      }
      documentsMap.get(doc.profile_id)!.push(doc);
    }

    const reviewsMap = new Map<string, any[]>();
    for (const review of allReviews || []) {
      if (!reviewsMap.has(review.professional_id)) {
        reviewsMap.set(review.professional_id, []);
      }
      reviewsMap.get(review.professional_id)!.push(review);
    }

    // Combine data
    const enrichedProfessionals = filteredProfessionals.map((prof: any) => {
      const documents = documentsMap.get(prof.profile_id) || [];
      const reviews = reviewsMap.get(prof.profile_id) || [];

      return {
        ...prof,
        documents,
        reviews,
        email: null, // We don't have access to auth.users.email in this query
        documentsCount: documents.length,
        latestReview: reviews[0] || null,
        waitingDays: Math.floor(
          (Date.now() - new Date(prof.created_at).getTime()) / (1000 * 60 * 60 * 24)
        ),
      };
    });

    // Group by onboarding status
    const grouped = {
      application_in_review: enrichedProfessionals.filter(
        (p: any) => p.profile?.onboarding_status === "application_in_review"
      ),
      approved: enrichedProfessionals.filter(
        (p: any) => p.profile?.onboarding_status === "approved"
      ),
      application_pending: enrichedProfessionals.filter(
        (p: any) => p.profile?.onboarding_status === "application_pending"
      ),
    };

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
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch vetting queue" },
      { status: error.message === "Not authenticated" ? 401 : 403 }
    );
  }
}
