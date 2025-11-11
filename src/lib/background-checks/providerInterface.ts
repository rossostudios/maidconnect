/**
 * Background Check Provider Interface
 *
 * Abstract interface that all background check providers must implement.
 * Ensures consistent behavior between Checkr, Truora, and future providers.
 */

import type {
  BackgroundCheckProvider,
  BackgroundCheckResult,
  CancelCheckResponse,
  CreateCheckResponse,
  GetCheckStatusResponse,
  ProfessionalInfo,
  WebhookEvent,
} from "./types";

/**
 * Abstract base class for background check providers
 */
export abstract class BackgroundCheckProviderInterface {
  protected apiKey: string;
  protected webhookSecret: string;
  protected baseUrl: string;

  constructor(apiKey: string, webhookSecret: string, baseUrl?: string) {
    this.apiKey = apiKey;
    this.webhookSecret = webhookSecret;
    this.baseUrl = baseUrl || this.getDefaultBaseUrl();
  }

  /**
   * Get the provider name
   */
  abstract getProviderName(): BackgroundCheckProvider;

  /**
   * Get default API base URL for this provider
   */
  abstract getDefaultBaseUrl(): string;

  /**
   * Create a new background check
   *
   * @param professionalInfo - Information about the professional to check
   * @returns Response with check ID and estimated completion date
   */
  abstract createCheck(professionalInfo: ProfessionalInfo): Promise<CreateCheckResponse>;

  /**
   * Get the current status of a background check
   *
   * @param providerCheckId - The provider's check ID (not our internal ID)
   * @returns Current check status and results
   */
  abstract getCheckStatus(providerCheckId: string): Promise<GetCheckStatusResponse>;

  /**
   * Cancel a pending background check
   *
   * @param providerCheckId - The provider's check ID
   * @returns Success status
   */
  abstract cancelCheck(providerCheckId: string): Promise<CancelCheckResponse>;

  /**
   * Verify and parse webhook payload
   *
   * @param payload - Raw webhook payload (string or buffer)
   * @param signature - Webhook signature from headers
   * @param headers - Full webhook headers
   * @returns Parsed webhook event
   * @throws BackgroundCheckError if verification fails
   */
  abstract verifyWebhook(
    payload: string | Buffer,
    signature: string,
    headers: Record<string, string | string[] | undefined>
  ): Promise<WebhookEvent>;

  /**
   * Transform provider-specific status to our unified status
   *
   * @param providerStatus - Status string from provider
   * @returns Our unified status
   */
  abstract transformStatus(providerStatus: string): "pending" | "clear" | "consider" | "suspended";

  /**
   * Transform provider-specific result to our unified format
   *
   * @param providerData - Raw data from provider
   * @returns Unified background check result
   */
  abstract transformResult(providerData: unknown): BackgroundCheckResult;

  /**
   * Test API credentials
   *
   * @returns True if credentials are valid
   */
  abstract testCredentials(): Promise<boolean>;

  /**
   * Get rate limit information (optional)
   *
   * @returns Current rate limit status
   */
  async getRateLimitStatus(): Promise<{ remaining: number; resetAt: Date } | null> {
    // Default implementation - override if provider supports rate limit info
    return null;
  }

  /**
   * Estimate cost for a background check (optional)
   *
   * @param checkTypes - Types of checks to perform
   * @returns Estimated cost in cents (USD)
   */
  async estimateCost(_checkTypes: string[]): Promise<number | null> {
    // Default implementation - override if provider provides cost estimates
    return null;
  }
}
