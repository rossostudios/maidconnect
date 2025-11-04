/**
 * API Response Helpers
 *
 * Provides consistent response formatting across all API routes.
 * Works in conjunction with the error handling middleware.
 *
 * @module lib/api/response
 */

import { NextResponse } from "next/server";

/**
 * Standard success response format
 */
interface SuccessResponse<T = unknown> {
  success: true;
  data?: T;
  message?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Create a successful JSON response
 *
 * @example
 * ```typescript
 * return successResponse({ user: userData });
 * return successResponse({ user: userData }, { message: "User created" });
 * return successResponse(null, { message: "Operation completed" }, 204);
 * ```
 */
export function successResponse<T = unknown>(
  data?: T,
  options: {
    message?: string;
    metadata?: Record<string, unknown>;
    status?: number;
    headers?: Record<string, string>;
  } = {}
): NextResponse<SuccessResponse<T>> {
  const { message, metadata, status = 200, headers } = options;

  const response: SuccessResponse<T> = {
    success: true,
    ...(data !== undefined && { data }),
    ...(message && { message }),
    ...(metadata && { metadata }),
  };

  return NextResponse.json(response, { status, headers });
}

/**
 * Create a 200 OK response with data
 *
 * @example
 * ```typescript
 * return ok({ bookings: bookingList });
 * ```
 */
export function ok<T = unknown>(data?: T, message?: string): NextResponse<SuccessResponse<T>> {
  return successResponse(data, { message, status: 200 });
}

/**
 * Create a 201 Created response
 *
 * @example
 * ```typescript
 * return created({ booking: newBooking }, { location: `/api/bookings/${id}` });
 * ```
 */
export function created<T = unknown>(
  data?: T,
  options: {
    message?: string;
    location?: string;
  } = {}
): NextResponse<SuccessResponse<T>> {
  const { message, location } = options;
  const headers = location ? { Location: location } : undefined;

  return successResponse(data, {
    message: message || "Resource created successfully",
    status: 201,
    headers,
  });
}

/**
 * Create a 204 No Content response
 *
 * @example
 * ```typescript
 * return noContent();
 * ```
 */
export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

/**
 * Create a 400 Bad Request error response
 *
 * Note: For most cases, throw ValidationError instead and let
 * the error handler create the response.
 *
 * @example
 * ```typescript
 * return badRequest("Invalid booking ID");
 * ```
 */
export function badRequest(message: string, details?: unknown): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "BAD_REQUEST",
        message,
        ...(details && { details }),
      },
    },
    { status: 400 }
  );
}

/**
 * Create a 401 Unauthorized error response
 *
 * Note: Prefer throwing AuthenticationError instead.
 *
 * @example
 * ```typescript
 * return unauthorized("Session expired");
 * ```
 */
export function unauthorized(message = "Not authenticated"): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "AUTH_REQUIRED",
        message,
      },
    },
    { status: 401 }
  );
}

/**
 * Create a 403 Forbidden error response
 *
 * Note: Prefer throwing UnauthorizedError instead.
 *
 * @example
 * ```typescript
 * return forbidden("Admin access required");
 * ```
 */
export function forbidden(message = "Not authorized"): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "FORBIDDEN",
        message,
      },
    },
    { status: 403 }
  );
}

/**
 * Create a 404 Not Found error response
 *
 * Note: Prefer throwing NotFoundError instead.
 *
 * @example
 * ```typescript
 * return notFound("Booking not found");
 * ```
 */
export function notFound(message = "Resource not found"): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "NOT_FOUND",
        message,
      },
    },
    { status: 404 }
  );
}

/**
 * Create a 409 Conflict error response
 *
 * Note: Prefer throwing ResourceConflictError instead.
 *
 * @example
 * ```typescript
 * return conflict("Booking time slot already taken");
 * ```
 */
export function conflict(message: string, details?: unknown): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "CONFLICT",
        message,
        ...(details && { details }),
      },
    },
    { status: 409 }
  );
}

/**
 * Create a 500 Internal Server Error response
 *
 * Note: Generally you should throw errors and let the error handler
 * create the response. This is for edge cases only.
 *
 * @example
 * ```typescript
 * return internalError("Database connection failed");
 * ```
 */
export function internalError(message = "Internal server error"): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message,
      },
    },
    { status: 500 }
  );
}

/**
 * Create a paginated response
 *
 * @example
 * ```typescript
 * return paginated({
 *   items: bookings,
 *   page: 1,
 *   limit: 20,
 *   total: 150
 * });
 * ```
 */
export function paginated<T = unknown>(options: {
  items: T[];
  page: number;
  limit: number;
  total: number;
  message?: string;
}): NextResponse {
  const { items, page, limit, total, message } = options;
  const totalPages = Math.ceil(total / limit);

  return successResponse(items, {
    message,
    metadata: {
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    },
  });
}
