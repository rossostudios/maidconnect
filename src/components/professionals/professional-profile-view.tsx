"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Clock, Globe2, MapPin, ShieldCheck } from "lucide-react";

import { BookingForm } from "@/components/bookings/booking-form";
import { Container } from "@/components/ui/container";
import { ProfessionalAvailabilityCalendar } from "@/components/professionals/professional-availability-calendar";
import { ProfessionalPortfolioGallery } from "@/components/professionals/professional-portfolio-gallery";
import { ProfessionalReviewsSection } from "@/components/professionals/professional-reviews";
import type {
  ProfessionalBookingSummary,
  ProfessionalPortfolioImage,
  ProfessionalReviewSummary,
} from "@/components/professionals/types";
import type { AppUser } from "@/lib/auth/types";
import { type AvailabilitySlot, type ProfessionalService } from "@/lib/professionals/transformers";

export type ProfessionalProfileDetail = {
  id: string;
  name: string;
  service: string | null;
  bio: string | null;
  experienceYears: number | null;
  languages: string[];
  city: string | null;
  country: string | null;
  location: string;
  services: ProfessionalService[];
  availability: AvailabilitySlot[];
  availableToday: boolean;
  hourlyRateCop: number | null;
  photoUrl: string | null;
  bookings: ProfessionalBookingSummary[];
  reviews: ProfessionalReviewSummary[];
  portfolioImages: ProfessionalPortfolioImage[];
};

type ProfessionalProfileViewProps = {
  professional: ProfessionalProfileDetail;
  viewer: AppUser | null;
};

const DEFAULT_PRO_PHOTO =
  "https://images.unsplash.com/photo-1523800503107-5bc3ba2a6f81?auto=format&fit=crop&w=600&q=80";

function formatCurrencyCOP(value: number | null | undefined) {
  if (!value || Number.isNaN(value)) return null;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function ProfessionalProfileView({ professional, viewer }: ProfessionalProfileViewProps) {
  const locationLabel = professional.location || "Colombia";
  const formattedRate = formatCurrencyCOP(professional.hourlyRateCop);
  const hasServices = professional.services.length > 0;

  return (
    <div className="pb-24">
      <Container className="max-w-[1680px] pt-12">
        <Link
          href="/professionals"
          className="text-xs font-semibold text-[#5a5549] transition hover:text-[#fd857f]"
        >
          ← Back to directory
        </Link>

        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,_420px)_minmax(0,_1fr)] xl:grid-cols-[minmax(0,_520px)_minmax(0,_1fr)]">
          <aside className="space-y-6">
            <div className="overflow-hidden rounded-[36px] border border-[#ebe5d8] bg-white shadow-[0_28px_70px_rgba(18,17,15,0.08)]">
              <div className="relative h-72 w-full">
                <Image
                  src={professional.photoUrl ?? DEFAULT_PRO_PHOTO}
                  alt={professional.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-4 p-6 text-sm text-[#5d574b]">
                <div>
                  <h1 className="text-[2.4rem] font-semibold text-[#211f1a] leading-tight">{professional.name}</h1>
                  <p className="mt-1 text-sm text-[#7d7566]">{professional.service ?? "Available for bookings"}</p>
                </div>
                <dl className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#fd857f]" />
                    <div>
                      <dt className="sr-only">Location</dt>
                      <dd>{locationLabel}</dd>
                    </div>
                  </div>
                  {formattedRate ? (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[#fd857f]" />
                      <div>
                        <dt className="sr-only">Hourly rate</dt>
                        <dd>{formattedRate} · COP / hr</dd>
                      </div>
                    </div>
                  ) : null}
                  {professional.languages.length > 0 ? (
                    <div className="flex items-center gap-2">
                      <Globe2 className="h-4 w-4 text-[#fd857f]" />
                      <div>
                        <dt className="sr-only">Languages</dt>
                        <dd>{professional.languages.join(" / ")}</dd>
                      </div>
                    </div>
                  ) : null}
                  {professional.experienceYears !== null ? (
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-[#fd857f]" />
                      <div>
                        <dt className="sr-only">Experience</dt>
                        <dd>{professional.experienceYears} yrs experience</dd>
                      </div>
                    </div>
                  ) : null}
                  {professional.availableToday ? (
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#fd857f]/15 px-3 py-1 text-xs font-semibold text-[#8a3934]">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Available today
                    </span>
                  ) : null}
                </dl>
              </div>
            </div>

            <div className="rounded-[32px] border border-[#ebe5d8] bg-white shadow-[0_24px_60px_rgba(18,17,15,0.08)]">
              <div className="space-y-5 p-6">
                <div>
                  <h2 className="text-lg font-semibold text-[#211f1a]">Request a booking</h2>
                  <p className="mt-1 text-sm text-[#7d7566]">
                    Hold funds securely until the visit is complete. You can cancel any time before the appointment.
                  </p>
                </div>
                <BookingForm
                  professionalId={professional.id}
                  professionalName={professional.name}
                  services={professional.services}
                  defaultHourlyRate={professional.hourlyRateCop}
                />
              </div>
            </div>
          </aside>

          <div className="space-y-10">
            <section className="rounded-[32px] border border-[#ebe5d8] bg-white p-6 shadow-[0_24px_60px_rgba(18,17,15,0.06)]">
              <h3 className="text-lg font-semibold text-[#211f1a]">About</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#5d574b]">
                {professional.bio ??
                  "This professional is finalizing their public bio. Reach out with a booking request to learn more about their experience."}
              </p>
            </section>

            <section className="rounded-[32px] border border-[#ebe5d8] bg-white p-6 shadow-[0_24px_60px_rgba(18,17,15,0.06)]">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#211f1a]">Services & rates</h3>
              </div>
              <div className="mt-4 space-y-4">
                {hasServices ? (
                  professional.services.map((service) => (
                    <div
                      key={`${service.name ?? "service"}-${service.description ?? "detail"}`}
                      className="rounded-2xl border border-[#f0ece4] bg-[#fbfafa] p-4"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-sm font-semibold text-[#211f1a]">{service.name ?? "Service"}</div>
                        <div className="text-sm text-[#5d574b]">
                          {formatCurrencyCOP(service.hourlyRateCop) ?? "Rate on request"}
                        </div>
                      </div>
                      {service.description ? (
                        <p className="mt-2 text-sm text-[#7d7566]">{service.description}</p>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#7d7566]">
                    Services are being finalized. Submit a booking request with the details you need and we&apos;ll confirm pricing.
                  </p>
                )}
              </div>
            </section>

            <ProfessionalPortfolioGallery images={professional.portfolioImages} />

            <ProfessionalAvailabilityCalendar
              availability={professional.availability}
              bookings={professional.bookings}
            />

            <ProfessionalReviewsSection
              professionalId={professional.id}
              reviews={professional.reviews}
              viewer={viewer}
            />
          </div>
        </div>
      </Container>
    </div>
  );
}
