import { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Star, Image, Award, CheckCircle2 } from "lucide-react";
import { ProductHeroSection } from "@/components/product/product-hero-section";
import { ProductFeatureCard } from "@/components/product/product-feature-card";
import { ProductStepsSection } from "@/components/product/product-steps-section";
import { SiteHeader } from "@/components/sections/site-header";
import { SiteFooter } from "@/components/sections/site-footer";

export const metadata: Metadata = {
  title: "Professional Profiles - MaidConnect",
  description:
    "Every profile includes background checks, verified credentials, customer reviews, and portfolio galleries showcasing their work.",
};

export default function ProfessionalProfilesPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <SiteHeader />
      <main>
      {/* Hero Section */}
      <ProductHeroSection
        headline="Meet verified professionals you can trust"
        description="Every profile includes background checks, verified credentials, customer reviews, and portfolio galleries showcasing their work."
        primaryCTA={{ label: "View Professionals", href: "/professionals" }}
        secondaryCTA={{ label: "Learn More", href: "#features" }}
        badge="100% verified professionals"
      />

      {/* Features Section */}
      <section
        id="features"
        className="border-b border-[#ebe5d8] bg-white px-6 py-16 sm:py-20 lg:py-24"
      >
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-4xl font-semibold leading-tight text-[#211f1a] sm:text-5xl lg:text-6xl">
            Trust built into every profile
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-center text-lg leading-relaxed text-[#5d574b]">
            We verify every detail so you can book with complete confidence
          </p>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <ProductFeatureCard
              icon={ShieldCheck}
              title="Verified Credentials"
              description="Background checks, identity verification, and certification validation ensure every professional meets our high standards."
            />

            <ProductFeatureCard
              icon={Star}
              title="Customer Reviews & Ratings"
              description="Real feedback from verified bookings with detailed ratings on quality, communication, punctuality, and value."
            />

            <ProductFeatureCard
              icon={Image}
              title="Portfolio Galleries"
              description="Before/after photos and work samples from past projects showcase the quality you can expect."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <ProductStepsSection
        headline="How we verify professionals"
        description="Our rigorous vetting process ensures quality and safety"
        steps={[
          {
            number: "1",
            title: "Application Review",
            description:
              "We review every application for experience, qualifications, and professionalism",
          },
          {
            number: "2",
            title: "Document Verification",
            description:
              "Background checks, ID verification, and certification validation",
          },
          {
            number: "3",
            title: "Portfolio Assessment",
            description:
              "Review work samples and past projects to ensure quality standards",
          },
          {
            number: "4",
            title: "Ongoing Monitoring",
            description:
              "Continuous review of ratings, feedback, and service quality",
          },
        ]}
      />

      {/* Profile Features Section */}
      <section className="border-b border-[#ebe5d8] bg-white px-6 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-4xl font-semibold leading-tight text-[#211f1a] sm:text-5xl">
            What you'll find in every profile
          </h2>

          <div className="mt-16 grid gap-8 md:grid-cols-2">
            <div className="rounded-[28px] border border-[#ebe5d8] bg-white p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ff5d46]/10">
                <Award className="h-6 w-6 text-[#ff5d46]" />
              </div>
              <h3 className="mt-6 text-2xl font-semibold text-[#211f1a]">
                Professional Information
              </h3>
              <ul className="mt-4 space-y-3 text-base text-[#5d574b]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#ff5d46]" />
                  <span>Years of experience and specializations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#ff5d46]" />
                  <span>Certifications and training completed</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#ff5d46]" />
                  <span>Services offered and hourly rates</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#ff5d46]" />
                  <span>Service areas and availability</span>
                </li>
              </ul>
            </div>

            <div className="rounded-[28px] border border-[#ebe5d8] bg-white p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ff5d46]/10">
                <Star className="h-6 w-6 text-[#ff5d46]" />
              </div>
              <h3 className="mt-6 text-2xl font-semibold text-[#211f1a]">
                Social Proof
              </h3>
              <ul className="mt-4 space-y-3 text-base text-[#5d574b]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#ff5d46]" />
                  <span>Overall rating from verified bookings</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#ff5d46]" />
                  <span>Detailed reviews from past customers</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#ff5d46]" />
                  <span>Portfolio gallery with before/after photos</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#ff5d46]" />
                  <span>Total bookings and repeat customer rate</span>
                </li>
              </ul>
            </div>

            <div className="rounded-[28px] border border-[#ebe5d8] bg-white p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ff5d46]/10">
                <ShieldCheck className="h-6 w-6 text-[#ff5d46]" />
              </div>
              <h3 className="mt-6 text-2xl font-semibold text-[#211f1a]">
                Safety & Trust
              </h3>
              <ul className="mt-4 space-y-3 text-base text-[#5d574b]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#ff5d46]" />
                  <span>Background check status and date</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#ff5d46]" />
                  <span>Identity verification badge</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#ff5d46]" />
                  <span>Insurance and bonding information</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#ff5d46]" />
                  <span>Platform-verified reviews only</span>
                </li>
              </ul>
            </div>

            <div className="rounded-[28px] border border-[#ebe5d8] bg-white p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ff5d46]/10">
                <Image className="h-6 w-6 text-[#ff5d46]" />
              </div>
              <h3 className="mt-6 text-2xl font-semibold text-[#211f1a]">
                Work Examples
              </h3>
              <ul className="mt-4 space-y-3 text-base text-[#5d574b]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#ff5d46]" />
                  <span>Portfolio gallery with real project photos</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#ff5d46]" />
                  <span>Before and after transformations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#ff5d46]" />
                  <span>Service-specific examples and results</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#ff5d46]" />
                  <span>Professional bio and service approach</span>
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
            Find your perfect professional match
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#5d574b]">
            Browse verified profiles, read authentic reviews, and book with
            confidence knowing every professional has been thoroughly vetted
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
              Become a Professional
            </Link>
          </div>
        </div>
      </section>
      </main>
      <SiteFooter />
    </div>
  );
}
