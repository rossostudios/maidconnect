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

// Rate Limiting
export { withRateLimit } from "../rate-limit";
// Authentication & Authorization
export {
  type AuthContext,
  getOptionalAuth,
  requireAdmin,
  requireAuth,
  requireCustomer,
  requireCustomerOwnership,
  requireCustomerProfile,
  requireProfessional,
  requireProfessionalOwnership,
  requireProfessionalProfile,
  requireResourceOwnership,
  requireRole,
} from "./auth";

// Middleware
export {
  compose,
  withAdmin,
  withAuth,
  withAuthMethods,
  withCors,
  withCustomer,
  withProfessional,
  withValidation,
} from "./middleware";
// Response Helpers
export {
  badRequest,
  conflict,
  created,
  forbidden,
  internalError,
  noContent,
  notFound,
  ok,
  paginated,
  successResponse,
  unauthorized,
} from "./response";
