import { NextResponse } from "next/server";
import { createAuditLog, requireAdmin } from "@/lib/admin-helpers";
import { sendAccountRestorationEmail, sendAccountSuspensionEmail } from "@/lib/email/send";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * User moderation actions
 * POST /api/admin/users/moderate
 *
 * Body:
 * - userId: string (required)
 * - action: 'suspend' | 'unsuspend' | 'ban' (required)
 * - reason: string (required for suspend/ban)
 * - durationDays: number (optional, for temporary suspensions)
 * - details: object (optional) - Additional context
 *
 * Actions:
 * - suspend: Temporarily suspend user (default 7 days)
 * - ban: Permanently ban user
 * - unsuspend: Lift active suspension
 */
export async function POST(request: Request) {
  try {
    // Verify admin access
    const admin = await requireAdmin();

    const supabase = await createSupabaseServerClient();

    const body = (await request.json()) as {
      userId: string;
      action: "suspend" | "unsuspend" | "ban";
      reason?: string;
      liftReason?: string;
      durationDays?: number;
      details?: Record<string, any>;
    };

    const { userId, action, reason, liftReason, durationDays, details } = body;

    if (!(userId && action)) {
      return NextResponse.json({ error: "userId and action are required" }, { status: 400 });
    }

    if ((action === "suspend" || action === "ban") && !reason) {
      return NextResponse.json(
        { error: "reason is required for suspend/ban actions" },
        { status: 400 }
      );
    }

    // Verify user exists and get email
    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("id, role, full_name")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user email from auth
    const { data: authUser } = await supabase.auth.admin.getUserById(userId);
    const userEmail = authUser?.user?.email;
    const userName = user.full_name || "User";

    // Prevent admin from suspending themselves
    if (user.id === admin.id) {
      return NextResponse.json({ error: "Cannot moderate your own account" }, { status: 400 });
    }

    // Prevent suspending other admins (safety measure)
    if (user.role === "admin" && action !== "unsuspend") {
      return NextResponse.json({ error: "Cannot suspend or ban other admins" }, { status: 403 });
    }

    let result: any;

    switch (action) {
      case "suspend": {
        // Check if already suspended
        const { data: existing } = await supabase
          .from("user_suspensions")
          .select("id")
          .eq("user_id", userId)
          .is("lifted_at", null)
          .maybeSingle();

        if (existing) {
          return NextResponse.json({ error: "User is already suspended" }, { status: 400 });
        }

        // Calculate expiry date (default 7 days)
        const days = durationDays || 7;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + days);

        // Create suspension record
        const { data: suspension, error: suspendError } = await supabase
          .from("user_suspensions")
          .insert({
            user_id: userId,
            suspended_by: admin.id,
            suspension_type: "temporary",
            reason: reason!,
            expires_at: expiresAt.toISOString(),
            details: details || null,
          })
          .select()
          .single();

        if (suspendError) {
          return NextResponse.json({ error: "Failed to suspend user" }, { status: 500 });
        }

        result = suspension;

        // Create audit log
        await createAuditLog({
          adminId: admin.id,
          actionType: "suspend_user",
          targetUserId: userId,
          targetResourceType: "user_suspension",
          targetResourceId: suspension.id,
          details: { ...details, durationDays: days },
          notes: reason,
        });

        break;
      }

      case "ban": {
        // Check if already banned
        const { data: existing } = await supabase
          .from("user_suspensions")
          .select("id")
          .eq("user_id", userId)
          .eq("suspension_type", "permanent")
          .is("lifted_at", null)
          .maybeSingle();

        if (existing) {
          return NextResponse.json({ error: "User is already banned" }, { status: 400 });
        }

        // Create permanent ban record
        const { data: ban, error: banError } = await supabase
          .from("user_suspensions")
          .insert({
            user_id: userId,
            suspended_by: admin.id,
            suspension_type: "permanent",
            reason: reason!,
            expires_at: null, // Permanent
            details: details || null,
          })
          .select()
          .single();

        if (banError) {
          return NextResponse.json({ error: "Failed to ban user" }, { status: 500 });
        }

        result = ban;

        // Create audit log
        await createAuditLog({
          adminId: admin.id,
          actionType: "ban_user",
          targetUserId: userId,
          targetResourceType: "user_suspension",
          targetResourceId: ban.id,
          details,
          notes: reason,
        });

        break;
      }

      case "unsuspend": {
        // Find active suspension
        const { data: activeSuspension, error: findError } = await supabase
          .from("user_suspensions")
          .select("id")
          .eq("user_id", userId)
          .is("lifted_at", null)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (findError) {
          return NextResponse.json({ error: "Failed to find active suspension" }, { status: 500 });
        }

        if (!activeSuspension) {
          return NextResponse.json(
            { error: "No active suspension found for this user" },
            { status: 404 }
          );
        }

        // Lift suspension
        const { data: lifted, error: liftError } = await supabase
          .from("user_suspensions")
          .update({
            lifted_at: new Date().toISOString(),
            lifted_by: admin.id,
            lift_reason: liftReason || "Suspension lifted by admin",
          })
          .eq("id", activeSuspension.id)
          .select()
          .single();

        if (liftError) {
          return NextResponse.json({ error: "Failed to unsuspend user" }, { status: 500 });
        }

        result = lifted;

        // Create audit log
        await createAuditLog({
          adminId: admin.id,
          actionType: "unsuspend_user",
          targetUserId: userId,
          targetResourceType: "user_suspension",
          targetResourceId: activeSuspension.id,
          details,
          notes: liftReason || "Suspension lifted",
        });

        break;
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Send email notification to user
    if (userEmail) {
      try {
        if (action === "suspend" || action === "ban") {
          const expiresAt = action === "suspend" && result.expires_at ? result.expires_at : null;
          await sendAccountSuspensionEmail(userEmail, userName, reason!, expiresAt, durationDays);
        } else if (action === "unsuspend") {
          await sendAccountRestorationEmail(
            userEmail,
            userName,
            liftReason || "Suspension lifted by admin"
          );
        }
      } catch (_emailError) {}
    }

    return NextResponse.json({
      success: true,
      result,
      message:
        action === "suspend"
          ? `User suspended for ${durationDays || 7} days`
          : action === "ban"
            ? "User permanently banned"
            : "User suspension lifted",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to moderate user" },
      { status: error.message === "Not authenticated" ? 401 : 500 }
    );
  }
}
