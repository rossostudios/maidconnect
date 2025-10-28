"use client";

import { useActionState, useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

type BookingFormProps = {
  professionalId: string;
  professionalName: string;
};

type FormState = {
  status: "idle" | "loading" | "success" | "error";
  message?: string;
  bookingId?: string;
  clientSecret?: string;
  paymentIntentId?: string;
};

const initialState: FormState = { status: "idle" };

export function BookingForm({ professionalId, professionalName }: BookingFormProps) {
  const [state, action, pending] = useActionState<FormState, FormData>(createBookingAction, initialState);

  useEffect(() => {
    if (state.status === "success") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [state.status]);

  if (!stripePromise) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        Stripe publishable key is not configured. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in your environment.
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-[24px] border border-[#e5dfd4] bg-white p-6 shadow-[0_16px_30px_rgba(18,17,15,0.05)]">
      <h2 className="text-lg font-semibold text-[#211f1a]">Request a booking</h2>
      <p className="text-sm text-[#5d574b]">
        Confirm your booking with {professionalName}. We’ll place a temporary hold and only capture after the service is completed.
      </p>
      {state.status === "error" && state.message ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{state.message}</div>
      ) : null}
      {state.status === "success" && state.bookingId ? (
        <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          Booking created successfully. We’ll notify the professional and confirm shortly.
        </div>
      ) : null}
      <form action={action} className="space-y-4">
        <input type="hidden" name="professionalId" value={professionalId} />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Date" helper="Preferred service date">
            <input
              name="scheduledDate"
              type="date"
              className="w-full rounded-md border border-[#e5dfd4] px-3 py-2 text-sm focus:border-[#fd857f] focus:outline-none focus:ring-2 focus:ring-[#fd857f33]"
              required
            />
          </FormField>
          <FormField label="Start time">
            <input
              name="scheduledTime"
              type="time"
              className="w-full rounded-md border border-[#e5dfd4] px-3 py-2 text-sm focus:border-[#fd857f] focus:outline-none focus:ring-2 focus:ring-[#fd857f33]"
              required
            />
          </FormField>
          <FormField label="Estimated duration (hours)">
            <input
              name="duration"
              type="number"
              min={1}
              max={12}
              defaultValue={2}
              className="w-full rounded-md border border-[#e5dfd4] px-3 py-2 text-sm focus:border-[#fd857f] focus:outline-none focus:ring-2 focus:ring-[#fd857f33]"
              required
            />
          </FormField>
          <FormField label="Estimated total (COP)" helper="You are only charged after completion">
            <input
              name="amount"
              type="number"
              min={20000}
              step={1000}
              defaultValue={80000}
              className="w-full rounded-md border border-[#e5dfd4] px-3 py-2 text-sm focus:border-[#fd857f] focus:outline-none focus:ring-2 focus:ring-[#fd857f33]"
              required
            />
          </FormField>
        </div>
        <FormField label="Special instructions">
          <textarea
            name="specialInstructions"
            rows={3}
            className="w-full rounded-md border border-[#e5dfd4] px-3 py-2 text-sm focus:border-[#fd857f] focus:outline-none focus:ring-2 focus:ring-[#fd857f33]"
            placeholder="Building entry instructions, pets, cleaning priorities..."
          />
        </FormField>
        <FormField label="Service address">
          <textarea
            name="address"
            rows={2}
            className="w-full rounded-md border border-[#e5dfd4] px-3 py-2 text-sm focus:border-[#fd857f] focus:outline-none focus:ring-2 focus:ring-[#fd857f33]"
            placeholder="Street, city, any access info"
          />
        </FormField>
        <button
          type="submit"
          disabled={pending || state.status === "loading"}
          className="inline-flex items-center justify-center rounded-md bg-[#fd857f] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#eb6c65] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pending ? "Creating booking…" : "Create booking"}
        </button>
      </form>

      {state.status === "success" && state.clientSecret ? (
        <Elements stripe={stripePromise} options={{ clientSecret: state.clientSecret, appearance: stripeAppearance }}>
          <PaymentConfirmation
            bookingId={state.bookingId!}
            onReset={() => window.location.reload()}
          />
        </Elements>
      ) : null}
    </div>
  );
}

const stripeAppearance = {
  theme: "flat" as const,
  variables: {
    colorPrimary: "#fd857f",
    colorText: "#211f1a",
    borderRadius: "8px",
  },
};

async function createBookingAction(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const scheduledDate = formData.get("scheduledDate") as string | null;
    const scheduledTime = formData.get("scheduledTime") as string | null;
    const professionalId = formData.get("professionalId") as string | null;
    const duration = formData.get("duration") as string | null;
    const amount = formData.get("amount") as string | null;

    if (!professionalId) {
      return { status: "error", message: "Missing professional." };
    }

    if (!scheduledDate || !scheduledTime) {
      return { status: "error", message: "Please select a date and time." };
    }

    if (!amount) {
      return { status: "error", message: "Please set an estimated amount." };
    }

    const scheduledStart = new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString();

    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        professionalId,
        scheduledStart,
        durationMinutes: duration ? Number(duration) * 60 : undefined,
        amount: Math.round(Number(amount)),
        specialInstructions: formData.get("specialInstructions") ?? undefined,
        address: formData.get("address") ? { raw: formData.get("address") } : undefined,
      }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error ?? "Unable to create booking");
    }

    const { bookingId, clientSecret, paymentIntentId } = (await response.json()) as {
      bookingId: string;
      clientSecret: string;
      paymentIntentId: string;
    };

    return {
      status: "success",
      bookingId,
      clientSecret,
      paymentIntentId,
    };
  } catch (error) {
    console.error(error);
    return { status: "error", message: error instanceof Error ? error.message : "Unexpected error" };
  }
}

type PaymentConfirmationProps = {
  bookingId: string;
  onReset: () => void;
};

function PaymentConfirmation({ bookingId, onReset }: PaymentConfirmationProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);
    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin,
        },
        redirect: "if_required",
      });

      if (error) {
        throw new Error(error.message ?? "Payment requires additional verification.");
      }

      router.refresh();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unexpected payment error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3 rounded-md border border-[#ece4d9] bg-[#fdfaf6] p-4">
      <h3 className="text-sm font-semibold text-[#211f1a]">Confirm payment method</h3>
      <PaymentElement options={{ layout: "tabs" }} />
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-md bg-[#fd857f] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#eb6c65] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? "Confirming…" : "Confirm hold"}
        </button>
        <button
          type="button"
          onClick={onReset}
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-md border border-[#e5dfd4] px-3 py-1.5 text-xs font-semibold text-[#7a6d62] transition hover:border-[#fd857f] hover:text-[#fd857f] disabled:cursor-not-allowed disabled:opacity-70"
        >
          Cancel
        </button>
      </div>
      <p className="text-xs text-[#7a6d62]">
        Booking ID: {bookingId}. You’ll only be charged after the professional marks the service complete.
      </p>
    </div>
  );
}

type FormFieldProps = {
  label: string;
  children: React.ReactNode;
  helper?: string;
};

function FormField({ label, children, helper }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[#211f1a]">{label}</label>
      {helper ? <p className="text-xs text-[#7a6d62]">{helper}</p> : null}
      {children}
    </div>
  );
}
