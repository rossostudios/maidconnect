import type { CurrencyCode } from '../territories';

export type PaymentProcessor = 'stripe' | 'paypal';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'refunded';

export interface PaymentIntent {
  id: string;
  amount_cents: number;
  currency_code: CurrencyCode;
  status: PaymentStatus;
  processor: PaymentProcessor;
  client_secret?: string;
  metadata?: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal';
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  is_default: boolean;
  created_at: string;
}

export interface CreatePaymentIntentParams {
  booking_id: string;
  amount_cents: number;
  currency_code: CurrencyCode;
  payment_method?: 'stripe' | 'paypal';
}

export interface ConfirmPaymentParams {
  payment_intent_id: string;
  payment_method_id?: string;
}

export interface PaymentIntentResponse {
  payment_intent: PaymentIntent;
  client_secret: string;
  publishable_key: string;
}
