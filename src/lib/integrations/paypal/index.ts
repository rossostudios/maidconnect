/**
 * PayPal Integration Module
 *
 * Unified exports for PayPal Payouts API
 */

export type {
  PayPalConfig,
  PayPalEnvironment,
  PayPalPayoutRequest,
  PayPalPayoutResponse,
  PayPalWebhookEvent,
} from "./client";
export { assertPayPalSignature, paypal } from "./client";
