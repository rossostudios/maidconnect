"use client";

import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
        colorPrimary: "neutral-900",
        colorText: "neutral-800",
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
      <Card className="mt-4 border-red-200 bg-red-50">
        <CardContent className="px-4 py-3 text-red-800 text-sm">
          Stripe publishable key is not configured.
        </CardContent>
      </Card>
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
          <p className="text-neutral-600 text-sm leading-relaxed">
            We'll authorize a small amount (COP $50,000) to keep your payment method on file. You're
            only charged after a service is completed.
          </p>
        )}
        {message ? <p className="text-red-600 text-sm">{message}</p> : null}
        <button
          className={cn(
            "inline-flex w-fit items-center justify-center px-6 py-3 font-semibold text-base transition",
            "bg-neutral-900 text-white shadow-lg hover:bg-neutral-800",
            "disabled:cursor-not-allowed disabled:opacity-70"
          )}
          disabled={status === "loading"}
          onClick={handleStart}
          type="button"
        >
          {(() => {
            if (status === "loading") {
              return "Preparing…";
            }
            if (hasPaymentMethod) {
              return "Update payment method";
            }
            return "Add payment method";
          })()}
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
    <Card className="mt-4 border-neutral-200 bg-white shadow-sm">
      <CardContent className="space-y-4 p-6">
        <PaymentElement options={{ layout: "tabs" }} />
        <div className="flex items-center gap-3">
          <button
            className={cn(
              "inline-flex items-center justify-center px-6 py-3 font-semibold text-base transition",
              "bg-neutral-900 text-white shadow-lg hover:bg-neutral-800",
              "disabled:cursor-not-allowed disabled:opacity-70"
            )}
            disabled={isSubmitting}
            onClick={handleSubmit}
            type="button"
          >
            {isSubmitting ? "Authorizing…" : "Authorize"}
          </button>
          <button
            className={cn(
              "inline-flex items-center justify-center border-2 px-6 py-3 font-semibold text-base transition",
              "border-neutral-300 text-neutral-700 hover:border-neutral-400 hover:text-neutral-900",
              "disabled:cursor-not-allowed disabled:opacity-70"
            )}
            disabled={isSubmitting}
            onClick={reset}
            type="button"
          >
            Cancel
          </button>
        </div>
        <p className="text-neutral-600 text-sm leading-relaxed">
          You'll only be charged after the service is completed. Authorizations expire automatically
          if unused.
        </p>
      </CardContent>
    </Card>
  );
}
