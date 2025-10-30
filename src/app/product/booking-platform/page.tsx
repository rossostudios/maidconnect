import { Metadata } from "next";
import Link from "next/link";
import { Calendar, Zap, Clock, CheckCircle2 } from "lucide-react";
import { ProductHeroSection } from "@/components/product/product-hero-section";
import { ProductFeatureCard } from "@/components/product/product-feature-card";
import { ProductStepsSection } from "@/components/product/product-steps-section";
import { SiteHeader } from "@/components/sections/site-header";
import { SiteFooter } from "@/components/sections/site-footer";

export const metadata: Metadata = {
  title: "Booking Platform - Instant Service Scheduling | Maidconnect",
  description:
    "Schedule services with instant booking or request approval. Real-time availability and smart filtering make finding the right match effortless. 500+ bookings monthly.",
  keywords: [
    "booking platform",
    "service scheduling",
    "instant booking",
    "professional booking system",
    "real-time availability",
    "domestic services Colombia",
    "home services booking",
  ],
  openGraph: {
    title: "Booking Platform - Instant Service Scheduling | Maidconnect",
    description:
      "Book trusted professionals in minutes with instant booking, real-time availability, and smart scheduling. 500+ bookings monthly.",
    url: "https://maidconnect.co/product/booking-platform",
    siteName: "Maidconnect",
    images: [
      {
        url: "https://maidconnect.co/og-booking-platform.png",
        width: 1200,
        height: 630,
        alt: "Maidconnect Booking Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Booking Platform - Instant Service Scheduling | Maidconnect",
    description:
      "Book trusted professionals in minutes with instant booking, real-time availability, and smart scheduling.",
    images: ["https://maidconnect.co/og-booking-platform.png"],
  },
  alternates: {
    canonical: "https://maidconnect.co/product/booking-platform",
  },
};

export default function BookingPlatformPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Maidconnect Booking Platform",
    applicationCategory: "BusinessApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Book trusted professionals in minutes with instant booking, real-time availability, and smart scheduling.",
    featureList: [
      "Instant & Approved Booking",
      "Real-Time Availability",
      "Smart Scheduling",
      "Recurring Bookings",
    ],
    operatingSystem: "Web",
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />
      <main>
      {/* Hero Section */}
      <ProductHeroSection
        headline="Book trusted professionals in minutes"
        description="Schedule services with instant booking or request approval. Real-time availability and smart filtering make finding the right match effortless."
        primaryCTA={{ label: "Browse Professionals", href: "/professionals" }}
        secondaryCTA={{ label: "Learn More", href: "#features" }}
        badge="500+ bookings this month"
      />

      {/* Features Section */}
      <section
        id="features"
        className="border-b border-[#ebe5d8] bg-white px-6 py-16 sm:py-20 lg:py-24"
      >
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-4xl font-semibold leading-tight text-[#211f1a] sm:text-5xl lg:text-6xl">
            Powerful booking features
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-center text-lg leading-relaxed text-[#5d574b]">
            Everything you need to schedule services quickly and confidently
          </p>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <ProductFeatureCard
              icon={Zap}
              title="Instant & Approved Booking"
              description="Book immediately with verified professionals or request approval for custom needs. Get instant confirmation for standard services."
            />

            <ProductFeatureCard
              icon={Calendar}
              title="Real-Time Availability"
              description="See professional calendars and available time slots before booking. Never waste time requesting unavailable dates."
            />

            <ProductFeatureCard
              icon={Clock}
              title="Smart Scheduling"
              description="Set up recurring bookings, sync with your calendar, and receive automated reminders before every service."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <ProductStepsSection
        headline="How it works"
        description="Four simple steps to book your perfect professional"
        steps={[
          {
            number: "1",
            title: "Filter & Search",
            description:
              "Filter by service type, date, location, and professional ratings",
          },
          {
            number: "2",
            title: "Select Professional",
            description:
              "View availability, read reviews, and browse portfolio galleries",
          },
          {
            number: "3",
            title: "Confirm Booking",
            description:
              "Choose date and time, add service add-ons, and authorize payment",
          },
          {
            number: "4",
            title: "Get Reminders",
            description:
              "Receive automatic reminders and communicate via secure messaging",
          },
        ]}
      />

      {/* Benefits Section */}
      <section className="border-b border-[#ebe5d8] bg-white px-6 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-4xl font-semibold leading-tight text-[#211f1a] sm:text-5xl">
            Why customers love our booking system
          </h2>

          <div className="mt-16 space-y-8">
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#ff5d46]">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#211f1a]">
                  No more phone tag
                </h3>
                <p className="mt-2 text-base leading-relaxed text-[#5d574b]">
                  See real-time availability and book instantly without endless
                  back-and-forth calls or emails.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#ff5d46]">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#211f1a]">
                  Transparent pricing
                </h3>
                <p className="mt-2 text-base leading-relaxed text-[#5d574b]">
                  Know exactly what you'll pay before booking. See hourly
                  rates, add-on costs, and total price upfront.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#ff5d46]">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#211f1a]">
                  Flexible scheduling
                </h3>
                <p className="mt-2 text-base leading-relaxed text-[#5d574b]">
                  Book one-time services or set up weekly, biweekly, or monthly
                  recurring appointments with automatic discounts.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#ff5d46]">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#211f1a]">
                  Easy rescheduling
                </h3>
                <p className="mt-2 text-base leading-relaxed text-[#5d574b]">
                  Life happens. Reschedule or cancel bookings with just a few
                  clicks, subject to professional's cancellation policy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white px-6 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-semibold leading-tight text-[#211f1a] sm:text-5xl">
            Ready to book your first service?
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#5d574b]">
            Join hundreds of satisfied customers who trust MaidConnect for
            their home service needs
          </p>

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/professionals"
              className="inline-flex items-center justify-center rounded-full bg-[#ff5d46] px-8 py-4 text-base font-semibold text-white shadow-[0_6px_18px_rgba(255,93,70,0.22)] transition hover:bg-[#eb6c65]"
            >
              Browse Professionals
            </Link>

            <Link
              href="/auth/sign-up"
              className="inline-flex items-center justify-center rounded-full border-2 border-[#ebe5d8] bg-white px-8 py-4 text-base font-semibold text-[#211f1a] transition hover:border-[#ff5d46] hover:text-[#ff5d46]"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </section>
      </main>
      <SiteFooter />
    </div>
  );
}
