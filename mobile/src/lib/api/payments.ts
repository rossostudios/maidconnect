import type {
  ConfirmPaymentParams,
  CreatePaymentIntentParams,
  PaymentIntent,
  PaymentIntentResponse,
  PaymentMethod,
} from "@/types/api/payment";
import { supabase } from "../supabase";

/**
 * Create a payment intent for a booking
 */
export async function createPaymentIntent(
  params: CreatePaymentIntentParams
): Promise<PaymentIntentResponse> {
  const { data, error } = await supabase.functions.invoke("create-payment-intent", {
    body: params,
  });

  if (error) {
    console.error("Error creating payment intent:", error);
    throw new Error("Failed to create payment intent");
  }

  return data;
}

/**
 * Confirm a payment intent
 */
export async function confirmPayment(params: ConfirmPaymentParams): Promise<PaymentIntent> {
  const { data, error } = await supabase.functions.invoke("confirm-payment", {
    body: params,
  });

  if (error) {
    console.error("Error confirming payment:", error);
    throw new Error("Failed to confirm payment");
  }

  return data.payment_intent;
}

/**
 * Get user's saved payment methods
 */
export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  const { data, error } = await supabase.functions.invoke("get-payment-methods");

  if (error) {
    console.error("Error fetching payment methods:", error);
    throw new Error("Failed to fetch payment methods");
  }

  return data.payment_methods || [];
}

/**
 * Save a new payment method
 */
export async function savePaymentMethod(payment_method_id: string): Promise<PaymentMethod> {
  const { data, error } = await supabase.functions.invoke("save-payment-method", {
    body: { payment_method_id },
  });

  if (error) {
    console.error("Error saving payment method:", error);
    throw new Error("Failed to save payment method");
  }

  return data.payment_method;
}

/**
 * Delete a payment method
 */
export async function deletePaymentMethod(payment_method_id: string): Promise<void> {
  const { error } = await supabase.functions.invoke("delete-payment-method", {
    body: { payment_method_id },
  });

  if (error) {
    console.error("Error deleting payment method:", error);
    throw new Error("Failed to delete payment method");
  }
}

/**
 * Set default payment method
 */
export async function setDefaultPaymentMethod(payment_method_id: string): Promise<void> {
  const { error } = await supabase.functions.invoke("set-default-payment-method", {
    body: { payment_method_id },
  });

  if (error) {
    console.error("Error setting default payment method:", error);
    throw new Error("Failed to set default payment method");
  }
}
