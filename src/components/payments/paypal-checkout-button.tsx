"use client";

/**
 * PayPal Checkout Button Component
 *
 * Renders PayPal payment buttons using the PayPal JavaScript SDK.
 * Handles the complete payment flow: order creation, approval, and capture.
 *
 * USAGE:
 * ```tsx
 * <PayPalCheckoutButton
 *   bookingId="uuid"
 *   amount="100.00"
 *   currency="USD"
 *   onSuccess={(data) => console.log("Payment successful", data)}
 *   onError={(error) => console.error("Payment failed", error)}
 * />
 * ```
 */

import { useEffect, useRef, useState } from "react";
import { logger } from "@/lib/logger";

type PayPalCheckoutButtonProps = {
  bookingId: string;
  amount: string;
  currency: "USD" | "ARS" | "UYU" | "PYG";
  onSuccess?: (data: { orderId: string; captureId?: string; bookingId: string }) => void;
  onError?: (error: Error) => void;
  onCancel?: () => void;
};

// Extend Window type for PayPal SDK
declare global {
  type Window = {
    paypal?: {
      Buttons: (config: {
        createOrder: () => Promise<string>;
        onApprove: (data: { orderID: string }) => Promise<void>;
        onError?: (error: Error) => void;
        onCancel?: () => void;
        style?: {
          layout?: "vertical" | "horizontal";
          color?: "gold" | "blue" | "silver" | "white" | "black";
          shape?: "rect" | "pill";
          label?: "paypal" | "checkout" | "buynow" | "pay" | "installment";
        };
      }) => {
        render: (selector: string) => Promise<void>;
      };
    };
  };
}

export function PayPalCheckoutButton({
  bookingId,
  amount,
  currency,
  onSuccess,
  onError,
  onCancel,
}: PayPalCheckoutButtonProps) {
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // Load PayPal SDK script
  useEffect(() => {
    const loadPayPalScript = async () => {
      try {
        // Get client token from backend
        const tokenResponse = await fetch("/api/paypal/token");
        if (!tokenResponse.ok) {
          throw new Error("Failed to get PayPal client token");
        }
        const { clientToken } = await tokenResponse.json();

        // Load PayPal SDK script
        const script = document.createElement("script");
        script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=${currency}&data-client-token=${clientToken}`;
        script.async = true;
        script.onload = () => {
          setIsScriptLoaded(true);
          setIsLoading(false);
        };
        script.onerror = () => {
          setError("Failed to load PayPal SDK");
          setIsLoading(false);
        };

        document.body.appendChild(script);

        return () => {
          document.body.removeChild(script);
        };
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        logger.error("[PayPal Button] Error loading SDK", { error });
        setError(error.message);
        setIsLoading(false);
      }
    };

    loadPayPalScript();
  }, [currency]);

  // Render PayPal button once SDK is loaded
  useEffect(() => {
    if (!(isScriptLoaded && window.paypal && buttonContainerRef.current)) {
      return;
    }

    const buttons = window.paypal.Buttons({
      createOrder: async () => {
        try {
          // Create order via backend API
          const response = await fetch("/api/paypal/orders/create", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              bookingId,
              amount,
              currency,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to create order");
          }

          const { orderId } = await response.json();
          return orderId;
        } catch (err) {
          const error = err instanceof Error ? err : new Error("Failed to create order");
          logger.error("[PayPal Button] Error creating order", { error });
          onError?.(error);
          throw error;
        }
      },

      onApprove: async (data) => {
        try {
          // Capture payment via backend API
          const response = await fetch(`/api/paypal/orders/${data.orderID}/capture`, {
            method: "POST",
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to capture payment");
          }

          const captureData = await response.json();

          logger.info("[PayPal Button] Payment captured successfully", {
            orderId: data.orderID,
            captureId: captureData.captureId,
            bookingId,
          });

          onSuccess?.({
            orderId: data.orderID,
            captureId: captureData.captureId,
            bookingId,
          });
        } catch (err) {
          const error = err instanceof Error ? err : new Error("Failed to capture payment");
          logger.error("[PayPal Button] Error capturing payment", { error });
          onError?.(error);
        }
      },

      onError: (err) => {
        const error = err instanceof Error ? err : new Error("PayPal payment error");
        logger.error("[PayPal Button] Payment error", { error });
        onError?.(error);
      },

      onCancel: () => {
        logger.info("[PayPal Button] Payment cancelled by user");
        onCancel?.();
      },

      style: {
        layout: "vertical",
        color: "gold",
        shape: "rect",
        label: "paypal",
      },
    });

    buttons.render("#paypal-button-container");
  }, [isScriptLoaded, bookingId, amount, currency, onSuccess, onError, onCancel]);

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-red-800 text-sm">Error loading PayPal: {error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 p-8">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-rausch-500" />
          <p className="text-neutral-600 text-sm">Loading PayPal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="min-h-[150px]" id="paypal-button-container" ref={buttonContainerRef} />
    </div>
  );
}
