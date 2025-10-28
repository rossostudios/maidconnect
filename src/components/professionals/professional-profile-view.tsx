"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Clock, Globe2, MapPin, ShieldCheck } from "lucide-react";

import { BookingForm } from "@/components/bookings/booking-form";
import { Container } from "@/components/ui/container";
import {
  type AvailabilitySlot,
  type ProfessionalReference,
  type ProfessionalService,
} from "@/lib/professionals/transformers";

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
  references: ProfessionalReference[];
  availableToday: boolean;
  hourlyRateCop: number | null;
  photoUrl: string | null;
};

type ProfessionalProfileViewProps = {
  professional: ProfessionalProfileDetail;
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

export function ProfessionalProfileView({ professional }: ProfessionalProfileViewProps) {
  const locationLabel = professional.location || "Colombia";
  const formattedRate = formatCurrencyCOP(professional.hourlyRateCop);
  const hasAvailability = professional.availability.length > 0;
  const hasReferences = professional.references.length > 0;
  const hasServices = professional.services.length > 0;

  return (
    <div className="bg-[var(--background)] pb-16">
      <Container className="pt-10">
        <Link
          href="/professionals"
          className="text-xs font-semibold text-[#5a5549] transition hover:text-[#fd857f]"
        >
          ← Back to directory
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,_340px)_minmax(0,_1fr)]">
          <aside className="space-y-6">
            <div className="overflow-hidden rounded-[32px] border border-[#ebe5d8] bg-white shadow-[0_24px_60px_rgba(18,17,15,0.08)]">
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

            <div className="rounded-[28px] border border-[#ebe5d8] bg-white shadow-[0_20px_50px_rgba(18,17,15,0.08)]">
              <div className="space-y-4 p-6">
                <div>
                  <h2 className="text-lg font-semibold text-[#211f1a]">Request a booking</h2>
                  <p className="mt-1 text-sm text-[#7d7566]">
                    Hold funds securely until the visit is complete. You can cancel any time before the appointment.
                  </p>
                </div>
                <BookingForm professionalId={professional.id} professionalName={professional.name} />
              </div>
            </div>
          </aside>

          <div className="space-y-8">
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

            <section className="rounded-[32px] border border-[#ebe5d8] bg-white p-6 shadow-[0_24px_60px_rgba(18,17,15,0.06)]">
              <h3 className="text-lg font-semibold text-[#211f1a]">Weekly availability</h3>
              {hasAvailability ? (
                <div className="mt-4 overflow-hidden rounded-xl border border-[#f0ece4]">
                  <table className="min-w-full divide-y divide-[#f0ece4] text-sm text-[#5d574b]">
                    <thead className="bg-[#fbfafa] text-xs uppercase tracking-wider text-[#7d7566]">
                      <tr>
                        <th className="px-4 py-3 text-left">Day</th>
                        <th className="px-4 py-3 text-left">Start</th>
                        <th className="px-4 py-3 text-left">End</th>
                        <th className="px-4 py-3 text-left">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f7f3eb] bg-white">
                      {professional.availability.map((slot) => (
                        <tr key={`${slot.day}-${slot.start}-${slot.end}`}>
                          <td className="px-4 py-3 font-medium text-[#211f1a]">{slot.day}</td>
                          <td className="px-4 py-3">{slot.start ?? "—"}</td>
                          <td className="px-4 py-3">{slot.end ?? "—"}</td>
                          <td className="px-4 py-3 text-[#8a826d]">{slot.notes ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="mt-3 text-sm text-[#7d7566]">
                  Availability will be added soon. Request a booking to confirm dates that work for you.
                </p>
              )}
            </section>

            <section className="rounded-[32px] border border-[#ebe5d8] bg-white p-6 shadow-[0_24px_60px_rgba(18,17,15,0.06)]">
              <h3 className="text-lg font-semibold text-[#211f1a]">Professional references</h3>
              {hasReferences ? (
                <ul className="mt-4 space-y-3 text-sm text-[#5d574b]">
                  {professional.references.map((reference, index) => (
                    <li key={`${reference.name ?? "reference"}-${index}`} className="rounded-2xl border border-[#f0ece4] bg-[#fbfafa] p-4">
                      <p className="font-semibold text-[#211f1a]">
                        {reference.name ?? "Reference available on request"}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-wide text-[#a49c90]">
                        {reference.relationship ?? "Relationship not specified"}
                      </p>
                      <p className="mt-2 text-sm text-[#7d7566]">
                        {reference.contact ?? "Contact information shared privately after booking confirmation."}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-[#7d7566]">
                  References are verified during onboarding and will be available to customers after the first booking.
                </p>
              )}
            </section>
          </div>
        </div>
      </Container>
    </div>
  );
}
