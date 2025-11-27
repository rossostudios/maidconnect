/**
 * Custom Error Classes
 *
 * Provides type-safe error handling with proper HTTP status codes
 * and structured error information for logging and API responses.
 */

/**
 * Base application error class
 * All custom errors should extend this class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(message: string, statusCode: number, code: string, details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true; // Operational errors are expected, vs programming errors
    this.details = details;

    // Maintains proper stack trace for where error was thrown (V8 only)
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}

// ============================================
// Authentication & Authorization Errors
// ============================================

export class AuthenticationError extends AppError {
  constructor(message = "Authentication required", details?: unknown) {
    super(message, 401, "AUTH_REQUIRED", details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "You do not have permission to perform this action", details?: unknown) {
    super(message, 403, "FORBIDDEN", details);
  }
}

class InvalidCredentialsError extends AppError {
  constructor(message = "Invalid email or password", details?: unknown) {
    super(message, 401, "INVALID_CREDENTIALS", details);
  }
}

// ============================================
// Validation Errors
// ============================================

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, "VALIDATION_ERROR", details);
  }
}

class InvalidInputError extends AppError {
  constructor(message: string, field?: string) {
    super(message, 400, "INVALID_INPUT", field ? { field } : undefined);
  }
}

class MissingRequiredFieldError extends AppError {
  constructor(field: string) {
    super(`Missing required field: ${field}`, 400, "MISSING_FIELD", { field });
  }
}

// ============================================
// Resource Errors
// ============================================

export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    super(message, 404, "NOT_FOUND", { resource, identifier });
  }
}

class ResourceAlreadyExistsError extends AppError {
  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' already exists`
      : `${resource} already exists`;
    super(message, 409, "RESOURCE_EXISTS", { resource, identifier });
  }
}

class ResourceConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 409, "RESOURCE_CONFLICT", details);
  }
}

// ============================================
// Rate Limiting Errors
// ============================================

export class RateLimitError extends AppError {
  public readonly retryAfter?: number;

  constructor(message = "Too many requests. Please try again later", retryAfter?: number) {
    super(message, 429, "RATE_LIMIT_EXCEEDED", { retryAfter });
    this.retryAfter = retryAfter;
  }
}

// ============================================
// Business Logic Errors
// ============================================

class BusinessRuleError extends AppError {
  constructor(message: string, code: string, details?: unknown) {
    super(message, 400, code, details);
  }
}

class InvalidBookingStatusError extends AppError {
  constructor(currentStatus: string, attemptedAction: string) {
    super(
      `Cannot ${attemptedAction} booking with status '${currentStatus}'`,
      400,
      "INVALID_BOOKING_STATUS",
      { currentStatus, attemptedAction }
    );
  }
}

// ============================================
// External Service Errors
// ============================================

export class ExternalServiceError extends AppError {
  constructor(
    service: string,
    message = "External service error",
    details?: Record<string, unknown>
  ) {
    super(`${service}: ${message}`, 502, "EXTERNAL_SERVICE_ERROR", { service, ...(details ?? {}) });
  }
}

class StripeError extends ExternalServiceError {
  constructor(message: string, details?: Record<string, unknown>) {
    super("Stripe", message, details);
  }
}

class EmailServiceError extends ExternalServiceError {
  constructor(message: string, details?: Record<string, unknown>) {
    super("Email Service", message, details);
  }
}

// ============================================
// Upload & File Errors
// ============================================

class FileUploadError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, "FILE_UPLOAD_ERROR", details);
  }
}

class FileTooLargeError extends AppError {
  constructor(maxSize: number) {
    super(`File size exceeds maximum of ${maxSize} bytes`, 413, "FILE_TOO_LARGE", { maxSize });
  }
}

class InvalidFileTypeError extends AppError {
  constructor(allowedTypes: string[]) {
    super(
      `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`,
      400,
      "INVALID_FILE_TYPE",
      { allowedTypes }
    );
  }
}

// ============================================
// Error Type Guards
// ============================================

/**
 * Checks if an error is an operational error (expected)
 */
export function isOperationalError(error: unknown): error is AppError {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}

/**
 * Checks if an error is a programming error (unexpected)
 */
function isProgrammingError(error: unknown): boolean {
  return error instanceof Error && !isOperationalError(error);
}

/**
 * Extracts HTTP status code from any error
 */
export function getStatusCode(error: unknown): number {
  if (error instanceof AppError) {
    return error.statusCode;
  }
  return 500; // Internal Server Error for unknown errors
}

/**
 * Extracts error code from any error
 */
function getErrorCode(error: unknown): string {
  if (error instanceof AppError) {
    return error.code;
  }
  return "INTERNAL_ERROR";
}
