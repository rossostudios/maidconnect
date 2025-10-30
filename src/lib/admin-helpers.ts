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
export async function isAdmin(): Promise<boolean> {
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
    console.error("Failed to create audit log:", error);
    // Don't throw - audit log failure shouldn't block the operation
  }
}

/**
 * Check if a user is currently suspended or banned
 */
export async function isUserSuspended(
  userId: string
): Promise<{ suspended: boolean; reason?: string; expiresAt?: string }> {
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("user_suspensions")
    .select("suspension_type, reason, expires_at")
    .eq("user_id", userId)
    .is("lifted_at", null)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) {
    return { suspended: false };
  }

  return {
    suspended: true,
    reason: data.reason,
    expiresAt: data.expires_at || undefined,
  };
}

/**
 * Professional vetting status helper
 */
export type VettingStatus =
  | "application_pending" // Just signed up, no application submitted
  | "application_in_review" // Application submitted, awaiting admin review
  | "approved" // Documents verified, awaiting profile completion
  | "active"; // Fully onboarded and can accept bookings

export function getNextVettingStatus(currentStatus: string): VettingStatus | null {
  switch (currentStatus) {
    case "application_pending":
      return "application_in_review";
    case "application_in_review":
      return "approved";
    case "approved":
      return "active";
    default:
      return null;
  }
}

export function canProgressToStatus(currentStatus: string, targetStatus: VettingStatus): boolean {
  const statusOrder: VettingStatus[] = [
    "application_pending",
    "application_in_review",
    "approved",
    "active",
  ];

  const currentIndex = statusOrder.indexOf(currentStatus as VettingStatus);
  const targetIndex = statusOrder.indexOf(targetStatus);

  if (currentIndex === -1 || targetIndex === -1) {
    return false;
  }

  // Can only progress forward, one step at a time
  return targetIndex === currentIndex + 1;
}

/**
 * Format suspension duration for display
 */
export function formatSuspensionDuration(expiresAt?: string | null): string {
  if (!expiresAt) {
    return "Permanent";
  }

  const expires = new Date(expiresAt);
  const now = new Date();
  const diffMs = expires.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 1) {
    return "Expires today";
  } else if (diffDays === 1) {
    return "Expires tomorrow";
  } else if (diffDays < 7) {
    return `Expires in ${diffDays} days`;
  } else if (diffDays < 30) {
    return `Expires in ${Math.ceil(diffDays / 7)} weeks`;
  } else {
    return `Expires in ${Math.ceil(diffDays / 30)} months`;
  }
}
