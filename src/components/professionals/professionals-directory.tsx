"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Filter, MapPin, Search, ShieldCheck, SlidersHorizontal, Star } from "lucide-react";

import { Container } from "@/components/ui/container";
import { professionals } from "@/lib/content";

const labels = {
  headerTitle: "Maidconnect professionals",
  headerSubtitle:
    "Every specialist listed below has cleared Maidconnect's four-stage vetting, concierge interviews, and probationary monitoring.",
  serviceFilter: "Service",
  cityFilter: "City",
  ratingFilter: "Rating",
  availabilityFilter: "Available today",
  reset: "Reset",
  noResults: "No professionals match these filters yet.",
  explore: "View profile",
  hourly: "USD / hr",
  years: "yrs exp",
};

const ratingOptions = [
  { value: "all", label: "All ratings" },
  { value: "4.5", label: "4.5+" },
  { value: "4.8", label: "4.8+" },
];

const serviceOptions = ["all", ...new Set(professionals.map((item) => item.service))];
const cityOptions = ["all", ...new Set(professionals.map((item) => item.city))];

export function ProfessionalsDirectory() {
  const [serviceFilter, setServiceFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [availableToday, setAvailableToday] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProfessionals = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return professionals.filter((professional) => {
      const matchesSearch =
        term.length === 0 ||
        professional.name.toLowerCase().includes(term) ||
        professional.service.toLowerCase().includes(term) ||
        professional.neighborhood.toLowerCase().includes(term);

      const matchesService = serviceFilter === "all" || professional.service === serviceFilter;
      const matchesCity = cityFilter === "all" || professional.city === cityFilter;
      const matchesRating =
        ratingFilter === "all" || professional.rating >= parseFloat(ratingFilter);
      const matchesAvailability = !availableToday || professional.availableToday;

      return matchesSearch && matchesService && matchesCity && matchesRating && matchesAvailability;
    });
  }, [availableToday, cityFilter, ratingFilter, searchTerm, serviceFilter]);

  const resetFilters = () => {
    setServiceFilter("all");
    setCityFilter("all");
    setRatingFilter("all");
    setAvailableToday(false);
    setSearchTerm("");
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <Container className="space-y-10">
        <header className="space-y-4">
          <h1 className="text-[2.6rem] font-semibold tracking-tight text-[#211f1a]">
            {labels.headerTitle}
          </h1>
          <p className="max-w-3xl text-base text-[#5d574b]">{labels.headerSubtitle}</p>
        </header>

        <div className="space-y-5 rounded-[32px] border border-[#ebe5d8] bg-white p-6 shadow-[0_24px_60px_rgba(18,17,15,0.08)]">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,_1fr)_minmax(0,_1fr)] lg:items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#a49c90]" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by name, service, or neighbourhood"
                className="w-full rounded-full border border-[#e2ddd2] bg-[#fbfafa] py-3 pl-12 pr-4 text-sm text-[#211f1a] shadow-inner shadow-black/5 outline-none transition focus:border-[#fd857f]"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-[#5a5549]">
              <label className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-[#fd857f]" />
                {labels.serviceFilter}
                <select
                  className="rounded-full border border-[#e2ddd2] bg-[#fbfafa] px-3 py-1"
                  value={serviceFilter}
                  onChange={(event) => setServiceFilter(event.target.value)}
                >
                  {serviceOptions.map((service) => (
                    <option key={service} value={service}>
                      {service === "all" ? "All" : service}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#fd857f]" />
                {labels.cityFilter}
                <select
                  className="rounded-full border border-[#e2ddd2] bg-[#fbfafa] px-3 py-1"
                  value={cityFilter}
                  onChange={(event) => setCityFilter(event.target.value)}
                >
                  {cityOptions.map((city) => (
                    <option key={city} value={city}>
                      {city === "all" ? "All" : city}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-[#fd857f]" />
                {labels.ratingFilter}
                <select
                  className="rounded-full border border-[#e2ddd2] bg-[#fbfafa] px-3 py-1"
                  value={ratingFilter}
                  onChange={(event) => setRatingFilter(event.target.value)}
                >
                  {ratingOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-[#e2ddd2] text-[#fd857f] focus:ring-[#fd857f]"
                  checked={availableToday}
                  onChange={(event) => setAvailableToday(event.target.checked)}
                />
                {labels.availabilityFilter}
              </label>

              <button
                type="button"
                className="rounded-full border border-[#dcd6c7] px-3 py-1 text-xs font-semibold text-[#5a5549] transition hover:border-[#fd857f] hover:text-[#fd857f]"
                onClick={resetFilters}
              >
                {labels.reset}
              </button>
            </div>
          </div>
        </div>

        {filteredProfessionals.length === 0 ? (
          <div className="rounded-[32px] border border-[#f0ece4] bg-[#fbfafa] p-10 text-center">
            <p className="text-sm text-[#5d574b]">{labels.noResults}</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredProfessionals.map((professional) => (
              <article
                key={professional.id}
                className="flex h-full flex-col overflow-hidden rounded-[28px] border border-[#ebe5d8] bg-white shadow-[0_24px_60px_rgba(18,17,15,0.06)] transition hover:border-[#fd857f]/50"
              >
                <div className="relative h-52 w-full">
                  <Image src={professional.photo} alt={professional.name} fill className="object-cover" />
                </div>
                <div className="flex flex-1 flex-col gap-4 p-6">
                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold text-[#211f1a]">{professional.name}</h2>
                    <p className="text-sm text-[#7d7566]">{professional.service}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-[#5a5549]">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#fbfafa] px-3 py-1">
                      <Star className="h-3.5 w-3.5 text-[#fd857f]" />
                      {professional.rating.toFixed(2)}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#fbfafa] px-3 py-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-[#fd857f]" />
                      {professional.experienceYears} {labels.years}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#fbfafa] px-3 py-1">
                      {professional.languages.join(" / ")}
                    </span>
                    {professional.availableToday && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#fd857f]/15 px-3 py-1 text-[#8a3934]">
                        {labels.availabilityFilter}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm text-[#5d574b]">
                    <span>{professional.location}</span>
                    <span>
                      ${professional.hourlyRate} {labels.hourly}
                    </span>
                  </div>
                  <div className="mt-auto">
                    <Link
                      href={`/professionals/${professional.id}`}
                      className="inline-flex items-center justify-center rounded-full bg-[#fd857f] px-5 py-3 text-sm font-semibold text-[#2f2624] shadow-[0_6px_18px_rgba(253,133,127,0.18)] transition hover:bg-[#fc6f68]"
                    >
                      {labels.explore}
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
