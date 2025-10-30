import { Metadata } from "next";
import Link from "next/link";
import { MessageCircle, Shield, FileImage, CheckCircle2 } from "lucide-react";
import { ProductHeroSection } from "@/components/product/product-hero-section";
import { ProductFeatureCard } from "@/components/product/product-feature-card";
import { ProductStepsSection } from "@/components/product/product-steps-section";
import { SiteHeader } from "@/components/sections/site-header";
import { SiteFooter } from "@/components/sections/site-footer";

export const metadata: Metadata = {
  title: "Secure Messaging Platform - Direct Communication | Maidconnect",
  description:
    "Direct messaging unlocked after booking. Coordinate details, send photos, and stay connected throughout your service relationship. Booking-based security.",
  keywords: [
    "secure messaging",
    "direct communication",
    "photo sharing",
    "service coordination",
    "booking communication",
    "professional messaging",
    "customer support",
  ],
  openGraph: {
    title: "Secure Messaging Platform - Direct Communication | Maidconnect",
    description:
      "Communicate securely with your professionals. Direct messaging unlocked after booking with photo sharing and real-time updates.",
    url: "https://maidconnect.co/product/secure-messaging",
    siteName: "Maidconnect",
    images: [
      {
        url: "https://maidconnect.co/og-secure-messaging.png",
        width: 1200,
        height: 630,
        alt: "Maidconnect Secure Messaging",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Secure Messaging Platform - Direct Communication | Maidconnect",
    description:
      "Direct messaging unlocked after booking. Coordinate details, send photos, and stay connected.",
    images: ["https://maidconnect.co/og-secure-messaging.png"],
  },
  alternates: {
    canonical: "https://maidconnect.co/product/secure-messaging",
  },
};

export default function SecureMessagingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Maidconnect Secure Messaging",
    applicationCategory: "CommunicationApplication",
    description:
      "Direct messaging platform for coordinating service details with booking-based security.",
    featureList: [
      "Booking-Based Access",
      "Photo Sharing",
      "Real-Time Messaging",
      "Message History",
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
          headline="Communicate securely with your professionals"
          description="Direct messaging unlocked after booking. Coordinate details, send photos, and stay connected throughout your service relationship."
          primaryCTA={{ label: "Book a Service", href: "/professionals" }}
          secondaryCTA={{ label: "Learn More", href: "#features" }}
          badge="Booking-based security"
        />

        {/* Features Section */}
        <section
          id="features"
          className="border-b border-[#ebe5d8] bg-white px-6 py-16 sm:py-20 lg:py-24"
        >
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-4xl font-semibold leading-tight text-[#211f1a] sm:text-5xl lg:text-6xl">
              Safe, convenient communication
            </h2>

            <p className="mx-auto mt-6 max-w-3xl text-center text-lg leading-relaxed text-[#5d574b]">
              Built-in messaging that protects your privacy while enabling
              seamless coordination
            </p>

            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <ProductFeatureCard
                icon={Shield}
                title="Booking-Based Access"
                description="Messaging available only for confirmed bookings, ensuring safety and preventing spam. Your contact information stays private."
              />

              <ProductFeatureCard
                icon={MessageCircle}
                title="Real-Time Conversations"
                description="Instant message delivery with read receipts and notifications. Stay connected from booking confirmation to service completion."
              />

              <ProductFeatureCard
                icon={FileImage}
                title="Photo & File Sharing"
                description="Share instructions, references, and updates easily. Send photos of areas that need attention or special requests."
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <ProductStepsSection
          headline="How it works"
          description="Simple, secure messaging tied to your bookings"
          steps={[
            {
              number: "1",
              title: "Complete Booking",
              description:
                "Book a service with any professional to unlock messaging access",
            },
            {
              number: "2",
              title: "Access Chat",
              description:
                "Find the conversation thread in your dashboard messages section",
            },
            {
              number: "3",
              title: "Coordinate Details",
              description:
                "Discuss service details, timing, special requests, or access instructions",
            },
            {
              number: "4",
              title: "Stay Connected",
              description:
                "Keep communication history for reference throughout your service relationship",
            },
          ]}
        />

        {/* Benefits Section */}
        <section className="border-b border-[#ebe5d8] bg-white px-6 py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-4xl font-semibold leading-tight text-[#211f1a] sm:text-5xl">
              Why our messaging system is different
            </h2>

            <div className="mt-16 space-y-8">
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#ff5d46]">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#211f1a]">
                    Privacy protected
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-[#5d574b]">
                    Your phone number and email stay private. All communication
                    happens through the platform with full message history for
                    safety.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#ff5d46]">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#211f1a]">
                    No spam or solicitation
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-[#5d574b]">
                    Only confirmed bookings unlock messaging. Professionals
                    can't contact you without a booking, eliminating unwanted
                    messages.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#ff5d46]">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#211f1a]">
                    Message history & receipts
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-[#5d574b]">
                    All messages are saved and tied to the booking. Perfect for
                    referencing past conversations and instructions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#ff5d46]">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#211f1a]">
                    Real-time notifications
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-[#5d574b]">
                    Get notified instantly when professionals respond. Never
                    miss important updates about your booking.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="border-b border-[#ebe5d8] bg-white px-6 py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-4xl font-semibold leading-tight text-[#211f1a] sm:text-5xl">
              Common messaging scenarios
            </h2>

            <div className="mt-16 grid gap-8 md:grid-cols-2">
              <div className="rounded-[28px] border border-[#ebe5d8] bg-white p-8">
                <h3 className="text-2xl font-semibold text-[#211f1a]">
                  Before the service
                </h3>
                <ul className="mt-4 space-y-3 text-base text-[#5d574b]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#ff5d46]">•</span>
                    <span>Share building access codes and parking instructions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#ff5d46]">•</span>
                    <span>Send photos of areas needing special attention</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#ff5d46]">•</span>
                    <span>Confirm arrival time and any last-minute changes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#ff5d46]">•</span>
                    <span>Discuss specific cleaning products or preferences</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-[28px] border border-[#ebe5d8] bg-white p-8">
                <h3 className="text-2xl font-semibold text-[#211f1a]">
                  During the service
                </h3>
                <ul className="mt-4 space-y-3 text-base text-[#5d574b]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#ff5d46]">•</span>
                    <span>Get updates on service progress and completion</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#ff5d46]">•</span>
                    <span>Answer questions about specific areas or items</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#ff5d46]">•</span>
                    <span>Receive before/after photos of completed work</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#ff5d46]">•</span>
                    <span>Address any issues or requests in real-time</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-white px-6 py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-4xl font-semibold leading-tight text-[#211f1a] sm:text-5xl">
              Ready to experience seamless communication?
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#5d574b]">
              Book your first service and unlock secure messaging with verified
              professionals
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
