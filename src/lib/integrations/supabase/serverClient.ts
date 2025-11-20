import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { unstable_noStore as noStore } from "next/cache";
import { cookies } from "next/headers";

export async function createSupabaseServerClient() {
  // Opt out of static generation when accessing cookies
  noStore();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!(supabaseUrl && supabaseKey)) {
    throw new Error(
      "Supabase URL or anon key is missing. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set."
    );
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}

/**
 * Create a simple anon Supabase client for public data fetching
 * Use this for data that doesn't require authentication (e.g., public listings)
 * This client is safe to use inside unstable_cache() since it doesn't access cookies
 */
export function createSupabaseAnonClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!(supabaseUrl && supabaseKey)) {
    throw new Error(
      "Supabase URL or anon key is missing. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set."
    );
  }

  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Create a Supabase client from an Authorization header (for mobile apps)
 * Mobile apps authenticate via JWT in Authorization header instead of cookies
 *
 * @param authHeader - The Authorization header value (e.g., "Bearer eyJ...")
 * @returns Supabase client with JWT authentication
 *
 * @example
 * ```typescript
 * const authHeader = request.headers.get("authorization");
 * if (authHeader) {
 *   const supabase = createSupabaseFromAuthHeader(authHeader);
 *   const { data: { user } } = await supabase.auth.getUser();
 * }
 * ```
 */
export function createSupabaseFromAuthHeader(authHeader: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!(supabaseUrl && supabaseKey)) {
    throw new Error(
      "Supabase URL or anon key is missing. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set."
    );
  }

  // Extract JWT from "Bearer <token>" format
  const token = authHeader.replace(/^Bearer\s+/i, "");

  // Create Supabase client with JWT in Authorization header
  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}
