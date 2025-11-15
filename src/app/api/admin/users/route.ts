/**
 * Admin User Management API
 * GET /api/admin/users - List users with filters and pagination
 *
 * REFACTORED: Complexity 28 → <15
 * - Extracted query building to user-management-service.ts
 * - Route now focuses on orchestration only
 *
 * Rate Limit: 10 requests per minute (admin tier)
 */

import { NextResponse } from "next/server";
import {
  buildActiveSuspensionMap,
  buildPaginationMetadata,
  buildUserQuery,
  calculatePaginationRange,
  combineUserData,
  fetchActiveSuspensions,
  fetchUserEmails,
  filterUsersBySuspensionStatus,
  parseUserQueryParams,
} from "@/lib/admin/user-management-service";
import { requireAdmin } from "@/lib/admin-helpers";
import { withRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

async function handleGetUsers(request: Request) {
  try {
    // Verify admin access
    await requireAdmin();
    const supabase = await createSupabaseServerClient();

    // Parse query parameters using service
    const { searchParams } = new URL(request.url);
    const params = parseUserQueryParams(searchParams);

    // Calculate pagination range using service
    const { from, to } = calculatePaginationRange(params.page, params.limit);

    // Build and execute user query using service
    const profileQuery = buildUserQuery(supabase, params, from, to);
    const { data: profiles, error: profilesError, count } = await profileQuery;

    if (profilesError) {
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }

    // Handle empty results
    if (!profiles || profiles.length === 0) {
      return NextResponse.json({
        users: [],
        pagination: buildPaginationMetadata(params.page, params.limit, 0),
      });
    }

    // Fetch user emails from auth using service
    const userIds = profiles.map((p) => p.id);
    const emailMap = await fetchUserEmails(supabase, userIds);

    // Fetch active suspensions using service
    const suspensions = await fetchActiveSuspensions(supabase, userIds);
    const suspensionMap = buildActiveSuspensionMap(suspensions);

    // Combine all data using service
    let users = combineUserData(profiles, emailMap, suspensionMap);

    // Apply suspension filter using service
    users = filterUsersBySuspensionStatus(users, params.suspensionFilter);

    return NextResponse.json({
      users,
      pagination: buildPaginationMetadata(params.page, params.limit, count || 0),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch users" },
      { status: error.message === "Not authenticated" ? 401 : 500 }
    );
  }
}

// Apply rate limiting: 10 requests per minute
export const GET = withRateLimit(handleGetUsers, "admin");
