/**
 * Admin User Management API
 * GET /api/admin/users - List users with filters and pagination
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-helpers";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type UserRole = "customer" | "professional" | "admin";
type SuspensionFilter = "all" | "active" | "suspended" | "banned";

export async function GET(request: Request) {
  try {
    // Verify admin access
    await requireAdmin();
    const supabase = await createSupabaseServerClient();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page") || "1", 10);
    const limit = Number.parseInt(searchParams.get("limit") || "20", 10);
    const role = searchParams.get("role") as UserRole | null;
    const suspensionFilter = (searchParams.get("suspensionFilter") || "all") as SuspensionFilter;
    const search = searchParams.get("search") || "";

    // Calculate pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Base query for profiles
    let profileQuery = supabase
      .from("profiles")
      .select("id, full_name, role, avatar_url, city, created_at", { count: "exact" });

    // Apply role filter
    if (role) {
      profileQuery = profileQuery.eq("role", role);
    }

    // Apply search filter (search by name)
    if (search) {
      profileQuery = profileQuery.ilike("full_name", `%${search}%`);
    }

    // Apply pagination
    profileQuery = profileQuery.range(from, to).order("created_at", { ascending: false });

    const { data: profiles, error: profilesError, count } = await profileQuery;

    if (profilesError) {
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({
        users: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      });
    }

    // Get user emails from auth
    const userIds = profiles.map((p) => p.id);
    const emailPromises = userIds.map(async (id) => {
      const { data } = await supabase.auth.admin.getUserById(id);
      return { id, email: data?.user?.email || null };
    });
    const emailResults = await Promise.all(emailPromises);
    const emailMap = new Map(emailResults.map((r) => [r.id, r.email]));

    // Get suspension status for all users
    const { data: suspensions } = await supabase
      .from("user_suspensions")
      .select("user_id, suspension_type, reason, expires_at, created_at")
      .in("user_id", userIds)
      .is("lifted_at", null)
      .order("created_at", { ascending: false });

    // Create suspension map (most recent suspension per user)
    const suspensionMap = new Map();
    if (suspensions) {
      for (const suspension of suspensions) {
        if (!suspensionMap.has(suspension.user_id)) {
          // Check if still active
          const isActive =
            suspension.suspension_type === "permanent" ||
            (suspension.expires_at && new Date(suspension.expires_at) > new Date());

          if (isActive) {
            suspensionMap.set(suspension.user_id, suspension);
          }
        }
      }
    }

    // Combine data
    let users = profiles.map((profile) => {
      const suspension = suspensionMap.get(profile.id);
      return {
        id: profile.id,
        full_name: profile.full_name,
        email: emailMap.get(profile.id),
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

    // Apply suspension filter
    if (suspensionFilter !== "all") {
      users = users.filter((user) => {
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

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch users" },
      { status: error.message === "Not authenticated" ? 401 : 500 }
    );
  }
}
