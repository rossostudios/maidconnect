import { NextResponse } from "next/server";
import { createAuditLog, requireAdmin } from "@/lib/admin-helpers";
import { withRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type BulkSuspendBody = {
  user_ids: string[];
  reason: string;
  type: "temporary" | "permanent";
  expires_at?: string | null;
};

type OperationResult = {
  userId: string;
  success: boolean;
  error?: string;
};

/**
 * Bulk Suspend Users
 * POST /api/admin/bulk/suspend
 *
 * Suspends multiple users in a single operation.
 * Returns detailed results for each user processed.
 *
 * Body:
 * - user_ids: string[] (required, max 100 users)
 * - reason: string (required)
 * - type: "temporary" | "permanent" (required)
 * - expires_at?: string (required for temporary suspensions)
 *
 * Rate Limit: 5 requests per minute (admin tier)
 */
async function handleBulkSuspend(request: Request) {
  try {
    // Verify admin access
    const admin = await requireAdmin();
    const supabase = await createSupabaseServerClient();
    const body = (await request.json()) as BulkSuspendBody;

    // Validate request body
    if (!(body.user_ids && Array.isArray(body.user_ids)) || body.user_ids.length === 0) {
      return NextResponse.json({ error: "user_ids array is required" }, { status: 400 });
    }

    if (body.user_ids.length > 100) {
      return NextResponse.json(
        { error: "Maximum 100 users can be processed at once" },
        { status: 400 }
      );
    }

    if (!body.reason?.trim()) {
      return NextResponse.json({ error: "Reason is required" }, { status: 400 });
    }

    if (!["temporary", "permanent"].includes(body.type)) {
      return NextResponse.json(
        { error: "Type must be 'temporary' or 'permanent'" },
        { status: 400 }
      );
    }

    if (body.type === "temporary" && !body.expires_at) {
      return NextResponse.json(
        { error: "expires_at is required for temporary suspensions" },
        { status: 400 }
      );
    }

    const results: OperationResult[] = [];
    let successful = 0;
    let failed = 0;

    // Process each user
    for (const userId of body.user_ids) {
      try {
        // Get user and validate
        const { data: user, error: userError } = await supabase
          .from("profiles")
          .select("id, role")
          .eq("id", userId)
          .single();

        if (userError || !user) {
          results.push({
            userId,
            success: false,
            error: "User not found",
          });
          failed++;
          continue;
        }

        // Prevent suspending admins
        if (user.role === "admin") {
          results.push({
            userId,
            success: false,
            error: "Cannot suspend admin users",
          });
          failed++;
          continue;
        }

        // Prevent admin from suspending themselves
        if (user.id === admin.id) {
          results.push({
            userId,
            success: false,
            error: "Cannot suspend your own account",
          });
          failed++;
          continue;
        }

        // Check if already suspended
        const { data: existing } = await supabase
          .from("user_suspensions")
          .select("id")
          .eq("user_id", userId)
          .is("lifted_at", null)
          .maybeSingle();

        if (existing) {
          results.push({
            userId,
            success: false,
            error: "User is already suspended",
          });
          failed++;
          continue;
        }

        // Create suspension record
        const { data: suspension, error: suspendError } = await supabase
          .from("user_suspensions")
          .insert({
            user_id: userId,
            suspended_by: admin.id,
            suspension_type: body.type,
            reason: body.reason,
            expires_at: body.type === "temporary" ? body.expires_at : null,
          })
          .select()
          .single();

        if (suspendError) {
          results.push({
            userId,
            success: false,
            error: "Failed to create suspension record",
          });
          failed++;
          continue;
        }

        // Create audit log
        await createAuditLog({
          adminId: admin.id,
          actionType: body.type === "permanent" ? "ban_user" : "suspend_user",
          targetUserId: userId,
          targetResourceType: "user_suspension",
          targetResourceId: suspension.id,
          details: {
            type: body.type,
            expires_at: body.expires_at || null,
            bulk_operation: true,
          },
          notes: `Bulk ${body.type} suspension: ${body.reason}`,
        });

        results.push({
          userId,
          success: true,
        });
        successful++;
      } catch (error) {
        console.error(`[Admin] Failed to suspend user ${userId}:`, error);
        results.push({
          userId,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        failed++;
      }
    }

    // Return summary
    return NextResponse.json({
      success: true,
      total: body.user_ids.length,
      successful,
      failed,
      results,
      errors: results.filter((r) => !r.success).map((r) => ({ userId: r.userId, error: r.error })),
    });
  } catch (error: unknown) {
    console.error("[Admin] Bulk suspend error:", error);
    const message = error instanceof Error ? error.message : "Failed to process bulk suspension";
    const status = message === "Not authenticated" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

// Apply rate limiting: 5 requests per minute (more restrictive for bulk operations)
export const POST = withRateLimit(handleBulkSuspend, "admin", 5);
