"use client";

import { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { CalendarDays, Clock, Globe2, MapPin, ShieldCheck, Star } from "lucide-react";
import { useTranslations } from "next-intl";

import { LargeAvailabilityCalendar } from "@/components/bookings/large-availability-calendar";
import { BookingSheet } from "@/components/bookings/booking-sheet";
import { Container } from "@/components/ui/container";
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
  locale: string;
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

export function ProfessionalProfileView({ professional, viewer, locale }: ProfessionalProfileViewProps) {
  const t = useTranslations("pages.professionalProfile");
  const [isBookingSheetOpen, setIsBookingSheetOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"about" | "services" | "portfolio" | "reviews">("about");

  const locationLabel = professional.location || "Colombia";
  const formattedRate = formatCurrencyCOP(professional.hourlyRateCop);
  const hasServices = professional.services.length > 0;
  const averageRating = professional.reviews.length > 0
    ? professional.reviews.reduce((sum, r) => sum + r.rating, 0) / professional.reviews.length
    : 0;

  const handleDateSelect = (date: Date, slots: string[]) => {
    setSelectedDate(date);
    setAvailableSlots(slots);
    setIsBookingSheetOpen(true);
  };

  return (
    <div className="pb-24">
      <Container className="max-w-[1680px] pt-12">
        <Link
          href="/professionals"
          className="text-base font-semibold text-[#5a5549] transition hover:text-[#ff5d46]"
        >
          {t("backToDirectory")}
        </Link>

        {/* Professional Hero Card */}
        <div className="mt-8 overflow-hidden rounded-[36px] border border-[#ebe5d8] bg-white shadow-[0_10px_40px_rgba(18,17,15,0.04)]">
          <div className="grid gap-8 p-8 md:grid-cols-[240px_1fr] lg:grid-cols-[300px_1fr]">
            {/* Photo */}
            <div className="relative h-64 w-full overflow-hidden rounded-3xl md:h-full">
              <Image
                src={professional.photoUrl ?? DEFAULT_PRO_PHOTO}
                alt={professional.name}
                fill
                className="object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex flex-col justify-center space-y-6">
              <div>
                <h1 className="text-5xl font-semibold leading-tight text-[#211f1a] lg:text-6xl">
                  {professional.name}
                </h1>
                <p className="mt-2 text-xl text-[#7d7566]">
                  {professional.service ?? t("availableForBookings")}
                </p>
              </div>

              <div className="flex flex-wrap gap-6 text-base text-[#5d574b]">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#ff5d46]" />
                  <span>{locationLabel}</span>
                </div>
                {formattedRate && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-[#ff5d46]" />
                    <span>{formattedRate} {t("perHour")}</span>
                  </div>
                )}
                {professional.languages.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Globe2 className="h-5 w-5 text-[#ff5d46]" />
                    <span>{professional.languages.join(" / ")}</span>
                  </div>
                )}
                {professional.experienceYears !== null && (
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-[#ff5d46]" />
                    <span>{t("yearsExperience", { years: professional.experienceYears })}</span>
                  </div>
                )}
                {averageRating > 0 && (
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-[#ff5d46] text-[#ff5d46]" />
                    <span className="font-semibold">{averageRating.toFixed(1)}</span>
                    <span className="text-[#7d7566]">({t("reviewsCount", { count: professional.reviews.length })})</span>
                  </div>
                )}
              </div>

              {professional.availableToday && (
                <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#ff5d46]/15 px-5 py-2.5 text-base font-semibold text-[#8a3934]">
                  <CalendarDays className="h-5 w-5" />
                  {t("availableToday")}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Layout: Calendar + Info Sidebar */}
        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,_1fr)_minmax(0,_400px)] xl:grid-cols-[minmax(0,_1fr)_minmax(0,_480px)]">
          {/* Left: Large Calendar */}
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-semibold text-[#211f1a]">{t("bookingSection.title")}</h2>
              <p className="mt-2 text-lg text-[#7d7566]">
                {t("bookingSection.description")}
              </p>
            </div>
            <LargeAvailabilityCalendar
              professionalId={professional.id}
              onDateSelect={handleDateSelect}
            />
          </div>

          {/* Right: Info Tabs */}
          <aside className="space-y-8">
            {/* Tab Navigation */}
            <div className="rounded-[32px] border border-[#ebe5d8] bg-white shadow-[0_10px_40px_rgba(18,17,15,0.04)]">
              <div className="flex border-b border-[#ebe5d8]">
                <button
                  onClick={() => setActiveTab("about")}
                  className={`flex-1 px-6 py-4 text-base font-semibold transition ${
                    activeTab === "about"
                      ? "border-b-2 border-[#ff5d46] text-[#ff5d46]"
                      : "text-[#7d7566] hover:text-[#ff5d46]"
                  }`}
                >
                  {t("tabs.about")}
                </button>
                <button
                  onClick={() => setActiveTab("services")}
                  className={`flex-1 px-6 py-4 text-base font-semibold transition ${
                    activeTab === "services"
                      ? "border-b-2 border-[#ff5d46] text-[#ff5d46]"
                      : "text-[#7d7566] hover:text-[#ff5d46]"
                  }`}
                >
                  {t("tabs.services")}
                </button>
                <button
                  onClick={() => setActiveTab("portfolio")}
                  className={`flex-1 px-6 py-4 text-base font-semibold transition ${
                    activeTab === "portfolio"
                      ? "border-b-2 border-[#ff5d46] text-[#ff5d46]"
                      : "text-[#7d7566] hover:text-[#ff5d46]"
                  }`}
                >
                  {t("tabs.portfolio")}
                </button>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`flex-1 px-6 py-4 text-base font-semibold transition ${
                    activeTab === "reviews"
                      ? "border-b-2 border-[#ff5d46] text-[#ff5d46]"
                      : "text-[#7d7566] hover:text-[#ff5d46]"
                  }`}
                >
                  {t("tabs.reviews")}
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-8">
                {activeTab === "about" && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-semibold text-[#211f1a]">{t("tabs.about")}</h3>
                    <p className="text-base leading-relaxed text-[#5d574b]">
                      {professional.bio ?? t("aboutSection.noBio")}
                    </p>
                  </div>
                )}

                {activeTab === "services" && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-semibold text-[#211f1a]">{t("servicesSection.title")}</h3>
                    <div className="space-y-4">
                      {hasServices ? (
                        professional.services.map((service) => (
                          <div
                            key={`${service.name ?? "service"}-${service.description ?? "detail"}`}
                            className="rounded-2xl border border-[#f0ece4] bg-[#fbfafa] p-5"
                          >
                            <div className="flex flex-col gap-2">
                              <div className="text-base font-semibold text-[#211f1a]">
                                {service.name ?? t("servicesSection.serviceFallback")}
                              </div>
                              <div className="text-lg font-semibold text-[#ff5d46]">
                                {formatCurrencyCOP(service.hourlyRateCop) ?? t("servicesSection.rateOnRequest")}
                              </div>
                            </div>
                            {service.description && (
                              <p className="mt-2 text-base text-[#7d7566]">{service.description}</p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-base text-[#7d7566]">
                          {t("servicesSection.noServices")}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "portfolio" && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-semibold text-[#211f1a]">{t("tabs.portfolio")}</h3>
                    {professional.portfolioImages.length > 0 ? (
                      <div className="grid grid-cols-2 gap-4">
                        {professional.portfolioImages.slice(0, 6).map((image, index) => (
                          <div key={index} className="relative aspect-square overflow-hidden rounded-2xl">
                            <Image
                              src={image.url}
                              alt={image.caption || t("portfolioSection.imageAlt")}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-base text-[#7d7566]">
                        {t("portfolioSection.noImages")}
                      </p>
                    )}
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-semibold text-[#211f1a]">{t("tabs.reviews")}</h3>
                    {professional.reviews.length > 0 ? (
                      <div className="space-y-6">
                        {professional.reviews.slice(0, 3).map((review) => (
                          <div key={review.id} className="space-y-3 border-b border-[#ebe5d8] pb-6 last:border-b-0 last:pb-0">
                            <div className="flex items-center gap-2">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? "fill-[#ff5d46] text-[#ff5d46]"
                                      : "text-[#e5dfd4]"
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-base text-[#5d574b]">{review.comment}</p>
                            <p className="text-sm text-[#7d7566]">
                              {review.reviewerName} · {new Date(review.createdAt).toLocaleDateString(locale === "es" ? "es-ES" : "en-US", { month: "short", year: "numeric" })}
                            </p>
                          </div>
                        ))}
                        {professional.reviews.length > 3 && (
                          <p className="text-sm text-[#7d7566]">
                            {t("reviewsSection.moreReviews", { count: professional.reviews.length - 3 })}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-base text-[#7d7566]">
                        {t("reviewsSection.noReviews")}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </Container>

      {/* Booking Sheet */}
      <BookingSheet
        isOpen={isBookingSheetOpen}
        onClose={() => setIsBookingSheetOpen(false)}
        professionalId={professional.id}
        professionalName={professional.name}
        selectedDate={selectedDate}
        availableSlots={availableSlots}
        services={professional.services}
        defaultHourlyRate={professional.hourlyRateCop}
      />
    </div>
  );
}
