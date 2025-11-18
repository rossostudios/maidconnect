import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  createErrorResponse,
  createSuccessResponse,
  dateRangeSchema,
  dateSchema,
  emailSchema,
  errorResponseSchema,
  idParamSchema,
  isoDateSchema,
  paginatedResponseSchema,
  paginationQuerySchema,
  phoneSchema,
  priceRangeSchema,
  searchQuerySchema,
  successResponseSchema,
  urlSchema,
  uuidSchema,
  validateSearchParams,
} from "../api";

// ============================================================================
// COMMON FIELD VALIDATIONS
// ============================================================================

describe("uuidSchema", () => {
  it("accepts valid UUIDs", () => {
    const valid = "123e4567-e89b-12d3-a456-426614174000";
    expect(uuidSchema.parse(valid)).toBe(valid);
  });

  it("accepts different UUID versions", () => {
    // UUID v4
    expect(uuidSchema.safeParse("550e8400-e29b-41d4-a716-446655440000").success).toBe(true);
    // UUID v1
    expect(uuidSchema.safeParse("c9bf9e58-d9e2-11ed-afa1-0242ac120002").success).toBe(true);
  });

  it("rejects invalid UUIDs", () => {
    expect(uuidSchema.safeParse("not-a-uuid").success).toBe(false);
    expect(uuidSchema.safeParse("123-456-789").success).toBe(false);
    expect(uuidSchema.safeParse("").success).toBe(false);
  });

  it("rejects UUIDs with incorrect format", () => {
    expect(uuidSchema.safeParse("123e4567e89b12d3a456426614174000").success).toBe(false); // No dashes
    expect(uuidSchema.safeParse("123e4567-e89b-12d3-a456").success).toBe(false); // Too short
  });
});

describe("emailSchema", () => {
  it("accepts valid email addresses", () => {
    expect(emailSchema.parse("juan@example.com")).toBe("juan@example.com");
    expect(emailSchema.safeParse("maria.garcia@company.co").success).toBe(true);
    expect(emailSchema.safeParse("user+tag@domain.com").success).toBe(true);
  });

  it("accepts emails with subdomains", () => {
    expect(emailSchema.safeParse("user@mail.example.com").success).toBe(true);
  });

  it("rejects invalid email formats", () => {
    expect(emailSchema.safeParse("not-an-email").success).toBe(false);
    expect(emailSchema.safeParse("@example.com").success).toBe(false);
    expect(emailSchema.safeParse("user@").success).toBe(false);
    expect(emailSchema.safeParse("user @example.com").success).toBe(false);
  });
});

describe("phoneSchema", () => {
  it("accepts valid E.164 phone numbers", () => {
    expect(phoneSchema.safeParse("+573001234567").success).toBe(true); // Colombia
    expect(phoneSchema.safeParse("+12125551234").success).toBe(true); // US
    expect(phoneSchema.safeParse("+447911123456").success).toBe(true); // UK
  });

  it("accepts phone numbers without + prefix", () => {
    expect(phoneSchema.safeParse("573001234567").success).toBe(true);
  });

  it("rejects invalid phone formats", () => {
    expect(phoneSchema.safeParse("1").success).toBe(false); // Too short (min 2 digits)
    expect(phoneSchema.safeParse("+0123456789").success).toBe(false); // Starts with 0
    expect(phoneSchema.safeParse("abc123").success).toBe(false); // Contains letters
    expect(phoneSchema.safeParse("+1-212-555-1234").success).toBe(false); // Has dashes
  });

  it("enforces E.164 length limits (max 15 digits)", () => {
    expect(phoneSchema.safeParse("+12345678901234").success).toBe(true); // 14 digits
    expect(phoneSchema.safeParse("+123456789012345").success).toBe(true); // 15 digits
    expect(phoneSchema.safeParse("+1234567890123456").success).toBe(false); // 16 digits (too long)
  });
});

describe("urlSchema", () => {
  it("accepts valid URLs", () => {
    expect(urlSchema.safeParse("https://example.com").success).toBe(true);
    expect(urlSchema.safeParse("http://example.com").success).toBe(true);
    expect(urlSchema.safeParse("https://example.com/path?query=1").success).toBe(true);
  });

  it("rejects invalid URLs", () => {
    expect(urlSchema.safeParse("not-a-url").success).toBe(false);
    expect(urlSchema.safeParse("example.com").success).toBe(false); // Missing protocol
    expect(urlSchema.safeParse("//example.com").success).toBe(false);
  });
});

describe("dateSchema", () => {
  it("accepts valid ISO 8601 datetime strings", () => {
    expect(dateSchema.safeParse("2024-12-25T14:30:00Z").success).toBe(true);
    expect(dateSchema.safeParse("2024-12-25T14:30:00.123Z").success).toBe(true); // With milliseconds
    expect(dateSchema.safeParse("2024-01-01T00:00:00Z").success).toBe(true);
  });

  it("rejects invalid datetime formats", () => {
    expect(dateSchema.safeParse("2024-12-25").success).toBe(false); // Date only
    expect(dateSchema.safeParse("14:30:00").success).toBe(false); // Time only
    expect(dateSchema.safeParse("2024/12/25 14:30:00").success).toBe(false); // Wrong format
    expect(dateSchema.safeParse("2024-12-25 14:30:00").success).toBe(false); // Missing T separator
    expect(dateSchema.safeParse("2024-12-25T14:30:00").success).toBe(false); // Missing timezone
  });
});

describe("isoDateSchema", () => {
  it("accepts valid YYYY-MM-DD dates", () => {
    expect(isoDateSchema.safeParse("2024-12-25").success).toBe(true);
    expect(isoDateSchema.safeParse("2024-01-01").success).toBe(true);
    expect(isoDateSchema.safeParse("2024-12-31").success).toBe(true);
  });

  it("rejects invalid date formats", () => {
    expect(isoDateSchema.safeParse("2024/12/25").success).toBe(false); // Wrong separator
    expect(isoDateSchema.safeParse("25-12-2024").success).toBe(false); // Wrong order
    expect(isoDateSchema.safeParse("2024-12-25T00:00:00Z").success).toBe(false); // With time
    expect(isoDateSchema.safeParse("12-25-2024").success).toBe(false); // MM-DD-YYYY
  });

  it("enforces strict format (no extra characters)", () => {
    expect(isoDateSchema.safeParse("2024-12-25 ").success).toBe(false); // Trailing space
    expect(isoDateSchema.safeParse("2024-12-25T").success).toBe(false);
  });
});

// ============================================================================
// PAGINATION SCHEMAS
// ============================================================================

describe("paginationQuerySchema", () => {
  it("applies defaults for empty query", () => {
    const result = paginationQuerySchema.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.sortOrder).toBe("desc");
  });

  it("coerces string numbers to integers", () => {
    const result = paginationQuerySchema.parse({
      page: "2",
      limit: "50",
    });
    expect(result.page).toBe(2);
    expect(result.limit).toBe(50);
  });

  it("accepts valid pagination parameters", () => {
    const valid = {
      page: 3,
      limit: 50,
      sortBy: "createdAt",
      sortOrder: "asc" as const,
    };
    const result = paginationQuerySchema.parse(valid);
    expect(result).toEqual(valid);
  });

  it("enforces page minimum 1", () => {
    expect(paginationQuerySchema.safeParse({ page: 0 }).success).toBe(false);
    expect(paginationQuerySchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it("enforces limit maximum 100", () => {
    expect(paginationQuerySchema.safeParse({ limit: 100 }).success).toBe(true);
    expect(paginationQuerySchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("enforces limit minimum 1", () => {
    expect(paginationQuerySchema.safeParse({ limit: 0 }).success).toBe(false);
    expect(paginationQuerySchema.safeParse({ limit: -10 }).success).toBe(false);
  });

  it("accepts only 'asc' or 'desc' for sortOrder", () => {
    expect(paginationQuerySchema.safeParse({ sortOrder: "asc" }).success).toBe(true);
    expect(paginationQuerySchema.safeParse({ sortOrder: "desc" }).success).toBe(true);
    expect(paginationQuerySchema.safeParse({ sortOrder: "random" }).success).toBe(false);
  });
});

describe("paginatedResponseSchema", () => {
  it("validates paginated responses with typed data", () => {
    const userSchema = z.object({
      id: z.string(),
      name: z.string(),
    });

    const schema = paginatedResponseSchema(userSchema);

    const valid = {
      data: [
        { id: "1", name: "Juan" },
        { id: "2", name: "Maria" },
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 50,
        totalPages: 3,
      },
    };

    const result = schema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects responses with invalid data array", () => {
    const schema = paginatedResponseSchema(z.object({ id: z.string() }));

    const invalid = {
      data: [{ id: 123 }], // Should be string
      pagination: {
        page: 1,
        limit: 20,
        total: 50,
        totalPages: 3,
      },
    };

    expect(schema.safeParse(invalid).success).toBe(false);
  });

  it("requires all pagination fields", () => {
    const schema = paginatedResponseSchema(z.object({ id: z.string() }));

    const missing = {
      data: [],
      pagination: {
        page: 1,
        limit: 20,
        // Missing total and totalPages
      },
    };

    expect(schema.safeParse(missing).success).toBe(false);
  });
});

// ============================================================================
// STANDARD API RESPONSE SCHEMAS
// ============================================================================

describe("successResponseSchema", () => {
  it("validates success responses with typed data", () => {
    const dataSchema = z.object({ userId: z.string() });
    const schema = successResponseSchema(dataSchema);

    const valid = {
      success: true,
      data: { userId: "123" },
    };

    const result = schema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("accepts optional message", () => {
    const schema = successResponseSchema(z.string());

    const withMessage = {
      success: true,
      data: "Result",
      message: "Operation completed",
    };

    expect(schema.safeParse(withMessage).success).toBe(true);
  });

  it("requires success to be true", () => {
    const schema = successResponseSchema(z.string());

    const invalid = {
      success: false,
      data: "Result",
    };

    expect(schema.safeParse(invalid).success).toBe(false);
  });
});

describe("errorResponseSchema", () => {
  it("validates error responses", () => {
    const valid = {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid input data",
      },
    };

    const result = errorResponseSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("accepts optional details field", () => {
    const valid = {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        details: { field: "email", reason: "Invalid format" },
      },
    };

    expect(errorResponseSchema.safeParse(valid).success).toBe(true);
  });

  it("requires success to be false", () => {
    const invalid = {
      success: true,
      error: {
        code: "ERROR",
        message: "Error message",
      },
    };

    expect(errorResponseSchema.safeParse(invalid).success).toBe(false);
  });

  it("requires error object with code and message", () => {
    const missing = {
      success: false,
      error: {
        code: "ERROR",
        // Missing message
      },
    };

    expect(errorResponseSchema.safeParse(missing).success).toBe(false);
  });
});

// ============================================================================
// COMMON REQUEST BODY SCHEMAS
// ============================================================================

describe("idParamSchema", () => {
  it("accepts valid UUID id", () => {
    const valid = { id: "123e4567-e89b-12d3-a456-426614174000" };
    const result = idParamSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects invalid UUIDs", () => {
    const invalid = { id: "not-a-uuid" };
    expect(idParamSchema.safeParse(invalid).success).toBe(false);
  });

  it("requires id field", () => {
    const missing = {};
    expect(idParamSchema.safeParse(missing).success).toBe(false);
  });
});

describe("searchQuerySchema", () => {
  it("accepts valid search query", () => {
    const valid = {
      q: "cleaning services",
      page: 1,
      limit: 20,
    };
    const result = searchQuerySchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("requires search query 'q'", () => {
    const missing = { page: 1, limit: 20 };
    expect(searchQuerySchema.safeParse(missing).success).toBe(false);
  });

  it("requires non-empty search query", () => {
    const empty = { q: "" };
    expect(searchQuerySchema.safeParse(empty).success).toBe(false);
  });

  it("enforces search query maximum 100 characters", () => {
    const valid = { q: "A".repeat(100) };
    expect(searchQuerySchema.safeParse(valid).success).toBe(true);

    const tooLong = { q: "A".repeat(101) };
    expect(searchQuerySchema.safeParse(tooLong).success).toBe(false);
  });

  it("inherits pagination defaults", () => {
    const minimal = { q: "search" };
    const result = searchQuerySchema.parse(minimal);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.sortOrder).toBe("desc");
  });
});

// ============================================================================
// FILTER SCHEMAS
// ============================================================================

describe("dateRangeSchema", () => {
  it("accepts valid date range", () => {
    const valid = {
      startDate: "2024-01-01",
      endDate: "2024-12-31",
    };
    const result = dateRangeSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("requires both startDate and endDate", () => {
    expect(dateRangeSchema.safeParse({ startDate: "2024-01-01" }).success).toBe(false);
    expect(dateRangeSchema.safeParse({ endDate: "2024-12-31" }).success).toBe(false);
  });

  it("validates date format (YYYY-MM-DD)", () => {
    const invalid = {
      startDate: "2024/01/01", // Wrong separator
      endDate: "2024-12-31",
    };
    expect(dateRangeSchema.safeParse(invalid).success).toBe(false);
  });
});

describe("priceRangeSchema", () => {
  it("accepts valid price range", () => {
    const valid = {
      minPrice: 50_000,
      maxPrice: 200_000,
    };
    const result = priceRangeSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("coerces string numbers to numbers", () => {
    const result = priceRangeSchema.parse({
      minPrice: "50000",
      maxPrice: "200000",
    });
    expect(result.minPrice).toBe(50_000);
    expect(result.maxPrice).toBe(200_000);
  });

  it("requires non-negative prices", () => {
    const negative = {
      minPrice: -1000,
      maxPrice: 200_000,
    };
    expect(priceRangeSchema.safeParse(negative).success).toBe(false);
  });

  it("accepts zero for minPrice", () => {
    const valid = {
      minPrice: 0,
      maxPrice: 100_000,
    };
    expect(priceRangeSchema.safeParse(valid).success).toBe(true);
  });
});

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

describe("validateSearchParams", () => {
  it("validates and parses search params", () => {
    const params = new URLSearchParams({
      page: "2",
      limit: "50",
      sortOrder: "asc",
    });

    const result = validateSearchParams(params, paginationQuerySchema);

    expect(result.page).toBe(2);
    expect(result.limit).toBe(50);
    expect(result.sortOrder).toBe("asc");
  });

  it("applies schema defaults", () => {
    const params = new URLSearchParams({});
    const result = validateSearchParams(params, paginationQuerySchema);

    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.sortOrder).toBe("desc");
  });

  it("throws error for invalid params", () => {
    const params = new URLSearchParams({
      page: "invalid",
    });

    expect(() => validateSearchParams(params, paginationQuerySchema)).toThrow(
      "Invalid query parameters"
    );
  });

  it("includes field path in error message", () => {
    const params = new URLSearchParams({
      limit: "200", // Exceeds max 100
    });

    expect(() => validateSearchParams(params, paginationQuerySchema)).toThrow("limit:");
  });
});

describe("createSuccessResponse", () => {
  it("creates success response with data", () => {
    const response = createSuccessResponse({ userId: "123" });

    expect(response).toEqual({
      success: true,
      data: { userId: "123" },
    });
  });

  it("includes optional message", () => {
    const response = createSuccessResponse({ userId: "123" }, "User created");

    expect(response).toEqual({
      success: true,
      data: { userId: "123" },
      message: "User created",
    });
  });

  it("omits message when not provided", () => {
    const response = createSuccessResponse({ userId: "123" });

    expect(response).not.toHaveProperty("message");
  });

  it("preserves data type", () => {
    const arrayData = [1, 2, 3];
    const response = createSuccessResponse(arrayData);

    expect(response.data).toBe(arrayData);
  });
});

describe("createErrorResponse", () => {
  it("creates error response with code and message", () => {
    const response = createErrorResponse("VALIDATION_ERROR", "Invalid input");

    expect(response).toEqual({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid input",
      },
    });
  });

  it("includes optional details", () => {
    const details = { field: "email", reason: "Invalid format" };
    const response = createErrorResponse("VALIDATION_ERROR", "Invalid input", details);

    expect(response).toEqual({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        details,
      },
    });
  });

  it("omits details when not provided", () => {
    const response = createErrorResponse("ERROR", "Error message");

    expect(response.error).not.toHaveProperty("details");
  });
});
