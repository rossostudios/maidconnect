/**
 * PayPal Integration Module
 *
 * Unified exports for PayPal Payouts API
 */

export { paypal, assertPayPalSignature } from "./client";
export type {
  PayPalConfig,
  PayPalEnvironment,
  PayPalPayoutRequest,
  PayPalPayoutResponse,
  PayPalWebhookEvent,
} from "./client";
