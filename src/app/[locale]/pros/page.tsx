import {
  Award,
  CheckCircle2,
  ChevronRight,
  Clock,
  DollarSign,
  MessageSquare,
  Repeat,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { SiteHeader } from "@/components/sections/SiteHeader";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/routing";

/**
 * Pros Landing Page - For Professionals
 *
 * Dedicated landing page for household professionals interested in
 * joining the Casaora platform. Highlights benefits, process, and earnings.
 */

const benefits = [
  {
    icon: DollarSign,
    title: "Set Your Own Rates",
    description:
      "You determine your hourly rate. Families pay a transparent 15% platform fee — you keep 100% of what you charge.",
  },
  {
    icon: Clock,
    title: "Guaranteed Payment",
    description:
      "Secure payment processing ensures you're paid on time, every time. No chasing clients for payment.",
  },
  {
    icon: Users,
    title: "Quality Clients",
    description:
      "Connect with verified, respectful expat families who value professional domestic staff and pay fairly.",
  },
  {
    icon: Repeat,
    title: "Long-Term Relationships",
    description:
      "Build steady income through repeat bookings with families who appreciate your work.",
  },
  {
    icon: MessageSquare,
    title: "Bilingual Support",
    description:
      "Our English-speaking team helps you communicate seamlessly with international clients.",
  },
  {
    icon: Shield,
    title: "Safety & Verification",
    description:
      "We verify all families and provide secure bookings so you can work with confidence.",
  },
];

const howItWorksSteps = [
  {
    step: "1",
    title: "Complete Your Profile",
    description:
      "Fill out a simple application with your experience, services offered, and availability. Takes about 10 minutes.",
  },
  {
    step: "2",
    title: "Get Verified",
    description:
      "We'll review your profile and may request references or a background check (at no cost to you).",
  },
  {
    step: "3",
    title: "Start Receiving Requests",
    description:
      "Once approved, you'll appear in search results and receive booking requests from families in your area.",
  },
  {
    step: "4",
    title: "Confirm & Get Paid",
    description:
      "Accept requests that fit your schedule. After each job, payment is automatically transferred to your account.",
  },
];

const faqs = [
  {
    question: "How much can I earn on Casaora?",
    answer:
      "You set your own hourly rate. Most professionals on our platform charge between 15,000-40,000 COP per hour depending on their experience and services. There are no fees to join or list your services — families pay a 15% platform fee on top of your rate.",
  },
  {
    question: "How do I get paid?",
    answer:
      "After completing a booking, payment is processed securely through our platform and transferred to your bank account or preferred payment method within 2-3 business days.",
  },
  {
    question: "Do I need to speak English?",
    answer:
      "Not required, but helpful! Many of our families are English-speaking expats. We provide bilingual support to help you communicate with clients who don't speak Spanish.",
  },
  {
    question: "What if a family cancels a booking?",
    answer:
      "Our cancellation policy protects you. If a family cancels with less than 24 hours notice, you'll receive 50% of the booking fee. Last-minute cancellations (less than 4 hours) result in full payment.",
  },
  {
    question: "Is there a contract or commitment?",
    answer:
      "No long-term contract required. You control your schedule and can accept or decline booking requests as you wish. You're free to leave the platform at any time.",
  },
  {
    question: "What services can I offer?",
    answer:
      "You can offer housekeeping, childcare, eldercare, cooking, laundry, pet care, estate management, or specialized services. Simply specify what you offer in your profile.",
  },
];

export default async function ProsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="relative min-h-screen bg-neutral-50 text-neutral-900">
      <SiteHeader />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-neutral-50 py-20 lg:py-28">
          <Container className="relative max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
              {/* Left Column - Content */}
              <div className="flex flex-col justify-center">
                <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 font-medium text-orange-700 text-sm">
                  <Award className="h-4 w-4" />
                  For Professionals
                </div>

                <h1 className="mb-6 font-bold text-5xl text-neutral-900 leading-tight lg:text-6xl">
                  Join Colombia's top household staffing platform
                </h1>

                <p className="mb-8 text-neutral-700 text-xl leading-relaxed">
                  Connect with quality expat families who value professional domestic staff. Set
                  your own rates, build long-term relationships, and grow your income.
                </p>

                <div className="flex flex-col gap-4 sm:flex-row">
                  <Link href="#apply">
                    <Button className="min-w-[200px]" size="lg">
                      Apply to Join Now
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="#how-it-works">
                    <Button className="min-w-[200px]" size="lg" variant="outline">
                      See How It Works
                    </Button>
                  </Link>
                </div>

                <div className="mt-8 flex items-center gap-6 text-neutral-600 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span>Free to join</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span>No upfront fees</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span>Start earning in days</span>
                  </div>
                </div>
              </div>

              {/* Right Column - Earnings Preview */}
              <div className="flex items-center justify-center lg:justify-end">
                <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 shadow-lg">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                      <TrendingUp className="h-6 w-6 text-green-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900">Earnings Potential</h3>
                      <p className="text-neutral-600 text-sm">Based on platform averages</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-lg bg-neutral-50 p-4">
                      <div className="mb-1 text-neutral-600 text-sm">Part-time (20 hrs/week)</div>
                      <div className="font-bold text-3xl text-neutral-900">
                        $1,200,000-1,600,000
                      </div>
                      <div className="text-neutral-600 text-sm">COP per month</div>
                    </div>

                    <div className="rounded-lg bg-orange-50 p-4">
                      <div className="mb-1 text-orange-700 text-sm">Full-time (40 hrs/week)</div>
                      <div className="font-bold text-3xl text-orange-900">$2,400,000-3,200,000</div>
                      <div className="text-orange-600 text-sm">COP per month</div>
                    </div>
                  </div>

                  <p className="mt-6 text-center text-neutral-600 text-xs">
                    Actual earnings vary based on your rates, experience, and hours worked
                  </p>
                </div>
              </div>
            </div>
          </Container>

          {/* Decorative Elements */}
          <div className="pointer-events-none absolute top-0 right-0 h-96 w-96 rounded-full bg-orange-100 opacity-20 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-96 w-96 rounded-full bg-neutral-200 opacity-20 blur-3xl" />
        </section>

        {/* Benefits Section */}
        <section className="py-20 lg:py-28">
          <Container className="max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 font-bold text-4xl text-neutral-900 sm:text-5xl">
                Why professionals choose Casaora
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-neutral-700">
                We've built a platform that puts you first — fair pay, quality clients, and support
                when you need it.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <div
                    className="flex flex-col items-start gap-4 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                    key={benefit.title}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                      <Icon className="h-6 w-6 text-orange-600" strokeWidth={2} />
                    </div>

                    <div>
                      <h3 className="mb-2 font-semibold text-lg text-neutral-900">
                        {benefit.title}
                      </h3>
                      <p className="text-neutral-600 leading-relaxed">{benefit.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Container>
        </section>

        {/* How It Works */}
        <section className="bg-white py-20 lg:py-28" id="how-it-works">
          <Container className="max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 font-bold text-4xl text-neutral-900 sm:text-5xl">
                How to get started
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-neutral-700">
                Joining Casaora is simple. Complete your profile, get verified, and start receiving
                booking requests.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {howItWorksSteps.map((item, index) => (
                <div className="relative" key={item.step}>
                  {/* Connector Line (desktop only) */}
                  {index < howItWorksSteps.length - 1 && (
                    <div className="absolute top-12 left-1/2 hidden h-0.5 w-full bg-orange-200 lg:block" />
                  )}

                  <div className="relative flex flex-col items-center text-center">
                    <div className="relative z-10 mb-4 flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-orange-500 font-bold text-2xl text-white shadow-md">
                      {item.step}
                    </div>

                    <h3 className="mb-2 font-semibold text-lg text-neutral-900">{item.title}</h3>
                    <p className="text-neutral-600 text-sm leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link href="#apply">
                <Button className="min-w-[250px]" size="lg">
                  Start Your Application
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </Container>
        </section>

        {/* FAQ Section */}
        <section className="py-20 lg:py-28">
          <Container className="max-w-4xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 font-bold text-4xl text-neutral-900 sm:text-5xl">
                Frequently asked questions
              </h2>
              <p className="text-lg text-neutral-700">
                Everything you need to know about joining Casaora
              </p>
            </div>

            <div className="space-y-6">
              {faqs.map((faq) => (
                <div
                  className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm"
                  key={faq.question}
                >
                  <h3 className="mb-3 font-semibold text-lg text-neutral-900">{faq.question}</h3>
                  <p className="text-neutral-700 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* Final CTA Section */}
        <section
          className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 py-20 text-white lg:py-28"
          id="apply"
        >
          <Container className="relative max-w-4xl text-center">
            <h2 className="mb-6 font-bold text-4xl leading-tight sm:text-5xl">
              Ready to grow your income with quality families?
            </h2>
            <p className="mb-8 text-orange-50 text-xl">
              Join hundreds of trusted professionals earning more on Casaora. Apply today — it's
              free and takes just 10 minutes.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/auth/sign-up?type=professional">
                <Button
                  className="min-w-[250px] border-white bg-white text-orange-600 hover:bg-neutral-50"
                  size="lg"
                  variant="outline"
                >
                  Create Professional Account
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  className="min-w-[200px] border border-white bg-transparent text-white hover:bg-white/10"
                  size="lg"
                  variant="ghost"
                >
                  Contact Us
                </Button>
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-orange-100 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                <span>No hidden fees</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                <span>Start earning in 48 hours</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                <span>Bilingual support team</span>
              </div>
            </div>
          </Container>

          {/* Decorative Elements */}
          <div className="pointer-events-none absolute top-0 right-0 h-96 w-96 rounded-full bg-white opacity-10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-96 w-96 rounded-full bg-orange-900 opacity-20 blur-3xl" />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
