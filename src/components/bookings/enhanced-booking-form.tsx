"use client";

import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  type SavedAddress,
  SavedAddressesManager,
} from "@/components/addresses/saved-addresses-manager";
import { AvailabilityCalendar } from "@/components/booking/availability-calendar";
import { PriceBreakdown } from "@/components/pricing/price-breakdown";
import type { ServiceAddon } from "@/components/service-addons/service-addons-manager";
import { useAddressesAndAddons } from "@/hooks/use-addresses-and-addons";
import { useBookingSubmission } from "@/hooks/use-booking-submission";
import { useFeatureFlag } from "@/hooks/use-feature-flag";
import { formatCurrencyCOP, normalizeServiceName } from "@/lib/booking-utils";
import type { ProfessionalService } from "@/lib/professionals/transformers";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

type BookingFormProps = {
  professionalId: string;
  professionalName: string;
  services: ProfessionalService[];
  defaultHourlyRate: number | null;
  savedAddresses?: SavedAddress[];
  availableAddons?: ServiceAddon[];
};

type BookingStep = "service-details" | "address-addons" | "confirmation" | "payment";

type BookingData = {
  serviceName: string;
  serviceHourlyRate: number | null;
  selectedDate: Date | null;
  selectedTime: string | null;
  durationHours: number;
  address: SavedAddress | null;
  customAddress?: string;
  selectedAddons: ServiceAddon[];
  specialInstructions: string;
  isRecurring: boolean;
  recurrencePattern?: {
    frequency: "weekly" | "biweekly" | "monthly";
    endDate?: string;
  };
};

export function EnhancedBookingForm({
  professionalId,
  professionalName,
  services,
  defaultHourlyRate,
  savedAddresses = [],
  availableAddons = [],
}: BookingFormProps) {
  const [currentStep, setCurrentStep] = useState<BookingStep>("service-details");
  const [bookingData, setBookingData] = useState<BookingData>({
    serviceName: "",
    serviceHourlyRate: null,
    selectedDate: null,
    selectedTime: null,
    durationHours: 2,
    address: null,
    selectedAddons: [],
    specialInstructions: "",
    isRecurring: false,
  });

  // Custom hooks for cleaner code
  const { addresses, addons, handleAddressesChange } = useAddressesAndAddons({
    professionalId,
    initialAddresses: savedAddresses,
    initialAddons: availableAddons,
  });

  const { submissionState, submitAction, isPending } = useBookingSubmission({
    professionalId,
    services,
    defaultHourlyRate,
    onSuccess: () => setCurrentStep("payment"),
  });

  const serviceWithName = services.filter((service) => Boolean(service.name));

  if (serviceWithName.length === 0) {
    return (
      <div className="rounded-2xl border border-[#f0ece4] bg-[#fbfafa] p-5 text-[#7a6d62] text-sm">
        This professional is updating their services. Check back soon.
      </div>
    );
  }

  if (!stripePromise) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
        Payment system not configured.
      </div>
    );
  }

  const selectedService = serviceWithName.find(
    (service) => normalizeServiceName(service.name) === bookingData.serviceName
  );
  const selectedRate =
    bookingData.serviceHourlyRate ?? selectedService?.hourlyRateCop ?? defaultHourlyRate ?? 0;
  const baseAmount =
    selectedRate && bookingData.durationHours > 0
      ? Math.round(selectedRate * bookingData.durationHours)
      : 0;
  const addonsTotal = bookingData.selectedAddons.reduce((sum, addon) => sum + addon.price_cop, 0);
  const totalAmount = baseAmount + addonsTotal;

  // Simplified submit handler - custom hook manages complexity
  const handleSubmit = () => {
    if (!(bookingData.selectedDate && bookingData.selectedTime && bookingData.serviceName)) {
      return;
    }
    submitAction(bookingData);
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {[
          { key: "service-details", label: "Service & Time" },
          { key: "address-addons", label: "Location & Add-ons" },
          { key: "confirmation", label: "Review" },
          { key: "payment", label: "Payment" },
        ].map((step, index) => (
          <div className="flex items-center" key={step.key}>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full font-semibold text-xs ${
                currentStep === step.key
                  ? "bg-[var(--red)] text-white"
                  : index <
                      ["service-details", "address-addons", "confirmation", "payment"].indexOf(
                        currentStep
                      )
                    ? "bg-[var(--foreground)] text-white"
                    : "bg-[#f0ece5] text-[#7a6d62]"
              }`}
            >
              {index + 1}
            </div>
            <span className="ml-2 hidden text-[#7a6d62] text-xs sm:block">{step.label}</span>
          </div>
        ))}
      </div>

      {submissionState.error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-red-600 text-sm">
          {submissionState.error}
        </div>
      )}

      {/* Step 1: Service Details & Time Selection */}
      {currentStep === "service-details" && (
        <ServiceDetailsStep
          bookingData={bookingData}
          onNext={() => setCurrentStep("address-addons")}
          professionalId={professionalId}
          services={serviceWithName}
          setBookingData={setBookingData}
        />
      )}

      {/* Step 2: Address & Add-ons */}
      {currentStep === "address-addons" && (
        <AddressAddonsStep
          addons={addons}
          addresses={addresses}
          bookingData={bookingData}
          onAddressesChange={handleAddressesChange}
          onBack={() => setCurrentStep("service-details")}
          onNext={() => setCurrentStep("confirmation")}
          setBookingData={setBookingData}
        />
      )}

      {/* Step 3: Confirmation */}
      {currentStep === "confirmation" && (
        <ConfirmationStep
          addonsTotal={addonsTotal}
          baseAmount={baseAmount}
          bookingData={bookingData}
          loading={isPending}
          onBack={() => setCurrentStep("address-addons")}
          onConfirm={handleSubmit}
          professionalName={professionalName}
          totalAmount={totalAmount}
        />
      )}

      {/* Step 4: Payment */}
      {currentStep === "payment" && submissionState.result && (
        <Elements
          options={{
            clientSecret: submissionState.result.clientSecret,
            appearance: stripeAppearance,
          }}
          stripe={stripePromise}
        >
          <PaymentConfirmation
            bookingId={submissionState.result.bookingId}
            onReset={() => window.location.reload()}
            paymentIntentId={submissionState.result.paymentIntentId}
          />
        </Elements>
      )}
    </div>
  );
}

// Step 1: Service Details Component
function ServiceDetailsStep({
  services,
  bookingData,
  setBookingData,
  professionalId,
  onNext,
}: {
  services: ProfessionalService[];
  bookingData: BookingData;
  setBookingData: (data: BookingData) => void;
  professionalId: string;
  onNext: () => void;
}) {
  const canProceed =
    bookingData.serviceName &&
    bookingData.selectedDate &&
    bookingData.selectedTime &&
    bookingData.durationHours > 0;

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-[var(--foreground)] text-lg">Choose Service & Time</h3>

      {/* Service Selection */}
      <div>
        <label
          className="mb-2 block font-medium text-[var(--foreground)] text-sm"
          htmlFor="enhanced-service-select"
        >
          Service *
        </label>
        <select
          className="w-full rounded-md border border-[#e5dfd4] px-3 py-2 text-sm focus:border-[var(--red)] focus:outline-none focus:ring-2 focus:ring-[var(--red)]/20"
          id="enhanced-service-select"
          onChange={(e) => {
            const service = services.find((s) => s.name === e.target.value);
            setBookingData({
              ...bookingData,
              serviceName: e.target.value,
              serviceHourlyRate: service?.hourlyRateCop ?? null,
            });
          }}
          required
          value={bookingData.serviceName}
        >
          <option value="">Select a service</option>
          {services.map((service) => (
            <option key={service.name} value={service.name ?? ""}>
              {service.name}
              {service.hourlyRateCop ? ` · ${formatCurrencyCOP(service.hourlyRateCop)}/hr` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Duration */}
      <div>
        <label
          className="mb-2 block font-medium text-[var(--foreground)] text-sm"
          htmlFor="duration-hours"
        >
          Duration (hours) *
        </label>
        <input
          className="w-full rounded-md border border-[#e5dfd4] px-3 py-2 text-sm focus:border-[var(--red)] focus:outline-none focus:ring-2 focus:ring-[var(--red)]/20"
          id="duration-hours"
          max={12}
          min={1}
          onChange={(e) =>
            setBookingData({
              ...bookingData,
              durationHours: Number.parseInt(e.target.value, 10) || 0,
            })
          }
          required
          type="number"
          value={bookingData.durationHours}
        />
      </div>

      {/* Availability Calendar */}
      <div>
        <div className="mb-2 block font-medium text-[var(--foreground)] text-sm">
          Select Date & Time *
        </div>
        <AvailabilityCalendar
          durationHours={bookingData.durationHours}
          onDateSelect={(date) => setBookingData({ ...bookingData, selectedDate: date })}
          onTimeSelect={(time) => setBookingData({ ...bookingData, selectedTime: time })}
          professionalId={professionalId}
          selectedDate={bookingData.selectedDate}
          selectedTime={bookingData.selectedTime}
        />
      </div>

      {/* Recurring Booking Option */}
      <div>
        <label className="flex items-center gap-2">
          <input
            checked={bookingData.isRecurring}
            className="rounded"
            onChange={(e) =>
              setBookingData({
                ...bookingData,
                isRecurring: e.target.checked,
              })
            }
            type="checkbox"
          />
          <span className="text-[var(--foreground)] text-sm">Make this a recurring booking</span>
        </label>
      </div>

      {bookingData.isRecurring && (
        <div className="rounded-lg border border-[#f0ece5] bg-white/90 p-4">
          <label
            className="mb-2 block font-medium text-[var(--foreground)] text-sm"
            htmlFor="recurrence-frequency"
          >
            Frequency
          </label>
          <select
            className="w-full rounded-md border border-[#e5dfd4] px-3 py-2 text-sm focus:border-[var(--red)] focus:outline-none focus:ring-2 focus:ring-[var(--red)]/20"
            id="recurrence-frequency"
            onChange={(e) =>
              setBookingData({
                ...bookingData,
                recurrencePattern: {
                  frequency: e.target.value as "weekly" | "biweekly" | "monthly",
                },
              })
            }
            value={bookingData.recurrencePattern?.frequency || "weekly"}
          >
            <option value="weekly">Weekly</option>
            <option value="biweekly">Every 2 weeks</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      )}

      <div className="flex justify-end">
        <button
          className="rounded-md bg-[var(--red)] px-6 py-2 font-semibold text-sm text-white transition hover:bg-[var(--red-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!canProceed}
          onClick={onNext}
          type="button"
        >
          Continue to Location & Add-ons →
        </button>
      </div>
    </div>
  );
}

// Step 2: Address & Add-ons Component
function AddressAddonsStep({
  bookingData,
  setBookingData,
  addresses,
  onAddressesChange,
  addons,
  onBack,
  onNext,
}: {
  bookingData: BookingData;
  setBookingData: (data: BookingData) => void;
  addresses: SavedAddress[];
  onAddressesChange: (addresses: SavedAddress[]) => void;
  addons: ServiceAddon[];
  onBack: () => void;
  onNext: () => void;
}) {
  const [useCustomAddress, setUseCustomAddress] = useState(false);

  const toggleAddon = (addon: ServiceAddon) => {
    const isSelected = bookingData.selectedAddons.some((a) => a.id === addon.id);
    setBookingData({
      ...bookingData,
      selectedAddons: isSelected
        ? bookingData.selectedAddons.filter((a) => a.id !== addon.id)
        : [...bookingData.selectedAddons, addon],
    });
  };

  const canProceed = bookingData.address || bookingData.customAddress;

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-[var(--foreground)] text-lg">Location & Add-ons</h3>

      {/* Address Selection */}
      <div>
        <label
          className="mb-2 block font-medium text-[var(--foreground)] text-sm"
          htmlFor="custom-address-enhanced"
        >
          Service Address *
        </label>

        {!useCustomAddress && addresses.length > 0 && (
          <div className="space-y-2">
            <SavedAddressesManager
              addresses={addresses}
              onAddressesChange={onAddressesChange}
              onAddressSelect={(address) => setBookingData({ ...bookingData, address })}
              selectedAddressId={bookingData.address?.id}
              showManagement={false}
            />
            <button
              className="text-[var(--red)] text-sm hover:text-[var(--red-hover)]"
              onClick={() => setUseCustomAddress(true)}
              type="button"
            >
              + Enter a different address
            </button>
          </div>
        )}

        {(useCustomAddress || addresses.length === 0) && (
          <div className="space-y-2">
            <textarea
              className="w-full rounded-md border border-[#e5dfd4] px-3 py-2 text-sm focus:border-[var(--red)] focus:outline-none focus:ring-2 focus:ring-[var(--red)]/20"
              id="custom-address-enhanced"
              onChange={(e) =>
                setBookingData({
                  ...bookingData,
                  customAddress: e.target.value,
                  address: null,
                })
              }
              placeholder="Street, city, building access info..."
              rows={3}
              value={bookingData.customAddress || ""}
            />
            {addresses.length > 0 && (
              <button
                className="text-[var(--red)] text-sm hover:text-[var(--red-hover)]"
                onClick={() => setUseCustomAddress(false)}
                type="button"
              >
                ← Use saved address
              </button>
            )}
          </div>
        )}
      </div>

      {/* Special Instructions */}
      <div>
        <label
          className="mb-2 block font-medium text-[var(--foreground)] text-sm"
          htmlFor="special-instructions-enhanced"
        >
          Special Instructions
        </label>
        <textarea
          className="w-full rounded-md border border-[#e5dfd4] px-3 py-2 text-sm focus:border-[var(--red)] focus:outline-none focus:ring-2 focus:ring-[var(--red)]/20"
          id="special-instructions-enhanced"
          onChange={(e) =>
            setBookingData({
              ...bookingData,
              specialInstructions: e.target.value,
            })
          }
          placeholder="Pets, cleaning priorities, access codes..."
          rows={2}
          value={bookingData.specialInstructions}
        />
      </div>

      {/* Service Add-ons */}
      {addons.length > 0 && (
        <div>
          <div className="mb-2 block font-medium text-[var(--foreground)] text-sm">
            Add Extra Services (Optional)
          </div>
          <div className="space-y-2">
            {addons.map((addon) => {
              const isSelected = bookingData.selectedAddons.some((a) => a.id === addon.id);
              return (
                <button
                  className={`w-full rounded-lg border p-3 text-left transition ${
                    isSelected
                      ? "border-[var(--red)] bg-[var(--red)]/5 ring-2 ring-[var(--red)]/20"
                      : "border-[#e5dfd4] bg-white hover:border-[var(--red)]/50"
                  }`}
                  key={addon.id}
                  onClick={() => toggleAddon(addon)}
                  type="button"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-lg ${isSelected ? "opacity-100" : "opacity-40"}`}>
                          {isSelected ? "✓" : "○"}
                        </span>
                        <h4 className="font-semibold text-[var(--foreground)]">{addon.name}</h4>
                      </div>
                      {addon.description && (
                        <p className="mt-1 text-[#7a6d62] text-sm">{addon.description}</p>
                      )}
                      <div className="mt-1 flex gap-3 text-[#7a6d62] text-xs">
                        <span className="font-semibold text-[var(--red)]">
                          {formatCurrencyCOP(addon.price_cop)}
                        </span>
                        {addon.duration_minutes > 0 && <span>+{addon.duration_minutes} min</span>}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button
          className="rounded-md border border-[#e5dfd4] px-6 py-2 font-semibold text-[#7a6d62] text-sm transition hover:border-[var(--red)] hover:text-[var(--red)]"
          onClick={onBack}
          type="button"
        >
          ← Back
        </button>
        <button
          className="rounded-md bg-[var(--red)] px-6 py-2 font-semibold text-sm text-white transition hover:bg-[var(--red-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!canProceed}
          onClick={onNext}
          type="button"
        >
          Review Booking →
        </button>
      </div>
    </div>
  );
}

// Step 3: Confirmation Component
function ConfirmationStep({
  bookingData,
  professionalName,
  baseAmount,
  addonsTotal,
  totalAmount,
  onBack,
  onConfirm,
  loading,
}: {
  bookingData: BookingData;
  professionalName: string;
  baseAmount: number;
  addonsTotal: number;
  totalAmount: number;
  onBack: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  // Week 3-4 feature flag
  const showLivePriceBreakdown = useFeatureFlag("live_price_breakdown");
  const selectedRate = bookingData.serviceHourlyRate ?? 0;
  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-[var(--foreground)] text-lg">Review Your Booking</h3>

      <div className="space-y-4 rounded-lg border border-[#f0ece5] bg-white p-6">
        {/* Service Details */}
        <div>
          <h4 className="font-semibold text-[#7a6d62] text-sm">Service</h4>
          <p className="mt-1 text-[var(--foreground)] text-sm">
            {bookingData.serviceName} with {professionalName}
          </p>
        </div>

        {/* Date & Time */}
        <div>
          <h4 className="font-semibold text-[#7a6d62] text-sm">Date & Time</h4>
          <p className="mt-1 text-[var(--foreground)] text-sm">
            {bookingData.selectedDate?.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            at {bookingData.selectedTime}
          </p>
          <p className="text-[#7a6d62] text-xs">Duration: {bookingData.durationHours} hours</p>
          {bookingData.isRecurring && (
            <p className="mt-1 text-[var(--red)] text-xs">
              ⏱️ Recurring {bookingData.recurrencePattern?.frequency}
            </p>
          )}
        </div>

        {/* Address */}
        <div>
          <h4 className="font-semibold text-[#7a6d62] text-sm">Location</h4>
          {bookingData.address ? (
            <div className="mt-1 text-[var(--foreground)] text-sm">
              <p>{bookingData.address.street}</p>
              <p>
                {[
                  bookingData.address.neighborhood,
                  bookingData.address.city,
                  bookingData.address.postal_code,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              {bookingData.address.building_access && (
                <p className="text-[#7a6d62] text-xs">🔑 {bookingData.address.building_access}</p>
              )}
            </div>
          ) : (
            <p className="mt-1 text-[var(--foreground)] text-sm">{bookingData.customAddress}</p>
          )}
        </div>

        {/* Add-ons */}
        {bookingData.selectedAddons.length > 0 && (
          <div>
            <h4 className="font-semibold text-[#7a6d62] text-sm">Add-ons</h4>
            <ul className="mt-1 space-y-1">
              {bookingData.selectedAddons.map((addon) => (
                <li
                  className="flex justify-between text-[var(--foreground)] text-sm"
                  key={addon.id}
                >
                  <span>{addon.name}</span>
                  <span>{formatCurrencyCOP(addon.price_cop)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Special Instructions */}
        {bookingData.specialInstructions && (
          <div>
            <h4 className="font-semibold text-[#7a6d62] text-sm">Special Instructions</h4>
            <p className="mt-1 text-[var(--foreground)] text-sm">
              {bookingData.specialInstructions}
            </p>
          </div>
        )}

        {/* Price Breakdown - Week 3-4 Enhanced or Legacy */}
        {showLivePriceBreakdown ? (
          <PriceBreakdown
            addonsTotal={addonsTotal}
            baseAmount={baseAmount}
            hourlyRate={selectedRate}
            hours={bookingData.durationHours}
            showPlatformFee={true}
          />
        ) : (
          <>
            <div className="border-[#f0ece5] border-t pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#7a6d62]">Service</span>
                  <span className="text-[var(--foreground)]">{formatCurrencyCOP(baseAmount)}</span>
                </div>
                {addonsTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#7a6d62]">Add-ons</span>
                    <span className="text-[var(--foreground)]">
                      {formatCurrencyCOP(addonsTotal)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-[#f0ece5] border-t pt-2 font-semibold text-base">
                  <span className="text-[var(--foreground)]">Total</span>
                  <span className="text-[var(--red)]">{formatCurrencyCOP(totalAmount)}</span>
                </div>
              </div>
            </div>

            <p className="text-[#7a6d62] text-xs">
              We'll place a temporary hold on your payment method. You'll only be charged after the
              service is completed.
            </p>
          </>
        )}
      </div>

      <div className="flex justify-between">
        <button
          className="rounded-md border border-[#e5dfd4] px-6 py-2 font-semibold text-[#7a6d62] text-sm transition hover:border-[var(--red)] hover:text-[var(--red)] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={loading}
          onClick={onBack}
          type="button"
        >
          ← Back
        </button>
        <button
          className="rounded-md bg-[var(--red)] px-6 py-2 font-semibold text-sm text-white transition hover:bg-[var(--red-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={loading}
          onClick={onConfirm}
          type="button"
        >
          {loading ? "Creating booking..." : "Proceed to Payment →"}
        </button>
      </div>
    </div>
  );
}

// Payment Confirmation Component
function PaymentConfirmation({
  bookingId,
  paymentIntentId,
  onReset,
}: {
  bookingId: string;
  paymentIntentId: string;
  onReset: () => void;
}) {
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
      const { error: paymentError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin,
        },
        redirect: "if_required",
      });

      if (paymentError) {
        throw new Error(paymentError.message ?? "Payment requires additional verification.");
      }

      if (paymentIntent?.status === "requires_capture") {
        await fetch("/api/bookings/authorize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId, paymentIntentId }),
        });
      }

      router.push(`/bookings/${bookingId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected payment error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border border-[#f0ece5] bg-white p-6">
      <h3 className="font-semibold text-[var(--foreground)] text-lg">Confirm Payment Method</h3>
      <p className="text-[#7a6d62] text-sm">
        We'll authorize a hold on your card. You'll only be charged after the service is completed.
      </p>
      <PaymentElement options={{ layout: "tabs" }} />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="flex items-center gap-3">
        <button
          className="rounded-md bg-[var(--red)] px-6 py-2 font-semibold text-sm text-white transition hover:bg-[var(--red-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={submitting}
          onClick={handleConfirm}
          type="button"
        >
          {submitting ? "Confirming..." : "Confirm Booking"}
        </button>
        <button
          className="rounded-md border border-[#e5dfd4] px-6 py-2 font-semibold text-[#7a6d62] text-sm transition hover:border-[var(--red)] hover:text-[var(--red)] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={submitting}
          onClick={onReset}
          type="button"
        >
          Cancel
        </button>
      </div>
      <p className="text-[#7a6d62] text-xs">Booking ID: {bookingId}</p>
    </div>
  );
}

const stripeAppearance = {
  theme: "flat" as const,
  variables: {
    colorPrimary: "var(--red)",
    colorText: "var(--foreground)",
    borderRadius: "8px",
  },
};
