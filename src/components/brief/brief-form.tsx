"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { conversionTracking } from "@/lib/integrations/posthog/conversion-tracking";
import { COUNTRY_OPTIONS, type CountryCode, getCityOptions } from "@/lib/shared/config/territories";

// Form validation schema
const briefSchema = z.object({
  serviceType: z.enum([
    "housekeeping",
    "childcare",
    "eldercare",
    "cooking",
    "estate_management",
    "other",
  ]),
  country: z.string().min(2, "Please select a country"),
  city: z.string().min(1, "Please select a city"),
  language: z.enum(["english", "spanish", "both"]),
  startDate: z.string().min(1, "Please select a start date"),
  hoursPerWeek: z.string().min(1, "Please specify hours needed"),
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  requirements: z.string().optional(),
});

type BriefFormData = z.infer<typeof briefSchema>;

const STEPS = [
  { id: 1, title: "Service Type", description: "What type of help do you need?" },
  { id: 2, title: "Location & Language", description: "Where and how?" },
  { id: 3, title: "Schedule", description: "When do you need help?" },
  { id: 4, title: "Contact Info", description: "How can we reach you?" },
  { id: 5, title: "Special Requirements", description: "Anything else we should know?" },
];

const SERVICE_TYPES = [
  { value: "housekeeping", label: "Housekeeping & Cleaning" },
  { value: "childcare", label: "Childcare & Nanny Services" },
  { value: "eldercare", label: "Eldercare & Senior Assistance" },
  { value: "cooking", label: "Private Chef & Cooking" },
  { value: "estate_management", label: "Estate Management" },
  { value: "other", label: "Other Services" },
];

const LANGUAGES = [
  { value: "english", label: "English only" },
  { value: "spanish", label: "Spanish only" },
  { value: "both", label: "Bilingual (English & Spanish)" },
];

type BriefFormProps = {
  onSuccess: (briefId: string) => void;
};

export function BriefForm({ onSuccess }: BriefFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    trigger,
  } = useForm<BriefFormData>({
    resolver: zodResolver(briefSchema),
    mode: "onBlur",
  });

  const formData = watch();

  // Track brief started on mount
  useState(() => {
    conversionTracking.briefStarted({
      serviceType: formData.serviceType || "",
      city: formData.city || "",
    });
  });

  const nextStep = async () => {
    const fields = getFieldsForStep(currentStep);
    const isValid = await trigger(fields);

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
      // Track step completion
      conversionTracking.briefStepCompleted({ step: currentStep });
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data: BriefFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Submit to Supabase
      const response = await fetch("/api/briefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to submit brief");
      }

      const { briefId } = await response.json();

      // Track conversion
      conversionTracking.briefCompleted({ briefId });

      onSuccess(briefId);
    } catch (error) {
      console.error("Error submitting brief:", error);
      alert("There was an error submitting your request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldsForStep = (step: number): (keyof BriefFormData)[] => {
    switch (step) {
      case 1:
        return ["serviceType"];
      case 2:
        return ["country", "city", "language"];
      case 3:
        return ["startDate", "hoursPerWeek"];
      case 4:
        return ["name", "email", "phone"];
      case 5:
        return ["requirements"];
      default:
        return [];
    }
  };

  // Get city options for selected country
  const selectedCountry = watch("country");
  const cityOptions = selectedCountry ? getCityOptions(selectedCountry as CountryCode) : [];

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          {STEPS.map((step) => (
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                step.id === currentStep
                  ? "border-orange-500 bg-orange-500 text-white"
                  : step.id < currentStep
                    ? "border-orange-500 bg-orange-50 text-orange-600"
                    : "border-neutral-300 bg-white text-neutral-600"
              }`}
              key={step.id}
            >
              {step.id}
            </div>
          ))}
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200">
          <div
            className="h-full rounded-full bg-orange-500 transition-all duration-300"
            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Title */}
      <div className="mb-8 text-center">
        <h2 className="mb-2 font-bold text-3xl text-neutral-900">
          {STEPS[currentStep - 1]?.title}
        </h2>
        <p className="text-neutral-600">{STEPS[currentStep - 1]?.description}</p>
      </div>

      {/* Form */}
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1: Service Type */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <label className="block font-medium text-neutral-700 text-sm">
              Service Type <span className="text-orange-500">*</span>
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              {SERVICE_TYPES.map((service) => (
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-all ${
                    formData.serviceType === service.value
                      ? "border-orange-500 bg-orange-50"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                  key={service.value}
                >
                  <input
                    type="radio"
                    value={service.value}
                    {...register("serviceType")}
                    className="h-4 w-4 text-orange-500"
                  />
                  <span className="font-medium text-neutral-900">{service.label}</span>
                </label>
              ))}
            </div>
            {errors.serviceType && (
              <p className="text-red-600 text-sm">{errors.serviceType.message}</p>
            )}
          </div>
        )}

        {/* Step 2: Location & Language */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <label className="mb-2 block font-medium text-neutral-700 text-sm" htmlFor="country">
                Country <span className="text-orange-500">*</span>
              </label>
              <select
                id="country"
                {...register("country")}
                className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/25"
              >
                <option value="">Select a country</option>
                {COUNTRY_OPTIONS.map((country) => (
                  <option key={country.value} value={country.value}>
                    {country.label}
                  </option>
                ))}
              </select>
              {errors.country && (
                <p className="mt-1 text-red-600 text-sm">{errors.country.message}</p>
              )}
            </div>

            {selectedCountry && (
              <div>
                <label className="mb-2 block font-medium text-neutral-700 text-sm" htmlFor="city">
                  City <span className="text-orange-500">*</span>
                </label>
                <select
                  id="city"
                  {...register("city")}
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/25"
                >
                  <option value="">Select a city</option>
                  {cityOptions.map((city) => (
                    <option key={city.value} value={city.value}>
                      {city.label}
                    </option>
                  ))}
                </select>
                {errors.city && <p className="mt-1 text-red-600 text-sm">{errors.city.message}</p>}
              </div>
            )}

            <div>
              <label className="mb-3 block font-medium text-neutral-700 text-sm">
                Language Preference <span className="text-orange-500">*</span>
              </label>
              <div className="space-y-2">
                {LANGUAGES.map((lang) => (
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-all ${
                      formData.language === lang.value
                        ? "border-orange-500 bg-orange-50"
                        : "border-neutral-200 hover:border-neutral-300"
                    }`}
                    key={lang.value}
                  >
                    <input
                      type="radio"
                      value={lang.value}
                      {...register("language")}
                      className="h-4 w-4 text-orange-500"
                    />
                    <span className="font-medium text-neutral-900">{lang.label}</span>
                  </label>
                ))}
              </div>
              {errors.language && (
                <p className="mt-1 text-red-600 text-sm">{errors.language.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Schedule */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <label
                className="mb-2 block font-medium text-neutral-700 text-sm"
                htmlFor="startDate"
              >
                When do you need help to start? <span className="text-orange-500">*</span>
              </label>
              <Input
                id="startDate"
                type="date"
                {...register("startDate")}
                className="w-full"
                min={new Date().toISOString().split("T")[0]}
              />
              {errors.startDate && (
                <p className="mt-1 text-red-600 text-sm">{errors.startDate.message}</p>
              )}
            </div>

            <div>
              <label
                className="mb-2 block font-medium text-neutral-700 text-sm"
                htmlFor="hoursPerWeek"
              >
                Hours per week <span className="text-orange-500">*</span>
              </label>
              <select
                id="hoursPerWeek"
                {...register("hoursPerWeek")}
                className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/25"
              >
                <option value="">Select hours</option>
                <option value="1-10">1-10 hours/week</option>
                <option value="11-20">11-20 hours/week</option>
                <option value="21-30">21-30 hours/week</option>
                <option value="31-40">31-40 hours/week</option>
                <option value="40+">40+ hours/week (Full-time)</option>
              </select>
              {errors.hoursPerWeek && (
                <p className="mt-1 text-red-600 text-sm">{errors.hoursPerWeek.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Contact Info */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <label className="mb-2 block font-medium text-neutral-700 text-sm" htmlFor="name">
                Your Name <span className="text-orange-500">*</span>
              </label>
              <Input id="name" {...register("name")} className="w-full" placeholder="John Doe" />
              {errors.name && <p className="mt-1 text-red-600 text-sm">{errors.name.message}</p>}
            </div>

            <div>
              <label className="mb-2 block font-medium text-neutral-700 text-sm" htmlFor="email">
                Email Address <span className="text-orange-500">*</span>
              </label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                className="w-full"
                placeholder="john@example.com"
              />
              {errors.email && <p className="mt-1 text-red-600 text-sm">{errors.email.message}</p>}
            </div>

            <div>
              <label className="mb-2 block font-medium text-neutral-700 text-sm" htmlFor="phone">
                Phone Number (Optional)
              </label>
              <Input
                id="phone"
                type="tel"
                {...register("phone")}
                className="w-full"
                placeholder="+57 300 123 4567"
              />
            </div>
          </div>
        )}

        {/* Step 5: Special Requirements */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <label className="block font-medium text-neutral-700 text-sm" htmlFor="requirements">
              Any special requirements or preferences? (Optional)
            </label>
            <Textarea
              id="requirements"
              {...register("requirements")}
              className="w-full"
              placeholder="E.g., must speak English fluently, experience with infants, cooking skills, pet-friendly..."
              rows={6}
            />
            <p className="text-neutral-700 text-sm">
              Tell us about any specific needs, scheduling preferences, or qualifications you're
              looking for.
            </p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6">
          <Button
            className="disabled:opacity-50"
            disabled={currentStep === 1}
            onClick={prevStep}
            type="button"
            variant="ghost"
          >
            Back
          </Button>

          {currentStep < STEPS.length ? (
            <Button onClick={nextStep} type="button">
              Continue
            </Button>
          ) : (
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          )}
        </div>
      </form>

      {/* Save for Later */}
      <div className="mt-6 text-center">
        <p className="text-neutral-700 text-sm">
          Your progress is automatically saved. You can return to this page anytime to continue.
        </p>
      </div>
    </div>
  );
}
