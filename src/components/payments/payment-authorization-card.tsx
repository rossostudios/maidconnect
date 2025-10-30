"use client";

import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

type PaymentAuthorizationCardProps = {
  hasPaymentMethod: boolean;
};

type StepState = "idle" | "loading" | "confirming" | "success" | "error";

export function PaymentAuthorizationCard({ hasPaymentMethod }: PaymentAuthorizationCardProps) {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const stripePromise = useMemo(
    () => (publishableKey ? loadStripe(publishableKey) : null),
    [publishableKey]
  );
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [status, setStatus] = useState<StepState>(hasPaymentMethod ? "success" : "idle");
  const [message, setMessage] = useState<string | null>(null);

  const appearance = useMemo(
    () => ({
      theme: "flat" as const,
      variables: {
        colorPrimary: "#ff5d46",
        colorText: "#211f1a",
        colorBackground: "#ffffff",
        borderRadius: "12px",
      },
    }),
    []
  );

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
          amount: 50_000,
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
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Something went wrong. Please try again."
      );
    }
  }, []);

  if (!stripePromise) {
    return (
      <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-red-600 text-sm">
        Stripe publishable key is not configured.
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="mt-4 flex flex-col gap-3">
        {status === "success" ? (
          <p className="text-green-700 text-sm">
            Payment method on file. You can update it anytime.
          </p>
        ) : (
          <p className="text-[#5d574b] text-sm leading-relaxed">
            We'll authorize a small amount (COP $50,000) to keep your payment method on file. You're
            only charged after a service is completed.
          </p>
        )}
        {message ? <p className="text-red-600 text-sm">{message}</p> : null}
        <button
          className="inline-flex w-fit items-center justify-center rounded-full bg-[#ff5d46] px-6 py-3 font-semibold text-base text-white shadow-[0_6px_18px_rgba(255,93,70,0.22)] transition hover:bg-[#eb6c65] disabled:cursor-not-allowed disabled:opacity-70"
          disabled={status === "loading"}
          onClick={handleStart}
          type="button"
        >
          {status === "loading"
            ? "Preparing…"
            : hasPaymentMethod
              ? "Update payment method"
              : "Add payment method"}
        </button>
      </div>
    );
  }

  return (
    <Elements options={{ clientSecret, appearance }} stripe={stripePromise}>
      <PaymentForm
        onError={setMessage}
        onSuccess={() => setStatus("success")}
        reset={() => setClientSecret(null)}
      />
      {message ? <p className="mt-2 text-red-600 text-xs">{message}</p> : null}
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
    if (!(stripe && elements)) {
      return;
    }
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
      onError(error instanceof Error ? error.message : "Unexpected error confirming payment.");
    } finally {
      setIsSubmitting(false);
    }
  }, [stripe, elements, onError, onSuccess, reset, router]);

  return (
    <div className="mt-4 space-y-4 rounded-2xl border border-[#ebe5d8] bg-white p-6 shadow-sm">
      <PaymentElement options={{ layout: "tabs" }} />
      <div className="flex items-center gap-3">
        <button
          className="inline-flex items-center justify-center rounded-full bg-[#ff5d46] px-6 py-3 font-semibold text-base text-white shadow-[0_6px_18px_rgba(255,93,70,0.22)] transition hover:bg-[#eb6c65] disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSubmitting}
          onClick={handleSubmit}
          type="button"
        >
          {isSubmitting ? "Authorizing…" : "Authorize"}
        </button>
        <button
          className="inline-flex items-center justify-center rounded-full border-2 border-[#ebe5d8] px-6 py-3 font-semibold text-[#211f1a] text-base transition hover:border-[#ff5d46] hover:text-[#ff5d46] disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSubmitting}
          onClick={reset}
          type="button"
        >
          Cancel
        </button>
      </div>
      <p className="text-[#5d574b] text-sm leading-relaxed">
        You'll only be charged after the service is completed. Authorizations expire automatically
        if unused.
      </p>
    </div>
  );
}
