// =============================================================================
// CORS Utility for Supabase Edge Functions
// =============================================================================
// Provides CORS headers for Edge Functions to allow browser requests
//
// Usage:
//   import { corsHeaders, handleCors } from "../_shared/cors.ts";
//
//   Deno.serve(async (req: Request) => {
//     // Handle CORS preflight
//     if (req.method === "OPTIONS") {
//       return handleCors(req);
//     }
//
//     // Your logic here...
//
//     return new Response(data, {
//       headers: { ...corsHeaders, "Content-Type": "application/json" }
//     });
//   });
// =============================================================================

/**
 * CORS headers to allow cross-origin requests from browsers
 * Adjust the origin as needed for production
 */
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Consider restricting this in production
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
  "Access-Control-Max-Age": "86400", // 24 hours
};

/**
 * Handle CORS preflight requests
 * @returns Response with CORS headers
 */
export function handleCors(): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

/**
 * Create a JSON response with CORS headers
 * @param data - Data to send in response
 * @param status - HTTP status code (default: 200)
 * @returns Response with JSON data and CORS headers
 */
export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

/**
 * Create an error response with CORS headers
 * @param message - Error message
 * @param status - HTTP status code (default: 500)
 * @returns Response with error message and CORS headers
 */
export function errorResponse(message: string, status = 500): Response {
  return jsonResponse({ error: message }, status);
}
