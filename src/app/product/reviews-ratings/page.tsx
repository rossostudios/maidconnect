import { Metadata } from "next";
import Link from "next/link";
import { Star, Users, BarChart3, CheckCircle2 } from "lucide-react";
import { ProductHeroSection } from "@/components/product/product-hero-section";
import { ProductFeatureCard } from "@/components/product/product-feature-card";
import { ProductStepsSection } from "@/components/product/product-steps-section";
import { SiteHeader } from "@/components/sections/site-header";
import { SiteFooter } from "@/components/sections/site-footer";

export const metadata: Metadata = {
  title: "Reviews & Ratings - MaidConnect",
  description:
    "Two-way reviews ensure accountability. Rate professionals after every service and build your own reputation as a reliable customer.",
};

export default function ReviewsRatingsPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <SiteHeader />
      <main>
        {/* Hero Section */}
        <ProductHeroSection
          headline="Community-driven trust and quality"
          description="Two-way reviews ensure accountability. Rate professionals after every service and build your own reputation as a reliable customer."
          primaryCTA={{ label: "Read Reviews", href: "/professionals" }}
          secondaryCTA={{ label: "Learn More", href: "#features" }}
          badge="Verified reviews only"
        />

        {/* Features Section */}
        <section
          id="features"
          className="border-b border-[#ebe5d8] bg-white px-6 py-16 sm:py-20 lg:py-24"
        >
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-4xl font-semibold leading-tight text-[#211f1a] sm:text-5xl lg:text-6xl">
              Authentic feedback that matters
            </h2>

            <p className="mx-auto mt-6 max-w-3xl text-center text-lg leading-relaxed text-[#5d574b]">
              Only real bookings, real experiences, and real accountability
            </p>

            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <ProductFeatureCard
                icon={Star}
                title="Verified Booking Reviews"
                description="Only customers who completed bookings can leave reviews. Every review is tied to a real service, ensuring authenticity."
              />

              <ProductFeatureCard
                icon={Users}
                title="Two-Way Accountability"
                description="Professionals rate customers too, building mutual trust and respect. Great customers get better service and priority booking."
              />

              <ProductFeatureCard
                icon={BarChart3}
                title="Detailed Rating Categories"
                description="Rate quality, communication, punctuality, and value separately. Get the full picture beyond a single star rating."
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <ProductStepsSection
          headline="How reviews work"
          description="Simple, fair, and transparent for everyone"
          steps={[
            {
              number: "1",
              title: "Complete Service",
              description:
                "Finish a booking and ensure all check-in/check-out steps are done",
            },
            {
              number: "2",
              title: "Receive Prompt",
              description:
                "Get a review request within 48 hours of service completion",
            },
            {
              number: "3",
              title: "Rate Experience",
              description:
                "Rate across multiple categories with detailed feedback options",
            },
            {
              number: "4",
              title: "Build Reputation",
              description:
                "Your review helps others and builds your customer reputation score",
            },
          ]}
        />

        {/* Rating Categories Section */}
        <section className="border-b border-[#ebe5d8] bg-white px-6 py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-4xl font-semibold leading-tight text-[#211f1a] sm:text-5xl">
              What gets rated
            </h2>

            <div className="mt-16 grid gap-8 md:grid-cols-2">
              <div className="rounded-[28px] border border-[#ebe5d8] bg-white p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ff5d46]/10">
                  <Star className="h-6 w-6 text-[#ff5d46]" />
                </div>
                <h3 className="mt-6 text-2xl font-semibold text-[#211f1a]">
                  For Professionals
                </h3>
                <ul className="mt-4 space-y-3 text-base text-[#5d574b]">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#ff5d46]" />
                    <span>
                      <strong>Service Quality:</strong> Thoroughness, attention
                      to detail, results
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#ff5d46]" />
                    <span>
                      <strong>Communication:</strong> Responsiveness, clarity,
                      professionalism
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#ff5d46]" />
                    <span>
                      <strong>Punctuality:</strong> On-time arrival, schedule
                      adherence
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#ff5d46]" />
                    <span>
                      <strong>Value:</strong> Fair pricing, worth the cost
                    </span>
                  </li>
                </ul>
              </div>

              <div className="rounded-[28px] border border-[#ebe5d8] bg-white p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ff5d46]/10">
                  <Users className="h-6 w-6 text-[#ff5d46]" />
                </div>
                <h3 className="mt-6 text-2xl font-semibold text-[#211f1a]">
                  For Customers
                </h3>
                <ul className="mt-4 space-y-3 text-base text-[#5d574b]">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#ff5d46]" />
                    <span>
                      <strong>Communication:</strong> Clear instructions,
                      responsiveness
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#ff5d46]" />
                    <span>
                      <strong>Home Readiness:</strong> Property prepared for
                      service
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#ff5d46]" />
                    <span>
                      <strong>Respect:</strong> Courteous, professional
                      interaction
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#ff5d46]" />
                    <span>
                      <strong>Payment:</strong> Timely payment, fair tipping
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="border-b border-[#ebe5d8] bg-white px-6 py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-4xl font-semibold leading-tight text-[#211f1a] sm:text-5xl">
              Why two-way reviews work better
            </h2>

            <div className="mt-16 space-y-8">
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#ff5d46]">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#211f1a]">
                    Mutual respect and accountability
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-[#5d574b]">
                    When both parties can be rated, everyone brings their best.
                    Professionals take pride in their work, and customers
                    provide clear instructions and respectful treatment.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#ff5d46]">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#211f1a]">
                    Better matching for everyone
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-[#5d574b]">
                    High-rated customers get priority booking and better rates.
                    Professionals can see customer history before accepting
                    bookings, ensuring good fits.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#ff5d46]">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#211f1a]">
                    Protection from bad actors
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-[#5d574b]">
                    Low-rated users on either side get flagged for review.
                    Repeat issues result in account suspension, keeping the
                    platform safe for everyone.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#ff5d46]">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#211f1a]">
                    Honest, balanced feedback
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-[#5d574b]">
                    Detailed categories prevent unfair single-issue ratings.
                    You can rate service quality highly while noting
                    communication needs improvement.
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
              Join a community built on trust
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#5d574b]">
              Start building your reputation today. Great customers and
              professionals both benefit from our two-way review system.
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
