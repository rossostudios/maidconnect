/**
 * Client Type Detection
 *
 * Types for detecting and handling different client types (web vs mobile)
 * to support multi-platform authentication strategies.
 */

/**
 * Client platform types
 * - web: Browser-based clients (authenticate via cookies)
 * - mobile: Native mobile apps (authenticate via Authorization header)
 */
export type ClientType = "web" | "mobile";

/**
 * Client detection result
 */
export type ClientDetectionResult = {
  /** The detected client type */
  type: ClientType;
  /** Whether the client provided an Authorization header */
  hasAuthHeader: boolean;
  /** Whether the client provided session cookies */
  hasSessionCookies: boolean;
};

/**
 * Detect client type from HTTP request headers
 *
 * @param headers - HTTP request headers
 * @returns Client detection result
 *
 * @example
 * ```typescript
 * const headers = request.headers;
 * const detection = detectClientType(headers);
 *
 * if (detection.type === "mobile") {
 *   // Handle mobile client with Authorization header
 * } else {
 *   // Handle web client with cookies
 * }
 * ```
 */
function detectClientType(headers: Headers): ClientDetectionResult {
  const clientTypeHeader = headers.get("x-client-type");
  const authHeader = headers.get("authorization");
  const cookieHeader = headers.get("cookie");

  // Explicit client type declaration
  if (clientTypeHeader === "mobile") {
    return {
      type: "mobile",
      hasAuthHeader: !!authHeader,
      hasSessionCookies: !!cookieHeader?.includes("sb-"),
    };
  }

  // Implicit detection: Authorization header without cookies = mobile
  if (authHeader?.startsWith("Bearer ") && !cookieHeader?.includes("sb-")) {
    return {
      type: "mobile",
      hasAuthHeader: true,
      hasSessionCookies: false,
    };
  }

  // Default to web client
  return {
    type: "web",
    hasAuthHeader: !!authHeader,
    hasSessionCookies: !!cookieHeader?.includes("sb-"),
  };
}
