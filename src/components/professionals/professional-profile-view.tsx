"use client";

import dynamic from "next/dynamic";
import { CalendarDays, Clock, Globe2, MapPin, ShieldCheck, Star } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { LargeAvailabilityCalendar } from "@/components/bookings/large-availability-calendar";

// Dynamic import for sheet (lazy load on demand)
const BookingSheet = dynamic(
  () => import("@/components/bookings/booking-sheet").then((mod) => mod.BookingSheet),
  { ssr: false }
);
import { CompactPrice } from "@/components/pricing/price-breakdown";
import type {
  ProfessionalBookingSummary,
  ProfessionalPortfolioImage,
  ProfessionalReviewSummary,
} from "@/components/professionals/types";
import { Container } from "@/components/ui/container";
import { useFeatureFlag } from "@/hooks/use-feature-flag";
import { Link } from "@/i18n/routing";
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

function formatCOPWithFallback(value: number | null | undefined) {
  if (!value || Number.isNaN(value)) {
    return null;
  }
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function ProfessionalProfileView({
  professional,
  viewer: _viewer,
  locale,
}: ProfessionalProfileViewProps) {
  const t = useTranslations("pages.professionalProfile");
  const [isBookingSheetOpen, setIsBookingSheetOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"about" | "services" | "portfolio" | "reviews">(
    "about"
  );

  // Week 3-4 feature flag
  const showLivePriceBreakdown = useFeatureFlag("live_price_breakdown");

  const locationLabel = professional.location || "Colombia";
  const formattedRate = formatCOPWithFallback(professional.hourlyRateCop);
  const hasServices = professional.services.length > 0;
  const averageRating =
    professional.reviews.length > 0
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
          className="font-semibold text-[#5a5549] text-base transition hover:text-[#8B7355]"
          href="/professionals"
        >
          {t("backToDirectory")}
        </Link>

        {/* Professional Hero Card */}
        <div className="mt-8 overflow-hidden rounded-[36px] border border-[#ebe5d8] bg-white shadow-[var(--shadow-elevated)] sm:p-10 md:p-12">
          <div className="grid gap-10 p-8 md:grid-cols-[280px_1fr] lg:grid-cols-[340px_1fr]">
            {/* Photo */}
            <div className="relative h-80 w-full overflow-hidden rounded-3xl shadow-[var(--shadow-card)] md:h-full">
              <Image
                alt={professional.name}
                className="object-cover"
                fill
                src={professional.photoUrl ?? DEFAULT_PRO_PHOTO}
              />
            </div>

            {/* Info */}
            <div className="flex flex-col justify-center space-y-8">
              <div>
                <h1 className="font-[family-name:var(--font-cinzel)] text-5xl text-[#211f1a] leading-tight tracking-wide lg:text-6xl">
                  {professional.name}
                </h1>
                <p className="mt-2 text-[#7d7566] text-xl">
                  {professional.service ?? t("availableForBookings")}
                </p>
              </div>

              <div className="flex flex-wrap gap-6 text-[#5d574b] text-base">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#8B7355]" />
                  <span>{locationLabel}</span>
                </div>
                {formattedRate && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-[#8B7355]" />
                    <span>
                      {formattedRate} {t("perHour")}
                    </span>
                  </div>
                )}
                {professional.languages.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Globe2 className="h-5 w-5 text-[#8B7355]" />
                    <span>{professional.languages.join(" / ")}</span>
                  </div>
                )}
                {professional.experienceYears !== null && (
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-[#8B7355]" />
                    <span>{t("yearsExperience", { years: professional.experienceYears })}</span>
                  </div>
                )}
                {averageRating > 0 && (
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-[#8B7355] text-[#8B7355]" />
                    <span className="font-semibold">{averageRating.toFixed(1)}</span>
                    <span className="text-[#7d7566]">
                      ({t("reviewsCount", { count: professional.reviews.length })})
                    </span>
                  </div>
                )}
              </div>

              {professional.availableToday && (
                <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#8B7355]/10 px-5 py-2.5 font-semibold text-[#8B7355] text-base">
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
              <h2 className="font-semibold text-3xl text-[#211f1a]">{t("bookingSection.title")}</h2>
              <p className="mt-2 text-[#7d7566] text-lg">{t("bookingSection.description")}</p>
            </div>
            <LargeAvailabilityCalendar
              onDateSelect={handleDateSelect}
              professionalId={professional.id}
            />
          </div>

          {/* Right: Info Tabs */}
          <aside className="space-y-8">
            {/* Tab Navigation - Horizontally scrollable on mobile */}
            <div className="rounded-[32px] border border-[#ebe5d8] bg-white shadow-[var(--shadow-card)]">
              <div className="overflow-x-auto">
                <div className="flex w-max border-[#ebe5d8] border-b md:w-full">
                  <button
                    className={`flex-shrink-0 whitespace-nowrap px-6 py-4 font-semibold text-base transition md:flex-1 ${
                      activeTab === "about"
                        ? "border-[#8B7355] border-b-2 text-[#8B7355]"
                        : "text-[#7d7566] hover:text-[#8B7355]"
                    }`}
                    onClick={() => setActiveTab("about")}
                    type="button"
                  >
                    {t("tabs.about")}
                  </button>
                  <button
                    className={`flex-shrink-0 whitespace-nowrap px-6 py-4 font-semibold text-base transition md:flex-1 ${
                      activeTab === "services"
                        ? "border-[#8B7355] border-b-2 text-[#8B7355]"
                        : "text-[#7d7566] hover:text-[#8B7355]"
                    }`}
                    onClick={() => setActiveTab("services")}
                    type="button"
                  >
                    {t("tabs.services")}
                  </button>
                  <button
                    className={`flex-shrink-0 whitespace-nowrap px-6 py-4 font-semibold text-base transition md:flex-1 ${
                      activeTab === "portfolio"
                        ? "border-[#8B7355] border-b-2 text-[#8B7355]"
                        : "text-[#7d7566] hover:text-[#8B7355]"
                    }`}
                    onClick={() => setActiveTab("portfolio")}
                    type="button"
                  >
                    {t("tabs.portfolio")}
                  </button>
                  <button
                    className={`flex-shrink-0 whitespace-nowrap px-6 py-4 font-semibold text-base transition md:flex-1 ${
                      activeTab === "reviews"
                        ? "border-[#8B7355] border-b-2 text-[#8B7355]"
                        : "text-[#7d7566] hover:text-[#8B7355]"
                    }`}
                    onClick={() => setActiveTab("reviews")}
                    type="button"
                  >
                    {t("tabs.reviews")}
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-8">
                {activeTab === "about" && (
                  <div className="space-y-6">
                    <h3 className="font-semibold text-2xl text-[#211f1a]">{t("tabs.about")}</h3>
                    <p className="text-[#5d574b] text-base leading-relaxed">
                      {professional.bio ?? t("aboutSection.noBio")}
                    </p>
                  </div>
                )}

                {activeTab === "services" && (
                  <div className="space-y-6">
                    <h3 className="font-semibold text-2xl text-[#211f1a]">
                      {t("servicesSection.title")}
                    </h3>
                    <div className="space-y-4">
                      {hasServices ? (
                        professional.services.map((service) => (
                          <div
                            className="rounded-2xl border border-[#f0ece4] bg-[#fbfafa] p-5"
                            key={`${service.name ?? "service"}-${service.description ?? "detail"}`}
                          >
                            <div className="flex flex-col gap-2">
                              <div className="font-semibold text-[#211f1a] text-base">
                                {service.name ?? t("servicesSection.serviceFallback")}
                              </div>
                              {service.hourlyRateCop ? (
                                showLivePriceBreakdown ? (
                                  <CompactPrice
                                    className="text-lg"
                                    hourlyRate={service.hourlyRateCop}
                                    showBreakdown={true}
                                  />
                                ) : (
                                  <div className="font-semibold text-[#8B7355] text-lg">
                                    {formatCOPWithFallback(service.hourlyRateCop)}
                                  </div>
                                )
                              ) : (
                                <div className="font-semibold text-[#8B7355] text-lg">
                                  {t("servicesSection.rateOnRequest")}
                                </div>
                              )}
                            </div>
                            {service.description && (
                              <p className="mt-2 text-[#7d7566] text-base">{service.description}</p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-[#7d7566] text-base">
                          {t("servicesSection.noServices")}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "portfolio" && (
                  <div className="space-y-6">
                    <h3 className="font-semibold text-2xl text-[#211f1a]">{t("tabs.portfolio")}</h3>
                    {professional.portfolioImages.length > 0 ? (
                      <div className="grid grid-cols-2 gap-4">
                        {professional.portfolioImages.slice(0, 6).map((image, index) => (
                          <div
                            className="relative aspect-square overflow-hidden rounded-2xl"
                            key={index}
                          >
                            <Image
                              alt={image.caption || t("portfolioSection.imageAlt")}
                              className="object-cover"
                              fill
                              src={image.url}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[#7d7566] text-base">{t("portfolioSection.noImages")}</p>
                    )}
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div className="space-y-6">
                    <h3 className="font-semibold text-2xl text-[#211f1a]">{t("tabs.reviews")}</h3>
                    {professional.reviews.length > 0 ? (
                      <div className="space-y-6">
                        {professional.reviews.slice(0, 3).map((review) => (
                          <div
                            className="space-y-3 border-[#ebe5d8] border-b pb-6 last:border-b-0 last:pb-0"
                            key={review.id}
                          >
                            <div className="flex items-center gap-2">
                              {[...new Array(5)].map((_, i) => (
                                <Star
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? "fill-[#8B7355] text-[#8B7355]"
                                      : "text-[#e5dfd4]"
                                  }`}
                                  key={i}
                                />
                              ))}
                            </div>
                            <p className="text-[#5d574b] text-base">{review.comment}</p>
                            <p className="text-[#7d7566] text-sm">
                              {review.reviewerName} ·{" "}
                              {new Date(review.createdAt).toLocaleDateString(
                                locale === "es" ? "es-ES" : "en-US",
                                { month: "short", year: "numeric" }
                              )}
                            </p>
                          </div>
                        ))}
                        {professional.reviews.length > 3 && (
                          <p className="text-[#7d7566] text-sm">
                            {t("reviewsSection.moreReviews", {
                              count: professional.reviews.length - 3,
                            })}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-[#7d7566] text-base">{t("reviewsSection.noReviews")}</p>
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
        availableSlots={availableSlots}
        defaultHourlyRate={professional.hourlyRateCop}
        isOpen={isBookingSheetOpen}
        onClose={() => setIsBookingSheetOpen(false)}
        professionalId={professional.id}
        professionalName={professional.name}
        selectedDate={selectedDate}
        services={professional.services}
      />
    </div>
  );
}
