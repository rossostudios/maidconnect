/**
 * API Authentication and Authorization Utilities
 *
 * Provides reusable authentication and authorization helpers to eliminate
 * duplication across 68+ API routes.
 *
 * @module lib/api/auth
 */

import type { SupabaseClient, User } from "@supabase/supabase-js";
import {
  createSupabaseFromAuthHeader,
  createSupabaseServerClient,
} from "@/lib/integrations/supabase/serverClient";
import { AuthenticationError, NotFoundError, UnauthorizedError } from "@/lib/shared/errors";
import type { Database } from "@/types/databaseTypes";

// Type aliases for database tables
export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
// TODO: Re-enable when recurring_plans table is added to database types
// export type RecurringPlan = Database["public"]["Tables"]["recurring_plans"]["Row"];

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
 * Supports both cookie-based (web) and Authorization header (mobile) authentication.
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
export async function requireAuth(request: Request): Promise<AuthContext> {
  // Check for mobile client Authorization header (JWT auth)
  const authHeader = request.headers.get("authorization");

  let supabase: SupabaseClient<Database>;

  if (authHeader?.startsWith("Bearer ")) {
    // Mobile client: Use JWT from Authorization header
    supabase = createSupabaseFromAuthHeader(authHeader);
  } else {
    // Web client: Use session from cookies
    supabase = await createSupabaseServerClient();
  }

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
 * Supports both cookie-based (web) and Authorization header (mobile) authentication.
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
async function getOptionalAuth(request: Request): Promise<AuthContext | null> {
  // Check for mobile client Authorization header (JWT auth)
  const authHeader = request.headers.get("authorization");

  let supabase: SupabaseClient<Database>;

  if (authHeader?.startsWith("Bearer ")) {
    // Mobile client: Use JWT from Authorization header
    supabase = createSupabaseFromAuthHeader(authHeader);
  } else {
    // Web client: Use session from cookies
    supabase = await createSupabaseServerClient();
  }

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
 * SECURITY: Verifies role against the profiles table, NOT JWT metadata.
 * JWT user_metadata is client-controlled and can be spoofed. Always verify
 * against the database for authorization decisions.
 *
 * @example
 * ```typescript
 * const { user, supabase } = await requireAuth(request);
 * await requireRole(supabase, user.id, "admin");
 * ```
 *
 * @throws {UnauthorizedError} If user doesn't have the required role
 * @throws {NotFoundError} If user profile doesn't exist
 */
export async function requireRole(
  supabase: SupabaseClient<Database>,
  userId: string,
  role: "admin" | "professional" | "customer"
): Promise<void> {
  // Query the profiles table for the authoritative role
  // NEVER trust JWT metadata for authorization decisions
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error || !profile) {
    throw new NotFoundError("Profile");
  }

  const dbRole = profile.role as string | null;

  if (dbRole !== role) {
    throw new UnauthorizedError(`This action requires ${role} role`);
  }
}

/**
 * Require user to be an admin
 *
 * SECURITY: Verifies admin role against the profiles table, NOT JWT metadata.
 *
 * @example
 * ```typescript
 * const { user, supabase } = await requireAuth(request);
 * await requireAdmin(supabase, user.id);
 * ```
 *
 * @throws {UnauthorizedError} If user is not an admin
 * @throws {NotFoundError} If user profile doesn't exist
 */
export async function requireAdmin(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<void> {
  await requireRole(supabase, userId, "admin");
}

/**
 * Require user to be a professional
 *
 * SECURITY: Verifies professional role against the profiles table, NOT JWT metadata.
 *
 * @example
 * ```typescript
 * const { user, supabase } = await requireAuth(request);
 * await requireProfessional(supabase, user.id);
 * ```
 *
 * @throws {UnauthorizedError} If user is not a professional
 * @throws {NotFoundError} If user profile doesn't exist
 */
export async function requireProfessional(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<void> {
  await requireRole(supabase, userId, "professional");
}

/**
 * Require user to be a customer
 *
 * SECURITY: Verifies customer role against the profiles table, NOT JWT metadata.
 *
 * @example
 * ```typescript
 * const { user, supabase } = await requireAuth(request);
 * await requireCustomer(supabase, user.id);
 * ```
 *
 * @throws {UnauthorizedError} If user is not a customer
 * @throws {NotFoundError} If user profile doesn't exist
 */
export async function requireCustomer(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<void> {
  await requireRole(supabase, userId, "customer");
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
async function requireProfessionalOwnership<T = Booking>(
  supabase: SupabaseClient<Database>,
  userId: string,
  bookingId: string,
  select?: string
): Promise<T> {
  const { data: booking, error } = await supabase
    .from("bookings")
    .select(select || "*")
    .eq("id", bookingId)
    .maybeSingle();

  if (error || !booking) {
    throw new NotFoundError("Booking", bookingId);
  }

  // Type-safe check: when select is not provided, booking is full Booking type
  // When select is provided, caller must specify return type
  const typedBooking = booking as unknown as T & { professional_id: string };

  if (typedBooking.professional_id !== userId) {
    throw new UnauthorizedError("You are not authorized to access this booking");
  }

  return booking as unknown as T;
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
async function requireCustomerOwnership<T = Booking>(
  supabase: SupabaseClient<Database>,
  userId: string,
  bookingId: string,
  select?: string
): Promise<T> {
  const { data: booking, error } = await supabase
    .from("bookings")
    .select(select || "*")
    .eq("id", bookingId)
    .maybeSingle();

  if (error || !booking) {
    throw new NotFoundError("Booking", bookingId);
  }

  // Type-safe check: when select is not provided, booking is full Booking type
  // When select is provided, caller must specify return type
  const typedBooking = booking as unknown as T & { customer_id: string };

  if (typedBooking.customer_id !== userId) {
    throw new UnauthorizedError("You are not authorized to access this booking");
  }

  return booking as unknown as T;
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
async function requireProfessionalProfile(
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
async function requireCustomerProfile(
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
async function requireResourceOwnership<T extends Record<string, unknown>>(
  supabase: SupabaseClient<Database>,
  table: keyof Database["public"]["Tables"],
  resourceId: string,
  userId: string,
  ownerField = "profile_id"
): Promise<T> {
  // Note: Type assertion is required here due to Supabase's generic type system
  // The table parameter is validated by TypeScript to be a valid table name
  const { data: resource, error } = await supabase
    .from(table)
    .select("*")
    .eq("id", resourceId)
    .maybeSingle();

  if (error || !resource) {
    throw new NotFoundError(table, resourceId);
  }

  // Type guard: ensure ownerField exists in resource
  if (!(ownerField in resource)) {
    throw new Error(`Owner field "${ownerField}" does not exist on ${table}`);
  }

  const resourceWithOwner = resource as unknown as Record<string, unknown> &
    Record<typeof ownerField, string>;

  if (resourceWithOwner[ownerField] !== userId) {
    throw new UnauthorizedError(`You are not authorized to access this ${table}`);
  }

  return resource as unknown as T;
}
