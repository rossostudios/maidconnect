/**
 * Middleware to allow both authenticated users and guest sessions
 *
 * Supports guest checkout flow while maintaining auth for registered users
 */

import { type SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";
import { type Database } from "@/types/supabase";

export type AuthOrGuestContext = {
  supabase: SupabaseClient<Database>;
  user: { id: string; email?: string } | null;
  guestSession: {
    id: string;
    email: string;
    full_name: string;
  } | null;
  isGuest: boolean;
};

export type AuthOrGuestHandler<T = unknown> = (
  context: AuthOrGuestContext,
  request: Request
) => Promise<NextResponse<T>>;

/**
 * Middleware that allows both authenticated users and guest sessions
 */
export function withAuthOrGuest<T = unknown>(handler: AuthOrGuestHandler<T>) {
  return async (request: Request): Promise<NextResponse<T>> => {
    const supabase = await createSupabaseServerClient();

    // Check for authenticated user first
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (user && !authError) {
      // Authenticated user path
      return handler(
        {
          supabase,
          user: { id: user.id, email: user.email },
          guestSession: null,
          isGuest: false,
        },
        request
      );
    }

    // Check for guest session token
    const body = await request.clone().json();
    const guestToken = body.guestToken as string | undefined;

    if (!guestToken) {
      return NextResponse.json(
        { error: "Authentication required or guest token missing" },
        { status: 401 }
      ) as NextResponse<T>;
    }

    // Verify guest session
    const { data: guestSession, error: guestError } = await supabase
      .from("guest_sessions")
      .select("id, email, full_name, expires_at")
      .eq("session_token", guestToken)
      .maybeSingle();

    if (guestError || !guestSession) {
      return NextResponse.json(
        { error: "Invalid or expired guest session" },
        { status: 401 }
      ) as NextResponse<T>;
    }

    // Check if session has expired
    if (new Date(guestSession.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "Guest session expired" },
        { status: 401 }
      ) as NextResponse<T>;
    }

    // Guest session path
    return handler(
      {
        supabase,
        user: null,
        guestSession: {
          id: guestSession.id,
          email: guestSession.email,
          full_name: guestSession.full_name,
        },
        isGuest: true,
      },
      request
    );
  };
}
