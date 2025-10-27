"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { MapPin, Search, ShieldCheck, SlidersHorizontal, Star } from "lucide-react";
import { Container } from "@/components/ui/container";
import { professionals } from "@/lib/content";
import { cn } from "@/lib/utils";

const translations = {
  en: {
    title: "Find trusted home professionals",
    subtitle:
      "Search bilingual, pre-vetted specialists available across Bogotá and Medellín. Every profile includes background checks, ratings, and transparent pricing.",
    searchPlaceholder: "What service do you need?",
    searchButton: "Search",
    popularLabel: "Popular services",
    topProsLabel: "Top professionals this week",
    availableToday: "Available today",
    filters: "Filters",
    sortBy: "Sort by",
    serviceType: "Service type",
    location: "Location",
    priceRange: "Hourly rate",
    rating: "Rating",
    language: "Language",
    allOption: "All",
    priceAny: "Any",
    priceLow: "Under $20",
    priceMid: "$20 – $30",
    priceHigh: "$30+",
    rating45: "4.5+",
    rating48: "4.8+",
    sortRating: "Rating",
    sortPriceLow: "Price · Low to High",
    sortPriceHigh: "Price · High to Low",
    sortDistance: "Distance",
    experience: "Experience",
    yearsExpShort: "yrs exp",
    yearsUnit: "years",
    perHour: "per hour",
    verified: "Verified",
    topProfessional: "Top professional",
    distanceUnit: "km away",
    bilingualToggle: "Idioma",
    spanish: "Español",
    english: "English",
    noResultsTitle: "No professionals matched your filters",
    noResultsSubtitle: "Try adjusting the filters or explore another service.",
    startSearchTitle: "Search to see vetted professionals near you",
    startSearchSubtitle:
      "Select a service type or enter what you need to view background-checked specialists with transparent pricing.",
  },
  es: {
    title: "Encuentra profesionales confiables para tu hogar",
    subtitle:
      "Busca especialistas bilingües y preseleccionados disponibles en Bogotá y Medellín. Cada perfil incluye verificación, calificaciones y tarifas transparentes.",
    searchPlaceholder: "¿Qué servicio necesitas?",
    searchButton: "Buscar",
    popularLabel: "Servicios populares",
    topProsLabel: "Profesionales destacados de la semana",
    availableToday: "Disponible hoy",
    filters: "Filtros",
    sortBy: "Ordenar por",
    serviceType: "Tipo de servicio",
    location: "Ubicación",
    priceRange: "Tarifa por hora",
    rating: "Calificación",
    language: "Idioma",
    allOption: "Todos",
    priceAny: "Cualquiera",
    priceLow: "Menos de $20",
    priceMid: "$20 – $30",
    priceHigh: "Más de $30",
    rating45: "4.5+",
    rating48: "4.8+",
    sortRating: "Calificación",
    sortPriceLow: "Precio · Menor a Mayor",
    sortPriceHigh: "Precio · Mayor a Menor",
    sortDistance: "Distancia",
    experience: "Experiencia",
    yearsExpShort: "años exp",
    yearsUnit: "años",
    perHour: "por hora",
    verified: "Verificado",
    topProfessional: "Profesional destacado",
    distanceUnit: "km de distancia",
    bilingualToggle: "Language",
    spanish: "Español",
    english: "English",
    noResultsTitle: "No encontramos profesionales con esos filtros",
    noResultsSubtitle: "Ajusta los filtros o explora otro servicio.",
    startSearchTitle: "Busca para ver profesionales verificados cerca de ti",
    startSearchSubtitle:
      "Elige un tipo de servicio o escribe lo que necesitas para ver especialistas verificados con tarifas transparentes.",
  },
};

const popularServices = [
  { en: "Cleaning", es: "Limpieza" },
  { en: "Cooking", es: "Cocina" },
  { en: "Laundry & Ironing", es: "Lavandería y Planchado" },
  { en: "Childcare Support", es: "Cuidado Infantil" },
];

const ratingOptions = [
  { value: "all", en: translations.en.allOption, es: translations.es.allOption },
  { value: "4.5", en: translations.en.rating45, es: translations.es.rating45 },
  { value: "4.8", en: translations.en.rating48, es: translations.es.rating48 },
];

const priceOptions = [
  { value: "any", en: translations.en.priceAny, es: translations.es.priceAny },
  { value: "under-20", en: translations.en.priceLow, es: translations.es.priceLow },
  { value: "20-30", en: translations.en.priceMid, es: translations.es.priceMid },
  { value: "30+", en: translations.en.priceHigh, es: translations.es.priceHigh },
];

const sortOptions = [
  { value: "rating", en: translations.en.sortRating, es: translations.es.sortRating },
  { value: "price-asc", en: translations.en.sortPriceLow, es: translations.es.sortPriceLow },
  { value: "price-desc", en: translations.en.sortPriceHigh, es: translations.es.sortPriceHigh },
  { value: "distance", en: translations.en.sortDistance, es: translations.es.sortDistance },
];

const serviceOptions = [
  ...new Set(professionals.map((pro) => pro.service)),
].map((service) => ({
  en: service,
  es: professionals.find((pro) => pro.service === service)?.service_es ?? service,
}));

const locationOptions = [
  ...new Set(professionals.map((pro) => pro.location)),
];

const languageOptions = [
  ...new Set(professionals.flatMap((pro) => pro.languages)),
];

type LanguageKey = keyof typeof translations;

export function CustomerSearchSection() {
  const [language, setLanguage] = useState<LanguageKey>("en");
  const copy = translations[language];

  const [query, setQuery] = useState("");
  const [activeService, setActiveService] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [serviceFilter, setServiceFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("any");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [availableToday, setAvailableToday] = useState(false);
  const [sortBy, setSortBy] = useState("rating");

  const topProfessionals = useMemo(
    () => professionals.filter((pro) => pro.rating >= 4.8).slice(0, 3),
    [],
  );

  const filteredProfessionals = useMemo(() => {
    const normalizedQuery = (activeService ?? query).toLowerCase();

    let results = professionals.filter((pro) => {
      const matchesQuery =
        !showResults || normalizedQuery.length === 0
          ? true
          : pro.service.toLowerCase().includes(normalizedQuery) ||
            pro.name.toLowerCase().includes(normalizedQuery);

      const matchesService =
        serviceFilter === "all" || pro.service === serviceFilter;

      const matchesLocation =
        locationFilter === "all" || pro.location === locationFilter;

      const matchesPrice =
        priceFilter === "any" ||
        (priceFilter === "under-20" && pro.hourlyRate < 20) ||
        (priceFilter === "20-30" &&
          pro.hourlyRate >= 20 &&
          pro.hourlyRate <= 30) ||
        (priceFilter === "30+" && pro.hourlyRate > 30);

      const matchesRating =
        ratingFilter === "all" || pro.rating >= parseFloat(ratingFilter);

      const matchesLanguage =
        languageFilter === "all" ||
        pro.languages.map((lang) => lang.toLowerCase()).includes(languageFilter);

      const matchesAvailability = !availableToday || pro.availableToday;

      return (
        matchesQuery &&
        matchesService &&
        matchesLocation &&
        matchesPrice &&
        matchesRating &&
        matchesLanguage &&
        matchesAvailability
      );
    });

    results = [...results].sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.hourlyRate - b.hourlyRate;
        case "price-desc":
          return b.hourlyRate - a.hourlyRate;
        case "distance":
          return a.distanceKm - b.distanceKm;
        default:
          return b.rating - a.rating;
      }
    });

    return results;
  }, [
    activeService,
    availableToday,
    languageFilter,
    locationFilter,
    priceFilter,
    query,
    ratingFilter,
    serviceFilter,
    showResults,
    sortBy,
  ]);

  const handleSearch = (service?: string) => {
    const value = service ?? query;
    if (!value.trim()) return;
    setActiveService(service ?? null);
    setShowResults(true);
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20" id="search">
      <Container className="grid gap-10 lg:grid-cols-[minmax(0,_0.85fr)_minmax(0,_1fr)]">
        <div className="space-y-8">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.32em] text-[#a49c90]">
            <span>{copy.bilingualToggle}</span>
            <div className="flex items-center gap-1 rounded-full border border-[#e2ddd2] bg-[#fbfafa] p-1">
              <button
                type="button"
                className={cn(
                  "rounded-full px-3 py-1 text-[11px] transition",
                  language === "en"
                    ? "bg-[#fd857f] text-[#2f2624]"
                    : "text-[#726a5d]",
                )}
                onClick={() => setLanguage("en")}
              >
                {copy.english}
              </button>
              <button
                type="button"
                className={cn(
                  "rounded-full px-3 py-1 text-[11px] transition",
                  language === "es"
                    ? "bg-[#fd857f] text-[#2f2624]"
                    : "text-[#726a5d]",
                )}
                onClick={() => setLanguage("es")}
              >
                {copy.spanish}
              </button>
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-[2.35rem] font-semibold leading-tight text-[#211f1a]">
              {copy.title}
            </h2>
            <p className="text-base text-[#5d574b]">{copy.subtitle}</p>
          </div>

          <div className="space-y-5 rounded-[28px] border border-[#ebe5d8] bg-white p-6 shadow-[0_22px_55px_rgba(18,17,15,0.08)]">
            <form
              className="flex flex-col gap-3 sm:flex-row sm:items-center"
              onSubmit={(event) => {
                event.preventDefault();
                handleSearch();
              }}
            >
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#a49c90]" />
                <input
                  type="text"
                  className="w-full rounded-full border border-[#e2ddd1] bg-[#fbfafa] py-3 pl-12 pr-4 text-sm text-[#211f1a] shadow-inner shadow-black/5 outline-none transition focus:border-[#fd857f]"
                  placeholder={copy.searchPlaceholder}
                  value={activeService ?? query}
                  onChange={(event) => {
                    setActiveService(null);
                    setQuery(event.target.value);
                  }}
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-[#fd857f] px-6 py-[0.85rem] text-sm font-semibold text-[#2f2624] shadow-[0_6px_18px_rgba(253,133,127,0.18)] transition hover:bg-[#fc6f68] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fd857f]"
              >
                {copy.searchButton}
              </button>
            </form>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#a49c90]">
                {copy.popularLabel}
              </p>
              <div className="flex flex-wrap gap-3">
                {popularServices.map((service) => (
                  <button
                    type="button"
                    key={service.en}
                    className="rounded-full border border-[#e2ddd2] bg-[#fbfafa] px-4 py-2 text-sm font-semibold text-[#3f3a31] transition hover:border-[#fd857f] hover:text-[#fd857f]"
                    onClick={() => {
                      setQuery(service.en);
                      handleSearch(service.en);
                    }}
                  >
                    {language === "en" ? service.en : service.es}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-[28px] border border-[#ebe5d8] bg-[#fbfafa] p-6">
            <div className="flex items-center gap-3 text-sm font-semibold text-[#211f1a]">
              <Star className="h-4 w-4 text-[#fd857f]" />
              <span>{copy.topProsLabel}</span>
            </div>
          <div className="space-y-4">
              {topProfessionals.map((pro) => (
                <Link
                  key={pro.id}
                  href={`/professionals/${pro.id}`}
                  className="flex items-center gap-4 rounded-2xl border border-[#e4ded3] bg-white p-4 transition hover:border-[#fd857f]/60"
                >
                  <div className="relative h-14 w-14 overflow-hidden rounded-2xl">
                    <Image
                      src={pro.photo}
                      alt={pro.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#211f1a]">{pro.name}</p>
                    <p className="text-xs text-[#7d7566]">
                      {language === "en" ? pro.service : pro.service_es}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#fd857f]">
                        <Star className="h-3 w-3" />
                        {pro.rating.toFixed(2)}
                      </span>
                      <span className="text-[11px] text-[#7d7566]">
                        ({pro.reviewCount})
                      </span>
                      <span className="text-[11px] text-[#7d7566]">
                        {pro.experienceYears} {copy.yearsExpShort}
                      </span>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#211f1a] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white">
                    {language === "en" ? copy.topProfessional : copy.topProfessional}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div
          className="space-y-6 rounded-[32px] border border-[#ebe5d8] bg-white p-6 shadow-[0_24px_60px_rgba(18,17,15,0.08)]"
          id="results"
        >
          <div className="flex flex-col gap-4 border-b border-[#f0ece4] pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#211f1a]">
              <SlidersHorizontal className="h-4 w-4 text-[#fd857f]" />
              <span>{copy.filters}</span>
            </div>
            <div className="flex flex-wrap gap-3 text-xs font-semibold text-[#5a5549]">
              <label className="flex items-center gap-2">
                <span>{copy.serviceType}</span>
                <select
                  className="rounded-full border border-[#e2ddd2] bg-[#fbfafa] px-3 py-1"
                  value={serviceFilter}
                  onChange={(event) => setServiceFilter(event.target.value)}
                >
                  <option value="all">{copy.allOption}</option>
                  {serviceOptions.map((option) => (
                    <option key={option.en} value={option.en}>
                      {language === "en" ? option.en : option.es}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-2">
                <span>{copy.location}</span>
                <select
                  className="rounded-full border border-[#e2ddd2] bg-[#fbfafa] px-3 py-1"
                  value={locationFilter}
                  onChange={(event) => setLocationFilter(event.target.value)}
                >
                  <option value="all">{copy.allOption}</option>
                  {locationOptions.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-2">
                <span>{copy.priceRange}</span>
                <select
                  className="rounded-full border border-[#e2ddd2] bg-[#fbfafa] px-3 py-1"
                  value={priceFilter}
                  onChange={(event) => setPriceFilter(event.target.value)}
                >
                  {priceOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {language === "en" ? option.en : option.es}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-2">
                <span>{copy.rating}</span>
                <select
                  className="rounded-full border border-[#e2ddd2] bg-[#fbfafa] px-3 py-1"
                  value={ratingFilter}
                  onChange={(event) => setRatingFilter(event.target.value)}
                >
                  {ratingOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {language === "en" ? option.en : option.es}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-2">
                <span>{copy.language}</span>
                <select
                  className="rounded-full border border-[#e2ddd2] bg-[#fbfafa] px-3 py-1"
                  value={languageFilter}
                  onChange={(event) => setLanguageFilter(event.target.value)}
                >
                  <option value="all">{copy.allOption}</option>
                  {languageOptions.map((lang) => (
                    <option key={lang} value={lang.toLowerCase()}>
                      {lang}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-[#5a5549]">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-[#e2ddd2] text-[#fd857f] focus:ring-[#fd857f]"
                checked={availableToday}
                onChange={(event) => setAvailableToday(event.target.checked)}
              />
              {copy.availableToday}
            </label>

            <label className="flex items-center gap-2">
              <span>{copy.sortBy}</span>
              <select
                className="rounded-full border border-[#e2ddd2] bg-[#fbfafa] px-3 py-1"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {language === "en" ? option.en : option.es}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="space-y-4">
            {!showResults ? (
              <div className="rounded-[24px] border border-[#f0ece4] bg-[#fbfafa] p-8 text-center">
                <h3 className="text-lg font-semibold text-[#211f1a]">
                  {copy.startSearchTitle}
                </h3>
                <p className="mt-2 text-sm text-[#666053]">
                  {copy.startSearchSubtitle}
                </p>
              </div>
            ) : filteredProfessionals.length === 0 ? (
              <div className="rounded-[24px] border border-[#f0ece4] bg-[#fbfafa] p-8 text-center">
                <h3 className="text-lg font-semibold text-[#211f1a]">
                  {copy.noResultsTitle}
                </h3>
                <p className="mt-2 text-sm text-[#666053]">{copy.noResultsSubtitle}</p>
              </div>
            ) : (
              filteredProfessionals.map((pro) => (
                <Link
                  key={pro.id}
                  href={`/professionals/${pro.id}`}
                  className="flex flex-col gap-4 rounded-[28px] border border-[#ebe5d8] bg-[#fbfafa] p-5 transition hover:border-[#fd857f]/60 sm:flex-row sm:items-center"
                >
                  <div className="relative h-24 w-24 overflow-hidden rounded-[20px] sm:h-28 sm:w-28">
                    <Image
                      src={pro.photo}
                      alt={pro.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-[#211f1a]">
                          {language === "en" ? pro.name : pro.name_es}
                        </h3>
                        <p className="text-sm text-[#7d7566]">
                          {language === "en" ? pro.service : pro.service_es}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-[#fd857f]">
                        <Star className="h-4 w-4" />
                        <span>{pro.rating.toFixed(2)}</span>
                        <span className="text-xs text-[#7d7566]">
                          ({pro.reviewCount})
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-[#5a5549]">
                      {pro.isTopProfessional && (
                        <span className="inline-flex items-center rounded-full bg-[#fd857f]/15 px-3 py-1 text-[#8a3934]">
                          {copy.topProfessional}
                        </span>
                      )}
                      {pro.isVerified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#211f1a] px-3 py-1 text-white">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          {copy.verified}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[#3f3a31]">
                        {copy.experience}: {pro.experienceYears} {copy.yearsUnit}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[#3f3a31]">
                        ${pro.hourlyRate} USD · {copy.perHour}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[#3f3a31]">
                        {pro.languages.join(" / ")}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#7d7566]">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-[#fd857f]" />
                        {pro.location}
                      </span>
                      <span>{pro.distanceKm.toFixed(1)} {copy.distanceUnit}</span>
                      {pro.availableToday && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#fd857f]/15 px-3 py-1 text-xs font-semibold text-[#8a3934]">
                          {copy.availableToday}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
