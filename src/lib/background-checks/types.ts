/**
 * Background Check Provider Types
 *
 * Unified types for both Checkr and Truora background check providers.
 * Allows switching between providers without changing application logic.
 */

// ============================================================================
// Common Types
// ============================================================================

export type BackgroundCheckProvider = "checkr" | "truora";

export type BackgroundCheckStatus = "pending" | "clear" | "consider" | "suspended";

export type BackgroundCheckType =
  | "criminal" // Criminal records
  | "disciplinary" // Disciplinary records (PGN in Colombia)
  | "identity" // Identity verification
  | "credit" // Credit/financial history
  | "employment"; // Employment verification

// ============================================================================
// Professional Information (Input)
// ============================================================================

export interface ProfessionalInfo {
  // Required fields
  professionalId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO 8601 format: "1990-05-15"

  // Colombian ID (Cédula de Ciudadanía)
  documentType: "CC" | "CE" | "PA" | "NIT"; // CC=Cédula, CE=Cédula Extranjería, PA=Passport, NIT=Business
  documentId: string;

  // Contact info
  email: string;
  phone?: string;

  // Address (required for some checks)
  address?: {
    street?: string;
    city?: string;
    state?: string; // Department in Colombia
    postalCode?: string;
    country: "CO"; // Colombia
  };

  // Optional metadata
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Background Check Result (Output)
// ============================================================================

export interface BackgroundCheckResult {
  // Common fields
  id: string; // Our internal ID
  providerCheckId: string; // Provider's ID (Checkr or Truora)
  provider: BackgroundCheckProvider;
  professionalId: string;
  status: BackgroundCheckStatus;

  // Check details
  checksPerformed: BackgroundCheckType[];
  completedAt?: Date;
  estimatedCompletionDate?: Date;

  // Results by type
  results: {
    criminal?: CheckTypeResult;
    disciplinary?: CheckTypeResult;
    identity?: CheckTypeResult;
    credit?: CheckTypeResult;
    employment?: CheckTypeResult;
  };

  // Overall assessment
  recommendation: "approved" | "review_required" | "rejected";

  // Raw provider data (for debugging/auditing)
  rawData: Record<string, unknown>;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface CheckTypeResult {
  status: "clear" | "consider" | "suspended" | "pending";
  records: Array<{
    description: string;
    date?: string;
    severity?: "low" | "medium" | "high";
    details?: Record<string, unknown>;
  }>;
  completedAt?: Date;
}

// ============================================================================
// Webhook Event Types
// ============================================================================

export type WebhookEventType =
  | "check.created"
  | "check.completed"
  | "check.updated"
  | "check.failed";

export interface WebhookEvent {
  type: WebhookEventType;
  provider: BackgroundCheckProvider;
  checkId: string;
  providerCheckId: string;
  status: BackgroundCheckStatus;
  timestamp: Date;
  data: Record<string, unknown>;
}

// ============================================================================
// Provider Configuration
// ============================================================================

export interface ProviderConfig {
  provider: BackgroundCheckProvider;
  apiKey: string;
  webhookSecret: string;
  baseUrl?: string;
  enabled: boolean;

  // Which checks to perform
  enabledChecks: BackgroundCheckType[];

  // Provider-specific settings
  settings?: Record<string, unknown>;
}

// ============================================================================
// API Responses
// ============================================================================

export interface CreateCheckResponse {
  success: boolean;
  checkId?: string;
  providerCheckId?: string;
  error?: string;
  estimatedCompletionDate?: Date;
}

export interface GetCheckStatusResponse {
  success: boolean;
  check?: BackgroundCheckResult;
  error?: string;
}

export interface CancelCheckResponse {
  success: boolean;
  error?: string;
}

// ============================================================================
// Error Types
// ============================================================================

export class BackgroundCheckError extends Error {
  constructor(
    message: string,
    public code: string,
    public provider: BackgroundCheckProvider,
    public originalError?: unknown
  ) {
    super(message);
    this.name = "BackgroundCheckError";
  }
}

export const ErrorCodes = {
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  INSUFFICIENT_INFO: "INSUFFICIENT_INFO",
  PROVIDER_ERROR: "PROVIDER_ERROR",
  NETWORK_ERROR: "NETWORK_ERROR",
  WEBHOOK_VERIFICATION_FAILED: "WEBHOOK_VERIFICATION_FAILED",
  CHECK_NOT_FOUND: "CHECK_NOT_FOUND",
  INVALID_DOCUMENT: "INVALID_DOCUMENT",
} as const;
