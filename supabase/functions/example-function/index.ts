// =============================================================================
// Example Supabase Edge Function
// =============================================================================
// This is a template/example Edge Function for Casaora
//
// Test locally:
//   supabase functions serve example-function
//
// Deploy:
//   supabase functions deploy example-function
//
// Call:
//   curl --location --request POST 'http://localhost:54321/functions/v1/example-function' \
//     --header 'Authorization: Bearer YOUR_ANON_KEY' \
//     --header 'Content-Type: application/json' \
//     --data '{"name":"World"}'
// =============================================================================

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { errorResponse, handleCors, jsonResponse } from "../_shared/cors.ts";

/**
 * Example Edge Function
 *
 * Features demonstrated:
 * - CORS handling for browser requests
 * - Environment variable access
 * - Supabase client creation
 * - Error handling
 * - JSON request/response
 * - Authentication check
 */
Deno.serve(async (req: Request) => {
  try {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
      return handleCors(req);
    }

    // Only allow POST requests
    if (req.method !== "POST") {
      return errorResponse("Method not allowed", 405);
    }

    // Get request body
    const body = await req.json().catch(() => ({}));
    const { name = "World" } = body;

    // Access environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!(supabaseUrl && supabaseKey)) {
      return errorResponse("Missing environment variables", 500);
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Optional: Verify user authentication
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));

      if (authError || !user) {
        return errorResponse("Unauthorized", 401);
      }

      // User is authenticated - you can use user.id, user.email, etc.
      console.log("Authenticated user:", user.id);
    }

    // Example: Query database
    // const { data, error } = await supabase
    //   .from("your_table")
    //   .select("*")
    //   .limit(10);

    // if (error) {
    //   return errorResponse(error.message, 500);
    // }

    // Build response
    const response = {
      message: `Hello, ${name}!`,
      timestamp: new Date().toISOString(),
      environment: Deno.env.get("ENVIRONMENT") || "development",
      // data: data, // Include query results if needed
    };

    // Log for debugging (visible in function logs)
    console.log("Function executed successfully:", response);

    // Return JSON response with CORS headers
    return jsonResponse(response);
  } catch (error) {
    // Log error for debugging
    console.error("Function error:", error);

    // Return error response
    return errorResponse(error instanceof Error ? error.message : "Internal server error", 500);
  }
});
