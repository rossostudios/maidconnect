/**
 * Guest Checkout Utilities
 *
 * Handles anonymous checkout flow:
 * 1. Create guest session
 * 2. Store guest details in session
 * 3. Allow booking without authentication
 * 4. Convert to full account post-booking
 */

import { createSupabaseBrowserClient } from "@/lib/integrations/supabase/browserClient";

export type GuestSession = {
  id: string;
  session_token: string;
  email: string;
  full_name: string;
  phone: string | null;
  expires_at: string;
  created_at: string;
};

export type GuestCheckoutData = {
  email: string;
  full_name: string;
  phone?: string;
};

const GUEST_TOKEN_KEY = "maidconnect_guest_token";
const GUEST_SESSION_KEY = "maidconnect_guest_session";

/**
 * Generate a secure random token for guest sessions
 */
function generateGuestToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Create a new guest session
 */
export async function createGuestSession(data: GuestCheckoutData): Promise<GuestSession | null> {
  try {
    const supabase = createSupabaseBrowserClient();
    const sessionToken = generateGuestToken();

    const { data: session, error } = await supabase
      .from("guest_sessions")
      .insert({
        session_token: sessionToken,
        email: data.email,
        full_name: data.full_name,
        phone: data.phone || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to create guest session:", error);
      return null;
    }

    // Store token in localStorage for session persistence
    if (typeof window !== "undefined") {
      localStorage.setItem(GUEST_TOKEN_KEY, sessionToken);
      localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(session));
    }

    return session as GuestSession;
  } catch (err) {
    console.error("Error creating guest session:", err);
    return null;
  }
}

/**
 * Get current guest session from localStorage
 */
export function getCurrentGuestSession(): GuestSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const sessionData = localStorage.getItem(GUEST_SESSION_KEY);
    if (!sessionData) {
      return null;
    }

    const session = JSON.parse(sessionData) as GuestSession;

    // Check if session has expired
    if (new Date(session.expires_at) < new Date()) {
      clearGuestSession();
      return null;
    }

    return session;
  } catch (err) {
    console.error("Error reading guest session:", err);
    return null;
  }
}

/**
 * Get guest token for API calls
 */
export function getGuestToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem(GUEST_TOKEN_KEY);
}

/**
 * Clear guest session from localStorage
 */
export function clearGuestSession(): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem(GUEST_TOKEN_KEY);
  localStorage.removeItem(GUEST_SESSION_KEY);
}

/**
 * Check if user is in guest mode
 */
export function isGuestMode(): boolean {
  return getCurrentGuestSession() !== null;
}

/**
 * Convert guest session to full user account
 */
export async function convertGuestToUser(guestSessionId: string, userId: string): Promise<boolean> {
  try {
    const supabase = createSupabaseBrowserClient();

    const { error } = await supabase.rpc("convert_guest_to_user", {
      p_guest_session_id: guestSessionId,
      p_user_id: userId,
    });

    if (error) {
      console.error("Failed to convert guest to user:", error);
      return false;
    }

    // Clear guest session from localStorage
    clearGuestSession();

    return true;
  } catch (err) {
    console.error("Error converting guest to user:", err);
    return false;
  }
}

/**
 * Get guest or authenticated user identifier for bookings
 */
export async function getBookingIdentifier(): Promise<{
  type: "user" | "guest";
  id: string;
  email?: string;
} | null> {
  const supabase = createSupabaseBrowserClient();

  // Check if authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return {
      type: "user",
      id: user.id,
      email: user.email,
    };
  }

  // Check for guest session
  const guestSession = getCurrentGuestSession();
  if (guestSession) {
    return {
      type: "guest",
      id: guestSession.id,
      email: guestSession.email,
    };
  }

  return null;
}

/**
 * Check if user should see post-booking signup prompt
 */
export function shouldShowSignupPrompt(): boolean {
  // Show prompt if user just completed a booking as guest
  if (typeof window === "undefined") {
    return false;
  }

  const hasGuestBooking = sessionStorage.getItem("guest_booking_completed");
  const isGuest = isGuestMode();

  return Boolean(hasGuestBooking && isGuest);
}

/**
 * Mark that guest has completed a booking
 */
export function markGuestBookingCompleted(): void {
  if (typeof window === "undefined") {
    return;
  }
  sessionStorage.setItem("guest_booking_completed", "true");
}

/**
 * Clear guest booking completion flag
 */
export function clearGuestBookingFlag(): void {
  if (typeof window === "undefined") {
    return;
  }
  sessionStorage.removeItem("guest_booking_completed");
}
