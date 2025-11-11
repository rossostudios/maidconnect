import { z } from "zod";

/**
 * Common API Validation Schemas
 *
 * Shared validation schemas for API requests and responses.
 */

// ============================================
// Common Field Validations
// ============================================

export const uuidSchema = z.string().uuid();
export const emailSchema = z.string().email();
export const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/); // E.164 format
export const urlSchema = z.string().url();
export const dateSchema = z.string().datetime();
export const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/); // YYYY-MM-DD

// ============================================
// Pagination Schemas
// ============================================

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export const paginatedResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: z.array(dataSchema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
    }),
  });

// ============================================
// Standard API Response Schemas
// ============================================

export const successResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    message: z.string().optional(),
  });

export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;

// ============================================
// Common Request Body Schemas
// ============================================

export const idParamSchema = z.object({
  id: uuidSchema,
});

export const searchQuerySchema = z.object({
  q: z.string().min(1).max(100),
  ...paginationQuerySchema.shape,
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;

// ============================================
// Filter Schemas
// ============================================

export const dateRangeSchema = z.object({
  startDate: isoDateSchema,
  endDate: isoDateSchema,
});

export const priceRangeSchema = z.object({
  minPrice: z.coerce.number().nonnegative(),
  maxPrice: z.coerce.number().nonnegative(),
});

// ============================================
// Validation Helpers
// ============================================

/**
 * Validates request body and returns typed data or throws validation error
 */
export async function validateRequestBody<T extends z.ZodTypeAny>(
  request: Request,
  schema: T
): Promise<z.infer<T>> {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      throw new Error(
        `Validation error: ${parsed.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`
      );
    }

    return parsed.data;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("Invalid JSON in request body");
    }
    throw error;
  }
}

/**
 * Validates URL search params and returns typed data
 */
export function validateSearchParams<T extends z.ZodTypeAny>(
  searchParams: URLSearchParams,
  schema: T
): z.infer<T> {
  const params = Object.Entries(searchParams.entries());
  const parsed = schema.safeParse(params);

  if (!parsed.success) {
    throw new Error(
      `Invalid query parameters: ${parsed.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`
    );
  }

  return parsed.data;
}

/**
 * Creates a success response with proper typing
 */
export function createSuccessResponse<T>(data: T, message?: string) {
  return {
    success: true as const,
    data,
    ...(message && { message }),
  };
}

/**
 * Creates an error response with proper typing
 */
export function createErrorResponse(code: string, message: string, details?: unknown) {
  return {
    success: false as const,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  };
}
