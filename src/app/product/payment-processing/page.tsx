import { Metadata } from "next";
import Link from "next/link";
import { CreditCard, Shield, Receipt, CheckCircle2 } from "lucide-react";
import { ProductHeroSection } from "@/components/product/product-hero-section";
import { ProductFeatureCard } from "@/components/product/product-feature-card";
import { ProductStepsSection } from "@/components/product/product-steps-section";
import { SiteHeader } from "@/components/sections/site-header";
import { SiteFooter } from "@/components/sections/site-footer";

export const metadata: Metadata = {
  title: "Payment Processing - MaidConnect",
  description:
    "Secure payment processing with Stripe. Track expenses, manage receipts, and handle tips all in one place with complete transparency.",
};

export default function PaymentProcessingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <SiteHeader />
      <main>
        {/* Hero Section */}
        <ProductHeroSection
          headline="Safe, transparent payments every time"
          description="Secure payment processing with Stripe. Track expenses, manage receipts, and handle tips all in one place with complete transparency."
          primaryCTA={{ label: "See How It Works", href: "#features" }}
          secondaryCTA={{ label: "Book a Service", href: "/professionals" }}
          badge="Powered by Stripe"
        />

        {/* Features Section */}
        <section
          id="features"
          className="border-b border-[#ebe5d8] bg-white px-6 py-16 sm:py-20 lg:py-24"
        >
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-4xl font-semibold leading-tight text-[#211f1a] sm:text-5xl lg:text-6xl">
              Payment processing you can trust
            </h2>

            <p className="mx-auto mt-6 max-w-3xl text-center text-lg leading-relaxed text-[#5d574b]">
              Enterprise-grade security with consumer-friendly transparency
            </p>

            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <ProductFeatureCard
                icon={Shield}
                title="Secure Stripe Integration"
                description="Industry-standard payment security with encrypted transactions. Your card information never touches our servers."
              />

              <ProductFeatureCard
                icon={CreditCard}
                title="Transparent Pricing"
                description="Clear breakdown of service fees, add-ons, and total costs before payment. No hidden charges or surprise fees."
              />

              <ProductFeatureCard
                icon={Receipt}
                title="Automatic Receipts"
                description="Digital receipts and expense tracking for every booking. Perfect for tax deductions and household budgets."
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <ProductStepsSection
          headline="How payments work"
          description="Simple, secure, and transparent from start to finish"
          steps={[
            {
              number: "1",
              title: "Review Pricing",
              description:
                "See complete breakdown of base service, add-ons, and total before booking",
            },
            {
              number: "2",
              title: "Authorize Payment",
              description:
                "Secure payment authorization through Stripe holds funds until service completion",
            },
            {
              number: "3",
              title: "Service Completed",
              description:
                "Professional receives payment after service completion and check-out",
            },
            {
              number: "4",
              title: "Get Receipt",
              description:
                "Automatic digital receipt with full transaction details sent to your email",
            },
          ]}
        />

        {/* Payment Timeline Section */}
        <section className="border-b border-[#ebe5d8] bg-white px-6 py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-4xl font-semibold leading-tight text-[#211f1a] sm:text-5xl">
              Payment timeline explained
            </h2>

            <div className="mt-16 space-y-8">
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#ff5d46]">
                  <span className="text-sm font-semibold text-white">1</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#211f1a]">
                    Booking confirmation - Authorization hold placed
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-[#5d574b]">
                    When you book, we place a temporary authorization hold on
                    your card for the total amount. This isn't a charge yet -
                    it just reserves the funds.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#ff5d46]">
                  <span className="text-sm font-semibold text-white">2</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#211f1a]">
                    Service day - Check-in begins service
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-[#5d574b]">
                    Professional checks in when they arrive. The authorization
                    hold remains in place during the service. You can track
                    service progress in real-time.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#ff5d46]">
                  <span className="text-sm font-semibold text-white">3</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#211f1a]">
                    Service complete - Check-out captures payment
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-[#5d574b]">
                    When the professional checks out and marks service complete,
                    the authorization converts to an actual charge. This is when
                    you're billed.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#ff5d46]">
                  <span className="text-sm font-semibold text-white">4</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#211f1a]">
                    Post-service - Receipt and payout processing
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-[#5d574b]">
                    You receive a digital receipt immediately. The professional
                    receives their payout (minus platform fees) within 2-3
                    business days.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Protection Features Section */}
        <section className="border-b border-[#ebe5d8] bg-white px-6 py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-4xl font-semibold leading-tight text-[#211f1a] sm:text-5xl">
              Your payment protection
            </h2>

            <div className="mt-16 space-y-8">
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#ff5d46]">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#211f1a]">
                    Only charged after service completion
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-[#5d574b]">
                    Authorization holds aren't charges. You're only billed when
                    the professional marks the service complete and checks out.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#ff5d46]">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#211f1a]">
                    Cancellation protections
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-[#5d574b]">
                    Cancel before the cancellation window closes and the hold
                    releases automatically. No charge, no hassle, no questions
                    asked.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#ff5d46]">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#211f1a]">
                    Dispute resolution support
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-[#5d574b]">
                    If service wasn't delivered as promised, contact support
                    within 24 hours. We review disputes and process refunds when
                    appropriate.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#ff5d46]">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#211f1a]">
                    Encrypted card storage
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-[#5d574b]">
                    Your payment information is tokenized and encrypted by
                    Stripe. We never see or store your full card details on our
                    servers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Accepted Payments Section */}
        <section className="border-b border-[#ebe5d8] bg-white px-6 py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-4xl font-semibold leading-tight text-[#211f1a] sm:text-5xl">
              Accepted payment methods
            </h2>

            <div className="mt-16 grid gap-8 md:grid-cols-3">
              <div className="rounded-[28px] border border-[#ebe5d8] bg-white p-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#ff5d46]/10">
                  <CreditCard className="h-8 w-8 text-[#ff5d46]" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-[#211f1a]">
                  Credit Cards
                </h3>
                <p className="mt-3 text-base text-[#5d574b]">
                  Visa, Mastercard, American Express, Discover
                </p>
              </div>

              <div className="rounded-[28px] border border-[#ebe5d8] bg-white p-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#ff5d46]/10">
                  <CreditCard className="h-8 w-8 text-[#ff5d46]" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-[#211f1a]">
                  Debit Cards
                </h3>
                <p className="mt-3 text-base text-[#5d574b]">
                  All major debit cards with card number and CVV
                </p>
              </div>

              <div className="rounded-[28px] border border-[#ebe5d8] bg-white p-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#ff5d46]/10">
                  <Receipt className="h-8 w-8 text-[#ff5d46]" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-[#211f1a]">
                  Digital Receipts
                </h3>
                <p className="mt-3 text-base text-[#5d574b]">
                  Automatic receipts sent via email for all transactions
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-white px-6 py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-4xl font-semibold leading-tight text-[#211f1a] sm:text-5xl">
              Ready for secure, transparent payments?
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#5d574b]">
              Experience hassle-free payment processing backed by Stripe's
              industry-leading security
            </p>

            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/professionals"
                className="inline-flex items-center justify-center rounded-full bg-[#ff5d46] px-8 py-4 text-base font-semibold text-white shadow-[0_6px_18px_rgba(255,93,70,0.22)] transition hover:bg-[#eb6c65]"
              >
                Book Your First Service
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
