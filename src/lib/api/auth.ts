/**
 * API Authentication and Authorization Utilities
 *
 * Provides reusable authentication and authorization helpers to eliminate
 * duplication across 68+ API routes.
 *
 * @module lib/api/auth
 */

import type { SupabaseClient, User } from "@supabase/supabase-js";
import { AuthenticationError, NotFoundError, UnauthorizedError } from "@/lib/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { Database } from "@/types/database.types";

/**
 * Authentication context returned by auth helpers
 */
export type AuthContext = {
  user: User;
  supabase: SupabaseClient<Database>;
};

/**
 * Get authenticated user or throw 401
 *
 * Use this for routes that require authentication.
 *
 * @example
 * ```typescript
 * export async function POST(request: Request) {
 *   const { user, supabase } = await requireAuth(request);
 *   // user is guaranteed to exist here
 * }
 * ```
 *
 * @throws {AuthenticationError} If user is not authenticated
 */
export async function requireAuth(_request: Request): Promise<AuthContext> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new AuthenticationError("Not authenticated");
  }

  return { user, supabase };
}

/**
 * Get optional authentication - returns user or null
 *
 * Use this for routes that work with or without authentication.
 *
 * @example
 * ```typescript
 * export async function GET(request: Request) {
 *   const auth = await getOptionalAuth(request);
 *   if (auth) {
 *     // User is logged in
 *     const { user, supabase } = auth;
 *   }
 * }
 * ```
 */
export async function getOptionalAuth(_request: Request): Promise<AuthContext | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return { user, supabase };
}

/**
 * Require user to have a specific role
 *
 * @example
 * ```typescript
 * const { user, supabase } = await requireAuth(request);
 * await requireRole(user, "admin");
 * ```
 *
 * @throws {UnauthorizedError} If user doesn't have the required role
 */
export async function requireRole(
  user: User,
  role: "admin" | "professional" | "customer"
): Promise<void> {
  const userRole = user.user_metadata?.role;

  if (userRole !== role) {
    throw new UnauthorizedError(`This action requires ${role} role`);
  }
}

/**
 * Require user to be an admin
 *
 * @example
 * ```typescript
 * const { user, supabase } = await requireAuth(request);
 * await requireAdmin(user);
 * ```
 *
 * @throws {UnauthorizedError} If user is not an admin
 */
export async function requireAdmin(user: User): Promise<void> {
  await requireRole(user, "admin");
}

/**
 * Require user to be a professional
 *
 * @example
 * ```typescript
 * const { user, supabase } = await requireAuth(request);
 * await requireProfessional(user);
 * ```
 *
 * @throws {UnauthorizedError} If user is not a professional
 */
export async function requireProfessional(user: User): Promise<void> {
  await requireRole(user, "professional");
}

/**
 * Require user to be a customer
 *
 * @example
 * ```typescript
 * const { user, supabase } = await requireAuth(request);
 * await requireCustomer(user);
 * ```
 *
 * @throws {UnauthorizedError} If user is not a customer
 */
export async function requireCustomer(user: User): Promise<void> {
  await requireRole(user, "customer");
}

/**
 * Verify user owns the booking as professional and return booking data
 *
 * This is a common pattern in professional booking routes where we need to:
 * 1. Fetch the booking
 * 2. Verify it exists
 * 3. Verify the professional owns it
 *
 * @example
 * ```typescript
 * const { user, supabase } = await requireAuth(request);
 * const booking = await requireProfessionalOwnership(supabase, user.id, bookingId);
 * ```
 *
 * @throws {NotFoundError} If booking doesn't exist
 * @throws {UnauthorizedError} If user doesn't own the booking
 */
export async function requireProfessionalOwnership(
  supabase: SupabaseClient<Database>,
  userId: string,
  bookingId: string,
  select?: string
): Promise<any> {
  const { data: booking, error } = await supabase
    .from("bookings")
    .select(select || "*")
    .eq("id", bookingId)
    .maybeSingle();

  if (error || !booking) {
    throw new NotFoundError("Booking", bookingId);
  }

  // Type assertion needed when using custom select
  if ((booking as any).professional_id !== userId) {
    throw new UnauthorizedError("You are not authorized to access this booking");
  }

  return booking;
}

/**
 * Verify user owns the booking as customer and return booking data
 *
 * This is a common pattern in customer booking routes where we need to:
 * 1. Fetch the booking
 * 2. Verify it exists
 * 3. Verify the customer owns it
 *
 * @example
 * ```typescript
 * const { user, supabase } = await requireAuth(request);
 * const booking = await requireCustomerOwnership(supabase, user.id, bookingId);
 * ```
 *
 * @throws {NotFoundError} If booking doesn't exist
 * @throws {UnauthorizedError} If user doesn't own the booking
 */
export async function requireCustomerOwnership(
  supabase: SupabaseClient<Database>,
  userId: string,
  bookingId: string,
  select?: string
): Promise<any> {
  const { data: booking, error } = await supabase
    .from("bookings")
    .select(select || "*")
    .eq("id", bookingId)
    .maybeSingle();

  if (error || !booking) {
    throw new NotFoundError("Booking", bookingId);
  }

  // Type assertion needed when using custom select
  if ((booking as any).customer_id !== userId) {
    throw new UnauthorizedError("You are not authorized to access this booking");
  }

  return booking;
}

/**
 * Verify user is a professional and has a profile
 *
 * @example
 * ```typescript
 * const { user, supabase } = await requireAuth(request);
 * const profile = await requireProfessionalProfile(supabase, user.id);
 * ```
 *
 * @throws {NotFoundError} If professional profile doesn't exist
 */
export async function requireProfessionalProfile(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<Database["public"]["Tables"]["professional_profiles"]["Row"]> {
  const { data: profile, error } = await supabase
    .from("professional_profiles")
    .select("*")
    .eq("profile_id", userId)
    .maybeSingle();

  if (error || !profile) {
    throw new NotFoundError("Professional profile");
  }

  return profile;
}

/**
 * Verify user is a customer and has a profile
 *
 * @example
 * ```typescript
 * const { user, supabase } = await requireAuth(request);
 * const profile = await requireCustomerProfile(supabase, user.id);
 * ```
 *
 * @throws {NotFoundError} If customer profile doesn't exist
 */
export async function requireCustomerProfile(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<Database["public"]["Tables"]["customer_profiles"]["Row"]> {
  const { data: profile, error } = await supabase
    .from("customer_profiles")
    .select("*")
    .eq("profile_id", userId)
    .maybeSingle();

  if (error || !profile) {
    throw new NotFoundError("Customer profile");
  }

  return profile;
}

/**
 * Verify user owns the resource (generic ownership check)
 *
 * @example
 * ```typescript
 * const { user, supabase } = await requireAuth(request);
 * const addon = await requireResourceOwnership(
 *   supabase,
 *   "professional_addons",
 *   addonId,
 *   user.id,
 *   "professional_id"
 * );
 * ```
 *
 * @throws {NotFoundError} If resource doesn't exist
 * @throws {UnauthorizedError} If user doesn't own the resource
 */
export async function requireResourceOwnership<T>(
  supabase: SupabaseClient<Database>,
  table: keyof Database["public"]["Tables"],
  resourceId: string,
  userId: string,
  ownerField = "profile_id"
): Promise<T> {
  const { data: resource, error } = await supabase
    .from(table as any)
    .select("*")
    .eq("id", resourceId)
    .maybeSingle();

  if (error || !resource) {
    throw new NotFoundError(table as string, resourceId);
  }

  if ((resource as any)[ownerField] !== userId) {
    throw new UnauthorizedError(`You are not authorized to access this ${table}`);
  }

  return resource as T;
}
