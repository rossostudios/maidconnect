import { Metadata } from "next";
import Link from "next/link";
import { Settings, UserCheck, DollarSign, CheckCircle2 } from "lucide-react";
import { ProductHeroSection } from "@/components/product/product-hero-section";
import { ProductFeatureCard } from "@/components/product/product-feature-card";
import { ProductStepsSection } from "@/components/product/product-steps-section";
import { SiteHeader } from "@/components/sections/site-header";
import { SiteFooter } from "@/components/sections/site-footer";

export const metadata: Metadata = {
  title: "Admin Dashboard - Platform Management Tools | Maidconnect",
  description:
    "Enterprise-grade admin tools for moderating professionals, reviewing bookings, processing payouts, and maintaining platform quality. Complete oversight.",
  keywords: [
    "admin dashboard",
    "platform management",
    "professional moderation",
    "payout processing",
    "booking oversight",
    "quality control",
    "enterprise tools",
  ],
  openGraph: {
    title: "Admin Dashboard - Platform Management Tools | Maidconnect",
    description:
      "Complete platform management and oversight with comprehensive admin tools for moderation, bookings, and payouts.",
    url: "https://maidconnect.co/product/admin-dashboard",
    siteName: "Maidconnect",
    images: [
      {
        url: "https://maidconnect.co/og-admin-dashboard.png",
        width: 1200,
        height: 630,
        alt: "Maidconnect Admin Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Admin Dashboard - Platform Management Tools | Maidconnect",
    description:
      "Enterprise-grade admin tools for moderating professionals and maintaining platform quality.",
    images: ["https://maidconnect.co/og-admin-dashboard.png"],
  },
  alternates: {
    canonical: "https://maidconnect.co/product/admin-dashboard",
  },
};

export default function AdminDashboardPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Maidconnect Admin Dashboard",
    applicationCategory: "BusinessApplication",
    description:
      "Comprehensive admin tools for platform management, moderation, and quality control.",
    featureList: [
      "Professional Moderation",
      "Booking Oversight",
      "Payout Processing",
      "Analytics & Reporting",
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
          headline="Complete platform management and oversight"
          description="Comprehensive admin tools for moderating professionals, reviewing bookings, processing payouts, and maintaining platform quality."
          primaryCTA={{ label: "Request Demo", href: "/contact" }}
          secondaryCTA={{ label: "Learn More", href: "#features" }}
          badge="Enterprise-grade tools"
        />

        {/* Features Section */}
        <section
          id="features"
          className="border-b border-[#ebe5d8] bg-white px-6 py-16 sm:py-20 lg:py-24"
        >
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-4xl font-semibold leading-tight text-[#211f1a] sm:text-5xl lg:text-6xl">
              Powerful admin capabilities
            </h2>

            <p className="mx-auto mt-6 max-w-3xl text-center text-lg leading-relaxed text-[#5d574b]">
              Everything you need to maintain platform quality and user safety
            </p>

            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <ProductFeatureCard
                icon={UserCheck}
                title="Professional Review Queue"
                description="Screen applications, verify documents, and approve profiles. Comprehensive vetting workflow with document verification and background checks."
              />

              <ProductFeatureCard
                icon={DollarSign}
                title="Booking & Payment Oversight"
                description="Monitor transactions, handle disputes, and process payouts. Full visibility into platform financials and transaction history."
              />

              <ProductFeatureCard
                icon={Settings}
                title="User Moderation Tools"
                description="Suspend accounts, investigate reports, and maintain safety. Advanced filtering and search for quick issue resolution."
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <ProductStepsSection
          headline="Admin workflow"
          description="Streamlined processes for platform management"
          steps={[
            {
              number: "1",
              title: "Review Applications",
              description:
                "Screen professional applications and verify submitted documents",
            },
            {
              number: "2",
              title: "Approve or Reject",
              description:
                "Make decisions based on verification criteria and quality standards",
            },
            {
              number: "3",
              title: "Monitor Activity",
              description:
                "Track bookings, handle customer support, and investigate reports",
            },
            {
              number: "4",
              title: "Process Payouts",
              description:
                "Review and approve professional payouts, maintain platform integrity",
            },
          ]}
        />

        {/* Professional Vetting Section */}
        <section className="border-b border-[#ebe5d8] bg-white px-6 py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-4xl font-semibold leading-tight text-[#211f1a] sm:text-5xl">
              Professional vetting process
            </h2>

            <div className="mt-16 grid gap-8 md:grid-cols-2">
              <div className="rounded-[28px] border border-[#ebe5d8] bg-white p-8">
                <h3 className="text-2xl font-semibold text-[#211f1a]">
                  Application Review
                </h3>
                <ul className="mt-4 space-y-3 text-base text-[#5d574b]">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#ff5d46]" />
                    <span>Review professional profile information and bio</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#ff5d46]" />
                    <span>Verify years of experience and specializations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#ff5d46]" />
                    <span>Check service areas and availability settings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#ff5d46]" />
                    <span>Review hourly rates for market appropriateness</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-[28px] border border-[#ebe5d8] bg-white p-8">
                <h3 className="text-2xl font-semibold text-[#211f1a]">
                  Document Verification
                </h3>
                <ul className="mt-4 space-y-3 text-base text-[#5d574b]">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#ff5d46]" />
                    <span>Validate government-issued ID for identity verification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#ff5d46]" />
                    <span>Review background check results and clearance status</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#ff5d46]" />
                    <span>Verify professional certifications and training documents</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#ff5d46]" />
                    <span>Check insurance and bonding documentation if applicable</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Oversight Section */}
        <section className="border-b border-[#ebe5d8] bg-white px-6 py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-4xl font-semibold leading-tight text-[#211f1a] sm:text-5xl">
              Comprehensive platform oversight
            </h2>

            <div className="mt-16 space-y-8">
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#ff5d46]">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#211f1a]">
                    Real-time booking monitoring
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-[#5d574b]">
                    View all platform bookings in real-time with status
                    filtering, search capabilities, and detailed transaction
                    information. Track booking lifecycle from creation to
                    completion.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#ff5d46]">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#211f1a]">
                    Financial transaction oversight
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-[#5d574b]">
                    Monitor payment authorizations, captures, and refunds.
                    Process professional payouts, review platform fees, and
                    maintain complete financial audit trails.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#ff5d46]">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#211f1a]">
                    User moderation and safety
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-[#5d574b]">
                    Investigate user reports, suspend or ban problematic
                    accounts, and maintain platform safety. View complete user
                    history including bookings, reviews, and communications.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#ff5d46]">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#211f1a]">
                    Analytics and reporting
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-[#5d574b]">
                    Track platform metrics including booking volume, revenue,
                    user growth, and quality indicators. Generate custom reports
                    for business intelligence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Admin Features Grid */}
        <section className="border-b border-[#ebe5d8] bg-white px-6 py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-4xl font-semibold leading-tight text-[#211f1a] sm:text-5xl">
              Complete admin toolkit
            </h2>

            <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-[#ebe5d8] bg-white p-6">
                <h4 className="font-semibold text-[#211f1a]">
                  Professional Queue
                </h4>
                <p className="mt-2 text-sm text-[#5d574b]">
                  Review pending applications with document viewers
                </p>
              </div>

              <div className="rounded-2xl border border-[#ebe5d8] bg-white p-6">
                <h4 className="font-semibold text-[#211f1a]">Booking Search</h4>
                <p className="mt-2 text-sm text-[#5d574b]">
                  Advanced filtering and search across all bookings
                </p>
              </div>

              <div className="rounded-2xl border border-[#ebe5d8] bg-white p-6">
                <h4 className="font-semibold text-[#211f1a]">Payout Processing</h4>
                <p className="mt-2 text-sm text-[#5d574b]">
                  Review and approve professional payouts
                </p>
              </div>

              <div className="rounded-2xl border border-[#ebe5d8] bg-white p-6">
                <h4 className="font-semibold text-[#211f1a]">User Management</h4>
                <p className="mt-2 text-sm text-[#5d574b]">
                  Suspend, ban, or reinstate user accounts
                </p>
              </div>

              <div className="rounded-2xl border border-[#ebe5d8] bg-white p-6">
                <h4 className="font-semibold text-[#211f1a]">Dispute Resolution</h4>
                <p className="mt-2 text-sm text-[#5d574b]">
                  Handle customer complaints and refund requests
                </p>
              </div>

              <div className="rounded-2xl border border-[#ebe5d8] bg-white p-6">
                <h4 className="font-semibold text-[#211f1a]">Analytics Dashboard</h4>
                <p className="mt-2 text-sm text-[#5d574b]">
                  Platform metrics and business intelligence
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-white px-6 py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-4xl font-semibold leading-tight text-[#211f1a] sm:text-5xl">
              See the admin dashboard in action
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#5d574b]">
              Request a demo to explore our comprehensive platform management
              tools and see how we maintain quality and safety
            </p>

            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full bg-[#ff5d46] px-8 py-4 text-base font-semibold text-white shadow-[0_6px_18px_rgba(255,93,70,0.22)] transition hover:bg-[#eb6c65]"
              >
                Request Demo
              </Link>

              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full border-2 border-[#ebe5d8] bg-white px-8 py-4 text-base font-semibold text-[#211f1a] transition hover:border-[#ff5d46] hover:text-[#ff5d46]"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
