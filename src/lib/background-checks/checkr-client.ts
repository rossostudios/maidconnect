/**
 * Checkr Background Check Provider
 *
 * Implementation for Checkr API (Colombia support)
 * Docs: https://docs.checkr.com/
 */

import crypto from "node:crypto";
import { BackgroundCheckProviderInterface } from "./provider-interface";
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

type CheckrCandidate = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  zipcode?: string;
  dob?: string;
  ssn?: string;
  driver_license_number?: string;
  driver_license_state?: string;
  copy_requested: boolean;
};

type CheckrReport = {
  id: string;
  status: string; // 'pending', 'complete', 'consider', 'suspended', 'canceled'
  completed_at?: string;
  tat?: string;
  package?: string;
  candidate_id: string;

  // Colombia-specific fields
  national_id_search?: CheckrRecordResult;
  criminal_search?: CheckrRecordResult;

  // Other checks
  records?: Array<{
    type: string;
    status: string;
    created_at: string;
    completed_at?: string;
    result?: string;
  }>;
};

type CheckrRecordResult = {
  status: string;
  records: Array<{
    case_number?: string;
    file_date?: string;
    arresting_agency?: string;
    court_jurisdiction?: string;
    court_of_record?: string;
    charges?: Array<{
      charge: string;
      classification?: string;
      severity?: string;
      disposition?: string;
      disposition_date?: string;
      sentence?: string;
    }>;
  }>;
};

export class CheckrClient extends BackgroundCheckProviderInterface {
  private readonly apiVersion = "v1";

  getProviderName(): BackgroundCheckProvider {
    return "checkr";
  }

  getDefaultBaseUrl(): string {
    return "https://api.checkr.com";
  }

  /**
   * Create a background check for Colombian professional
   */
  async createCheck(professionalInfo: ProfessionalInfo): Promise<CreateCheckResponse> {
    try {
      // Step 1: Create candidate
      const candidate = await this.createCandidate(professionalInfo);

      // Step 2: Create report (background check) for the candidate
      // For Colombia, use 'colombian_national_criminal_search' package
      const report = await this.createReport(candidate.id, professionalInfo);

      return {
        success: true,
        checkId: report.id,
        providerCheckId: report.id,
        estimatedCompletionDate: this.estimateCompletionDate(report.tat),
      };
    } catch (error) {
      console.error("[CheckrClient] Create check failed:", error);

      if (error instanceof BackgroundCheckError) {
        throw error;
      }

      throw new BackgroundCheckError(
        "Failed to create background check",
        ErrorCodes.PROVIDER_ERROR,
        "checkr",
        error
      );
    }
  }

  /**
   * Get status of existing background check
   */
  async getCheckStatus(providerCheckId: string): Promise<GetCheckStatusResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.apiVersion}/reports/${providerCheckId}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Checkr API error: ${response.status}`);
      }

      const report: CheckrReport = await response.json();
      const result = this.transformResult(report);

      return {
        success: true,
        check: result,
      };
    } catch (error) {
      console.error("[CheckrClient] Get status failed:", error);

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Cancel a pending background check
   */
  async cancelCheck(providerCheckId: string): Promise<CancelCheckResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.apiVersion}/reports/${providerCheckId}`,
        {
          method: "DELETE",
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to cancel check: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      console.error("[CheckrClient] Cancel check failed:", error);

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Verify Checkr webhook signature
   */
  async verifyWebhook(
    payload: string | Buffer,
    signature: string,
    _headers: Record<string, string | string[] | undefined>
  ): Promise<WebhookEvent> {
    const payloadString = typeof payload === "string" ? payload : payload.toString("utf8");

    // Checkr uses HMAC-SHA256 for webhook verification
    const expectedSignature = crypto
      .createHmac("sha256", this.webhookSecret)
      .update(payloadString)
      .digest("hex");

    if (signature !== expectedSignature) {
      throw new BackgroundCheckError(
        "Webhook signature verification failed",
        ErrorCodes.WEBHOOK_VERIFICATION_FAILED,
        "checkr"
      );
    }

    // Parse webhook payload
    const data = JSON.parse(payloadString);

    return this.transformWebhookEvent(data);
  }

  /**
   * Transform Checkr status to our unified status
   */
  transformStatus(providerStatus: string): BackgroundCheckStatus {
    const statusMap: Record<string, BackgroundCheckStatus> = {
      pending: "pending",
      complete: "clear",
      consider: "consider",
      suspended: "suspended",
      canceled: "suspended",
    };

    return statusMap[providerStatus.toLowerCase()] || "pending";
  }

  /**
   * Transform Checkr report to our unified format
   */
  transformResult(providerData: unknown): BackgroundCheckResult {
    const report = providerData as CheckrReport;

    const status = this.transformStatus(report.status);

    return {
      id: report.id,
      providerCheckId: report.id,
      provider: "checkr",
      professionalId: report.candidate_id,
      status,
      checksPerformed: this.extractChecksPerformed(report),
      completedAt: report.completed_at ? new Date(report.completed_at) : undefined,
      results: {
        criminal: report.criminal_search
          ? {
              status: this.transformStatus(report.criminal_search.status),
              records: report.criminal_search.records.map((record) => ({
                description:
                  record.charges?.map((c) => c.charge).join(", ") || "Criminal record found",
                date: record.file_date,
                severity: this.determineSeverity(record.charges),
                details: record,
              })),
            }
          : undefined,
        identity: report.national_id_search
          ? {
              status: this.transformStatus(report.national_id_search.status),
              records: report.national_id_search.records.map((record) => ({
                description: "National ID verified",
                details: record,
              })),
            }
          : undefined,
      },
      recommendation: this.determineRecommendation(status, report),
      rawData: report as unknown as Record<string, unknown>,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Test Checkr API credentials
   */
  async testCredentials(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/${this.apiVersion}/candidates`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      return response.ok;
    } catch (error) {
      console.error("[CheckrClient] Credential test failed:", error);
      return false;
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private async createCandidate(info: ProfessionalInfo): Promise<CheckrCandidate> {
    const response = await fetch(`${this.baseUrl}/${this.apiVersion}/candidates`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        first_name: info.firstName,
        middle_name: "",
        last_name: info.lastName,
        email: info.email,
        phone: info.phone,
        zipcode: info.address?.postalCode,
        dob: info.dateOfBirth,

        // Colombian national ID (Cédula)
        copy_requested: false,
        custom_id: info.documentId, // Store Cédula number here

        // Metadata for our records
        metadata: {
          document_type: info.documentType,
          document_id: info.documentId,
          professional_id: info.professionalId,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new BackgroundCheckError(
        `Failed to create candidate: ${error.message || response.statusText}`,
        ErrorCodes.PROVIDER_ERROR,
        "checkr",
        error
      );
    }

    return await response.json();
  }

  private async createReport(candidateId: string, info: ProfessionalInfo): Promise<CheckrReport> {
    const response = await fetch(`${this.baseUrl}/${this.apiVersion}/reports`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        candidate_id: candidateId,
        // Colombian background check package
        package: "colombian_national_criminal_search",
        // Additional metadata
        metadata: {
          professional_id: info.professionalId,
          document_id: info.documentId,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new BackgroundCheckError(
        `Failed to create report: ${error.message || response.statusText}`,
        ErrorCodes.PROVIDER_ERROR,
        "checkr",
        error
      );
    }

    return await response.json();
  }

  private getHeaders(): Record<string, string> {
    return {
      Authorization: `Basic ${Buffer.from(`${this.apiKey}:`).toString("base64")}`,
      "Content-Type": "application/json",
    };
  }

  private estimateCompletionDate(tat?: string): Date | undefined {
    if (!tat) {
      return;
    }

    // TAT (Turnaround Time) is typically in minutes
    const minutes = Number.parseInt(tat, 10);
    if (Number.isNaN(minutes)) {
      return;
    }

    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    return now;
  }

  private extractChecksPerformed(
    report: CheckrReport
  ): Array<"criminal" | "identity" | "disciplinary"> {
    const checks: Array<"criminal" | "identity" | "disciplinary"> = [];

    if (report.criminal_search) {
      checks.push("criminal");
    }
    if (report.national_id_search) {
      checks.push("identity");
    }

    return checks;
  }

  private determineSeverity(charges?: Array<{ severity?: string }>): "low" | "medium" | "high" {
    if (!charges || charges.length === 0) {
      return "low";
    }

    const hasFelony = charges.some((c) => c.severity?.toLowerCase().includes("felony"));
    if (hasFelony) {
      return "high";
    }

    const hasMisdemeanor = charges.some((c) => c.severity?.toLowerCase().includes("misdemeanor"));
    if (hasMisdemeanor) {
      return "medium";
    }

    return "low";
  }

  private determineRecommendation(
    status: BackgroundCheckStatus,
    _report: CheckrReport
  ): "approved" | "review_required" | "rejected" {
    if (status === "clear") {
      return "approved";
    }
    if (status === "suspended") {
      return "rejected";
    }
    if (status === "consider") {
      return "review_required";
    }
    return "review_required";
  }

  private transformWebhookEvent(data: any): WebhookEvent {
    return {
      type: this.mapWebhookType(data.type),
      provider: "checkr",
      checkId: data.object?.id || data.id,
      providerCheckId: data.object?.id || data.id,
      status: this.transformStatus(data.object?.status || data.status),
      timestamp: new Date(),
      data,
    };
  }

  private mapWebhookType(checkrType: string): WebhookEvent["type"] {
    const typeMap: Record<string, WebhookEvent["type"]> = {
      "report.created": "check.created",
      "report.completed": "check.completed",
      "report.updated": "check.updated",
      "report.failed": "check.failed",
    };

    return typeMap[checkrType] || "check.updated";
  }
}
