"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Filter, MapPin, Search, ShieldCheck, SlidersHorizontal, Star } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { Container } from "@/components/ui/container";

export type DirectoryProfessional = {
  id: string;
  name: string;
  service: string | null;
  experienceYears: number | null;
  hourlyRateCop: number | null;
  languages: string[];
  city: string | null;
  country: string | null;
  location: string;
  availableToday: boolean;
  photoUrl: string;
  bio: string | null;
};

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
  hourly: "COP / hr",
  years: "yrs exp",
  noBio: "This professional is preparing their public bio. Check back soon.",
  newBadge: "New to MaidConnect",
};

const ratingOptions = [
  { value: "all", label: "All ratings" },
  { value: "4.5", label: "4.5+" },
  { value: "4.8", label: "4.8+" },
];

function formatCurrencyCOP(value: number | null | undefined) {
  if (!value || Number.isNaN(value)) return null;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

type ProfessionalsDirectoryProps = {
  professionals: DirectoryProfessional[];
};

export function ProfessionalsDirectory({ professionals }: ProfessionalsDirectoryProps) {
  const searchParams = useSearchParams();
  const [serviceFilter, setServiceFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [availableToday, setAvailableToday] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const serviceOptions = useMemo(() => {
    const unique = new Set<string>();
    professionals.forEach((professional) => {
      if (professional.service) {
        unique.add(professional.service);
      }
    });
    return ["all", ...Array.from(unique)];
  }, [professionals]);

  const cityOptions = useMemo(() => {
    const unique = new Set<string>();
    professionals.forEach((professional) => {
      if (professional.city) {
        unique.add(professional.city);
      }
    });
    return ["all", ...Array.from(unique)];
  }, [professionals]);

  useEffect(() => {
    const param = searchParams.get("service");
    if (!param) return;

    const normalizedParam = param.toLowerCase();
    const match = serviceOptions.find((option) => {
      if (option === "all") return false;
      const normalizedOption = option.toLowerCase();
      const slugifiedOption = normalizedOption.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      return normalizedOption === normalizedParam || slugifiedOption === normalizedParam;
    });

    if (match) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setServiceFilter(match);
    }
  }, [searchParams, serviceOptions]);

  const filteredProfessionals = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return professionals.filter((professional) => {
      const matchesSearch =
        term.length === 0 ||
        professional.name.toLowerCase().includes(term) ||
        (professional.service ?? "").toLowerCase().includes(term) ||
        professional.location.toLowerCase().includes(term);

      const matchesService =
        serviceFilter === "all" || (professional.service ?? "").toLowerCase() === serviceFilter.toLowerCase();
      const matchesCity =
        cityFilter === "all" || (professional.city ?? "").toLowerCase() === cityFilter.toLowerCase();
      const matchesRating = ratingFilter === "all";
      const matchesAvailability = !availableToday || professional.availableToday;

      return matchesSearch && matchesService && matchesCity && matchesRating && matchesAvailability;
    });
  }, [availableToday, cityFilter, professionals, ratingFilter, searchTerm, serviceFilter]);

  const resetFilters = () => {
    setServiceFilter("all");
    setCityFilter("all");
    setRatingFilter("all");
    setAvailableToday(false);
    setSearchTerm("");
  };

  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <Container className="space-y-12">
        <header className="space-y-6 text-center">
          <h1 className="text-5xl font-semibold tracking-tight text-[#211f1a] sm:text-6xl lg:text-7xl">
            {labels.headerTitle}
          </h1>
          <p className="mx-auto max-w-3xl text-xl text-[#5d574b] sm:text-2xl">{labels.headerSubtitle}</p>
        </header>

        <div className="space-y-6 rounded-[32px] border border-[#ebe5d8] bg-white p-8 shadow-[0_10px_40px_rgba(18,17,15,0.04)]">
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-[#a49c90]" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by name, service, or neighbourhood"
                className="w-full rounded-full border border-[#e2ddd2] bg-[#fbfafa] py-4 pl-14 pr-6 text-base text-[#211f1a] shadow-inner shadow-black/5 outline-none transition focus:border-[#211f1a]"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-[#5a5549]">
              <label className="flex items-center gap-2.5">
                <Filter className="h-5 w-5 text-[#211f1a]" />
                <span>{labels.serviceFilter}</span>
                <select
                  className="rounded-full border border-[#e2ddd2] bg-[#fbfafa] px-4 py-2 text-sm transition focus:border-[#211f1a] focus:outline-none"
                  value={serviceFilter}
                  onChange={(event) => setServiceFilter(event.target.value)}
                >
                  {serviceOptions.map((service) => (
                    <option key={service} value={service}>
                      {service === "all" ? "All services" : service}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-2.5">
                <MapPin className="h-5 w-5 text-[#211f1a]" />
                <span>{labels.cityFilter}</span>
                <select
                  className="rounded-full border border-[#e2ddd2] bg-[#fbfafa] px-4 py-2 text-sm transition focus:border-[#211f1a] focus:outline-none"
                  value={cityFilter}
                  onChange={(event) => setCityFilter(event.target.value)}
                >
                  {cityOptions.map((city) => (
                    <option key={city} value={city}>
                      {city === "all" ? "All cities" : city}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-2.5">
                <SlidersHorizontal className="h-5 w-5 text-[#211f1a]" />
                <span>{labels.ratingFilter}</span>
                <select
                  className="rounded-full border border-[#e2ddd2] bg-[#fbfafa] px-4 py-2 text-sm transition focus:border-[#211f1a] focus:outline-none"
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

              <label className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border-[#e2ddd2] text-[#211f1a] focus:ring-[#211f1a]"
                  checked={availableToday}
                  onChange={(event) => setAvailableToday(event.target.checked)}
                />
                <span>{labels.availabilityFilter}</span>
              </label>

              <button
                type="button"
                className="ml-auto rounded-full border-2 border-[#211f1a] bg-white px-5 py-2 text-sm font-semibold text-[#211f1a] transition hover:bg-[#211f1a] hover:text-white"
                onClick={resetFilters}
              >
                {labels.reset}
              </button>
            </div>
          </div>
        </div>

        {filteredProfessionals.length === 0 ? (
          <div className="rounded-[32px] border border-[#f0ece4] bg-[#fbfafa] p-12 text-center">
            <p className="text-lg text-[#5d574b]">{labels.noResults}</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {filteredProfessionals.map((professional) => (
              <article
                key={professional.id}
                className="flex h-full flex-col overflow-hidden rounded-[28px] border border-[#ebe5d8] bg-white shadow-[0_10px_40px_rgba(18,17,15,0.04)] transition hover:-translate-y-1 hover:border-[#211f1a] hover:shadow-[0_20px_60px_rgba(18,17,15,0.08)]"
              >
                <div className="relative h-64 w-full">
                  <Image src={professional.photoUrl} alt={professional.name} fill className="object-cover" />
                </div>
                <div className="flex flex-1 flex-col gap-5 p-7">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-[#211f1a]">{professional.name}</h2>
                    <p className="text-base text-[#7d7566]">{professional.service ?? "Flexible services"}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#5a5549]">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#fbfafa] px-3 py-1.5">
                      <Star className="h-3.5 w-3.5 text-[#211f1a]" />
                      {labels.newBadge}
                    </span>
                    {professional.experienceYears !== null ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#fbfafa] px-3 py-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-[#211f1a]" />
                        {professional.experienceYears} {labels.years}
                      </span>
                    ) : null}
                    {professional.languages.length > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#fbfafa] px-3 py-1.5">
                        {professional.languages.join(" / ")}
                      </span>
                    ) : null}
                    {professional.availableToday && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#211f1a] px-3 py-1.5 text-white">
                        {labels.availabilityFilter}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-base text-[#5d574b]">
                    <span>{professional.location}</span>
                    <span className="font-semibold">{formatCurrencyCOP(professional.hourlyRateCop) ?? "Rate on request"}</span>
                  </div>
                  <p className="text-base leading-relaxed text-[#7d7566]">
                    {professional.bio
                      ? professional.bio.length > 140
                        ? `${professional.bio.slice(0, 140)}…`
                        : professional.bio
                      : labels.noBio}
                  </p>
                  <div className="mt-auto pt-2">
                    <Link
                      href={`/professionals/${professional.id}`}
                      className="inline-flex w-full items-center justify-center rounded-full border border-[#211f1a] bg-[#211f1a] px-6 py-3.5 text-base font-semibold text-white shadow-[0_6px_18px_rgba(18,17,15,0.22)] transition hover:bg-[#2d2822]"
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
