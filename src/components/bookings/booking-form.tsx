"use client";

import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import type { ProfessionalService } from "@/lib/professionals/transformers";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

type BookingFormProps = {
  professionalId: string;
  professionalName: string;
  services: ProfessionalService[];
  defaultHourlyRate: number | null;
};

type FormState = {
  status: "idle" | "loading" | "success" | "error";
  message?: string;
  bookingId?: string;
  clientSecret?: string;
  paymentIntentId?: string;
};

const initialState: FormState = { status: "idle" };

function normalizeServiceName(value: string | null | undefined) {
  if (!value) {
    return "";
  }
  return value;
}

function formatCurrencyCOP(value: number | null | undefined) {
  if (!value || Number.isNaN(value)) {
    return null;
  }
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function BookingForm({
  professionalId,
  professionalName,
  services,
  defaultHourlyRate,
}: BookingFormProps) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    createBookingAction,
    initialState
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const serviceWithName = services.filter((service) => Boolean(service.name));
  const initialServiceName = normalizeServiceName(
    serviceWithName.find((service) => typeof service.hourlyRateCop === "number")?.name ??
      serviceWithName[0]?.name ??
      null
  );
  const [selectedServiceName, setSelectedServiceName] = useState<string>(initialServiceName);
  const [durationHours, setDurationHours] = useState<number>(2);

  const selectedService = serviceWithName.find(
    (service) => normalizeServiceName(service.name) === selectedServiceName
  );
  const selectedRate = selectedService?.hourlyRateCop ?? defaultHourlyRate ?? null;
  const estimatedAmount =
    selectedRate && durationHours > 0
      ? Math.max(20_000, Math.round(selectedRate * durationHours))
      : 0;

  useEffect(() => {
    if (state.status === "success") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [state.status]);

  if (serviceWithName.length === 0) {
    return (
      <div className="rounded-2xl border border-[#f0ece4] bg-[#fbfafa] p-5 text-[#7a6d62] text-sm">
        This professional is updating their services. Check back soon or contact concierge support
        to request a custom quote.
      </div>
    );
  }

  if (!stripePromise) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
        Stripe publishable key is not configured. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in your
        environment.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-[#5d574b] text-sm">
        Confirm your booking with {professionalName}. We’ll place a temporary hold and only capture
        after the service is completed.
      </p>
      {state.status === "error" && state.message ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-red-600 text-sm">
          {state.message}
        </div>
      ) : null}
      {state.status === "success" && state.bookingId ? (
        <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-green-700 text-sm">
          Booking created successfully. We’ll notify the professional and confirm shortly.
        </div>
      ) : null}
      <form action={action} className="space-y-4">
        <input name="professionalId" type="hidden" value={professionalId} />
        <input name="serviceHourlyRate" type="hidden" value={selectedRate ?? ""} />
        <input name="amount" type="hidden" value={estimatedAmount > 0 ? estimatedAmount : ""} />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Service">
            <select
              className="w-full rounded-full border border-[#e5dfd4] bg-[#fefcf9] px-4 py-2 font-medium text-[#211f1a] text-sm shadow-black/5 shadow-inner transition hover:border-[#8B7355] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#8B7355] focus-visible:outline-offset-2"
              name="serviceName"
              onChange={(event) => setSelectedServiceName(event.target.value)}
              required
              value={selectedServiceName}
            >
              <option disabled value="">
                Select a service
              </option>
              {serviceWithName.map((service) => (
                <option key={service.name ?? "service"} value={service.name ?? ""}>
                  {service.name ?? "Service"}
                  {service.hourlyRateCop ? ` · ${formatCurrencyCOP(service.hourlyRateCop)}` : ""}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Date">
            <DatePicker
              name="scheduledDate"
              onChange={setSelectedDate}
              placeholder="Select date"
              required
              value={selectedDate}
            />
          </FormField>
          <FormField label="Start time">
            <TimePicker
              name="scheduledTime"
              onChange={setSelectedTime}
              placeholder="Select time"
              required
              value={selectedTime}
            />
          </FormField>
          <FormField label="Estimated duration (hours)">
            <input
              className="w-full rounded-md border border-[#e5dfd4] px-3 py-2 text-sm focus:border-[#8B7355] focus:outline-none focus:ring-2 focus:ring-[#8B735533]"
              max={12}
              min={1}
              name="duration"
              onChange={(event) => {
                const next = Number(event.target.value);
                setDurationHours(Number.isNaN(next) ? 0 : next);
              }}
              required
              type="number"
              value={durationHours}
            />
          </FormField>
          <FormField label="Estimated total (COP)">
            <div className="flex items-center justify-between rounded-full border border-[#e5dfd4] bg-[#fefcf9] px-4 py-2 font-semibold text-[#211f1a] text-sm shadow-black/5 shadow-inner">
              <span>
                {estimatedAmount > 0 ? formatCurrencyCOP(estimatedAmount) : "Add service details"}
              </span>
              {selectedRate ? (
                <span className="font-medium text-[#7a6d62] text-xs">
                  Rate {formatCurrencyCOP(selectedRate)} · {durationHours}h
                </span>
              ) : null}
            </div>
          </FormField>
        </div>
        <FormField label="Special instructions">
          <textarea
            className="w-full rounded-md border border-[#e5dfd4] px-3 py-2 text-sm focus:border-[#8B7355] focus:outline-none focus:ring-2 focus:ring-[#8B735533]"
            name="specialInstructions"
            placeholder="Building entry instructions, pets, cleaning priorities..."
            rows={3}
          />
        </FormField>
        <FormField label="Service address">
          <textarea
            className="w-full rounded-md border border-[#e5dfd4] px-3 py-2 text-sm focus:border-[#8B7355] focus:outline-none focus:ring-2 focus:ring-[#8B735533]"
            name="address"
            placeholder="Street, city, any access info"
            rows={2}
          />
        </FormField>
        <div className="flex justify-end">
          <button
            className="inline-flex items-center justify-center rounded-full border border-[#211f1a] bg-[#211f1a] px-5 py-2 font-semibold text-sm text-white shadow-sm transition hover:border-[#8B7355] hover:bg-[#2b2624] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={
              pending ||
              state.status === "loading" ||
              !selectedDate ||
              !selectedTime ||
              !selectedServiceName ||
              estimatedAmount <= 0 ||
              durationHours <= 0
            }
            type="submit"
          >
            {pending ? "Creating booking…" : "Create booking"}
          </button>
        </div>
      </form>

      {state.status === "success" && state.clientSecret ? (
        <Elements
          options={{ clientSecret: state.clientSecret, appearance: stripeAppearance }}
          stripe={stripePromise}
        >
          <PaymentConfirmation
            bookingId={state.bookingId!}
            onReset={() => window.location.reload()}
            paymentIntentId={state.paymentIntentId!}
          />
        </Elements>
      ) : null}
    </div>
  );
}

const stripeAppearance = {
  theme: "flat" as const,
  variables: {
    colorPrimary: "#8B7355",
    colorText: "#211f1a",
    borderRadius: "8px",
  },
};

async function createBookingAction(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const scheduledDate = formData.get("scheduledDate") as string | null;
    const scheduledTime = formData.get("scheduledTime") as string | null;
    const professionalId = formData.get("professionalId") as string | null;
    const serviceName = formData.get("serviceName") as string | null;
    const serviceHourlyRate = formData.get("serviceHourlyRate") as string | null;
    const duration = formData.get("duration") as string | null;
    const amount = formData.get("amount") as string | null;

    if (!professionalId) {
      return { status: "error", message: "Missing professional." };
    }

    if (!serviceName) {
      return { status: "error", message: "Please choose a service." };
    }

    if (!(scheduledDate && scheduledTime)) {
      return { status: "error", message: "Please select a date and time." };
    }

    if (!amount) {
      return { status: "error", message: "Please set an estimated amount." };
    }

    const scheduledStartDate = new Date(`${scheduledDate}T${scheduledTime}:00`);
    if (Number.isNaN(scheduledStartDate.getTime())) {
      return { status: "error", message: "Invalid date selected." };
    }
    const durationNumber = duration ? Number(duration) : null;
    const amountNumber = Math.round(Number(amount));
    const scheduledEnd =
      durationNumber && !Number.isNaN(durationNumber)
        ? new Date(scheduledStartDate.getTime() + durationNumber * 60 * 60 * 1000).toISOString()
        : undefined;

    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      return { status: "error", message: "Estimated amount is required for booking." };
    }

    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        professionalId,
        serviceName,
        serviceHourlyRate: serviceHourlyRate ? Number(serviceHourlyRate) : undefined,
        scheduledStart: scheduledStartDate.toISOString(),
        scheduledEnd,
        durationMinutes: durationNumber ? durationNumber * 60 : undefined,
        amount: amountNumber,
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
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unexpected error",
    };
  }
}

type PaymentConfirmationProps = {
  bookingId: string;
  paymentIntentId: string;
  onReset: () => void;
};

function PaymentConfirmation({ bookingId, paymentIntentId, onReset }: PaymentConfirmationProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!(stripe && elements)) {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin,
        },
        redirect: "if_required",
      });

      if (error) {
        throw new Error(error.message ?? "Payment requires additional verification.");
      }

      if (paymentIntent?.status === "requires_capture") {
        await fetch("/api/bookings/authorize", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ bookingId, paymentIntentId }),
        });
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected payment error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3 rounded-md border border-[#ece4d9] bg-[#fdfaf6] p-4">
      <h3 className="font-semibold text-[#211f1a] text-sm">Confirm payment method</h3>
      <PaymentElement options={{ layout: "tabs" }} />
      {error ? <p className="text-red-600 text-xs">{error}</p> : null}
      <div className="flex items-center gap-3">
        <button
          className="inline-flex items-center justify-center rounded-md bg-[#8B7355] px-3 py-1.5 font-semibold text-white text-xs shadow-sm transition hover:bg-[#9B8B7E] disabled:cursor-not-allowed disabled:opacity-70"
          disabled={submitting}
          onClick={handleConfirm}
          type="button"
        >
          {submitting ? "Confirming…" : "Confirm hold"}
        </button>
        <button
          className="inline-flex items-center justify-center rounded-md border border-[#e5dfd4] px-3 py-1.5 font-semibold text-[#7a6d62] text-xs transition hover:border-[#8B7355] hover:text-[#8B7355] disabled:cursor-not-allowed disabled:opacity-70"
          disabled={submitting}
          onClick={onReset}
          type="button"
        >
          Cancel
        </button>
      </div>
      <p className="text-[#7a6d62] text-xs">
        Booking ID: {bookingId}. You’ll only be charged after the professional marks the service
        complete.
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
      <label className="block font-medium text-[#211f1a] text-sm">{label}</label>
      {helper ? <p className="text-[#7a6d62] text-xs">{helper}</p> : null}
      {children}
    </div>
  );
}
