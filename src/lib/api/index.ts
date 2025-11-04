/**
 * API Utilities
 *
 * Centralized exports for all API helpers, making it easy to import
 * authentication, authorization, response helpers, and middleware.
 *
 * @example
 * ```typescript
 * import { withAuth, ok, requireProfessionalOwnership } from "@/lib/api";
 * ```
 */

// Authentication & Authorization
export {
  requireAuth,
  getOptionalAuth,
  requireRole,
  requireAdmin,
  requireProfessional,
  requireCustomer,
  requireProfessionalOwnership,
  requireCustomerOwnership,
  requireProfessionalProfile,
  requireCustomerProfile,
  requireResourceOwnership,
  type AuthContext,
} from "./auth";

// Response Helpers
export {
  successResponse,
  ok,
  created,
  noContent,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  internalError,
  paginated,
} from "./response";

// Middleware
export {
  withAuth,
  withAdmin,
  withProfessional,
  withCustomer,
  withValidation,
  compose,
  withAuthMethods,
  withRateLimit,
  withCors,
} from "./middleware";
