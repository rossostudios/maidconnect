"use client";

/**
 * BookingWizard - Multi-Step Booking Flow
 *
 * Three-step country-first booking flow:
 * 1. Country Selection (CO, PY, UY, AR)
 * 2. City Selection (dynamic based on country)
 * 3. Service Type Selection (cleaning, nanny, etc.)
 *
 * Lia Design System with Anthropic rounded corners, orange accents.
 */

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMarket } from "@/lib/contexts/MarketContext";
import type { CountryCode } from "@/lib/shared/config/territories";
import { CountryCitySelector } from "./CountryCitySelector";

type BookingStep = "country" | "city" | "service";

type ServiceType = {
  id: string;
  nameKey: string;
  descriptionKey: string;
  icon: string;
};

const SERVICE_TYPES: ServiceType[] = [
  {
    id: "cleaning",
    nameKey: "services.cleaning.name",
    descriptionKey: "services.cleaning.description",
    icon: "🧹",
  },
  {
    id: "nanny",
    nameKey: "services.nanny.name",
    descriptionKey: "services.nanny.description",
    icon: "👶",
  },
  {
    id: "chef",
    nameKey: "services.chef.name",
    descriptionKey: "services.chef.description",
    icon: "👨‍🍳",
  },
  {
    id: "elder-care",
    nameKey: "services.elderCare.name",
    descriptionKey: "services.elderCare.description",
    icon: "🤝",
  },
  {
    id: "laundry",
    nameKey: "services.laundry.name",
    descriptionKey: "services.laundry.description",
    icon: "🧺",
  },
  {
    id: "gardening",
    nameKey: "services.gardening.name",
    descriptionKey: "services.gardening.description",
    icon: "🌱",
  },
];

export function BookingWizard() {
  const t = useTranslations("booking");
  const router = useRouter();
  const { country, city, setCountry, setCity } = useMarket();

  const [currentStep, setCurrentStep] = useState<BookingStep>("country");
  const [selectedService, setSelectedService] = useState<string | null>(null);

  // Determine if we can proceed to next step
  const canProceedFromCity = !!city;
  const canSubmit = !!selectedService;

  const handleCountryChange = (newCountry: CountryCode) => {
    setCountry(newCountry);
    // Automatically move to city step after country selection
    setTimeout(() => {
      setCurrentStep("city");
    }, 300);
  };

  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    // Automatically move to service step after city selection
    setTimeout(() => {
      setCurrentStep("service");
    }, 300);
  };

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
  };

  const handleSubmit = () => {
    if (!canSubmit) {
      return;
    }

    // Navigate to brief form with pre-filled market data
    const params = new URLSearchParams({
      country: country || "",
      city: city || "",
      service: selectedService || "",
    });

    router.push(`/brief?${params.toString()}`);
  };

  const handleBack = () => {
    if (currentStep === "service") {
      setCurrentStep("city");
    } else if (currentStep === "city") {
      setCurrentStep("country");
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {["country", "city", "service"].map((step, index) => {
            const stepNumber = index + 1;
            const isActive = currentStep === step;
            const isCompleted =
              (step === "country" && country) ||
              (step === "city" && city) ||
              (step === "service" && selectedService);

            // Determine step indicator style
            let stepClass = "border-neutral-200 bg-neutral-50 text-neutral-400";
            if (isCompleted) {
              stepClass = "border-orange-500 bg-orange-500 text-white";
            } else if (isActive) {
              stepClass = "border-orange-500 bg-orange-50 text-orange-700";
            }

            return (
              <div className="flex flex-1 items-center" key={step}>
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold text-sm transition-all ${stepClass}`}
                  >
                    {isCompleted ? "✓" : stepNumber}
                  </div>
                  <span
                    className={`mt-2 text-xs ${
                      isActive ? "font-medium text-neutral-900" : "text-neutral-500"
                    }`}
                  >
                    {t(`steps.${step}`)}
                  </span>
                </div>
                {index < 2 && (
                  <div
                    className={`mx-2 h-0.5 flex-1 transition-all ${
                      isCompleted ? "bg-orange-500" : "bg-neutral-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card className="p-8">
        {/* Step 1 & 2: Country and City Selection */}
        {(currentStep === "country" || currentStep === "city") && (
          <div>
            <h2 className="mb-2 font-semibold text-2xl text-neutral-900">
              {currentStep === "country"
                ? t("wizard.countryTitle") || "¿Dónde necesitas ayuda?"
                : t("wizard.cityTitle") || "¿En qué ciudad?"}
            </h2>
            <p className="mb-6 text-neutral-600">
              {currentStep === "country"
                ? t("wizard.countryDescription") ||
                  "Selecciona el país donde necesitas nuestros servicios"
                : t("wizard.cityDescription") ||
                  "Selecciona tu ciudad para mostrarte profesionales disponibles"}
            </p>

            <CountryCitySelector
              city={city || undefined}
              country={country}
              onCityChange={handleCityChange}
              onCountryChange={handleCountryChange}
            />

            {currentStep === "city" && (
              <div className="mt-6 flex gap-3">
                <Button className="flex-1" onClick={handleBack} variant="outline">
                  {t("wizard.back") || "Atrás"}
                </Button>
                <Button
                  className="flex-1"
                  disabled={!canProceedFromCity}
                  onClick={() => setCurrentStep("service")}
                >
                  {t("wizard.continue") || "Continuar"} →
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Service Type Selection */}
        {currentStep === "service" && (
          <div>
            <h2 className="mb-2 font-semibold text-2xl text-neutral-900">
              {t("wizard.serviceTitle") || "¿Qué tipo de servicio necesitas?"}
            </h2>
            <p className="mb-6 text-neutral-600">
              {t("wizard.serviceDescription") ||
                "Selecciona el servicio que mejor se adapte a tus necesidades"}
            </p>

            <div className="grid grid-cols-2 gap-4">
              {SERVICE_TYPES.map((service) => {
                const isSelected = selectedService === service.id;
                return (
                  <button
                    className={`rounded-lg border-2 p-4 text-left transition-all ${
                      isSelected
                        ? "border-orange-500 bg-orange-50"
                        : "border-neutral-200 bg-white hover:border-orange-300 hover:bg-orange-50/50"
                    }`}
                    key={service.id}
                    onClick={() => handleServiceSelect(service.id)}
                    type="button"
                  >
                    <div className="mb-2 text-3xl">{service.icon}</div>
                    <h3 className="mb-1 font-semibold text-neutral-900">{t(service.nameKey)}</h3>
                    <p className="text-neutral-600 text-sm">{t(service.descriptionKey)}</p>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex gap-3">
              <Button className="flex-1" onClick={handleBack} variant="outline">
                {t("wizard.back") || "Atrás"}
              </Button>
              <Button className="flex-1" disabled={!canSubmit} onClick={handleSubmit}>
                {t("wizard.submit") || "Continuar con el formulario"} →
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Market Summary (shown after selections) */}
      {(country || city || selectedService) && (
        <Card className="mt-4 bg-orange-50 p-4">
          <p className="text-neutral-700 text-sm">
            <span className="font-medium">Tu selección:</span> {country && `${country}`}
            {city && ` · ${city}`}
            {selectedService && ` · ${t(`services.${selectedService}.name`)}`}
          </p>
        </Card>
      )}
    </div>
  );
}
