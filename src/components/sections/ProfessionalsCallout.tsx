import { CheckCircle2, Clock, DollarSign, Repeat, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/routing";

/**
 * ProfessionalsCallout - Homepage section targeting professionals
 *
 * Encourages household professionals to join the platform by highlighting
 * key benefits: fair pay, timely payments, bilingual support, and repeat bookings.
 *
 * Placement: Between TestimonialsSection and PricingSection
 */

const benefits = [
  {
    icon: DollarSign,
    title: "Keep 100% of Your Rate",
    description:
      "You set your rate and keep every peso. Families pay a separate platform fee—your earnings stay yours.",
  },
  {
    icon: Clock,
    title: "Always Paid On Time",
    description:
      "Our secure payment system ensures you receive reliable, punctual payment for every booking—no worries.",
  },
  {
    icon: Users,
    title: "Thoughtful Bilingual Support",
    description:
      "Our caring team bridges any language gaps, making communication with expat families smooth and stress-free.",
  },
  {
    icon: Repeat,
    title: "Build Lasting Relationships",
    description:
      "Connect with families who value consistency and quality, creating opportunities for long-term partnerships.",
  },
];

export function ProfessionalsCallout() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-neutral-50 py-20 lg:py-28">
      <Container className="relative max-w-7xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 font-medium text-orange-700 text-sm">
            <CheckCircle2 className="h-4 w-4" />
            For Professionals
          </div>

          <h2 className="mb-4 font-bold text-4xl text-neutral-900 sm:text-5xl">
            Build your career with families who truly value your work
          </h2>

          <p className="mx-auto max-w-2xl text-lg text-neutral-700 leading-relaxed">
            Join Colombia's most trusted community of household professionals. We connect you with
            respectful families who appreciate your expertise, treat you fairly, and become
            long-term partners in maintaining beautiful homes.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="mb-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
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
                  <h3 className="mb-2 font-semibold text-neutral-900">{benefit.title}</h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-white p-8 text-center sm:p-12">
          <h3 className="font-bold text-2xl text-neutral-900 sm:text-3xl">
            We'd love to welcome you to our community
          </h3>
          <p className="max-w-xl text-base text-neutral-700">
            Apply today to connect with thoughtful families who genuinely appreciate skilled
            household professionals. We carefully match you with respectful clients who value your
            expertise and treat you with the dignity you deserve.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/pros">
              <Button className="min-w-[200px]" size="lg">
                Start Your Application
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button className="min-w-[200px]" size="lg" variant="outline">
                Learn How It Works
              </Button>
            </Link>
          </div>

          <p className="mt-2 text-neutral-600 text-xs">
            Free to apply • No upfront costs • Begin connecting with families within days
          </p>
        </div>
      </Container>

      {/* Decorative Elements */}
      <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 rounded-full bg-orange-100 opacity-20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-neutral-200 opacity-20 blur-3xl" />
    </section>
  );
}
