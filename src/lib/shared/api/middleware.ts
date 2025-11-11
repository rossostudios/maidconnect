/**
 * API Route Middleware
 *
 * Higher-order functions for composing API route handlers with
 * authentication, authorization, and error handling.
 *
 * Features:
 * - AsyncLocalStorage context initialization for request tracking
 * - Authentication and authorization
 * - Automatic error handling
 * - Request/response logging
 *
 * @module lib/api/middleware
 */

import { NextResponse } from "next/server";
import { createContextFromRequest, runWithContext, updateContext } from "@/lib/shared/asyncContext";
import { handleApiError } from "@/lib/shared/errorHandler";
import {
  type AuthContext,
  requireAdmin,
  requireAuth,
  requireCustomer,
  requireProfessional,
} from "./auth";

/**
 * Handler that receives authenticated context
 */
type AuthenticatedHandler<T extends unknown[]> = (
  context: AuthContext,
  ...args: T
) => Promise<NextResponse> | NextResponse;

/**
 * Standard route handler
 */
type RouteHandler<T extends unknown[]> = (...args: T) => Promise<NextResponse> | NextResponse;

/**
 * Wraps a route handler with authentication requirement
 *
 * Automatically:
 * - Initializes AsyncLocalStorage context for request tracking
 * - Checks authentication
 * - Updates context with user information
 * - Handles errors
 * - Injects user and supabase into handler
 *
 * All logs within the handler will automatically include:
 * - requestId (for correlation)
 * - userId, userEmail, userRole (after auth)
 * - duration (request timing)
 * - method, path, clientIp
 *
 * @example
 * ```typescript
 * export const POST = withAuth(async ({ user, supabase }, request: Request) => {
 *   // user and supabase are guaranteed to exist
 *   // All logger calls will include request context automatically
 *   const data = await request.json();
 *   return ok({ success: true });
 * });
 * ```
 */
export function withAuth<T extends unknown[]>(
  handler: AuthenticatedHandler<T>,
  context?: Record<string, unknown>
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
) {
  return async (...args: T): Promise<NextResponse> => {
    // Extract request if it's the first argument
    const request = args[0] instanceof Request ? args[0] : undefined;

    if (!request) {
      return handleApiError(new Error("Request is required"), undefined, context);
    }

    // Create request context from Request object
    const requestContext = createContextFromRequest(request);

    // Run handler within AsyncLocalStorage context
    return runWithContext(requestContext, async () => {
      try {
        // Require authentication
        const authContext = await requireAuth(request);

        // Update context with authenticated user information
        updateContext({
          userId: authContext.user.id,
          userEmail: authContext.user.email || undefined,
          userRole: authContext.user.role || undefined,
        });

        // Call handler with auth context
        return await handler(authContext, ...args);
      } catch (error) {
        return handleApiError(error, request, context);
      }
    });
  };
}

/**
 * Wraps a route handler with admin authentication requirement
 *
 * @example
 * ```typescript
 * export const DELETE = withAdmin(async ({ user, supabase }, request: Request) => {
 *   // Only admins can reach here
 *   return ok({ deleted: true });
 * });
 * ```
 */
export function withAdmin<T extends unknown[]>(
  handler: AuthenticatedHandler<T>,
  context?: Record<string, unknown>
) {
  return withAuth(async (authContext, ...args: T) => {
    await requireAdmin(authContext.user);
    return handler(authContext, ...args);
  }, context);
}

/**
 * Wraps a route handler with professional authentication requirement
 *
 * @example
 * ```typescript
 * export const POST = withProfessional(async ({ user, supabase }, request: Request) => {
 *   // Only professionals can reach here
 *   return ok({ success: true });
 * });
 * ```
 */
export function withProfessional<T extends unknown[]>(
  handler: AuthenticatedHandler<T>,
  context?: Record<string, unknown>
) {
  return withAuth(async (authContext, ...args: T) => {
    await requireProfessional(authContext.user);
    return handler(authContext, ...args);
  }, context);
}

/**
 * Wraps a route handler with customer authentication requirement
 *
 * @example
 * ```typescript
 * export const POST = withCustomer(async ({ user, supabase }, request: Request) => {
 *   // Only customers can reach here
 *   return ok({ success: true });
 * });
 * ```
 */
export function withCustomer<T extends unknown[]>(
  handler: AuthenticatedHandler<T>,
  context?: Record<string, unknown>
) {
  return withAuth(async (authContext, ...args: T) => {
    await requireCustomer(authContext.user);
    return handler(authContext, ...args);
  }, context);
}

/**
 * Wraps a route handler with validation
 *
 * Automatically parses and validates request body against a schema.
 * Works great with Zod schemas.
 *
 * @example
 * ```typescript
 * const schema = z.object({
 *   bookingId: z.string(),
 *   reason: z.string().optional()
 * });
 *
 * export const POST = withValidation(
 *   schema,
 *   async (validatedData, request: Request) => {
 *     // validatedData is type-safe and validated
 *     return ok({ success: true });
 *   }
 * );
 * ```
 */
export function withValidation<TSchema, T extends unknown[]>(
  schema: { parse: (data: unknown) => TSchema },
  handler: (validatedData: TSchema, ...args: T) => Promise<NextResponse> | NextResponse,
  context?: Record<string, unknown>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      const request = args[0] instanceof Request ? args[0] : undefined;

      if (!request) {
        throw new Error("Request is required for validation");
      }

      const body = await request.json();
      const validatedData = schema.parse(body);

      return await handler(validatedData, ...args);
    } catch (error) {
      const request = args[0] instanceof Request ? args[0] : undefined;
      return handleApiError(error, request, context);
    }
  };
}

/**
 * Compose multiple middleware functions
 *
 * Allows you to combine authentication + validation + error handling
 *
 * @example
 * ```typescript
 * const schema = z.object({ name: z.string() });
 *
 * export const POST = compose(
 *   withAuth,
 *   (handler) => withValidation(schema, handler)
 * )(async ({ user, supabase }, validatedData, request: Request) => {
 *   return ok({ success: true });
 * });
 * ```
 */
export function compose<T extends unknown[]>(
  ...middlewares: Array<(handler: RouteHandler<T>) => RouteHandler<T>>
) {
  return (handler: RouteHandler<T>): RouteHandler<T> =>
    middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
}

/**
 * Wraps multiple HTTP method handlers with the same middleware
 *
 * @example
 * ```typescript
 * export const { GET, POST, PUT } = withAuthMethods({
 *   GET: async ({ user, supabase }) => ok({ user }),
 *   POST: async ({ user, supabase }, request) => {
 *     const body = await request.json();
 *     return created({ data: body });
 *   },
 *   PUT: async ({ user, supabase }, request) => {
 *     const body = await request.json();
 *     return ok({ updated: true });
 *   }
 * });
 * ```
 */
export function withAuthMethods<T extends Record<string, AuthenticatedHandler<[Request]>>>(
  handlers: T
): Record<keyof T, RouteHandler<[Request]>> {
  const wrappedHandlers: Record<string, RouteHandler<[Request]>> = {};

  for (const [method, handler] of Object.entries(handlers)) {
    wrappedHandlers[method] = withAuth(handler);
  }

  return wrappedHandlers as Record<keyof T, RouteHandler<[Request]>>;
}

/**
 * CORS middleware
 *
 * @example
 * ```typescript
 * export const OPTIONS = withCors({
 *   allowedOrigins: ["https://example.com"],
 *   allowedMethods: ["GET", "POST"]
 * });
 * ```
 */
export function withCors(options: {
  allowedOrigins?: string[];
  allowedMethods?: string[];
  allowedHeaders?: string[];
}) {
  return async (_request: Request): Promise<NextResponse> => {
    const {
      allowedOrigins = ["*"],
      allowedMethods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders = ["Content-Type", "Authorization"],
    } = options;

    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": allowedOrigins.join(", "),
        "Access-Control-Allow-Methods": allowedMethods.join(", "),
        "Access-Control-Allow-Headers": allowedHeaders.join(", "),
      },
    });
  };
}
