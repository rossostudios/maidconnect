import { supabase } from "@/lib/supabase";
import { env } from "@/lib/env";
import type { CreatePaymentIntentParams, PaymentIntent, PaymentMethod } from "./types";

/**
 * Fetch saved payment methods for the current user
 */
export async function fetchPaymentMethods(): Promise<PaymentMethod[]> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${env.apiUrl}/api/payments/methods`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch payment methods");
  }

  const data = await response.json();
  return data.paymentMethods || [];
}

/**
 * Create a payment intent for booking authorization
 */
export async function createPaymentIntent(
  params: CreatePaymentIntentParams
): Promise<PaymentIntent> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${env.apiUrl}/api/payments/create-intent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      amount: params.amount,
      currency: params.currency || "cop",
      bookingId: params.bookingId,
      description: params.description,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create payment intent");
  }

  return response.json();
}

/**
 * Capture a payment intent (charge the card)
 */
export async function capturePaymentIntent(paymentIntentId: string): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${env.apiUrl}/api/payments/capture-intent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ paymentIntentId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to capture payment");
  }
}

/**
 * Void a payment intent (cancel authorization)
 */
export async function voidPaymentIntent(paymentIntentId: string): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${env.apiUrl}/api/payments/void-intent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ paymentIntentId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to void payment");
  }
}

/**
 * Process a tip payment
 */
export async function processTip(params: {
  bookingId: string;
  amount: number;
}): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${env.apiUrl}/api/payments/process-tip`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to process tip");
  }
}

/**
 * Save a payment method to the backend
 */
export async function savePaymentMethod(params: {
  stripePaymentMethodId: string;
  isDefault?: boolean;
}): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${env.apiUrl}/api/payments/methods`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to save payment method");
  }
}

/**
 * Delete a payment method
 */
export async function deletePaymentMethod(paymentMethodId: string): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${env.apiUrl}/api/payments/methods/${paymentMethodId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete payment method");
  }
}

/**
 * Set a payment method as default
 */
export async function setDefaultPaymentMethod(paymentMethodId: string): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${env.apiUrl}/api/payments/methods/${paymentMethodId}/default`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to set default payment method");
  }
}

/**
 * Get Stripe publishable key from environment
 */
export function getStripePublishableKey(): string {
  return process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
}
