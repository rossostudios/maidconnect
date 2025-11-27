/**
 * Admin Helper Functions
 *
 * Utilities for admin operations including:
 * - Role verification
 * - Audit logging
 * - Professional vetting workflow
 */

import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export type AdminActionType =
  | "approve_professional"
  | "reject_professional"
  | "suspend_user"
  | "unsuspend_user"
  | "ban_user"
  | "verify_document"
  | "reject_document"
  | "resolve_dispute"
  | "update_professional_status"
  | "manual_payout"
  | "other";

export type AuditLogParams = {
  adminId: string;
  actionType: AdminActionType;
  targetUserId?: string;
  targetResourceType?: string;
  targetResourceId?: string;
  details?: Record<string, any>;
  notes?: string;
};

/**
 * Verify that the current user is an admin
 * Throws error if not authenticated or not an admin
 */
export async function requireAdmin(): Promise<User> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    throw new Error("Unauthorized - admin access required");
  }

  return user;
}

/**
 * Check if a user is an admin (non-throwing version)
 */
async function isAdmin(): Promise<boolean> {
  try {
    await requireAdmin();
    return true;
  } catch {
    return false;
  }
}

/**
 * Create an audit log entry for an admin action
 */
export async function createAuditLog(params: AuditLogParams): Promise<void> {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("admin_audit_logs").insert({
    admin_id: params.adminId,
    action_type: params.actionType,
    target_user_id: params.targetUserId || null,
    target_resource_type: params.targetResourceType || null,
    target_resource_id: params.targetResourceId || null,
    details: params.details || null,
    notes: params.notes || null,
  });

  if (error) {
    // Don't throw - audit log failure shouldn't block the operation
  }
}
