/**
 * Truora Background Check Provider
 *
 * Implementation for Truora API (Colombian & LatAm specialist)
 * Docs: https://docs.truora.com/
 */

import crypto from "node:crypto";
import { BackgroundCheckProviderInterface } from "./providerInterface";
import {
  BackgroundCheckError,
  BackgroundCheckProvider,
  BackgroundCheckResult,
  type BackgroundCheckStatus,
  CancelCheckResponse,
  CreateCheckResponse,
  ErrorCodes,
  GetCheckStatusResponse,
  ProfessionalInfo,
  WebhookEvent,
} from "./types";

type TruoraCheck = {
  check_id: string;
  account_id: string;
  type: string; // 'background-check-colombia'
  status: string; // 'pending', 'success', 'failure'
  creation_date: string;
  user_authorized: boolean;

  // Check results
  checks?: {
    national_background_check?: TruoraCheckResult;
    judicial_records?: TruoraCheckResult;
    disciplinary_records?: TruoraCheckResult; // Procuraduría
    identity_validation?: TruoraCheckResult;
  };
};

type TruoraCheckResult = {
  status: string;
  summary: "pass" | "fail" | "review";
  breakdown?: Array<{
    type: string;
    description: string;
    date?: string;
    severity?: string;
    details?: Record<string, unknown>;
  }>;
};

export class TruoraClient extends BackgroundCheckProviderInterface {
  private readonly apiVersion = "v1";

  getProviderName(): BackgroundCheckProvider {
    return "truora";
  }

  getDefaultBaseUrl(): string {
    return "https://api.truora.com";
  }

  /**
   * Create a background check for Colombian professional
   */
  async createCheck(professionalInfo: ProfessionalInfo): Promise<CreateCheckResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${this.apiVersion}/checks`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          type: "background-check-colombia",
          country: "CO",
          user_authorized: true, // User gave consent

          // Personal information
          national_id: professionalInfo.documentId,
          document_type: this.mapDocumentType(professionalInfo.documentType),

          user_data: {
            first_name: professionalInfo.firstName,
            last_name: professionalInfo.lastName,
            date_of_birth: professionalInfo.dateOfBirth,
            email: professionalInfo.email,
            phone: professionalInfo.phone,
          },

          // Which checks to perform
          checks_requested: [
            "national_background_check", // Criminal records
            "judicial_records", // Judicial records
            "disciplinary_records", // Procuraduría (PGN)
            "identity_validation", // Document verification
          ],

          // Metadata for tracking
          metadata: {
            professional_id: professionalInfo.professionalId,
            source: "casaora_onboarding",
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new BackgroundCheckError(
          `Failed to create check: ${error.message || response.statusText}`,
          ErrorCodes.PROVIDER_ERROR,
          "truora",
          error
        );
      }

      const check: TruoraCheck = await response.json();

      return {
        success: true,
        checkId: check.check_id,
        providerCheckId: check.check_id,
        // Truora typically completes in 1-24 hours
        estimatedCompletionDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };
    } catch (error) {
      console.error("[TruoraClient] Create check failed:", error);

      if (error instanceof BackgroundCheckError) {
        throw error;
      }

      throw new BackgroundCheckError(
        "Failed to create background check",
        ErrorCodes.PROVIDER_ERROR,
        "truora",
        error
      );
    }
  }

  /**
   * Get status of existing background check
   */
  async getCheckStatus(providerCheckId: string): Promise<GetCheckStatusResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${this.apiVersion}/checks/${providerCheckId}`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Truora API error: ${response.status}`);
      }

      const check: TruoraCheck = await response.json();
      const result = this.transformResult(check);

      return {
        success: true,
        check: result,
      };
    } catch (error) {
      console.error("[TruoraClient] Get status failed:", error);

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Cancel a pending background check
   */
  async cancelCheck(_providerCheckId: string): Promise<CancelCheckResponse> {
    try {
      // Truora doesn't have a direct cancel endpoint, but we can mark it as canceled in our system
      // The check will eventually time out on their end
      console.warn(
        "[TruoraClient] Truora does not support check cancellation. Check will expire naturally."
      );

      return { success: true };
    } catch (error) {
      console.error("[TruoraClient] Cancel check failed:", error);

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Verify Truora webhook signature
   */
  async verifyWebhook(
    payload: string | Buffer,
    signature: string,
    _headers: Record<string, string | string[] | undefined>
  ): Promise<WebhookEvent> {
    const payloadString = typeof payload === "string" ? payload : payload.toString("utf8");

    // Truora uses X-Truora-Signature header with HMAC-SHA256
    const expectedSignature = crypto
      .createHmac("sha256", this.webhookSecret)
      .update(payloadString)
      .digest("hex");

    if (signature !== expectedSignature) {
      throw new BackgroundCheckError(
        "Webhook signature verification failed",
        ErrorCodes.WEBHOOK_VERIFICATION_FAILED,
        "truora"
      );
    }

    // Parse webhook payload
    const data = JSON.parse(payloadString);

    return this.transformWebhookEvent(data);
  }

  /**
   * Transform Truora status to our unified status
   */
  transformStatus(providerStatus: string): BackgroundCheckStatus {
    const statusMap: Record<string, BackgroundCheckStatus> = {
      pending: "pending",
      success: "clear",
      failure: "suspended",
      manual_review: "consider",
      expired: "suspended",
    };

    return statusMap[providerStatus.toLowerCase()] || "pending";
  }

  /**
   * Transform Truora check to our unified format
   */
  transformResult(providerData: unknown): BackgroundCheckResult {
    const check = providerData as TruoraCheck;

    const status = this.transformStatus(check.status);

    return {
      id: check.check_id,
      providerCheckId: check.check_id,
      provider: "truora",
      professionalId: check.account_id,
      status,
      checksPerformed: this.extractChecksPerformed(check),
      completedAt: check.status !== "pending" ? new Date(check.creation_date) : undefined,
      results: {
        criminal: check.checks?.judicial_records
          ? {
              status: this.transformCheckResultStatus(check.checks.judicial_records.summary),
              records:
                check.checks.judicial_records.breakdown?.map((item) => ({
                  description: item.description,
                  date: item.date,
                  severity: this.mapSeverity(item.severity),
                  details: item.details,
                })) || [],
            }
          : undefined,

        disciplinary: check.checks?.disciplinary_records
          ? {
              status: this.transformCheckResultStatus(check.checks.disciplinary_records.summary),
              records:
                check.checks.disciplinary_records.breakdown?.map((item) => ({
                  description: item.description,
                  date: item.date,
                  severity: this.mapSeverity(item.severity),
                  details: item.details,
                })) || [],
            }
          : undefined,

        identity: check.checks?.identity_validation
          ? {
              status: this.transformCheckResultStatus(check.checks.identity_validation.summary),
              records:
                check.checks.identity_validation.breakdown?.map((item) => ({
                  description: item.description,
                  details: item.details,
                })) || [],
            }
          : undefined,
      },
      recommendation: this.determineRecommendation(check),
      rawData: check as unknown as Record<string, unknown>,
      createdAt: new Date(check.creation_date),
      updatedAt: new Date(),
    };
  }

  /**
   * Test Truora API credentials
   */
  async testCredentials(): Promise<boolean> {
    try {
      // Test with a simple GET to the account endpoint
      const response = await fetch(`${this.baseUrl}/${this.apiVersion}/account`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      return response.ok;
    } catch (error) {
      console.error("[TruoraClient] Credential test failed:", error);
      return false;
    }
  }

  /**
   * Estimate cost for Truora check
   */
  async estimateCost(checkTypes: string[]): Promise<number | null> {
    // Truora pricing (approximate, in cents USD):
    // - Basic criminal check: $2 USD = 200 cents
    // - Disciplinary (PGN): $1 USD = 100 cents
    // - Identity validation: $1 USD = 100 cents
    // - Full package: ~$4-5 USD = 400-500 cents

    let totalCost = 0;

    if (checkTypes.includes("criminal")) {
      totalCost += 200;
    }
    if (checkTypes.includes("disciplinary")) {
      totalCost += 100;
    }
    if (checkTypes.includes("identity")) {
      totalCost += 100;
    }

    // Add base fee
    totalCost += 50;

    return totalCost;
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private getHeaders(): Record<string, string> {
    return {
      "Truora-API-Key": this.apiKey,
      "Content-Type": "application/json",
    };
  }

  private mapDocumentType(type: string): string {
    // Map LATAM document types to Truora's expected values
    const typeMap: Record<string, string> = {
      // Colombia
      CC: "cedula_ciudadania",
      CE: "cedula_extranjeria",
      NIT: "nit",
      // Paraguay, Uruguay
      CI: "cedula_identidad",
      // Argentina
      DNI: "dni",
      // Universal
      PA: "passport",
    };

    return typeMap[type] || "cedula_ciudadania";
  }

  private extractChecksPerformed(
    check: TruoraCheck
  ): Array<"criminal" | "identity" | "disciplinary"> {
    const checks: Array<"criminal" | "identity" | "disciplinary"> = [];

    if (check.checks?.judicial_records || check.checks?.national_background_check) {
      checks.push("criminal");
    }
    if (check.checks?.disciplinary_records) {
      checks.push("disciplinary");
    }
    if (check.checks?.identity_validation) {
      checks.push("identity");
    }

    return checks;
  }

  private transformCheckResultStatus(summary: "pass" | "fail" | "review"): BackgroundCheckStatus {
    const statusMap: Record<string, BackgroundCheckStatus> = {
      pass: "clear",
      fail: "suspended",
      review: "consider",
    };

    return statusMap[summary] || "pending";
  }

  private mapSeverity(severity?: string): "low" | "medium" | "high" {
    if (!severity) {
      return "low";
    }

    const sev = severity.toLowerCase();
    if (sev.includes("high") || sev.includes("grave")) {
      return "high";
    }
    if (sev.includes("medium") || sev.includes("moderate")) {
      return "medium";
    }
    return "low";
  }

  private determineRecommendation(check: TruoraCheck): "approved" | "review_required" | "rejected" {
    if (check.status === "success") {
      // Check if all sub-checks passed
      const allChecksPassed = Object.values(check.checks || {}).every(
        (result) => result.summary === "pass"
      );

      if (allChecksPassed) {
        return "approved";
      }
      return "review_required";
    }

    if (check.status === "failure") {
      return "rejected";
    }
    if (check.status === "manual_review") {
      return "review_required";
    }

    return "review_required";
  }

  private transformWebhookEvent(data: any): WebhookEvent {
    return {
      type: this.mapWebhookType(data.event_type || data.type),
      provider: "truora",
      checkId: data.check_id || data.object?.check_id,
      providerCheckId: data.check_id || data.object?.check_id,
      status: this.transformStatus(data.status || data.object?.status),
      timestamp: new Date(),
      data,
    };
  }

  private mapWebhookType(truoraType: string): WebhookEvent["type"] {
    const typeMap: Record<string, WebhookEvent["type"]> = {
      "check.created": "check.created",
      "check.completed": "check.completed",
      "check.updated": "check.updated",
      "check.failed": "check.failed",
    };

    return typeMap[truoraType] || "check.updated";
  }
}
