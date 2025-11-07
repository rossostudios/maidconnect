import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createAuditLog, requireAdmin } from "@/lib/admin-helpers";
import { sendAccountRestorationEmail, sendAccountSuspensionEmail } from "@/lib/email/send";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type ModerationBody = {
  userId: string;
  action: "suspend" | "unsuspend" | "ban";
  reason?: string;
  liftReason?: string;
  durationDays?: number;
  details?: Record<string, any>;
};

type UserInfo = {
  id: string;
  role: string;
  full_name: string | null;
  email: string | undefined;
  name: string;
};

/**
 * Validate request body
 */
function validateModerationRequest(body: ModerationBody): NextResponse | null {
  if (!(body.userId && body.action)) {
    return NextResponse.json({ error: "userId and action are required" }, { status: 400 });
  }

  if ((body.action === "suspend" || body.action === "ban") && !body.reason) {
    return NextResponse.json(
      { error: "reason is required for suspend/ban actions" },
      { status: 400 }
    );
  }

  return null;
}

/**
 * Get user info and validate permissions
 */
async function getUserInfo(
  supabase: SupabaseClient,
  userId: string,
  adminId: string,
  action: string
): Promise<{ user: UserInfo } | { error: NextResponse }> {
  const { data: user, error: userError } = await supabase
    .from("profiles")
    .select("id, role, full_name")
    .eq("id", userId)
    .single();

  if (userError || !user) {
    return { error: NextResponse.json({ error: "User not found" }, { status: 404 }) };
  }

  // Get user email from auth
  const { data: authUser } = await supabase.auth.admin.getUserById(userId);
  const userEmail = authUser?.user?.email;
  const userName = user.full_name || "User";

  // Prevent admin from suspending themselves
  if (user.id === adminId) {
    return {
      error: NextResponse.json({ error: "Cannot moderate your own account" }, { status: 400 }),
    };
  }

  // Prevent suspending other admins (safety measure)
  if (user.role === "admin" && action !== "unsuspend") {
    return {
      error: NextResponse.json({ error: "Cannot suspend or ban other admins" }, { status: 403 }),
    };
  }

  return {
    user: {
      ...user,
      email: userEmail,
      name: userName,
    },
  };
}

/**
 * Handle suspension action
 */
async function handleSuspend(options: {
  supabase: SupabaseClient;
  userId: string;
  adminId: string;
  reason: string;
  durationDays: number | undefined;
  details: Record<string, any> | undefined;
}) {
  // Check if already suspended
  const { data: existing } = await options.supabase
    .from("user_suspensions")
    .select("id")
    .eq("user_id", options.userId)
    .is("lifted_at", null)
    .maybeSingle();

  if (existing) {
    return { error: NextResponse.json({ error: "User is already suspended" }, { status: 400 }) };
  }

  // Calculate expiry date (default 7 days)
  const days = options.durationDays || 7;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);

  // Create suspension record
  const { data: suspension, error: suspendError } = await options.supabase
    .from("user_suspensions")
    .insert({
      user_id: options.userId,
      suspended_by: options.adminId,
      suspension_type: "temporary",
      reason: options.reason,
      expires_at: expiresAt.toISOString(),
      details: options.details || null,
    })
    .select()
    .single();

  if (suspendError) {
    return { error: NextResponse.json({ error: "Failed to suspend user" }, { status: 500 }) };
  }

  // Create audit log
  await createAuditLog({
    adminId: options.adminId,
    actionType: "suspend_user",
    targetUserId: options.userId,
    targetResourceType: "user_suspension",
    targetResourceId: suspension.id,
    details: { ...options.details, durationDays: days },
    notes: options.reason,
  });

  return { result: suspension, durationDays: days };
}

/**
 * Handle ban action
 */
async function handleBan(options: {
  supabase: SupabaseClient;
  userId: string;
  adminId: string;
  reason: string;
  details: Record<string, any> | undefined;
}) {
  // Check if already banned
  const { data: existing } = await options.supabase
    .from("user_suspensions")
    .select("id")
    .eq("user_id", options.userId)
    .eq("suspension_type", "permanent")
    .is("lifted_at", null)
    .maybeSingle();

  if (existing) {
    return { error: NextResponse.json({ error: "User is already banned" }, { status: 400 }) };
  }

  // Create permanent ban record
  const { data: ban, error: banError } = await options.supabase
    .from("user_suspensions")
    .insert({
      user_id: options.userId,
      suspended_by: options.adminId,
      suspension_type: "permanent",
      reason: options.reason,
      expires_at: null,
      details: options.details || null,
    })
    .select()
    .single();

  if (banError) {
    return { error: NextResponse.json({ error: "Failed to ban user" }, { status: 500 }) };
  }

  // Create audit log
  await createAuditLog({
    adminId: options.adminId,
    actionType: "ban_user",
    targetUserId: options.userId,
    targetResourceType: "user_suspension",
    targetResourceId: ban.id,
    details: options.details,
    notes: options.reason,
  });

  return { result: ban };
}

/**
 * Handle unsuspend action
 */
async function handleUnsuspend(
  supabase: SupabaseClient,
  userId: string,
  adminId: string,
  liftReason: string | undefined,
  details: Record<string, any> | undefined
) {
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
    return {
      error: NextResponse.json({ error: "Failed to find active suspension" }, { status: 500 }),
    };
  }

  if (!activeSuspension) {
    return {
      error: NextResponse.json(
        { error: "No active suspension found for this user" },
        { status: 404 }
      ),
    };
  }

  // Lift suspension
  const { data: lifted, error: liftError } = await supabase
    .from("user_suspensions")
    .update({
      lifted_at: new Date().toISOString(),
      lifted_by: adminId,
      lift_reason: liftReason || "Suspension lifted by admin",
    })
    .eq("id", activeSuspension.id)
    .select()
    .single();

  if (liftError) {
    return { error: NextResponse.json({ error: "Failed to unsuspend user" }, { status: 500 }) };
  }

  // Create audit log
  await createAuditLog({
    adminId,
    actionType: "unsuspend_user",
    targetUserId: userId,
    targetResourceType: "user_suspension",
    targetResourceId: activeSuspension.id,
    details,
    notes: liftReason || "Suspension lifted",
  });

  return { result: lifted };
}

/**
 * Execute moderation action based on type
 */
async function executeModerationAction(
  supabase: SupabaseClient,
  action: string,
  userId: string,
  adminId: string,
  reason: string | undefined,
  liftReason: string | undefined,
  durationDays: number | undefined,
  details: Record<string, any> | undefined
): Promise<{ result: any; durationDays?: number } | { error: NextResponse }> {
  switch (action) {
    case "suspend": {
      const result = await handleSuspend({
        supabase,
        userId,
        adminId,
        reason: reason!,
        durationDays,
        details,
      });
      if ("error" in result) {
        return result;
      }
      return { result: result.result, durationDays: result.durationDays };
    }

    case "ban": {
      const result = await handleBan({
        supabase,
        userId,
        adminId,
        reason: reason!,
        details,
      });
      if ("error" in result) {
        return result;
      }
      return { result: result.result };
    }

    case "unsuspend": {
      const result = await handleUnsuspend(supabase, userId, adminId, liftReason, details);
      if ("error" in result) {
        return result;
      }
      return { result: result.result };
    }

    default:
      return { error: NextResponse.json({ error: "Invalid action" }, { status: 400 }) };
  }
}

/**
 * Send notification email
 */
async function sendNotificationEmail(
  action: string,
  userEmail: string,
  userName: string,
  reason: string | undefined,
  liftReason: string | undefined,
  result: any,
  durationDays: number | undefined
) {
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
  } catch (emailError) {
    // Intentionally suppress email errors - notification emails are non-critical
    console.warn("Failed to send user moderation notification email:", emailError);
  }
}

/**
 * Get success message based on action
 */
function getSuccessMessage(action: string, durationDays: number | undefined): string {
  if (action === "suspend") {
    return `User suspended for ${durationDays || 7} days`;
  }
  if (action === "ban") {
    return "User permanently banned";
  }
  return "User suspension lifted";
}

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
    const body = (await request.json()) as ModerationBody;

    // Validate request
    const validationError = validateModerationRequest(body);
    if (validationError) {
      return validationError;
    }

    const { userId, action, reason, liftReason, durationDays, details } = body;

    // Get user info and validate permissions
    const userInfoResult = await getUserInfo(supabase, userId, admin.id, action);
    if ("error" in userInfoResult) {
      return userInfoResult.error;
    }
    const { user } = userInfoResult;

    // Execute moderation action
    const actionResult = await executeModerationAction(
      supabase,
      action,
      userId,
      admin.id,
      reason,
      liftReason,
      durationDays,
      details
    );
    if ("error" in actionResult) {
      return actionResult.error;
    }

    // Send email notification
    if (user.email) {
      await sendNotificationEmail(
        action,
        user.email,
        user.name,
        reason,
        liftReason,
        actionResult.result,
        actionResult.durationDays
      );
    }

    return NextResponse.json({
      success: true,
      result: actionResult.result,
      message: getSuccessMessage(action, actionResult.durationDays),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to moderate user" },
      { status: error.message === "Not authenticated" ? 401 : 500 }
    );
  }
}
