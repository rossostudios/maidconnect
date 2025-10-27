"use client";

import { useCallback, useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";

type PaymentAuthorizationCardProps = {
  hasPaymentMethod: boolean;
};

type StepState = "idle" | "loading" | "confirming" | "success" | "error";

export function PaymentAuthorizationCard({ hasPaymentMethod }: PaymentAuthorizationCardProps) {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const stripePromise = useMemo(() => (publishableKey ? loadStripe(publishableKey) : null), [publishableKey]);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [status, setStatus] = useState<StepState>(hasPaymentMethod ? "success" : "idle");
  const [message, setMessage] = useState<string | null>(null);

  const appearance = useMemo(() => ({
    theme: "flat" as const,
    variables: {
      colorPrimary: "#fd857f",
      colorText: "#211f1a",
      colorBackground: "#ffffff",
      borderRadius: "8px",
    },
  }), []);

  const handleStart = useCallback(async () => {
    setStatus("loading");
    setMessage(null);
    try {
      const response = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: 50000,
          currency: "cop",
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Unable to start payment");
      }

      const body = (await response.json()) as { clientSecret: string };
      setClientSecret(body.clientSecret);
      setStatus("idle");
    } catch (error) {
      console.error(error);
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  }, []);

  if (!stripePromise) {
    return (
      <div className="mt-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
        Stripe publishable key is not configured.
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="mt-3 flex flex-col gap-2">
        {status === "success" ? (
          <p className="text-xs text-[#2f7a47]">Payment method on file. You can update it anytime.</p>
        ) : (
          <p className="text-xs text-[#7a6d62]">
            We’ll authorize a small amount (COP $50,000) to keep your payment method on file. You’re only charged after a
            service is completed.
          </p>
        )}
        {message ? <p className="text-xs text-red-600">{message}</p> : null}
        <button
          type="button"
          onClick={handleStart}
          disabled={status === "loading"}
          className="inline-flex w-fit items-center justify-center rounded-md bg-[#fd857f] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#eb6c65] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {status === "loading" ? "Preparing…" : hasPaymentMethod ? "Update payment method" : "Add payment method"}
        </button>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
      <PaymentForm onSuccess={() => setStatus("success")} onError={setMessage} reset={() => setClientSecret(null)} />
      {message ? <p className="mt-2 text-xs text-red-600">{message}</p> : null}
    </Elements>
  );
}

type PaymentFormProps = {
  onSuccess: () => void;
  onError: (message: string | null) => void;
  reset: () => void;
};

function PaymentForm({ onSuccess, onError, reset }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!stripe || !elements) return;
    setIsSubmitting(true);
    onError(null);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin,
        },
        redirect: "if_required",
      });

      if (error) {
        throw new Error(error.message ?? "Payment could not be confirmed.");
      }

      if (paymentIntent?.status === "requires_capture" || paymentIntent?.status === "succeeded") {
        onSuccess();
        reset();
        router.refresh();
      } else {
        throw new Error("Payment is still pending. Please try again.");
      }
    } catch (error) {
      console.error(error);
      onError(error instanceof Error ? error.message : "Unexpected error confirming payment.");
    } finally {
      setIsSubmitting(false);
    }
  }, [stripe, elements, onError, onSuccess, reset, router]);

  return (
    <div className="mt-3 space-y-3 rounded-md border border-[#f0e1dc] bg-white p-4">
      <PaymentElement options={{ layout: "tabs" }} />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-md bg-[#fd857f] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#eb6c65] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Authorizing…" : "Authorize"}
        </button>
        <button
          type="button"
          onClick={reset}
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-md border border-[#f0e1dc] px-3 py-1.5 text-xs font-semibold text-[#7a6d62] transition hover:border-[#fd857f] hover:text-[#fd857f] disabled:cursor-not-allowed disabled:opacity-70"
        >
          Cancel
        </button>
      </div>
      <p className="text-xs text-[#7a6d62]">
        You’ll only be charged after the service is completed. Authorizations expire automatically if unused.
      </p>
    </div>
  );
}
