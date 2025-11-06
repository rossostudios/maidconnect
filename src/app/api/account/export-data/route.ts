import { NextResponse } from "next/server";
import {
  exportAuthMetadata,
  exportBookingsData,
  exportConversationsData,
  exportCustomerProfileData,
  exportNotificationsData,
  exportPayoutsData,
  exportProfessionalProfileData,
  exportProfileData,
  exportReviewsData,
} from "@/lib/account/data-export-service";
import { checkRateLimit, getClientIdentifier, RateLimiters } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

/**
 * Data Export API - Required by Ley 1581 de 2012 (Colombian Data Protection Law)
 *
 * Users have the right to access all their personal data stored in the platform.
 * This endpoint exports all user data in JSON format for download.
 *
 * GET /api/account/export-data
 *
 * Returns: JSON file with all user data
 */
export async function GET(request: Request) {
  try {
    // Rate limiting check (sensitive operation)
    const identifier = getClientIdentifier(request);
    const rateLimit = checkRateLimit(`export:${identifier}`, RateLimiters.sensitive);

    if (!rateLimit.allowed) {
      return NextResponse.json({ error: rateLimit.message }, { status: 429 });
    }

    const supabase = await createSupabaseServerClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    // Gather all user data using service functions to reduce complexity
    const exportData: Record<string, unknown> = {
      export_date: new Date().toISOString(),
      user_id: userId,
      export_version: "1.0",
      // Merge all exported data sections
      ...(await exportProfileData(supabase, userId)),
      ...(await exportCustomerProfileData(supabase, userId)),
      ...(await exportProfessionalProfileData(supabase, userId)),
      ...(await exportBookingsData(supabase, userId)),
      ...(await exportReviewsData(supabase, userId)),
      ...(await exportConversationsData(supabase, userId)),
      ...(await exportPayoutsData(supabase, userId)),
      ...(await exportNotificationsData(supabase, userId)),
      ...exportAuthMetadata(user),
    };

    // Return as downloadable JSON file
    const filename = `casaora_data_export_${userId}_${Date.now()}.json`;

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Data export error:", error);
    return NextResponse.json(
      { error: "Failed to export data. Please try again later." },
      { status: 500 }
    );
  }
}
