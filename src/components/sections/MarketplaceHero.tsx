"use client";

import {
  CheckmarkCircle01Icon,
  FlashIcon,
  Location01Icon,
  Search01Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DatePicker } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";

const SERVICES = [
  { value: "cleaning", label: "Cleaning" },
  { value: "childcare", label: "Childcare" },
  { value: "eldercare", label: "Elder Care" },
  { value: "cooking", label: "Cooking" },
] as const;

const CITIES = [
  // Colombia
  { value: "bogota", label: "Bogotá", country: "CO" },
  { value: "medellin", label: "Medellín", country: "CO" },
  { value: "cartagena", label: "Cartagena", country: "CO" },
  { value: "cali", label: "Cali", country: "CO" },
  { value: "barranquilla", label: "Barranquilla", country: "CO" },
  // Paraguay
  { value: "asuncion", label: "Asunción", country: "PY" },
  { value: "ciudad-del-este", label: "Ciudad del Este", country: "PY" },
  // Uruguay
  { value: "montevideo", label: "Montevideo", country: "UY" },
  { value: "punta-del-este", label: "Punta del Este", country: "UY" },
  // Argentina
  { value: "buenos-aires", label: "Buenos Aires", country: "AR" },
  { value: "cordoba", label: "Córdoba", country: "AR" },
  { value: "mendoza", label: "Mendoza", country: "AR" },
] as const;

export function MarketplaceHero() {
  const router = useRouter();
  const [service, setService] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [date, setDate] = useState<Date | null>(null);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  const filteredCities = CITIES.filter((city) =>
    city.label.toLowerCase().includes(location.toLowerCase())
  );

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (service) params.set("service", service);
    if (location) params.set("location", location);
    if (date) params.set("date", date.toISOString().split("T")[0]);

    router.push(`/professionals${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden lg:min-h-[85vh]">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          alt="Professional household services"
          className="object-cover object-center"
          fill
          priority
          sizes="100vw"
          src="/pricing.png"
        />
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center px-4 py-24 sm:px-6 lg:min-h-[85vh] lg:py-20">
        {/* Headline */}
        <div className="mb-6 max-w-3xl text-center sm:mb-8">
          <h1 className="mb-3 font-[family-name:var(--font-geist-sans)] font-semibold text-3xl text-white tracking-tight sm:mb-4 sm:text-4xl md:text-5xl lg:text-6xl">
            Find household help near you
          </h1>
          <p className="text-base text-white/90 sm:text-lg md:text-xl">
            Book trusted cleaning, childcare, and home services across Latin America
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full max-w-4xl">
          {/* Mobile Layout (stacked) */}
          <div className="flex flex-col gap-3 lg:hidden">
            <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
              {/* Service Select */}
              <div className="border-neutral-100 border-b">
                <label className="block px-4 pt-3 font-medium text-neutral-500 text-xs uppercase tracking-wide">
                  Service
                </label>
                <select
                  className="w-full cursor-pointer appearance-none bg-transparent px-4 pt-1 pb-3 font-medium text-neutral-900 outline-none"
                  onChange={(e) => setService(e.target.value)}
                  value={service}
                >
                  <option value="">What do you need?</option>
                  {SERVICES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Input */}
              <div className="relative border-neutral-100 border-b">
                <label className="block px-4 pt-3 font-medium text-neutral-500 text-xs uppercase tracking-wide">
                  Location
                </label>
                <div className="relative">
                  <HugeiconsIcon
                    className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-4 h-5 w-5 text-neutral-400"
                    icon={Location01Icon}
                  />
                  <input
                    autoComplete="off"
                    className="w-full bg-transparent pt-1 pr-4 pb-3 pl-11 font-medium text-neutral-900 placeholder-neutral-400 outline-none"
                    onBlur={() => setTimeout(() => setShowLocationDropdown(false), 200)}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      setShowLocationDropdown(true);
                    }}
                    onFocus={() => setShowLocationDropdown(true)}
                    placeholder="Where?"
                    type="text"
                    value={location}
                  />
                </div>

                {/* Location Dropdown - Mobile */}
                {showLocationDropdown && location.length > 0 && filteredCities.length > 0 && (
                  <div className="absolute inset-x-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-lg border border-neutral-200 bg-white shadow-xl">
                    {filteredCities.slice(0, 5).map((city) => (
                      <button
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-neutral-50 active:bg-neutral-100"
                        key={city.value}
                        onClick={() => {
                          setLocation(city.label);
                          setShowLocationDropdown(false);
                        }}
                        type="button"
                      >
                        <HugeiconsIcon className="h-5 w-5 text-neutral-400" icon={Location01Icon} />
                        <div>
                          <div className="font-medium text-neutral-900">{city.label}</div>
                          <div className="text-neutral-500 text-sm">
                            {city.country === "CO" && "Colombia"}
                            {city.country === "PY" && "Paraguay"}
                            {city.country === "UY" && "Uruguay"}
                            {city.country === "AR" && "Argentina"}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Date Picker */}
              <div>
                <label className="block px-4 pt-3 font-medium text-neutral-500 text-xs uppercase tracking-wide">
                  Date
                </label>
                <div className="px-4 pt-1 pb-3">
                  <DatePicker
                    className="w-full"
                    onChange={setDate}
                    placeholder="When?"
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
              <span>Search</span>
            </button>
          </div>

          {/* Desktop Layout (horizontal pill) */}
          <div className="hidden lg:block">
            <div className="flex items-center rounded-full bg-white p-2 shadow-2xl">
              {/* Service Select */}
              <div className="relative min-w-0 flex-1">
                <label className="block px-6 pt-2 font-semibold text-neutral-900 text-xs">
                  What
                </label>
                <select
                  className="w-full cursor-pointer appearance-none border-none bg-transparent px-6 pt-0.5 pb-2.5 text-neutral-500 text-sm outline-none"
                  onChange={(e) => setService(e.target.value)}
                  value={service}
                >
                  <option value="">What do you need?</option>
                  {SERVICES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Divider */}
              <div className="h-8 w-px bg-neutral-200/60" />

              {/* Location Input */}
              <div className="relative min-w-0 flex-1">
                <label className="block px-6 pt-2 font-semibold text-neutral-900 text-xs">
                  Where
                </label>
                <div className="relative">
                  <input
                    autoComplete="off"
                    className="w-full border-none bg-transparent px-6 pt-0.5 pb-2.5 text-neutral-500 text-sm outline-none placeholder:text-neutral-500"
                    onBlur={() => setTimeout(() => setShowLocationDropdown(false), 200)}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      setShowLocationDropdown(true);
                    }}
                    onFocus={() => setShowLocationDropdown(true)}
                    placeholder="Search destinations"
                    type="text"
                    value={location}
                  />

                  {/* Location Dropdown - Desktop */}
                  {showLocationDropdown && location.length > 0 && filteredCities.length > 0 && (
                    <div className="absolute top-full left-0 z-50 mt-4 w-72 rounded-2xl border border-neutral-200 bg-white py-2 shadow-xl">
                      {filteredCities.slice(0, 5).map((city) => (
                        <button
                          className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-neutral-50"
                          key={city.value}
                          onClick={() => {
                            setLocation(city.label);
                            setShowLocationDropdown(false);
                          }}
                          type="button"
                        >
                          <HugeiconsIcon
                            className="h-5 w-5 text-neutral-400"
                            icon={Location01Icon}
                          />
                          <div>
                            <div className="font-medium text-neutral-900">{city.label}</div>
                            <div className="text-neutral-500 text-sm">
                              {city.country === "CO" && "Colombia"}
                              {city.country === "PY" && "Paraguay"}
                              {city.country === "UY" && "Uruguay"}
                              {city.country === "AR" && "Argentina"}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="h-8 w-px bg-neutral-200/60" />

              {/* Date Picker */}
              <div className="relative min-w-0 flex-1">
                <label className="block px-6 pt-2 font-semibold text-neutral-900 text-xs">
                  When
                </label>
                <div className="px-6 pt-0.5 pb-2.5">
                  <DatePicker
                    className="!p-0 text-neutral-500 text-sm"
                    onChange={setDate}
                    placeholder="Add dates"
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
                <span className="sr-only">Search</span>
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
                  service === s.value
                    ? "bg-white text-neutral-900 shadow-lg"
                    : "bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 active:bg-white/40"
                )}
                key={s.value}
                onClick={() => setService(s.value)}
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
            <span className="font-medium text-sm">Background checked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
              <HugeiconsIcon className="h-4 w-4" icon={StarIcon} />
            </div>
            <span className="font-medium text-sm">Verified reviews</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
              <HugeiconsIcon className="h-4 w-4" icon={FlashIcon} />
            </div>
            <span className="font-medium text-sm">Instant booking</span>
          </div>
        </div>
      </div>

      {/* Bottom fade for smooth transition */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-neutral-50 to-transparent sm:h-32" />
    </section>
  );
}
