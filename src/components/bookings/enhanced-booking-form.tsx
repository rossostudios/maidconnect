"use client";

import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  type SavedAddress,
  SavedAddressesManager,
} from "@/components/addresses/saved-addresses-manager";
import { AvailabilityCalendar } from "@/components/booking/availability-calendar";
import type { ServiceAddon } from "@/components/service-addons/service-addons-manager";
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

function formatCurrencyCOP(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

function normalizeServiceName(value: string | null | undefined) {
  if (!value) {
    return "";
  }
  return value;
}

export function EnhancedBookingForm({
  professionalId,
  professionalName,
  services,
  defaultHourlyRate,
  savedAddresses = [],
  availableAddons = [],
}: BookingFormProps) {
  const _router = useRouter();
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

  const [addresses, setAddresses] = useState<SavedAddress[]>(savedAddresses);
  const [addons, setAddons] = useState<ServiceAddon[]>(availableAddons);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingResult, setBookingResult] = useState<{
    bookingId: string;
    clientSecret: string;
    paymentIntentId: string;
  } | null>(null);

  // Load saved addresses on mount
  useEffect(() => {
    if (savedAddresses.length === 0) {
      fetch("/api/customer/addresses")
        .then((res) => res.json())
        .then((data) => setAddresses(data.addresses || []))
        .catch(console.error);
    }
  }, [savedAddresses]);

  // Load available add-ons on mount
  useEffect(() => {
    if (availableAddons.length === 0) {
      fetch(`/api/professionals/${professionalId}/addons`)
        .then((res) => res.json())
        .then((data) => setAddons(data.addons || []))
        .catch(console.error);
    }
  }, [professionalId, availableAddons]);

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

  const handleAddressesChange = async (newAddresses: SavedAddress[]) => {
    setAddresses(newAddresses);
    try {
      await fetch("/api/customer/addresses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addresses: newAddresses }),
      });
    } catch (_err) {}
  };

  const handleSubmit = async () => {
    if (!(bookingData.selectedDate && bookingData.selectedTime && bookingData.serviceName)) {
      setError("Please complete all required fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const scheduledStart = new Date(
        `${bookingData.selectedDate.toISOString().split("T")[0]}T${bookingData.selectedTime}:00`
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
          address: bookingData.address
            ? {
                street: bookingData.address.street,
                city: bookingData.address.city,
                neighborhood: bookingData.address.neighborhood,
                postal_code: bookingData.address.postal_code,
                building_access: bookingData.address.building_access,
                parking_info: bookingData.address.parking_info,
                special_notes: bookingData.address.special_notes,
              }
            : bookingData.customAddress
              ? { raw: bookingData.customAddress }
              : undefined,
          selectedAddons:
            bookingData.selectedAddons.length > 0
              ? bookingData.selectedAddons.map((addon) => ({
                  addon_id: addon.id,
                  quantity: 1,
                }))
              : undefined,
          isRecurring: bookingData.isRecurring,
          recurrencePattern: bookingData.recurrencePattern,
        }),
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error ?? "Failed to create booking");
      }

      const result = await response.json();
      setBookingResult(result);
      setCurrentStep("payment");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
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
                  ? "bg-[#ff5d46] text-white"
                  : index <
                      ["service-details", "address-addons", "confirmation", "payment"].indexOf(
                        currentStep
                      )
                    ? "bg-[#211f1a] text-white"
                    : "bg-[#f0ece5] text-[#7a6d62]"
              }`}
            >
              {index + 1}
            </div>
            <span className="ml-2 hidden text-[#7a6d62] text-xs sm:block">{step.label}</span>
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-red-600 text-sm">
          {error}
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
          loading={loading}
          onBack={() => setCurrentStep("address-addons")}
          onConfirm={handleSubmit}
          professionalName={professionalName}
          totalAmount={totalAmount}
        />
      )}

      {/* Step 4: Payment */}
      {currentStep === "payment" && bookingResult && (
        <Elements
          options={{
            clientSecret: bookingResult.clientSecret,
            appearance: stripeAppearance,
          }}
          stripe={stripePromise}
        >
          <PaymentConfirmation
            bookingId={bookingResult.bookingId}
            onReset={() => window.location.reload()}
            paymentIntentId={bookingResult.paymentIntentId}
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
      <h3 className="font-semibold text-[#211f1a] text-lg">Choose Service & Time</h3>

      {/* Service Selection */}
      <div>
        <label className="mb-2 block font-medium text-[#211f1a] text-sm">Service *</label>
        <select
          className="w-full rounded-md border border-[#e5dfd4] px-3 py-2 text-sm focus:border-[#ff5d46] focus:outline-none focus:ring-2 focus:ring-[#ff5d46]/20"
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
        <label className="mb-2 block font-medium text-[#211f1a] text-sm">Duration (hours) *</label>
        <input
          className="w-full rounded-md border border-[#e5dfd4] px-3 py-2 text-sm focus:border-[#ff5d46] focus:outline-none focus:ring-2 focus:ring-[#ff5d46]/20"
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
        <label className="mb-2 block font-medium text-[#211f1a] text-sm">
          Select Date & Time *
        </label>
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
          <span className="text-[#211f1a] text-sm">Make this a recurring booking</span>
        </label>
      </div>

      {bookingData.isRecurring && (
        <div className="rounded-lg border border-[#f0ece5] bg-white/90 p-4">
          <label className="mb-2 block font-medium text-[#211f1a] text-sm">Frequency</label>
          <select
            className="w-full rounded-md border border-[#e5dfd4] px-3 py-2 text-sm focus:border-[#ff5d46] focus:outline-none focus:ring-2 focus:ring-[#ff5d46]/20"
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
          className="rounded-md bg-[#ff5d46] px-6 py-2 font-semibold text-sm text-white transition hover:bg-[#eb6c65] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!canProceed}
          onClick={onNext}
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
      <h3 className="font-semibold text-[#211f1a] text-lg">Location & Add-ons</h3>

      {/* Address Selection */}
      <div>
        <label className="mb-2 block font-medium text-[#211f1a] text-sm">Service Address *</label>

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
              className="text-[#ff5d46] text-sm hover:text-[#eb6c65]"
              onClick={() => setUseCustomAddress(true)}
            >
              + Enter a different address
            </button>
          </div>
        )}

        {(useCustomAddress || addresses.length === 0) && (
          <div className="space-y-2">
            <textarea
              className="w-full rounded-md border border-[#e5dfd4] px-3 py-2 text-sm focus:border-[#ff5d46] focus:outline-none focus:ring-2 focus:ring-[#ff5d46]/20"
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
                className="text-[#ff5d46] text-sm hover:text-[#eb6c65]"
                onClick={() => setUseCustomAddress(false)}
              >
                ← Use saved address
              </button>
            )}
          </div>
        )}
      </div>

      {/* Special Instructions */}
      <div>
        <label className="mb-2 block font-medium text-[#211f1a] text-sm">
          Special Instructions
        </label>
        <textarea
          className="w-full rounded-md border border-[#e5dfd4] px-3 py-2 text-sm focus:border-[#ff5d46] focus:outline-none focus:ring-2 focus:ring-[#ff5d46]/20"
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
          <label className="mb-2 block font-medium text-[#211f1a] text-sm">
            Add Extra Services (Optional)
          </label>
          <div className="space-y-2">
            {addons.map((addon) => {
              const isSelected = bookingData.selectedAddons.some((a) => a.id === addon.id);
              return (
                <button
                  className={`w-full rounded-lg border p-3 text-left transition ${
                    isSelected
                      ? "border-[#ff5d46] bg-[#ff5d46]/5 ring-2 ring-[#ff5d46]/20"
                      : "border-[#e5dfd4] bg-white hover:border-[#ff5d46]/50"
                  }`}
                  key={addon.id}
                  onClick={() => toggleAddon(addon)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-lg ${isSelected ? "opacity-100" : "opacity-40"}`}>
                          {isSelected ? "✓" : "○"}
                        </span>
                        <h4 className="font-semibold text-[#211f1a]">{addon.name}</h4>
                      </div>
                      {addon.description && (
                        <p className="mt-1 text-[#7a6d62] text-sm">{addon.description}</p>
                      )}
                      <div className="mt-1 flex gap-3 text-[#7a6d62] text-xs">
                        <span className="font-semibold text-[#ff5d46]">
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
          className="rounded-md border border-[#e5dfd4] px-6 py-2 font-semibold text-[#7a6d62] text-sm transition hover:border-[#ff5d46] hover:text-[#ff5d46]"
          onClick={onBack}
        >
          ← Back
        </button>
        <button
          className="rounded-md bg-[#ff5d46] px-6 py-2 font-semibold text-sm text-white transition hover:bg-[#eb6c65] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!canProceed}
          onClick={onNext}
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
  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-[#211f1a] text-lg">Review Your Booking</h3>

      <div className="space-y-4 rounded-lg border border-[#f0ece5] bg-white p-6">
        {/* Service Details */}
        <div>
          <h4 className="font-semibold text-[#7a6d62] text-sm">Service</h4>
          <p className="mt-1 text-[#211f1a] text-sm">
            {bookingData.serviceName} with {professionalName}
          </p>
        </div>

        {/* Date & Time */}
        <div>
          <h4 className="font-semibold text-[#7a6d62] text-sm">Date & Time</h4>
          <p className="mt-1 text-[#211f1a] text-sm">
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
            <p className="mt-1 text-[#ff5d46] text-xs">
              ⏱️ Recurring {bookingData.recurrencePattern?.frequency}
            </p>
          )}
        </div>

        {/* Address */}
        <div>
          <h4 className="font-semibold text-[#7a6d62] text-sm">Location</h4>
          {bookingData.address ? (
            <div className="mt-1 text-[#211f1a] text-sm">
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
            <p className="mt-1 text-[#211f1a] text-sm">{bookingData.customAddress}</p>
          )}
        </div>

        {/* Add-ons */}
        {bookingData.selectedAddons.length > 0 && (
          <div>
            <h4 className="font-semibold text-[#7a6d62] text-sm">Add-ons</h4>
            <ul className="mt-1 space-y-1">
              {bookingData.selectedAddons.map((addon) => (
                <li className="flex justify-between text-[#211f1a] text-sm" key={addon.id}>
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
            <p className="mt-1 text-[#211f1a] text-sm">{bookingData.specialInstructions}</p>
          </div>
        )}

        {/* Price Breakdown */}
        <div className="border-[#f0ece5] border-t pt-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#7a6d62]">Service</span>
              <span className="text-[#211f1a]">{formatCurrencyCOP(baseAmount)}</span>
            </div>
            {addonsTotal > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[#7a6d62]">Add-ons</span>
                <span className="text-[#211f1a]">{formatCurrencyCOP(addonsTotal)}</span>
              </div>
            )}
            <div className="flex justify-between border-[#f0ece5] border-t pt-2 font-semibold text-base">
              <span className="text-[#211f1a]">Total</span>
              <span className="text-[#ff5d46]">{formatCurrencyCOP(totalAmount)}</span>
            </div>
          </div>
        </div>

        <p className="text-[#7a6d62] text-xs">
          We'll place a temporary hold on your payment method. You'll only be charged after the
          service is completed.
        </p>
      </div>

      <div className="flex justify-between">
        <button
          className="rounded-md border border-[#e5dfd4] px-6 py-2 font-semibold text-[#7a6d62] text-sm transition hover:border-[#ff5d46] hover:text-[#ff5d46] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={loading}
          onClick={onBack}
        >
          ← Back
        </button>
        <button
          className="rounded-md bg-[#ff5d46] px-6 py-2 font-semibold text-sm text-white transition hover:bg-[#eb6c65] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={loading}
          onClick={onConfirm}
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
      <h3 className="font-semibold text-[#211f1a] text-lg">Confirm Payment Method</h3>
      <p className="text-[#7a6d62] text-sm">
        We'll authorize a hold on your card. You'll only be charged after the service is completed.
      </p>
      <PaymentElement options={{ layout: "tabs" }} />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="flex items-center gap-3">
        <button
          className="rounded-md bg-[#ff5d46] px-6 py-2 font-semibold text-sm text-white transition hover:bg-[#eb6c65] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={submitting}
          onClick={handleConfirm}
          type="button"
        >
          {submitting ? "Confirming..." : "Confirm Booking"}
        </button>
        <button
          className="rounded-md border border-[#e5dfd4] px-6 py-2 font-semibold text-[#7a6d62] text-sm transition hover:border-[#ff5d46] hover:text-[#ff5d46] disabled:cursor-not-allowed disabled:opacity-50"
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
    colorPrimary: "#ff5d46",
    colorText: "#211f1a",
    borderRadius: "8px",
  },
};
