/**
 * User Management Service - Business logic for admin user management
 *
 * Extracts user filtering, suspension checking, and data aggregation logic
 * to reduce route complexity and improve testability.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export type UserRole = "customer" | "professional" | "admin";
export type SuspensionFilter = "all" | "active" | "suspended" | "banned";

export type UserQueryParams = {
  page: number;
  limit: number;
  role: UserRole | null;
  suspensionFilter: SuspensionFilter;
  search: string;
};

export type UserProfile = {
  id: string;
  full_name: string | null;
  role: string;
  avatar_url: string | null;
  city: string | null;
  created_at: string;
};

export type UserSuspension = {
  user_id: string;
  suspension_type: "temporary" | "permanent";
  reason: string;
  expires_at: string | null;
  created_at: string;
};

export type CombinedUser = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  avatar_url: string | null;
  city: string | null;
  created_at: string;
  suspension: {
    type: "temporary" | "permanent";
    reason: string;
    expires_at: string | null;
  } | null;
};

export type PaginationMetadata = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

/**
 * Parse and validate query parameters for user filtering
 */
export function parseUserQueryParams(searchParams: URLSearchParams): UserQueryParams {
  const page = Number.parseInt(searchParams.get("page") || "1", 10);
  const limit = Number.parseInt(searchParams.get("limit") || "20", 10);
  const role = searchParams.get("role") as UserRole | null;
  const suspensionFilter = (searchParams.get("suspensionFilter") || "all") as SuspensionFilter;
  const search = searchParams.get("search") || "";

  return { page, limit, role, suspensionFilter, search };
}

/**
 * Calculate pagination range (from, to)
 */
export function calculatePaginationRange(
  page: number,
  limit: number
): { from: number; to: number } {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  return { from, to };
}

/**
 * Build user query with filters and pagination
 */
export function buildUserQuery(
  supabase: SupabaseClient,
  params: UserQueryParams,
  from: number,
  to: number
) {
  let query = supabase
    .from("profiles")
    .select("id, full_name, role, avatar_url, city, created_at", { count: "exact" });

  // Apply role filter
  if (params.role) {
    query = query.eq("role", params.role);
  }

  // Apply search filter (search by name)
  if (params.search) {
    query = query.ilike("full_name", `%${params.search}%`);
  }

  // Apply pagination
  query = query.range(from, to).order("created_at", { ascending: false });

  return query;
}

/**
 * Fetch user emails from auth admin API
 * Returns a map of user_id -> email
 */
export async function fetchUserEmails(
  supabase: SupabaseClient,
  userIds: string[]
): Promise<Map<string, string | null>> {
  const emailPromises = userIds.map(async (id) => {
    const { data } = await supabase.auth.admin.getUserById(id);
    return { id, email: data?.user?.email || null };
  });

  const emailResults = await Promise.all(emailPromises);
  return new Map(emailResults.map((r) => [r.id, r.email]));
}

/**
 * Fetch active suspensions for given user IDs
 */
export async function fetchActiveSuspensions(
  supabase: SupabaseClient,
  userIds: string[]
): Promise<UserSuspension[] | null> {
  const { data: suspensions } = await supabase
    .from("user_suspensions")
    .select("user_id, suspension_type, reason, expires_at, created_at")
    .in("user_id", userIds)
    .is("lifted_at", null)
    .order("created_at", { ascending: false });

  return suspensions;
}

/**
 * Check if a suspension is currently active
 */
export function isSuspensionActive(suspension: UserSuspension): boolean {
  // Permanent suspensions are always active
  if (suspension.suspension_type === "permanent") {
    return true;
  }

  // Temporary suspensions are active if not expired
  if (suspension.expires_at) {
    return new Date(suspension.expires_at) > new Date();
  }

  return false;
}

/**
 * Build suspension map (most recent active suspension per user)
 */
export function buildActiveSuspensionMap(
  suspensions: UserSuspension[] | null
): Map<string, UserSuspension> {
  const suspensionMap = new Map<string, UserSuspension>();

  if (!suspensions) {
    return suspensionMap;
  }

  for (const suspension of suspensions) {
    // Only add if user doesn't already have a suspension (most recent due to ordering)
    if (!suspensionMap.has(suspension.user_id)) {
      // Check if still active
      if (isSuspensionActive(suspension)) {
        suspensionMap.set(suspension.user_id, suspension);
      }
    }
  }

  return suspensionMap;
}

/**
 * Combine user profiles with emails and suspension data
 */
export function combineUserData(
  profiles: UserProfile[],
  emailMap: Map<string, string | null>,
  suspensionMap: Map<string, UserSuspension>
): CombinedUser[] {
  return profiles.map((profile) => {
    const suspension = suspensionMap.get(profile.id);

    return {
      id: profile.id,
      full_name: profile.full_name,
      email: emailMap.get(profile.id) || null,
      role: profile.role,
      avatar_url: profile.avatar_url,
      city: profile.city,
      created_at: profile.created_at,
      suspension: suspension
        ? {
            type: suspension.suspension_type,
            reason: suspension.reason,
            expires_at: suspension.expires_at,
          }
        : null,
    };
  });
}

/**
 * Filter users by suspension status
 */
export function filterUsersBySuspensionStatus(
  users: CombinedUser[],
  suspensionFilter: SuspensionFilter
): CombinedUser[] {
  if (suspensionFilter === "all") {
    return users;
  }

  return users.filter((user) => {
    if (suspensionFilter === "active") {
      return !user.suspension;
    }
    if (suspensionFilter === "suspended") {
      return user.suspension && user.suspension.type === "temporary";
    }
    if (suspensionFilter === "banned") {
      return user.suspension && user.suspension.type === "permanent";
    }
    return true;
  });
}

/**
 * Build pagination metadata
 */
export function buildPaginationMetadata(
  page: number,
  limit: number,
  totalCount: number
): PaginationMetadata {
  return {
    page,
    limit,
    total: totalCount,
    totalPages: Math.ceil(totalCount / limit),
  };
}
