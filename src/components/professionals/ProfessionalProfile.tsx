"use client";

import {
  CalendarSetting01Icon,
  Clock01Icon,
  Globe02Icon,
  Location01Icon,
  SecurityCheckIcon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { AvailabilityCalendar as LargeAvailabilityCalendar } from "@/components/shared/availability-calendar";
import { formatCurrency, type Currency } from "@/lib/utils/format";
import { COUNTRIES } from "@/lib/shared/config/territories";

// Dynamic import for sheet (lazy load on demand)
const BookingSheet = dynamic(
  () => import("@/components/bookings/BookingSheet").then((mod) => mod.BookingSheet),
  { ssr: false }
);

import { CompactPrice } from "@/components/pricing/price-breakdown";
import { DirectHireCard } from "@/components/professionals/direct-hire-card";
import { TrustCard } from "@/components/professionals/trust-card";
import type {
  ProfessionalBookingSummary,
  ProfessionalPortfolioImage,
  ProfessionalReviewSummary,
} from "@/components/professionals/types";
import type { VerificationData } from "@/components/professionals/verification-badges-grid";
import { Container } from "@/components/ui/container";
import { useFeatureFlag } from "@/hooks/useFeature";
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
  directHireFeeCOP?: number | null;
  verification?: VerificationData;
};

type ProfessionalProfileViewProps = {
  professional: ProfessionalProfileDetail;
  viewer: AppUser | null;
  locale: string;
  currency?: Currency; // Optional currency override (defaults to professional's country currency)
};

const DEFAULT_PRO_PHOTO =
  "https://images.unsplash.com/photo-1523800503107-5bc3ba2a6f81?auto=format&fit=crop&w=600&q=80";

export function ProfessionalProfileView({
  professional,
  viewer: _viewer,
  locale,
  currency,
}: ProfessionalProfileViewProps) {
  // Derive currency from professional's country if not provided
  const professionalCurrency: Currency = currency ||
    (professional.country && COUNTRIES[professional.country as keyof typeof COUNTRIES]?.currency) ||
    "COP";
  const t = useTranslations("pages.professionalProfile");
  const [isBookingSheetOpen, setIsBookingSheetOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableSlots] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"about" | "services" | "portfolio" | "reviews">(
    "about"
  );

  // Week 3-4 feature flag
  const showLivePriceBreakdown = useFeatureFlag("live_price_breakdown");

  const locationLabel = professional.location || "Colombia";
  const formattedRate = professional.hourlyRateCop
    ? formatCurrency(professional.hourlyRateCop, { currency: professionalCurrency })
    : null;
  const hasServices = professional.services.length > 0;
  const averageRating =
    professional.reviews.length > 0
      ? professional.reviews.reduce((sum, r) => sum + r.rating, 0) / professional.reviews.length
      : 0;

  const handleDateSelect = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
      // Note: Calendar component handles time slots internally
      setIsBookingSheetOpen(true);
    }
  };

  return (
    <div className="pb-24">
      <Container className="max-w-[1680px] pt-12">
        <Link
          className="font-semibold text-[neutral-900] text-base transition hover:text-[neutral-500]"
          href="/professionals"
        >
          {t("backToDirectory")}
        </Link>

        {/* Professional Hero Card */}
        <div className="mt-8 overflow-hidden border border-[neutral-200] bg-[neutral-50] shadow-[0_24px_60px_rgba(22,22,22,0.06)] sm:p-10 md:p-12">
          <div className="grid gap-10 p-8 md:grid-cols-[280px_1fr] xl:grid-cols-[280px_1fr_320px]">
            {/* Photo */}
            <div className="relative h-80 w-full overflow-hidden shadow-[0_10px_40px_rgba(22,22,22,0.04)] md:h-full">
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
                <h1 className="type-serif-lg text-[neutral-900] tracking-wide">
                  {professional.name}
                </h1>
                <p className="mt-2 text-[neutral-400] text-xl">
                  {professional.service ?? t("availableForBookings")}
                </p>
              </div>

              <div className="flex flex-wrap gap-6 text-[neutral-400] text-base">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon className="h-5 w-5 text-[neutral-500]" icon={Location01Icon} />
                  <span>{locationLabel}</span>
                </div>
                {formattedRate && (
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon className="h-5 w-5 text-[neutral-500]" icon={Clock01Icon} />
                    <span>
                      {formattedRate} {t("perHour")}
                    </span>
                  </div>
                )}
                {professional.languages.length > 0 && (
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon className="h-5 w-5 text-[neutral-500]" icon={Globe02Icon} />
                    <span>{professional.languages.join(" / ")}</span>
                  </div>
                )}
                {professional.experienceYears !== null && (
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon
                      className="h-5 w-5 text-[neutral-500]"
                      icon={SecurityCheckIcon}
                    />
                    <span>{t("yearsExperience", { years: professional.experienceYears })}</span>
                  </div>
                )}
                {averageRating > 0 && (
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon
                      className="h-5 w-5 fill-[neutral-500] text-[neutral-500]"
                      icon={StarIcon}
                    />
                    <span className="font-semibold">{averageRating.toFixed(1)}</span>
                    <span className="text-[neutral-400]">
                      ({t("reviewsCount", { count: professional.reviews.length })})
                    </span>
                  </div>
                )}
              </div>

              {professional.availableToday && (
                <div className="inline-flex w-fit items-center gap-2 bg-[neutral-500]/10 px-5 py-2.5 font-semibold text-[neutral-500] text-base">
                  <HugeiconsIcon className="h-5 w-5" icon={CalendarSetting01Icon} />
                  {t("availableToday")}
                </div>
              )}
            </div>

            {/* Trust Card - Visible on XL screens */}
            <div className="hidden xl:block">
              <TrustCard
                onTimeRate={95} // TODO: Get from professional data when available
                rating={averageRating}
                reviewCount={professional.reviews.length}
                verificationLevel="background-check" // TODO: Get from professional.verification_level
              />
            </div>
          </div>
        </div>

        {/* Trust Card - Visible on smaller screens */}
        <div className="mt-8 xl:hidden">
          <TrustCard
            onTimeRate={95} // TODO: Get from professional data when available
            rating={averageRating}
            reviewCount={professional.reviews.length}
            verificationLevel="background-check" // TODO: Get from professional.verification_level
          />
        </div>

        {/* Direct Hire Option - Show if enabled for this professional */}
        {professional.directHireFeeCOP && professional.directHireFeeCOP > 0 && (
          <div className="mt-8">
            <DirectHireCard
              professionalName={professional.name}
              professionalId={professional.id}
              feeCOP={professional.directHireFeeCOP}
              feeUSD={Math.round(professional.directHireFeeCOP / 4000)}
              currency={professionalCurrency}
              onRequestContact={() => {
                // TODO: Implement direct hire payment flow with Stripe Elements
                alert("Direct hire payment flow coming soon!");
              }}
            />
          </div>
        )}

        {/* Main Layout: Calendar + Info Sidebar */}
        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,_1fr)_minmax(0,_400px)] xl:grid-cols-[minmax(0,_1fr)_minmax(0,_480px)]">
          {/* Left: Large Calendar */}
          <div>
            <div className="mb-8">
              <h2 className="font-semibold text-3xl text-[neutral-900]">
                {t("bookingSection.title")}
              </h2>
              <p className="mt-2 text-[neutral-400] text-lg">{t("bookingSection.description")}</p>
            </div>
            <LargeAvailabilityCalendar
              dataSource={{
                type: "api",
                professionalId: professional.id,
              }}
              onDateSelect={handleDateSelect}
              size="large"
            />
          </div>

          {/* Right: Info Tabs */}
          <aside className="space-y-8">
            {/* Tab Navigation - Horizontally scrollable on mobile */}
            <div className="border border-[neutral-200] bg-[neutral-50] shadow-[0_10px_40px_rgba(22,22,22,0.04)]">
              <div className="overflow-x-auto">
                <div className="flex w-max border-[neutral-200] border-b md:w-full">
                  <button
                    className={`flex-shrink-0 whitespace-nowrap px-6 py-4 font-semibold text-base transition md:flex-1 ${
                      activeTab === "about"
                        ? "border-[neutral-500] border-b-2 text-[neutral-500]"
                        : "text-[neutral-400] hover:text-[neutral-500]"
                    }`}
                    onClick={() => setActiveTab("about")}
                    type="button"
                  >
                    {t("tabs.about")}
                  </button>
                  <button
                    className={`flex-shrink-0 whitespace-nowrap px-6 py-4 font-semibold text-base transition md:flex-1 ${
                      activeTab === "services"
                        ? "border-[neutral-500] border-b-2 text-[neutral-500]"
                        : "text-[neutral-400] hover:text-[neutral-500]"
                    }`}
                    onClick={() => setActiveTab("services")}
                    type="button"
                  >
                    {t("tabs.services")}
                  </button>
                  <button
                    className={`flex-shrink-0 whitespace-nowrap px-6 py-4 font-semibold text-base transition md:flex-1 ${
                      activeTab === "portfolio"
                        ? "border-[neutral-500] border-b-2 text-[neutral-500]"
                        : "text-[neutral-400] hover:text-[neutral-500]"
                    }`}
                    onClick={() => setActiveTab("portfolio")}
                    type="button"
                  >
                    {t("tabs.portfolio")}
                  </button>
                  <button
                    className={`flex-shrink-0 whitespace-nowrap px-6 py-4 font-semibold text-base transition md:flex-1 ${
                      activeTab === "reviews"
                        ? "border-[neutral-500] border-b-2 text-[neutral-500]"
                        : "text-[neutral-400] hover:text-[neutral-500]"
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
                    <h3 className="font-semibold text-2xl text-[neutral-900]">{t("tabs.about")}</h3>
                    <p className="text-[neutral-400] text-base leading-relaxed">
                      {professional.bio ?? t("aboutSection.noBio")}
                    </p>
                  </div>
                )}

                {activeTab === "services" && (
                  <div className="space-y-6">
                    <h3 className="font-semibold text-2xl text-[neutral-900]">
                      {t("servicesSection.title")}
                    </h3>
                    <div className="space-y-4">
                      {hasServices ? (
                        professional.services.map((service) => (
                          <div
                            className="border border-[neutral-50] bg-[neutral-50] p-5"
                            key={`${service.name ?? "service"}-${service.description ?? "detail"}`}
                          >
                            <div className="flex flex-col gap-2">
                              <div className="font-semibold text-[neutral-900] text-base">
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
                                  <div className="font-semibold text-[neutral-500] text-lg">
                                    {formatCurrency(service.hourlyRateCop, { currency: professionalCurrency })}
                                  </div>
                                )
                              ) : (
                                <div className="font-semibold text-[neutral-500] text-lg">
                                  {t("servicesSection.rateOnRequest")}
                                </div>
                              )}
                            </div>
                            {service.description && (
                              <p className="mt-2 text-[neutral-400] text-base">
                                {service.description}
                              </p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-[neutral-400] text-base">
                          {t("servicesSection.noServices")}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "portfolio" && (
                  <div className="space-y-6">
                    <h3 className="font-semibold text-2xl text-[neutral-900]">
                      {t("tabs.portfolio")}
                    </h3>
                    {professional.portfolioImages.length > 0 ? (
                      <div className="grid grid-cols-2 gap-4">
                        {professional.portfolioImages.slice(0, 6).map((image, index) => (
                          <div className="relative aspect-square overflow-hidden" key={index}>
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
                      <p className="text-[neutral-400] text-base">
                        {t("portfolioSection.noImages")}
                      </p>
                    )}
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div className="space-y-6">
                    <h3 className="font-semibold text-2xl text-[neutral-900]">
                      {t("tabs.reviews")}
                    </h3>
                    {professional.reviews.length > 0 ? (
                      <div className="space-y-6">
                        {professional.reviews.slice(0, 3).map((review) => (
                          <div
                            className="space-y-3 border-[neutral-200] border-b pb-6 last:border-b-0 last:pb-0"
                            key={review.id}
                          >
                            <div className="flex items-center gap-2">
                              {[...new Array(5)].map((_, i) => (
                                <HugeiconsIcon
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? "fill-[neutral-500] text-[neutral-500]"
                                      : "text-[neutral-200]"
                                  }`}
                                  icon={StarIcon}
                                  key={i}
                                />
                              ))}
                            </div>
                            <p className="text-[neutral-400] text-base">{review.comment}</p>
                            <p className="text-[neutral-400] text-sm">
                              {review.reviewerName} ·{" "}
                              {new Date(review.createdAt).toLocaleDateString(
                                locale === "es" ? "es-ES" : "en-US",
                                { month: "short", year: "numeric" }
                              )}
                            </p>
                          </div>
                        ))}
                        {professional.reviews.length > 3 && (
                          <p className="text-[neutral-400] text-sm">
                            {t("reviewsSection.moreReviews", {
                              count: professional.reviews.length - 3,
                            })}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-[neutral-400] text-base">
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
