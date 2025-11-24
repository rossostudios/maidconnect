import { NextResponse } from "next/server";
import { createAuditLog, requireAdmin } from "@/lib/admin-helpers";
import { withRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type BulkVerifyBody = {
  user_ids: string[];
  approved: boolean;
};

type OperationResult = {
  userId: string;
  success: boolean;
  error?: string;
};

/**
 * Bulk Verify Professionals
 * POST /api/admin/bulk/verify
 *
 * Verifies multiple professional users in a single operation.
 * Only processes users with role="professional".
 *
 * Body:
 * - user_ids: string[] (required, max 50 users)
 * - approved: boolean (required, typically true for bulk approval)
 *
 * Rate Limit: 5 requests per minute (admin tier)
 */
async function handleBulkVerify(request: Request) {
  try {
    // Verify admin access
    const admin = await requireAdmin();
    const supabase = await createSupabaseServerClient();
    const body = (await request.json()) as BulkVerifyBody;

    // Validate request body
    if (!(body.user_ids && Array.isArray(body.user_ids)) || body.user_ids.length === 0) {
      return NextResponse.json({ error: "user_ids array is required" }, { status: 400 });
    }

    if (body.user_ids.length > 50) {
      return NextResponse.json(
        { error: "Maximum 50 professionals can be verified at once" },
        { status: 400 }
      );
    }

    if (typeof body.approved !== "boolean") {
      return NextResponse.json(
        { error: "approved field is required and must be boolean" },
        { status: 400 }
      );
    }

    const results: OperationResult[] = [];
    let successful = 0;
    let failed = 0;

    // Process each user
    for (const userId of body.user_ids) {
      try {
        // Get user and validate they are a professional
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

        if (user.role !== "professional") {
          results.push({
            userId,
            success: false,
            error: "User is not a professional",
          });
          failed++;
          continue;
        }

        // Get or create professional profile
        const { data: professionalProfile, error: profileError } = await supabase
          .from("professional_profiles")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();

        if (profileError) {
          results.push({
            userId,
            success: false,
            error: "Failed to fetch professional profile",
          });
          failed++;
          continue;
        }

        // Update or create professional profile with verification status
        if (professionalProfile) {
          // Update existing profile
          const { error: updateError } = await supabase
            .from("professional_profiles")
            .update({
              is_verified: body.approved,
              verified_at: body.approved ? new Date().toISOString() : null,
              verified_by: body.approved ? admin.id : null,
              verification_notes: "Bulk verification operation",
              updated_at: new Date().toISOString(),
            })
            .eq("id", professionalProfile.id);

          if (updateError) {
            results.push({
              userId,
              success: false,
              error: "Failed to update professional profile",
            });
            failed++;
            continue;
          }
        } else {
          // Create new professional profile
          const { error: createError } = await supabase.from("professional_profiles").insert({
            user_id: userId,
            is_verified: body.approved,
            verified_at: body.approved ? new Date().toISOString() : null,
            verified_by: body.approved ? admin.id : null,
            verification_notes: "Bulk verification operation",
          });

          if (createError) {
            results.push({
              userId,
              success: false,
              error: "Failed to create professional profile",
            });
            failed++;
            continue;
          }
        }

        // Create audit log
        await createAuditLog({
          adminId: admin.id,
          actionType: body.approved ? "verify_professional" : "reject_verification",
          targetUserId: userId,
          targetResourceType: "professional_profile",
          targetResourceId: professionalProfile?.id || null,
          details: {
            bulk_operation: true,
          },
          notes: `Bulk verification: ${body.approved ? "approved" : "rejected"}`,
        });

        results.push({
          userId,
          success: true,
        });
        successful++;
      } catch (error) {
        console.error(`[Admin] Failed to verify user ${userId}:`, error);
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
    console.error("[Admin] Bulk verify error:", error);
    const message = error instanceof Error ? error.message : "Failed to process bulk verification";
    const status = message === "Not authenticated" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

// Apply rate limiting: 5 requests per minute (more restrictive for bulk operations)
export const POST = withRateLimit(handleBulkVerify, "admin", 5);
