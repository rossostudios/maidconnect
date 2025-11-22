/**
 * PayPal Client Integration
 *
 * Handles PayPal Payouts API for professional payments in:
 * - Paraguay (PY)
 * - Uruguay (UY)
 * - Argentina (AR)
 *
 * Uses PayPal REST API SDK for payouts
 */

import type { NextRequest } from "next/server";

/**
 * PayPal environment configuration
 */
export type PayPalEnvironment = "sandbox" | "production";

/**
 * PayPal client configuration
 */
export interface PayPalConfig {
  clientId: string;
  clientSecret: string;
  environment: PayPalEnvironment;
}

/**
 * PayPal payout request
 */
export interface PayPalPayoutRequest {
  recipientEmail: string;
  amount: number;
  currency: "USD" | "ARS" | "UYU" | "PYG"; // Supported currencies
  note?: string;
  emailSubject?: string;
  recipientType?: "EMAIL" | "PHONE" | "PAYPAL_ID";
}

/**
 * PayPal payout response
 */
export interface PayPalPayoutResponse {
  payoutBatchId: string;
  batchStatus: "PENDING" | "PROCESSING" | "SUCCESS" | "DENIED" | "CANCELED";
  items: Array<{
    payoutItemId: string;
    recipientEmail: string;
    amount: {
      value: string;
      currency: string;
    };
    transactionStatus:
      | "SUCCESS"
      | "FAILED"
      | "PENDING"
      | "UNCLAIMED"
      | "RETURNED"
      | "ONHOLD"
      | "BLOCKED";
  }>;
}

/**
 * PayPal access token response
 */
interface PayPalTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

/**
 * PayPal client class
 */
class PayPalClient {
  private config: PayPalConfig;
  private accessToken: string | null = null;
  private tokenExpiry = 0;

  constructor(config: PayPalConfig) {
    this.config = config;
  }

  /**
   * Get PayPal API base URL based on environment
   */
  private getBaseUrl(): string {
    return this.config.environment === "production"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";
  }

  /**
   * Get access token (cached until expiry)
   */
  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const baseUrl = this.getBaseUrl();
    const auth = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString(
      "base64"
    );

    const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get PayPal access token: ${error}`);
    }

    const data: PayPalTokenResponse = await response.json();

    // Cache token (subtract 60 seconds for safety margin)
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;

    return this.accessToken;
  }

  /**
   * Create a payout to a professional
   */
  async createPayout(payout: PayPalPayoutRequest): Promise<PayPalPayoutResponse> {
    const accessToken = await this.getAccessToken();
    const baseUrl = this.getBaseUrl();

    const requestBody = {
      sender_batch_header: {
        sender_batch_id: `BATCH-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        email_subject: payout.emailSubject || "You have a payment from Casaora",
        email_message: payout.note || "Thank you for your service!",
      },
      items: [
        {
          recipient_type: payout.recipientType || "EMAIL",
          amount: {
            value: payout.amount.toFixed(2),
            currency: payout.currency,
          },
          receiver: payout.recipientEmail,
          note: payout.note || "Payment for services",
          sender_item_id: `ITEM-${Date.now()}`,
        },
      ],
    };

    const response = await fetch(`${baseUrl}/v1/payments/payouts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`PayPal payout failed: ${error}`);
    }

    const data = await response.json();

    return {
      payoutBatchId: data.batch_header.payout_batch_id,
      batchStatus: data.batch_header.batch_status,
      items: data.items.map((item: any) => ({
        payoutItemId: item.payout_item_id,
        recipientEmail: item.payout_item.receiver,
        amount: item.payout_item.amount,
        transactionStatus: item.transaction_status,
      })),
    };
  }

  /**
   * Get payout status
   */
  async getPayoutStatus(payoutBatchId: string): Promise<PayPalPayoutResponse> {
    const accessToken = await this.getAccessToken();
    const baseUrl = this.getBaseUrl();

    const response = await fetch(`${baseUrl}/v1/payments/payouts/${payoutBatchId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get payout status: ${error}`);
    }

    const data = await response.json();

    return {
      payoutBatchId: data.batch_header.payout_batch_id,
      batchStatus: data.batch_header.batch_status,
      items:
        data.items?.map((item: any) => ({
          payoutItemId: item.payout_item_id,
          recipientEmail: item.payout_item.receiver,
          amount: item.payout_item.amount,
          transactionStatus: item.transaction_status,
        })) || [],
    };
  }

  /**
   * Verify PayPal webhook signature
   */
  async verifyWebhookSignature(
    webhookId: string,
    headers: Record<string, string>,
    body: string
  ): Promise<boolean> {
    const accessToken = await this.getAccessToken();
    const baseUrl = this.getBaseUrl();

    const verificationRequest = {
      auth_algo: headers["paypal-auth-algo"],
      cert_url: headers["paypal-cert-url"],
      transmission_id: headers["paypal-transmission-id"],
      transmission_sig: headers["paypal-transmission-sig"],
      transmission_time: headers["paypal-transmission-time"],
      webhook_id: webhookId,
      webhook_event: JSON.parse(body),
    };

    const response = await fetch(`${baseUrl}/v1/notifications/verify-webhook-signature`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(verificationRequest),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Webhook verification failed: ${error}`);
    }

    const data = await response.json();
    return data.verification_status === "SUCCESS";
  }

  /**
   * Test connection to PayPal API
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.getAccessToken();
      return true;
    } catch (error) {
      console.error("[PayPal] Connection test failed:", error);
      return false;
    }
  }

  /**
   * Generate client token for PayPal Checkout SDK
   * Used by frontend to initialize PayPal buttons
   */
  async generateClientToken(): Promise<string> {
    const accessToken = await this.getAccessToken();
    const baseUrl = this.getBaseUrl();

    const response = await fetch(`${baseUrl}/v1/identity/generate-token`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to generate client token: ${error}`);
    }

    const data = await response.json();
    return data.client_token;
  }

  /**
   * Create a PayPal order for checkout
   */
  async createOrder(params: {
    amount: string;
    currency: "USD" | "ARS" | "UYU" | "PYG";
    description?: string;
    metadata?: Record<string, string>;
  }): Promise<{ id: string; status: string }> {
    const accessToken = await this.getAccessToken();
    const baseUrl = this.getBaseUrl();

    const requestBody = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: params.currency,
            value: params.amount,
          },
          description: params.description || "Casaora Booking Payment",
          custom_id: params.metadata ? JSON.stringify(params.metadata) : undefined,
        },
      ],
    };

    const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create PayPal order: ${error}`);
    }

    const data = await response.json();
    return {
      id: data.id,
      status: data.status,
    };
  }

  /**
   * Capture payment for an approved order
   */
  async captureOrder(orderId: string): Promise<{
    id: string;
    status: string;
    captureId?: string;
    amount?: {
      value: string;
      currency: string;
    };
  }> {
    const accessToken = await this.getAccessToken();
    const baseUrl = this.getBaseUrl();

    const response = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to capture PayPal order: ${error}`);
    }

    const data = await response.json();
    const capture = data.purchase_units?.[0]?.payments?.captures?.[0];

    return {
      id: data.id,
      status: data.status,
      captureId: capture?.id,
      amount: capture?.amount,
    };
  }

  /**
   * Get order details
   */
  async getOrder(orderId: string): Promise<{
    id: string;
    status: string;
    amount?: {
      value: string;
      currency: string;
    };
    payer?: {
      email?: string;
      name?: { given_name?: string; surname?: string };
    };
  }> {
    const accessToken = await this.getAccessToken();
    const baseUrl = this.getBaseUrl();

    const response = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get PayPal order: ${error}`);
    }

    const data = await response.json();
    return {
      id: data.id,
      status: data.status,
      amount: data.purchase_units?.[0]?.amount,
      payer: data.payer,
    };
  }
}

// Lazy initialization to avoid throwing errors during build time
let paypalInstance: PayPalClient | null = null;

/**
 * Get PayPal client instance
 */
function getPayPalInstance(): PayPalClient {
  // During build/SSG, skip initialization
  if (typeof window === "undefined" && !process.env.PAYPAL_CLIENT_ID) {
    // Return a mock instance during build
    return {
      _isMock: true,
      createPayout: async () => {
        throw new Error("PayPal not configured");
      },
      getPayoutStatus: async () => {
        throw new Error("PayPal not configured");
      },
      verifyWebhookSignature: async () => false,
      testConnection: async () => false,
      generateClientToken: async () => {
        throw new Error("PayPal not configured");
      },
      createOrder: async () => {
        throw new Error("PayPal not configured");
      },
      captureOrder: async () => {
        throw new Error("PayPal not configured");
      },
      getOrder: async () => {
        throw new Error("PayPal not configured");
      },
    } as unknown as PayPalClient;
  }

  if (!paypalInstance) {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const environment = (process.env.PAYPAL_ENVIRONMENT || "sandbox") as PayPalEnvironment;

    if (!(clientId && clientSecret)) {
      throw new Error(
        "PayPal credentials not configured. Add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to environment."
      );
    }

    paypalInstance = new PayPalClient({
      clientId,
      clientSecret,
      environment,
    });
  }

  return paypalInstance;
}

// Export singleton instance via proxy
export const paypal = new Proxy({} as PayPalClient, {
  get(_target, prop) {
    const instance = getPayPalInstance();
    const value = instance[prop as keyof PayPalClient];
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

/**
 * Assert PayPal webhook signature headers are present
 */
export function assertPayPalSignature(request: NextRequest) {
  const transmissionId = request.headers.get("paypal-transmission-id");
  const transmissionSig = request.headers.get("paypal-transmission-sig");
  const transmissionTime = request.headers.get("paypal-transmission-time");
  const certUrl = request.headers.get("paypal-cert-url");
  const authAlgo = request.headers.get("paypal-auth-algo");

  if (!(transmissionId && transmissionSig && transmissionTime && certUrl && authAlgo)) {
    throw new Error("Missing PayPal webhook signature headers");
  }

  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    throw new Error("PAYPAL_WEBHOOK_ID is not configured");
  }

  return { webhookId };
}

/**
 * PayPal webhook event type
 */
export type PayPalWebhookEvent =
  | "PAYMENT.PAYOUTSBATCH.SUCCESS"
  | "PAYMENT.PAYOUTSBATCH.DENIED"
  | "PAYMENT.PAYOUTS-ITEM.SUCCEEDED"
  | "PAYMENT.PAYOUTS-ITEM.FAILED"
  | "PAYMENT.PAYOUTS-ITEM.BLOCKED"
  | "PAYMENT.PAYOUTS-ITEM.REFUNDED";
