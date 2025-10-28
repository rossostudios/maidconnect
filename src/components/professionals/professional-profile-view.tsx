"use client";

import Image from "next/image";
import { useState } from "react";
import {
  BadgeCheck,
  CalendarDays,
  ChevronRight,
  Clock,
  Globe2,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { BookingForm } from "@/components/bookings/booking-form";
import type { Professional, ProfessionalProfile } from "@/lib/content";
import { cn } from "@/lib/utils";

type LanguageKey = "en" | "es";

const labels = {
  en: {
    back: "← Back to search",
    rating: "Rating",
    reviews: "reviews",
    yearsExperience: "years experience",
    hourlyRate: "Hourly rate",
    languages: "Languages",
    serviceArea: "Service area",
    availableToday: "Available today",
    requestBooking: "Request booking",
    messageConcierge: "Message concierge",
    about: "About",
    services: "Services & Pricing",
    includes: "Includes",
    trust: "Verification & Trust",
    availability: "Availability",
    bookingProcess: "How booking works",
    reviewsTitle: "Recent feedback",
    conciergeNote: "Concierge note",
    languageToggle: "Language",
    english: "English",
    spanish: "Español",
    bookWithConfidence: "Book with confidence",
    bilingualSupport: "Bilingual support",
  },
  es: {
    back: "← Volver a la búsqueda",
    rating: "Calificación",
    reviews: "reseñas",
    yearsExperience: "años de experiencia",
    hourlyRate: "Tarifa por hora",
    languages: "Idiomas",
    serviceArea: "Zona de servicio",
    availableToday: "Disponible hoy",
    requestBooking: "Solicitar reserva",
    messageConcierge: "Enviar mensaje al concierge",
    about: "Sobre",
    services: "Servicios y tarifas",
    includes: "Incluye",
    trust: "Verificación y confianza",
    availability: "Disponibilidad",
    bookingProcess: "Cómo funciona la reserva",
    reviewsTitle: "Comentarios recientes",
    conciergeNote: "Nota del concierge",
    languageToggle: "Idioma",
    english: "English",
    spanish: "Español",
    bookWithConfidence: "Reserva con confianza",
    bilingualSupport: "Soporte bilingüe",
  },
};

type ProfessionalProfileViewProps = {
  professional: Professional;
  profile: ProfessionalProfile;
};

export function ProfessionalProfileView({ professional, profile }: ProfessionalProfileViewProps) {
  const [language, setLanguage] = useState<LanguageKey>("en");
  const copy = labels[language];

  const ratingLabel = `${professional.rating.toFixed(2)} · ${copy.rating}`;

  return (
    <div className="bg-[var(--background)] pb-16">
      <Container className="pt-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <a href="#search" className="text-xs font-semibold text-[#5a5549] hover:text-[#fd857f]">
            {copy.back}
          </a>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.32em] text-[#a49c90]">
            <span>{copy.languageToggle}</span>
            <div className="flex items-center gap-1 rounded-full border border-[#e2ddd2] bg-[#fbfafa] p-1">
              <button
                type="button"
                className={cn(
                  "rounded-full px-3 py-1 text-[11px] transition",
                  language === "en" ? "bg-[#fd857f] text-[#2f2624]" : "text-[#726a5d]",
                )}
                onClick={() => setLanguage("en")}
              >
                {copy.english}
              </button>
              <button
                type="button"
                className={cn(
                  "rounded-full px-3 py-1 text-[11px] transition",
                  language === "es" ? "bg-[#fd857f] text-[#2f2624]" : "text-[#726a5d]",
                )}
                onClick={() => setLanguage("es")}
              >
                {copy.spanish}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <h1 className="text-[2.6rem] font-semibold tracking-tight text-[#211f1a]">
                {language === "en" ? professional.name : professional.name_es}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-[#5a5549]">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#fbfafa] px-3 py-1">
                  <Star className="h-4 w-4 text-[#fd857f]" />
                  {ratingLabel}
                  <span className="text-xs text-[#908873]">({professional.reviewCount} {copy.reviews})</span>
                </span>
                {professional.isTopProfessional && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#fd857f]/15 px-3 py-1 text-[#8a3934]">
                    <Sparkles className="h-4 w-4" />
                    {language === "en" ? "Top professional" : "Profesional destacado"}
                  </span>
                )}
                {professional.isVerified && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#211f1a] px-3 py-1 text-xs font-semibold text-white">
                    <ShieldCheck className="h-4 w-4" />
                    {language === "en" ? "Verified" : "Verificado"}
                  </span>
                )}
              </div>
            </div>
          </div>
          <p className="max-w-3xl text-base text-[#5d574b]">
            {profile.headline[language]}
          </p>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,_320px)_minmax(0,_1fr)]">
          <aside className="space-y-6">
            <div className="overflow-hidden rounded-[32px] border border-[#ebe5d8] bg-white shadow-[0_24px_60px_rgba(18,17,15,0.08)]">
              <div className="relative h-72 w-full">
                <Image src={professional.photo} alt={professional.name} fill className="object-cover" />
              </div>
              <div className="space-y-4 p-6">
                <div className="space-y-2 text-sm text-[#5d574b]">
                  <p className="font-semibold text-[#211f1a]">
                    {language === "en" ? professional.service : professional.service_es}
                  </p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#fd857f]" />
                    <span>
                      {copy.hourlyRate}: ${professional.hourlyRate} USD
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#fd857f]" />
                    <span>{professional.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe2 className="h-4 w-4 text-[#fd857f]" />
                    <span>
                      {copy.languages}: {professional.languages.join(" / ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="h-4 w-4 text-[#fd857f]" />
                    <span>
                      {professional.experienceYears} {copy.yearsExperience}
                    </span>
                  </div>
                  {professional.availableToday && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#fd857f]/15 px-3 py-1 text-xs font-semibold text-[#8a3934]">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {copy.availableToday}
                    </span>
                  )}
                </div>

                <div className="space-y-2 rounded-2xl bg-[#fbfafa] p-4 text-xs text-[#6f685a]">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#211f1a]">
                    <ShieldCheck className="h-4 w-4 text-[#fd857f]" />
                    {copy.bookWithConfidence}
                  </div>
                  <p>
                    {language === "en"
                      ? "Background checks, concierge interviews, and probationary monitoring completed."
                      : "Antecedentes, entrevistas y monitoreo en período de prueba completados."}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <a
                    href="#booking"
                    className="inline-flex items-center justify-center rounded-full bg-[#fd857f] px-5 py-3 text-sm font-semibold text-[#2f2624] shadow-[0_6px_18px_rgba(253,133,127,0.18)] transition hover:bg-[#fc6f68]"
                  >
                    {copy.requestBooking}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </a>
                  <a
                    href="mailto:concierge@maidconnect.co"
                    className="inline-flex items-center justify-center rounded-full border border-[#dcd6c7] px-5 py-3 text-sm font-semibold text-[#3f3a31] transition hover:border-[#fd857f] hover:text-[#fd857f]"
                  >
                    {copy.messageConcierge}
                  </a>
                </div>
              </div>
            </div>
          </aside>

          <div className="space-y-12">
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-[#211f1a]">
                {copy.about} {language === "en" ? professional.name : professional.name_es}
              </h2>
              <p className="text-base text-[#5d574b]">{profile.about[language]}</p>
              <ul className="grid gap-3 sm:grid-cols-2">
                {profile.highlights.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 rounded-[18px] border border-[#e5dfd4] bg-[#fbfafa] px-4 py-3 text-sm text-[#4d473d]"
                  >
                    <Sparkles className="mt-0.5 h-4 w-4 text-[#fd857f]" />
                    {item[language]}
                  </li>
                ))}
              </ul>
            </section>

            <section className="space-y-5">
              <h2 className="text-xl font-semibold text-[#211f1a]">{copy.services}</h2>
              <div className="space-y-4">
                {profile.services.map((service, idx) => (
                  <div
                    key={idx}
                    className="space-y-3 rounded-[28px] border border-[#ebe5d8] bg-[#fbfafa] p-6"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-[#211f1a]">
                          {service.name[language]}
                        </h3>
                        <p className="text-sm text-[#6f685a]">{service.description[language]}</p>
                      </div>
                      <div className="text-sm font-semibold text-[#211f1a]">
                        {service.rate} · {service.duration}
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-[#5a5549]">
                      <p className="font-semibold uppercase tracking-[0.26em] text-xs text-[#a49c90]">
                        {copy.includes}
                      </p>
                      <ul className="grid gap-2 sm:grid-cols-2">
                        {service.includes.map((item, includeIdx) => (
                          <li key={includeIdx} className="flex items-start gap-2">
                            <ChevronRight className="mt-0.5 h-4 w-4 text-[#fd857f]" />
                            <span>{item[language]}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-5">
              <h2 className="text-xl font-semibold text-[#211f1a]">{copy.trust}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {profile.verifications.map((item, idx) => (
                  <div key={idx} className="rounded-[24px] border border-[#e5dfd4] bg-white p-5 shadow-[0_14px_30px_rgba(18,17,15,0.06)]">
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#211f1a]">
                      <ShieldCheck className="h-4 w-4 text-[#fd857f]" />
                      {item.title[language]}
                    </div>
                    <p className="mt-2 text-sm text-[#5d574b]">{item.detail[language]}</p>
                  </div>
                ))}
              </div>
            </section>

            <section id="booking" className="space-y-4">
              <h2 className="text-xl font-semibold text-[#211f1a]">{copy.bookingProcess}</h2>
              <ol className="grid gap-4 md:grid-cols-2">
                {profile.bookingProcess.map((step, idx) => (
                  <li
                    key={idx}
                    className="space-y-2 rounded-[24px] border border-[#e5dfd4] bg-[#fbfafa] p-5"
                  >
                    <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#fd857f]/20 text-sm font-semibold text-[#8a3934]">
                      {idx + 1}
                    </div>
                    <p className="text-sm font-semibold text-[#211f1a]">{step.title[language]}</p>
                    <p className="text-sm text-[#5d574b]">{step.detail[language]}</p>
                  </li>
                ))}
              </ol>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-[#211f1a]">{copy.availability}</h2>
              <ul className="space-y-2 text-sm text-[#5d574b]">
                {profile.availability.map((slot, idx) => (
                  <li key={idx} className="inline-flex items-center gap-2 rounded-full bg-[#fbfafa] px-4 py-2">
                    <Clock className="h-4 w-4 text-[#fd857f]" />
                    {slot[language]}
                  </li>
                ))}
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-[#211f1a]">{copy.reviewsTitle}</h2>
              <div className="space-y-4">
                {profile.reviews.map((review, idx) => (
                  <article key={idx} className="rounded-[24px] border border-[#ebe5d8] bg-white p-5 shadow-[0_18px_36px_rgba(18,17,15,0.05)]">
                    <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-[#211f1a]">
                      {review.name}
                      <span className="text-xs text-[#8a826d]">· {review.date}</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#fd857f]/15 px-2 py-1 text-xs text-[#8a3934]">
                        <Star className="h-3 w-3" /> {review.rating.toFixed(1)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-[#514c41]">{review.comment[language]}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="space-y-3 rounded-[28px] border border-[#ebe5d8] bg-[#fbfafa] p-6">
              <h2 className="text-sm font-semibold uppercase tracking-[0.32em] text-[#a49c90]">
                {copy.conciergeNote}
              </h2>
              <p className="text-sm text-[#5d574b]">{profile.conciergeNote[language]}</p>
            </section>
            <BookingForm professionalId={professional.id} professionalName={professional.name} />
          </div>
        </div>
      </Container>
    </div>
  );
}
