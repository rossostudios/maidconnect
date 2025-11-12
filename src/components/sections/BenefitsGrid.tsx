import {
  Clock01Icon,
  CustomerSupportIcon,
  MagicWand01Icon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Container } from "@/components/ui/container";

/**
 * BenefitsGrid Component
 *
 * Displays 4 key benefits in a 2x2 grid layout.
 * Each benefit has an icon, title, and description.
 */
export function BenefitsGrid() {
  const benefits = [
    {
      icon: Shield01Icon,
      title: "Rigorously Vetted",
      description:
        "All professionals undergo thorough background checks, interviews, and skills verification.",
    },
    {
      icon: MagicWand01Icon,
      title: "Curated Matches",
      description: "Our team hand-selects candidates based on your specific needs and preferences.",
    },
    {
      icon: Clock01Icon,
      title: "Fast Placement",
      description:
        "Receive qualified candidates within 5 business days, ready to start when you need them.",
    },
    {
      icon: CustomerSupportIcon,
      title: "Ongoing Support",
      description: "Dedicated account manager and 24/7 support to ensure everything runs smoothly.",
    },
  ];

  return (
    <section className="w-full bg-stone-100 py-16 md:py-24">
      <Container className="mx-auto max-w-7xl px-4">
        <div className="text-center">
          <h2 className="font-bold text-3xl text-stone-800 md:text-4xl">Why Choose Casaora?</h2>
          <p className="mt-4 text-lg text-stone-600">
            Premium household staffing made simple, reliable, and stress-free.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {benefits.map((benefit) => (
            <div
              className="rounded-2xl border-2 border-stone-300 bg-stone-50 p-6 transition-all duration-200 hover:border-stone-400 hover:shadow-lg"
              key={benefit.title}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-700">
                <HugeiconsIcon className="h-5 w-5 text-stone-50" icon={benefit.icon} />
              </div>
              <h3 className="mt-4 font-semibold text-stone-800 text-xl">{benefit.title}</h3>
              <p className="mt-2 text-stone-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
