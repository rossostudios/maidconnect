"use client";

import {
  CheckmarkCircle01Icon,
  FlashIcon,
  Search01Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import type { Key } from "react-aria-components";
import { ComboBox, ComboBoxItem, type ComboBoxItemData } from "@/components/ui/combobox";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const SERVICES = [
  { value: "cleaning", label: "Cleaning" },
  { value: "childcare", label: "Childcare" },
  { value: "eldercare", label: "Elder Care" },
  { value: "cooking", label: "Cooking" },
] as const;

const _COUNTRY_NAMES: Record<string, string> = {
  CO: "Colombia",
  PY: "Paraguay",
  UY: "Uruguay",
  AR: "Argentina",
};

const CITIES: (ComboBoxItemData & { country: string })[] = [
  // Colombia
  { id: "bogota", label: "Bogotá", country: "CO", description: "Colombia" },
  { id: "medellin", label: "Medellín", country: "CO", description: "Colombia" },
  { id: "cartagena", label: "Cartagena", country: "CO", description: "Colombia" },
  { id: "cali", label: "Cali", country: "CO", description: "Colombia" },
  { id: "barranquilla", label: "Barranquilla", country: "CO", description: "Colombia" },
  // Paraguay
  { id: "asuncion", label: "Asunción", country: "PY", description: "Paraguay" },
  { id: "ciudad-del-este", label: "Ciudad del Este", country: "PY", description: "Paraguay" },
  // Uruguay
  { id: "montevideo", label: "Montevideo", country: "UY", description: "Uruguay" },
  { id: "punta-del-este", label: "Punta del Este", country: "UY", description: "Uruguay" },
  // Argentina
  { id: "buenos-aires", label: "Buenos Aires", country: "AR", description: "Argentina" },
  { id: "cordoba", label: "Córdoba", country: "AR", description: "Argentina" },
  { id: "mendoza", label: "Mendoza", country: "AR", description: "Argentina" },
];

export function MarketplaceHero() {
  const t = useTranslations("home.hero");
  const router = useRouter();
  const [service, setService] = useState<Key | null>(null);
  const [locationQuery, setLocationQuery] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<Key | null>(null);
  const [date, setDate] = useState<Date | null>(null);

  // Filter cities based on search input
  const filteredCities = useMemo(() => {
    if (!locationQuery) {
      return CITIES;
    }
    const query = locationQuery.toLowerCase();
    return CITIES.filter(
      (city) =>
        city.label.toLowerCase().includes(query) || city.description?.toLowerCase().includes(query)
    );
  }, [locationQuery]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (service) {
      params.set("service", String(service));
    }
    if (selectedLocation) {
      params.set("location", String(selectedLocation));
    }
    if (date) {
      params.set("date", date.toISOString().split("T")[0]);
    }

    router.push(`/professionals${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const handleServiceChange = (key: Key | null) => {
    setService(key);
  };

  const handleLocationSelect = (key: Key | null) => {
    setSelectedLocation(key);
    const city = CITIES.find((c) => c.id === key);
    if (city) {
      setLocationQuery(city.label);
    }
  };

  return (
    <section className="w-full px-3 pt-3 sm:px-4 sm:pt-4 lg:px-5 lg:pt-5">
      <div className="relative min-h-[calc(100svh-1.5rem)] w-full overflow-hidden rounded-3xl lg:min-h-[calc(85vh-1.25rem)]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            alt="Professional household services"
            className="rounded-3xl object-cover object-center"
            fill
            priority
            sizes="100vw"
            src="/pricing.png"
          />
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex min-h-[calc(100svh-1.5rem)] flex-col items-center justify-center px-4 py-24 sm:px-6 lg:min-h-[calc(85vh-1.25rem)] lg:py-20">
          {/* Headline */}
          <div className="mb-6 max-w-3xl text-center sm:mb-8">
            <h1 className="mb-3 font-[family-name:var(--font-geist-sans)] font-semibold text-3xl text-white tracking-tight sm:mb-4 sm:text-4xl md:text-5xl lg:text-6xl">
              {t("headline")}
            </h1>
            <p className="text-base text-white/90 sm:text-lg md:text-xl">{t("subheadline")}</p>
          </div>

          {/* Search Bar */}
          <div className="w-full max-w-4xl">
            {/* Mobile Layout (stacked) */}
            <div className="flex flex-col gap-3 lg:hidden">
              <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
                {/* Service Select - React Aria */}
                <div className="border-neutral-100 border-b px-4 py-3">
                  <Select
                    aria-label={t("searchPlaceholder")}
                    className="w-full"
                    onSelectionChange={handleServiceChange}
                    selectedKey={service}
                  >
                    <SelectTrigger className="h-auto border-0 bg-transparent px-0 py-0 hover:bg-transparent focus:ring-0 focus:ring-offset-0">
                      <div className="flex flex-col items-start gap-1">
                        <span className="font-medium text-neutral-500 text-xs uppercase tracking-wide">
                          {t("searchPlaceholder")}
                        </span>
                        <SelectValue
                          className="font-medium text-neutral-900"
                          placeholder={t("searchPlaceholder")}
                        />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="z-[100]">
                      {SERVICES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location ComboBox - React Aria */}
                <div className="border-neutral-100 border-b px-4 py-3">
                  <ComboBox
                    aria-label={t("locationPlaceholder")}
                    inputClassName="pt-1 pb-0"
                    inputValue={locationQuery}
                    items={filteredCities.slice(0, 6)}
                    label={t("locationPlaceholder")}
                    labelClassName="mb-1"
                    onInputChange={setLocationQuery}
                    onSelectionChange={handleLocationSelect}
                    placeholder={t("locationPlaceholder")}
                    selectedKey={selectedLocation}
                    showLocationIcon
                  >
                    {(city) => (
                      <ComboBoxItem
                        description={city.description}
                        id={city.id}
                        key={city.id}
                        textValue={city.label}
                      >
                        {city.label}
                      </ComboBoxItem>
                    )}
                  </ComboBox>
                </div>

                {/* Date Picker */}
                <div>
                  <label className="block px-4 pt-3 font-medium text-neutral-500 text-xs uppercase tracking-wide">
                    {t("datePlaceholder")}
                  </label>
                  <div className="px-4 pt-1 pb-3">
                    <DatePicker
                      className="w-full"
                      onChange={setDate}
                      placeholder={t("datePlaceholder")}
                      value={date}
                      variant="inline"
                    />
                  </div>
                </div>
              </div>

              {/* Mobile Search Button */}
              <button
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 font-semibold text-white transition-all",
                  "bg-orange-500 hover:bg-orange-600 active:scale-[0.98]",
                  "shadow-lg shadow-orange-500/25"
                )}
                onClick={handleSearch}
                type="button"
              >
                <HugeiconsIcon className="h-5 w-5" icon={Search01Icon} />
                <span>{t("searchButton")}</span>
              </button>
            </div>

            {/* Desktop Layout (horizontal pill) */}
            <div className="hidden lg:block">
              <div className="flex items-center rounded-full bg-white p-2 shadow-2xl">
                {/* Service Select - React Aria */}
                <div className="relative min-w-0 flex-1 px-4">
                  <Select
                    aria-label={t("searchPlaceholder")}
                    className="w-full"
                    onSelectionChange={handleServiceChange}
                    selectedKey={service}
                  >
                    <SelectTrigger className="h-auto w-full justify-start border-0 bg-transparent px-2 py-1 hover:bg-transparent focus:ring-0 focus:ring-offset-0">
                      <div className="flex w-full flex-col items-start gap-0.5">
                        <span className="font-semibold text-neutral-900 text-xs">
                          {t("searchPlaceholder")}
                        </span>
                        <SelectValue
                          className="text-neutral-500 text-sm"
                          placeholder={t("searchPlaceholder")}
                        />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="z-[100]">
                      {SERVICES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Divider */}
                <div className="h-8 w-px bg-neutral-200/60" />

                {/* Location ComboBox - React Aria */}
                <div className="relative min-w-0 flex-1 px-4">
                  <ComboBox
                    aria-label={t("locationPlaceholder")}
                    className="w-full"
                    inputClassName="px-2 pt-0.5 pb-1 text-neutral-500 text-sm"
                    inputValue={locationQuery}
                    items={filteredCities.slice(0, 6)}
                    label={t("locationPlaceholder")}
                    labelClassName="font-semibold text-neutral-900 text-xs"
                    onInputChange={setLocationQuery}
                    onSelectionChange={handleLocationSelect}
                    placeholder={t("locationPlaceholder")}
                    selectedKey={selectedLocation}
                  >
                    {(city) => (
                      <ComboBoxItem
                        description={city.description}
                        id={city.id}
                        key={city.id}
                        textValue={city.label}
                      >
                        {city.label}
                      </ComboBoxItem>
                    )}
                  </ComboBox>
                </div>

                {/* Divider */}
                <div className="h-8 w-px bg-neutral-200/60" />

                {/* Date Picker */}
                <div className="relative min-w-0 flex-1">
                  <label className="block px-6 pt-2 font-semibold text-neutral-900 text-xs">
                    {t("datePlaceholder")}
                  </label>
                  <div className="px-6 pt-0.5 pb-2.5">
                    <DatePicker
                      className="!p-0 text-neutral-500 text-sm"
                      onChange={setDate}
                      placeholder={t("datePlaceholder")}
                      value={date}
                      variant="inline"
                    />
                  </div>
                </div>

                {/* Search Button - Circular like Airbnb */}
                <button
                  className={cn(
                    "ml-2 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full transition-all",
                    "bg-orange-500 hover:bg-orange-600 active:scale-[0.95]",
                    "shadow-lg shadow-orange-500/25"
                  )}
                  onClick={handleSearch}
                  type="button"
                >
                  <HugeiconsIcon className="h-5 w-5 text-white" icon={Search01Icon} />
                  <span className="sr-only">{t("searchButton")}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Service Category Pills */}
          <div className="mt-6 w-full max-w-4xl sm:mt-8">
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:justify-center sm:gap-3 sm:overflow-visible sm:px-0 sm:pb-0">
              {SERVICES.map((s) => (
                <button
                  className={cn(
                    "flex-shrink-0 rounded-full px-4 py-2 font-medium text-sm transition-all sm:px-5 sm:py-2.5",
                    String(service) === s.value
                      ? "bg-white text-neutral-900 shadow-lg"
                      : "bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 active:bg-white/40"
                  )}
                  key={s.value}
                  onClick={() => handleServiceChange(s.value)}
                  type="button"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-8 flex flex-col items-center gap-4 text-white/80 sm:mt-12 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <HugeiconsIcon className="h-4 w-4" icon={CheckmarkCircle01Icon} />
              </div>
              <span className="font-medium text-sm">{t("trustBadges.vetted")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <HugeiconsIcon className="h-4 w-4" icon={StarIcon} />
              </div>
              <span className="font-medium text-sm">{t("trustBadges.payments")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <HugeiconsIcon className="h-4 w-4" icon={FlashIcon} />
              </div>
              <span className="font-medium text-sm">{t("trustBadges.instant")}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
