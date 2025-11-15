"use client";

import { Add01Icon, Cancel01Icon, Clock01Icon, MinusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  type SavedAddress,
  SavedAddressesManager,
} from "@/components/addresses/saved-addresses-manager";
import type { ServiceAddon } from "@/components/service-addons/service-addons-manager";
import { formatCOP } from "@/lib/format";
import { bookingTracking } from "@/lib/integrations/posthog/booking-tracking-client";
import type { ProfessionalService } from "@/lib/professionals/transformers";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

type BookingSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  professionalId: string;
  professionalName: string;
  selectedDate: Date | null;
  availableSlots: string[];
  services: ProfessionalService[];
  defaultHourlyRate: number | null;
};

// Local time formatter for slot times (keep this as it's a specific format different from formatTime utility)
function formatTime(time: string): string {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

export function BookingSheet({
  isOpen,
  onClose,
  professionalId,
  professionalName: _professionalName,
  selectedDate,
  availableSlots,
  services,
  defaultHourlyRate,
}: BookingSheetProps) {
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<"time" | "details" | "payment">("time");
  const [bookingData, setBookingData] = useState({
    serviceName: "",
    serviceHourlyRate: null as number | null,
    durationHours: 2,
    address: null as SavedAddress | null,
    customAddress: "",
    selectedAddons: [] as ServiceAddon[],
    specialInstructions: "",
    isRecurring: false,
  });
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [addons, setAddons] = useState<ServiceAddon[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingResult, setBookingResult] = useState<{
    bookingId: string;
    clientSecret: string;
    paymentIntentId: string;
  } | null>(null);

  // Load addresses and addons
  useEffect(() => {
    if (isOpen) {
      fetch("/api/customer/addresses")
        .then((res) => res.json())
        .then((data) => setAddresses(data.addresses || []))
        .catch(console.error);

      fetch(`/api/professionals/${professionalId}/addons`)
        .then((res) => res.json())
        .then((data) => setAddons(data.addons || []))
        .catch(console.error);
    }
  }, [isOpen, professionalId]);

  // Reset when closed
  useEffect(() => {
    if (!isOpen) {
      setSelectedTime(null);
      setCurrentStep("time");
      setError(null);
    }
  }, [isOpen]);

  const serviceWithName = services.filter((service) => Boolean(service.name));

  const selectedService = serviceWithName.find(
    (service) => service.name === bookingData.serviceName
  );
  const selectedRate =
    bookingData.serviceHourlyRate ?? selectedService?.hourlyRateCop ?? defaultHourlyRate ?? 0;
  const baseAmount =
    selectedRate && bookingData.durationHours > 0
      ? Math.round(selectedRate * bookingData.durationHours)
      : 0;
  const addonsTotal = bookingData.selectedAddons.reduce((sum, addon) => sum + addon.price_cop, 0);
  const totalAmount = baseAmount + addonsTotal;

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setCurrentStep("details");
  };

  const toggleAddon = (addon: ServiceAddon) => {
    const isSelected = bookingData.selectedAddons.some((a) => a.id === addon.id);
    setBookingData({
      ...bookingData,
      selectedAddons: isSelected
        ? bookingData.selectedAddons.filter((a) => a.id !== addon.id)
        : [...bookingData.selectedAddons, addon],
    });
  };

  const handleSubmit = async () => {
    if (!(selectedDate && selectedTime && bookingData.serviceName)) {
      setError("Please complete all required fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const scheduledStart = new Date(
        `${selectedDate.toISOString().split("T")[0]}T${selectedTime}:00`
      );
      const scheduledEnd = new Date(
        scheduledStart.getTime() + bookingData.durationHours * 60 * 60 * 1000
      );

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professionalId,
          serviceName: bookingData.serviceName,
          serviceHourlyRate: selectedRate,
          scheduledStart: scheduledStart.toISOString(),
          scheduledEnd: scheduledEnd.toISOString(),
          durationMinutes: bookingData.durationHours * 60,
          amount: totalAmount,
          specialInstructions: bookingData.specialInstructions || undefined,
          address: (() => {
            if (bookingData.address) {
              return {
                street: bookingData.address.street,
                city: bookingData.address.city,
                neighborhood: bookingData.address.neighborhood,
                postal_code: bookingData.address.postal_code,
                building_access: bookingData.address.building_access,
                parking_info: bookingData.address.parking_info,
                special_notes: bookingData.address.special_notes,
              };
            }
            if (bookingData.customAddress) {
              return { raw: bookingData.customAddress };
            }
            return;
          })(),
          selectedAddons:
            bookingData.selectedAddons.length > 0
              ? bookingData.selectedAddons.map((addon) => ({
                  addon_id: addon.id,
                  quantity: 1,
                }))
              : undefined,
          isRecurring: bookingData.isRecurring,
        }),
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error ?? "Failed to create booking");
      }

      const result = await response.json();

      // Track checkout started in PostHog
      bookingTracking.checkoutStarted({
        bookingId: result.bookingId,
        amount: totalAmount,
        currency: "COP",
      });

      setBookingResult(result);
      setCurrentStep("payment");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fade-in fixed inset-0 z-40 animate-in bg-[neutral-900]/40 backdrop-blur-sm duration-300"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            onClose();
          }
        }}
        role="button"
        tabIndex={0}
      />

      {/* Sheet - Full width on mobile, max-w-2xl on desktop */}
      <div className="slide-in-from-right fixed inset-y-0 right-0 z-50 w-full animate-in overflow-y-auto bg-[neutral-50] shadow-2xl duration-500 ease-out md:max-w-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-[neutral-200] border-b bg-[neutral-50] px-6 py-5 md:px-8 md:py-6">
          <div>
            <h2 className="font-semibold text-[neutral-900] text-xl md:text-2xl">
              {currentStep === "time" && "Choose time"}
              {currentStep === "details" && "Booking details"}
              {currentStep === "payment" && "Payment"}
            </h2>
            {selectedDate && (
              <p className="mt-1 text-[neutral-400] text-sm md:text-base">
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
          <button
            aria-label="Close booking sheet"
            className="flex h-11 w-11 items-center justify-center rounded-full text-[neutral-400] transition hover:bg-[neutral-200]"
            onClick={onClose}
            type="button"
          >
            <HugeiconsIcon className="h-6 w-6" icon={Cancel01Icon} />
          </button>
        </div>

        <div className="p-6 md:p-8">
          {error && (
            <div className="mb-6 rounded-xl border border-[neutral-500]/30 bg-[neutral-500]/10 px-5 py-4 text-[neutral-500] text-base">
              {error}
            </div>
          )}

          {/* Step 1: Time Selection */}
          {currentStep === "time" && (
            <div className="fade-in-50 animate-in space-y-6 duration-500">
              <div>
                <h3 className="mb-4 font-semibold text-[neutral-900] text-xl">Available times</h3>
                <p className="mb-6 text-[neutral-400] text-base">
                  Select a time slot to continue with your booking
                </p>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {availableSlots.map((time, index) => (
                    <button
                      className="group fade-in-0 slide-in-from-bottom-4 animate-in rounded-xl border-2 border-[neutral-200] bg-[neutral-50] px-5 py-4 font-semibold text-[neutral-900] text-base shadow-sm transition-all duration-300 hover:scale-105 hover:border-[neutral-500] hover:bg-[neutral-500]/5 hover:shadow-lg active:scale-95 md:px-5 md:py-4"
                      key={time}
                      onClick={() => handleTimeSelect(time)}
                      style={{ animationDelay: `${index * 30}ms` }}
                      type="button"
                    >
                      {formatTime(time)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Booking Details */}
          {currentStep === "details" && (
            <div className="fade-in-50 animate-in space-y-8 duration-500">
              {/* Selected Time Display */}
              <div className="rounded-2xl bg-[neutral-500]/5 p-6">
                <div className="flex items-center gap-3 text-[neutral-500] text-base">
                  <HugeiconsIcon className="h-5 w-5" icon={Clock01Icon} />
                  <span className="font-semibold">{selectedTime && formatTime(selectedTime)}</span>
                  <button
                    className="ml-auto text-sm underline"
                    onClick={() => setCurrentStep("time")}
                    type="button"
                  >
                    Change time
                  </button>
                </div>
              </div>

              {/* Service Selection */}
              <div>
                <label
                  className="mb-3 block font-semibold text-[neutral-900] text-base md:text-lg"
                  htmlFor="service-select"
                >
                  Service *
                </label>
                <select
                  className="w-full rounded-xl border-2 border-[neutral-200] px-4 py-4 text-base focus:border-[neutral-500] focus:outline-none focus:ring-2 focus:ring-[neutral-500]/20 md:px-5"
                  id="service-select"
                  onChange={(e) => {
                    const service = serviceWithName.find((s) => s.name === e.target.value);
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
                  {serviceWithName.map((service) => (
                    <option key={service.name} value={service.name ?? ""}>
                      {service.name}
                      {service.hourlyRateCop ? ` · ${formatCOP(service.hourlyRateCop)}/hr` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration - Touch-friendly controls */}
              <div>
                <div className="mb-3 block font-semibold text-[neutral-900] text-base md:text-lg">
                  Duration *
                </div>
                <div className="flex items-center gap-3 md:gap-4">
                  <button
                    aria-label="Decrease duration"
                    className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-[neutral-200] transition hover:border-[neutral-500] hover:bg-[neutral-500]/5 md:p-3"
                    onClick={() =>
                      setBookingData({
                        ...bookingData,
                        durationHours: Math.max(1, bookingData.durationHours - 1),
                      })
                    }
                    type="button"
                  >
                    <HugeiconsIcon className="h-5 w-5" icon={MinusSignIcon} />
                  </button>
                  <div className="flex-1 rounded-xl border-2 border-[neutral-200] bg-[neutral-50] px-4 py-4 text-center font-semibold text-[neutral-900] text-lg md:px-5 md:text-xl">
                    {bookingData.durationHours} {bookingData.durationHours === 1 ? "hour" : "hours"}
                  </div>
                  <button
                    aria-label="Increase duration"
                    className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-[neutral-200] transition hover:border-[neutral-500] hover:bg-[neutral-500]/5 md:p-3"
                    onClick={() =>
                      setBookingData({
                        ...bookingData,
                        durationHours: Math.min(12, bookingData.durationHours + 1),
                      })
                    }
                    type="button"
                  >
                    <HugeiconsIcon className="h-5 w-5" icon={Add01Icon} />
                  </button>
                </div>
              </div>

              {/* Address */}
              <div>
                <label
                  className="mb-3 block font-semibold text-[neutral-900] text-lg"
                  htmlFor="service-address"
                >
                  Service address *
                </label>
                {addresses.length > 0 ? (
                  <SavedAddressesManager
                    addresses={addresses}
                    onAddressesChange={setAddresses}
                    onAddressSelect={(address) => setBookingData({ ...bookingData, address })}
                    selectedAddressId={bookingData.address?.id}
                    showManagement={false}
                  />
                ) : (
                  <textarea
                    className="w-full rounded-xl border-2 border-[neutral-200] px-5 py-4 text-base focus:border-[neutral-500] focus:outline-none focus:ring-2 focus:ring-[neutral-500]/20"
                    id="service-address"
                    onChange={(e) =>
                      setBookingData({
                        ...bookingData,
                        customAddress: e.target.value,
                      })
                    }
                    placeholder="Street, city, building access info..."
                    rows={3}
                    value={bookingData.customAddress}
                  />
                )}
              </div>

              {/* Add-ons */}
              {addons.length > 0 && (
                <div>
                  <div className="mb-3 block font-semibold text-[neutral-900] text-lg">
                    Add extras (optional)
                  </div>
                  <div className="space-y-3">
                    {addons.map((addon) => {
                      const isSelected = bookingData.selectedAddons.some((a) => a.id === addon.id);
                      return (
                        <button
                          className={`w-full rounded-xl border-2 p-5 text-left transition ${
                            isSelected
                              ? "border-[neutral-500] bg-[neutral-500]/5"
                              : "border-[neutral-200] bg-[neutral-50] hover:border-[neutral-500]/50"
                          }`}
                          key={addon.id}
                          onClick={() => toggleAddon(addon)}
                          type="button"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-[neutral-900] text-base">
                                {addon.name}
                              </h4>
                              {addon.description && (
                                <p className="mt-1 text-[neutral-400] text-sm">
                                  {addon.description}
                                </p>
                              )}
                            </div>
                            <div className="ml-4 font-semibold text-[neutral-500] text-base">
                              {formatCOP(addon.price_cop)}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Special Instructions */}
              <div>
                <label
                  className="mb-3 block font-semibold text-[neutral-900] text-lg"
                  htmlFor="special-instructions"
                >
                  Special instructions
                </label>
                <textarea
                  className="w-full rounded-xl border-2 border-[neutral-200] px-5 py-4 text-base focus:border-[neutral-500] focus:outline-none focus:ring-2 focus:ring-[neutral-500]/20"
                  id="special-instructions"
                  onChange={(e) =>
                    setBookingData({
                      ...bookingData,
                      specialInstructions: e.target.value,
                    })
                  }
                  placeholder="Pets, cleaning priorities, access codes..."
                  rows={3}
                  value={bookingData.specialInstructions}
                />
              </div>

              {/* Price Summary */}
              <div className="rounded-2xl border-2 border-[neutral-200] bg-[neutral-50] p-6">
                <h3 className="mb-4 font-semibold text-[neutral-900] text-lg">Price summary</h3>
                <div className="space-y-3 text-base">
                  <div className="flex justify-between">
                    <span className="text-[neutral-400]">Service</span>
                    <span className="font-semibold text-[neutral-900]">
                      {formatCOP(baseAmount)}
                    </span>
                  </div>
                  {addonsTotal > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[neutral-400]">Add-ons</span>
                      <span className="font-semibold text-[neutral-900]">
                        {formatCOP(addonsTotal)}
                      </span>
                    </div>
                  )}
                  <div className="border-[neutral-200] border-t pt-3">
                    <div className="flex justify-between text-xl">
                      <span className="font-semibold text-[neutral-900]">Total</span>
                      <span className="font-bold text-[neutral-500]">{formatCOP(totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions - Touch-friendly */}
              <div className="flex flex-col gap-3 md:flex-row md:gap-4">
                <button
                  className="order-2 rounded-xl border-2 border-[neutral-200] px-8 py-4 font-semibold text-[neutral-400] text-base transition hover:border-[neutral-500] hover:text-[neutral-500] md:order-1"
                  onClick={() => setCurrentStep("time")}
                  type="button"
                >
                  Back
                </button>
                <button
                  className="order-1 flex-1 rounded-xl bg-[neutral-500] px-8 py-4 font-semibold text-[neutral-50] text-base transition hover:bg-[neutral-500] disabled:cursor-not-allowed disabled:opacity-50 md:order-2"
                  disabled={
                    loading ||
                    !bookingData.serviceName ||
                    !(bookingData.address || bookingData.customAddress)
                  }
                  onClick={handleSubmit}
                  type="button"
                >
                  {loading ? "Creating booking..." : "Continue to payment"}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {currentStep === "payment" && bookingResult && stripePromise && (
            <Elements
              options={{
                clientSecret: bookingResult.clientSecret,
                appearance: {
                  theme: "flat" as const,
                  variables: {
                    colorPrimary: "neutral-500",
                    colorText: "neutral-900",
                    borderRadius: "12px",
                  },
                },
              }}
              stripe={stripePromise}
            >
              <PaymentStep
                bookingId={bookingResult.bookingId}
                onBack={() => setCurrentStep("details")}
                paymentIntentId={bookingResult.paymentIntentId}
              />
            </Elements>
          )}
        </div>
      </div>
    </>
  );
}

// Payment Step Component
function PaymentStep({
  bookingId,
  paymentIntentId,
  onBack,
}: {
  bookingId: string;
  paymentIntentId: string;
  onBack: () => void;
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

      router.push("/dashboard/customer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected payment error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-[neutral-400] text-base">
        We'll authorize a hold on your card. You'll only be charged after the service is completed.
      </p>
      <PaymentElement />
      {error && <p className="text-[neutral-500] text-base">{error}</p>}
      <div className="flex flex-col gap-3 md:flex-row md:gap-4">
        <button
          className="order-2 rounded-xl border-2 border-[neutral-200] px-8 py-4 font-semibold text-[neutral-400] text-base transition hover:border-[neutral-500] hover:text-[neutral-500] disabled:cursor-not-allowed disabled:opacity-50 md:order-1"
          disabled={submitting}
          onClick={onBack}
          type="button"
        >
          Back
        </button>
        <button
          className="order-1 flex-1 rounded-xl bg-[neutral-500] px-8 py-4 font-semibold text-[neutral-50] text-base transition hover:bg-[neutral-500] disabled:cursor-not-allowed disabled:opacity-50 md:order-2"
          disabled={submitting}
          onClick={handleConfirm}
          type="button"
        >
          {submitting ? "Confirming..." : "Confirm booking"}
        </button>
      </div>
    </div>
  );
}
