"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { useSwipeGesture } from "@/hooks/use-swipe-gesture";
import type { ProfessionalService } from "@/lib/professionals/transformers";

type BookingWizardProps = {
  professionalId: string;
  professionalName: string;
  services: ProfessionalService[];
  defaultHourlyRate: number | null;
  availability?: Record<string, boolean>; // Date string to available boolean
};

type WizardStep = 1 | 2 | 3 | 4;

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

export function BookingWizard({
  professionalId: _professionalId,
  professionalName,
  services,
  defaultHourlyRate,
  availability = {},
}: BookingWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [selectedServiceName, setSelectedServiceName] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [durationHours, setDurationHours] = useState<number>(2);
  const [specialInstructions, setSpecialInstructions] = useState<string>("");
  const [address, setAddress] = useState<string>("");

  const serviceWithName = services.filter((service) => Boolean(service.name));
  const selectedService = serviceWithName.find((s) => s.name === selectedServiceName);
  const selectedRate = selectedService?.hourlyRateCop ?? defaultHourlyRate ?? null;

  // Real-time price calculation
  const estimatedAmount =
    selectedRate && durationHours > 0
      ? Math.max(20_000, Math.round(selectedRate * durationHours))
      : 0;

  const taxAmount = Math.round(estimatedAmount * 0.19); // 19% VAT
  const totalAmount = estimatedAmount + taxAmount;

  // Step validation
  const step1Valid = Boolean(selectedServiceName);
  const step2Valid = Boolean(selectedDate && selectedTime);
  const step3Valid = true; // Optional fields
  const canProceedToStep2 = step1Valid;
  const canProceedToStep3 = step1Valid && step2Valid;
  const canProceedToStep4 = step1Valid && step2Valid && step3Valid;

  const steps = [
    { number: 1, title: "Service", completed: step1Valid },
    { number: 2, title: "Date & Time", completed: step2Valid },
    { number: 3, title: "Details", completed: step3Valid },
    { number: 4, title: "Review", completed: false },
  ];

  // Swipe gesture handlers for mobile navigation
  const handleSwipeLeft = () => {
    // Swipe left = next step
    if (currentStep === 1 && canProceedToStep2) setCurrentStep(2);
    else if (currentStep === 2 && canProceedToStep3) setCurrentStep(3);
    else if (currentStep === 3 && canProceedToStep4) setCurrentStep(4);
  };

  const handleSwipeRight = () => {
    // Swipe right = previous step
    if (currentStep === 2) setCurrentStep(1);
    else if (currentStep === 3) setCurrentStep(2);
    else if (currentStep === 4) setCurrentStep(3);
  };

  const swipeRef = useSwipeGesture<HTMLDivElement>({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    minSwipeDistance: 60,
  });

  return (
    <div className="space-y-8">
      {/* Progress Indicator */}
      <div className="relative">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div className="relative flex flex-1 flex-col items-center" key={step.number}>
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`absolute top-5 left-1/2 h-0.5 w-full ${
                    step.completed ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              )}

              {/* Step Circle */}
              <button
                className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold text-sm transition ${
                  currentStep === step.number
                    ? "border-[#ff5d46] bg-[#ff5d46] text-white"
                    : step.completed
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-gray-300 bg-white text-gray-400"
                }`}
                onClick={() => {
                  if (step.number === 2 && !canProceedToStep2) return;
                  if (step.number === 3 && !canProceedToStep3) return;
                  if (step.number === 4 && !canProceedToStep4) return;
                  setCurrentStep(step.number as WizardStep);
                }}
                type="button"
              >
                {step.completed ? <Check className="h-5 w-5" /> : step.number}
              </button>

              {/* Step Label */}
              <span
                className={`mt-2 text-xs ${
                  currentStep === step.number ? "font-semibold text-[#211f1a]" : "text-gray-500"
                }`}
              >
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content - Swipe enabled for mobile */}
      <div
        className="min-h-[400px] touch-pan-y rounded-2xl border border-[#ebe5d8] bg-white p-8 shadow-[0_10px_40px_rgba(18,17,15,0.04)]"
        ref={swipeRef}
      >
        {currentStep === 1 && (
          <Step1ServiceSelection
            defaultHourlyRate={defaultHourlyRate}
            onNext={() => setCurrentStep(2)}
            onSelectService={setSelectedServiceName}
            selectedServiceName={selectedServiceName}
            services={serviceWithName}
          />
        )}

        {currentStep === 2 && (
          <Step2DateTime
            availability={availability}
            onBack={() => setCurrentStep(1)}
            onNext={() => setCurrentStep(3)}
            onSelectDate={setSelectedDate}
            onSelectTime={setSelectedTime}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
          />
        )}

        {currentStep === 3 && (
          <Step3Details
            address={address}
            onBack={() => setCurrentStep(2)}
            onNext={() => setCurrentStep(4)}
            onUpdateAddress={setAddress}
            onUpdateInstructions={setSpecialInstructions}
            specialInstructions={specialInstructions}
          />
        )}

        {currentStep === 4 && (
          <Step4Review
            address={address}
            durationHours={durationHours}
            estimatedAmount={estimatedAmount}
            onBack={() => setCurrentStep(3)}
            onUpdateDuration={setDurationHours}
            professionalName={professionalName}
            selectedDate={selectedDate}
            selectedRate={selectedRate}
            selectedServiceName={selectedServiceName}
            selectedTime={selectedTime}
            specialInstructions={specialInstructions}
            taxAmount={taxAmount}
            totalAmount={totalAmount}
          />
        )}
      </div>

      {/* Floating Price Calculator (visible after step 1) */}
      {currentStep > 1 && estimatedAmount > 0 && (
        <div className="sticky right-0 bottom-6 left-0 mx-auto max-w-md">
          <div className="rounded-full border-2 border-[#ff5d46] bg-white px-6 py-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#7d7566] text-sm">Estimated Total</p>
                <p className="font-bold text-2xl text-[#211f1a]">
                  <AnimatedCounter decimals={0} target={totalAmount} />
                </p>
              </div>
              <div className="text-right">
                <p className="text-[#7d7566] text-xs">
                  {formatCurrencyCOP(selectedRate)} × {durationHours}h
                </p>
                <p className="text-[#7d7566] text-xs">+ Tax {formatCurrencyCOP(taxAmount)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Step 1: Service Selection
function Step1ServiceSelection({
  services,
  selectedServiceName,
  onSelectService,
  onNext,
  defaultHourlyRate,
}: {
  services: ProfessionalService[];
  selectedServiceName: string;
  onSelectService: (name: string) => void;
  onNext: () => void;
  defaultHourlyRate: number | null;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold text-2xl text-[#211f1a]">Select a Service</h2>
        <p className="mt-2 text-[#7d7566] text-sm">Choose the type of service you need</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {services.map((service) => {
          const isSelected = service.name === selectedServiceName;
          const rate = service.hourlyRateCop ?? defaultHourlyRate;

          return (
            <button
              className={`rounded-2xl border-2 p-6 text-left transition ${
                isSelected
                  ? "border-[#ff5d46] bg-[#fff8f6]"
                  : "border-[#ebe5d8] bg-white hover:border-[#211f1a]"
              }`}
              key={service.name}
              onClick={() => onSelectService(service.name ?? "")}
              type="button"
            >
              <h3 className="font-semibold text-[#211f1a] text-lg">{service.name}</h3>
              {rate && (
                <p className="mt-2 font-semibold text-[#ff5d46] text-xl">
                  {formatCurrencyCOP(rate)}/hour
                </p>
              )}
              {service.description && (
                <p className="mt-2 text-[#7d7566] text-sm">{service.description}</p>
              )}
              {isSelected && (
                <div className="mt-4 flex items-center gap-2 text-[#ff5d46] text-sm">
                  <Check className="h-4 w-4" />
                  <span>Selected</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex justify-end pt-4">
        <button
          className="rounded-full bg-[#ff5d46] px-8 py-3 font-semibold text-white transition hover:bg-[#eb6c65] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!selectedServiceName}
          onClick={onNext}
          type="button"
        >
          Continue to Date & Time →
        </button>
      </div>
    </div>
  );
}

// Step 2: Date & Time (we'll enhance this with availability calendar next)
function Step2DateTime({
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
  availability: _availability,
  onNext,
  onBack,
}: {
  selectedDate: Date | null;
  selectedTime: string | null;
  onSelectDate: (date: Date | null) => void;
  onSelectTime: (time: string | null) => void;
  availability: Record<string, boolean>;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold text-2xl text-[#211f1a]">Choose Date & Time</h2>
        <p className="mt-2 text-[#7d7566] text-sm">Select when you need the service</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-2 block font-medium text-[#211f1a] text-sm">Date</label>
          <DatePicker
            onChange={onSelectDate}
            placeholder="Select date"
            required
            value={selectedDate}
          />
        </div>

        <div>
          <label className="mb-2 block font-medium text-[#211f1a] text-sm">Start Time</label>
          <TimePicker
            onChange={onSelectTime}
            placeholder="Select time"
            required
            value={selectedTime}
          />
        </div>
      </div>

      {/* Availability Preview */}
      {selectedDate && (
        <div className="rounded-xl bg-green-50 p-4">
          <p className="flex items-center gap-2 text-green-700 text-sm">
            <Check className="h-4 w-4" />
            <span className="font-medium">Available on this date</span>
          </p>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <button
          className="rounded-full border-2 border-[#211f1a] px-8 py-3 font-semibold text-[#211f1a] transition hover:bg-[#f5f2ed]"
          onClick={onBack}
          type="button"
        >
          ← Back
        </button>
        <button
          className="rounded-full bg-[#ff5d46] px-8 py-3 font-semibold text-white transition hover:bg-[#eb6c65] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!(selectedDate && selectedTime)}
          onClick={onNext}
          type="button"
        >
          Continue to Details →
        </button>
      </div>
    </div>
  );
}

// Step 3: Special Instructions & Address
function Step3Details({
  specialInstructions,
  address,
  onUpdateInstructions,
  onUpdateAddress,
  onNext,
  onBack,
}: {
  specialInstructions: string;
  address: string;
  onUpdateInstructions: (value: string) => void;
  onUpdateAddress: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold text-2xl text-[#211f1a]">Additional Details</h2>
        <p className="mt-2 text-[#7d7566] text-sm">Help us serve you better (optional)</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block font-medium text-[#211f1a] text-sm">
            Special Instructions
          </label>
          <textarea
            className="w-full rounded-xl border border-[#e5dfd4] px-4 py-3 text-sm focus:border-[#ff5d46] focus:outline-none focus:ring-2 focus:ring-[#ff5d4633]"
            onChange={(e) => onUpdateInstructions(e.target.value)}
            placeholder="Building entry, pets, cleaning priorities, allergies..."
            rows={4}
            value={specialInstructions}
          />
        </div>

        <div>
          <label className="mb-2 block font-medium text-[#211f1a] text-sm">Service Address</label>
          <textarea
            className="w-full rounded-xl border border-[#e5dfd4] px-4 py-3 text-sm focus:border-[#ff5d46] focus:outline-none focus:ring-2 focus:ring-[#ff5d4633]"
            onChange={(e) => onUpdateAddress(e.target.value)}
            placeholder="Street address, apartment number, city..."
            rows={3}
            value={address}
          />
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button
          className="rounded-full border-2 border-[#211f1a] px-8 py-3 font-semibold text-[#211f1a] transition hover:bg-[#f5f2ed]"
          onClick={onBack}
          type="button"
        >
          ← Back
        </button>
        <button
          className="rounded-full bg-[#ff5d46] px-8 py-3 font-semibold text-white transition hover:bg-[#eb6c65]"
          onClick={onNext}
          type="button"
        >
          Review Booking →
        </button>
      </div>
    </div>
  );
}

// Step 4: Review & Confirm
function Step4Review({
  professionalName,
  selectedServiceName,
  selectedDate,
  selectedTime,
  specialInstructions: _specialInstructions,
  address: _address,
  durationHours,
  onUpdateDuration,
  selectedRate,
  estimatedAmount,
  taxAmount,
  totalAmount,
  onBack,
}: {
  professionalName: string;
  selectedServiceName: string;
  selectedDate: Date | null;
  selectedTime: string | null;
  specialInstructions: string;
  address: string;
  durationHours: number;
  onUpdateDuration: (hours: number) => void;
  selectedRate: number | null;
  estimatedAmount: number;
  taxAmount: number;
  totalAmount: number;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold text-2xl text-[#211f1a]">Review Your Booking</h2>
        <p className="mt-2 text-[#7d7566] text-sm">Confirm details before proceeding to payment</p>
      </div>

      {/* Booking Summary */}
      <div className="space-y-4 rounded-xl bg-[#fbfafa] p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[#7d7566] text-xs">Professional</p>
            <p className="font-semibold text-[#211f1a]">{professionalName}</p>
          </div>
        </div>

        <div className="border-[#ebe5d8] border-t pt-4">
          <p className="text-[#7d7566] text-xs">Service</p>
          <p className="font-semibold text-[#211f1a]">{selectedServiceName}</p>
        </div>

        <div className="border-[#ebe5d8] border-t pt-4">
          <p className="text-[#7d7566] text-xs">Date & Time</p>
          <p className="font-semibold text-[#211f1a]">
            {selectedDate?.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            at {selectedTime}
          </p>
        </div>

        {/* Duration Adjuster */}
        <div className="border-[#ebe5d8] border-t pt-4">
          <label className="mb-2 block text-[#7d7566] text-xs">Duration (hours)</label>
          <div className="flex items-center gap-3">
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#211f1a] font-bold text-[#211f1a] transition hover:bg-[#f5f2ed]"
              onClick={() => onUpdateDuration(Math.max(1, durationHours - 1))}
              type="button"
            >
              -
            </button>
            <span className="w-12 text-center font-bold text-2xl text-[#211f1a]">
              {durationHours}
            </span>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#211f1a] font-bold text-[#211f1a] transition hover:bg-[#f5f2ed]"
              onClick={() => onUpdateDuration(Math.min(12, durationHours + 1))}
              type="button"
            >
              +
            </button>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="border-[#ebe5d8] border-t pt-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#7d7566]">
                Service ({formatCurrencyCOP(selectedRate)}/hr × {durationHours}h)
              </span>
              <span className="font-semibold text-[#211f1a]">
                {formatCurrencyCOP(estimatedAmount)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#7d7566]">Tax (19%)</span>
              <span className="font-semibold text-[#211f1a]">{formatCurrencyCOP(taxAmount)}</span>
            </div>
            <div className="flex justify-between border-[#ebe5d8] border-t pt-2">
              <span className="font-bold text-[#211f1a]">Total</span>
              <span className="font-bold text-2xl text-[#ff5d46]">
                {formatCurrencyCOP(totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button
          className="rounded-full border-2 border-[#211f1a] px-8 py-3 font-semibold text-[#211f1a] transition hover:bg-[#f5f2ed]"
          onClick={onBack}
          type="button"
        >
          ← Back
        </button>
        <button
          className="rounded-full bg-[#ff5d46] px-8 py-3 font-semibold text-white transition hover:bg-[#eb6c65]"
          type="button"
        >
          Proceed to Payment →
        </button>
      </div>
    </div>
  );
}
