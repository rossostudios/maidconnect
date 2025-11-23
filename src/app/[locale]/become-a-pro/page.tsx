import {
  ArrowRight01Icon,
  Calendar03Icon,
  Coins01Icon,
  Home09Icon,
  SecurityCheckIcon,
  StarIcon,
  UserCheck01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { SiteHeader } from "@/components/sections/SiteHeader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Become a Casaora Pro | Turn Your Skills Into Income",
  description:
    "Join Casaora as a verified home service professional. Set your own rates, flexible schedule, and grow your client base with our trusted platform.",
};

export default async function BecomeAProPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <BenefitsSection />
        <HowItWorksSection />
        <EarningsSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>
      <SiteFooter />
    </div>
  );
}

async function HeroSection() {
  const t = await getTranslations("becomeAPro.hero");

  return (
    <section className="relative overflow-hidden bg-neutral-900 py-20 md:py-28 lg:py-36">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900" />

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <Container className="relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5">
            <span className="font-medium text-orange-400 text-sm">{t("badge")}</span>
          </div>

          {/* Headline */}
          <h1 className="mb-6 font-bold text-4xl text-white tracking-tight sm:text-5xl lg:text-6xl">
            {t("title")}
          </h1>

          {/* Subheadline */}
          <p className="mb-10 text-lg text-white/80 sm:text-xl">{t("subtitle")}</p>

          {/* CTAs */}
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-full px-8 py-4",
                "bg-orange-500 font-semibold text-white",
                "shadow-lg shadow-orange-500/20",
                "transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]",
                "hover:bg-orange-600 hover:shadow-orange-600/25 hover:shadow-xl",
                "active:scale-[0.98]"
              )}
              href="/become-a-pro/signup"
            >
              {t("primaryCta")}
              <HugeiconsIcon className="h-5 w-5" icon={ArrowRight01Icon} />
            </Link>
            <Link
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-full px-8 py-4",
                "border border-white/20 font-semibold text-white",
                "transition-all duration-300",
                "hover:bg-white/10"
              )}
              href="#how-it-works"
            >
              {t("secondaryCta")}
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <HugeiconsIcon className="h-5 w-5 text-green-400" icon={SecurityCheckIcon} />
              <span>{t("trustBadge1")}</span>
            </div>
            <div className="flex items-center gap-2">
              <HugeiconsIcon className="h-5 w-5 text-green-400" icon={Coins01Icon} />
              <span>{t("trustBadge2")}</span>
            </div>
            <div className="flex items-center gap-2">
              <HugeiconsIcon className="h-5 w-5 text-green-400" icon={Calendar03Icon} />
              <span>{t("trustBadge3")}</span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

async function BenefitsSection() {
  const t = await getTranslations("becomeAPro.benefits");

  const benefits = [
    {
      icon: Coins01Icon,
      title: t("items.earnings.title"),
      description: t("items.earnings.description"),
    },
    {
      icon: Calendar03Icon,
      title: t("items.flexibility.title"),
      description: t("items.flexibility.description"),
    },
    {
      icon: SecurityCheckIcon,
      title: t("items.protection.title"),
      description: t("items.protection.description"),
    },
    {
      icon: StarIcon,
      title: t("items.growth.title"),
      description: t("items.growth.description"),
    },
    {
      icon: Home09Icon,
      title: t("items.clients.title"),
      description: t("items.clients.description"),
    },
    {
      icon: UserCheck01Icon,
      title: t("items.support.title"),
      description: t("items.support.description"),
    },
  ];

  return (
    <section className="bg-white py-20 md:py-28">
      <Container>
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 font-bold text-3xl text-neutral-900 tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
          <p className="text-lg text-neutral-600">{t("subtitle")}</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, index) => (
            <div
              className="group rounded-2xl border border-neutral-200 bg-neutral-50 p-8 transition-all hover:border-orange-200 hover:bg-orange-50/50"
              key={index}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 transition-colors group-hover:bg-orange-200">
                <HugeiconsIcon className="h-6 w-6 text-orange-600" icon={benefit.icon} />
              </div>
              <h3 className="mb-2 font-semibold text-lg text-neutral-900">{benefit.title}</h3>
              <p className="text-neutral-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

async function HowItWorksSection() {
  const t = await getTranslations("becomeAPro.howItWorks");

  const steps = [
    {
      number: "01",
      title: t("steps.apply.title"),
      description: t("steps.apply.description"),
    },
    {
      number: "02",
      title: t("steps.verify.title"),
      description: t("steps.verify.description"),
    },
    {
      number: "03",
      title: t("steps.profile.title"),
      description: t("steps.profile.description"),
    },
    {
      number: "04",
      title: t("steps.earn.title"),
      description: t("steps.earn.description"),
    },
  ];

  return (
    <section className="bg-neutral-50 py-20 md:py-28" id="how-it-works">
      <Container>
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 font-bold text-3xl text-neutral-900 tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
          <p className="text-lg text-neutral-600">{t("subtitle")}</p>
        </div>

        <div className="relative">
          {/* Connection line - hidden on mobile */}
          <div className="absolute top-12 right-0 left-0 hidden h-0.5 bg-gradient-to-r from-orange-100 via-orange-300 to-orange-100 lg:block" />

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div className="relative text-center" key={index}>
                {/* Step number */}
                <div className="relative z-10 mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-lg">
                  <span className="font-bold text-2xl text-orange-500">{step.number}</span>
                </div>
                <h3 className="mb-2 font-semibold text-lg text-neutral-900">{step.title}</h3>
                <p className="text-neutral-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-full px-8 py-4",
              "bg-orange-500 font-semibold text-white",
              "shadow-lg shadow-orange-500/20",
              "transition-all duration-300",
              "hover:bg-orange-600 hover:shadow-xl"
            )}
            href="/become-a-pro/signup"
          >
            {t("cta")}
            <HugeiconsIcon className="h-5 w-5" icon={ArrowRight01Icon} />
          </Link>
        </div>
      </Container>
    </section>
  );
}

async function EarningsSection() {
  const t = await getTranslations("becomeAPro.earnings");

  return (
    <section className="bg-white py-20 md:py-28">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left: Content */}
          <div>
            <h2 className="mb-6 font-bold text-3xl text-neutral-900 tracking-tight sm:text-4xl">
              {t("title")}
            </h2>
            <p className="mb-8 text-lg text-neutral-600">{t("description")}</p>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                  <svg
                    aria-hidden="true"
                    className="h-4 w-4 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      clipRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      fillRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-900">{t("points.rates.title")}</h4>
                  <p className="text-neutral-600">{t("points.rates.description")}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                  <svg
                    aria-hidden="true"
                    className="h-4 w-4 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      clipRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      fillRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-900">{t("points.payouts.title")}</h4>
                  <p className="text-neutral-600">{t("points.payouts.description")}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                  <svg
                    aria-hidden="true"
                    className="h-4 w-4 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      clipRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      fillRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-900">{t("points.tips.title")}</h4>
                  <p className="text-neutral-600">{t("points.tips.description")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Earnings card visual */}
          <div className="relative">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-8 shadow-xl">
              <div className="mb-6 text-center">
                <p className="mb-2 text-neutral-600 text-sm">{t("card.label")}</p>
                <p className="font-bold text-5xl text-neutral-900">$2,500+</p>
                <p className="text-neutral-500 text-sm">{t("card.period")}</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-white p-3">
                  <span className="text-neutral-600 text-sm">{t("card.bookings")}</span>
                  <span className="font-semibold text-neutral-900">20-30</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white p-3">
                  <span className="text-neutral-600 text-sm">{t("card.hourlyRate")}</span>
                  <span className="font-semibold text-neutral-900">$25-50</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white p-3">
                  <span className="text-neutral-600 text-sm">{t("card.tips")}</span>
                  <span className="font-semibold text-green-600">+15%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

async function TestimonialsSection() {
  const t = await getTranslations("becomeAPro.testimonials");

  const testimonials = [
    {
      quote: t("items.0.quote"),
      name: t("items.0.name"),
      role: t("items.0.role"),
      location: t("items.0.location"),
    },
    {
      quote: t("items.1.quote"),
      name: t("items.1.name"),
      role: t("items.1.role"),
      location: t("items.1.location"),
    },
    {
      quote: t("items.2.quote"),
      name: t("items.2.name"),
      role: t("items.2.role"),
      location: t("items.2.location"),
    },
  ];

  return (
    <section className="bg-neutral-900 py-20 md:py-28">
      <Container>
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 font-bold text-3xl text-white tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
          <p className="text-lg text-white/70">{t("subtitle")}</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div className="rounded-2xl bg-neutral-800 p-8" key={index}>
              {/* Stars */}
              <div className="mb-4 flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <HugeiconsIcon className="h-5 w-5 text-orange-400" icon={StarIcon} key={i} />
                ))}
              </div>
              {/* Quote */}
              <p className="mb-6 text-white/90">"{testimonial.quote}"</p>
              {/* Author */}
              <div>
                <p className="font-semibold text-white">{testimonial.name}</p>
                <p className="text-sm text-white/60">
                  {testimonial.role} • {testimonial.location}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

async function FAQSection() {
  const t = await getTranslations("becomeAPro.faq");

  const faqs = [
    { key: "requirements" },
    { key: "earnings" },
    { key: "schedule" },
    { key: "verification" },
    { key: "support" },
  ];

  return (
    <section className="bg-white py-20 md:py-28">
      <Container className="max-w-3xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-bold text-3xl text-neutral-900 tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
          <p className="text-lg text-neutral-600">{t("subtitle")}</p>
        </div>

        <Accordion allowMultiple={false} variant="default">
          {faqs.map((faq) => (
            <AccordionItem key={faq.key} value={faq.key}>
              <AccordionTrigger>{t(`items.${faq.key}.question`)}</AccordionTrigger>
              <AccordionContent>{t(`items.${faq.key}.answer`)}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </section>
  );
}

async function CTASection() {
  const t = await getTranslations("becomeAPro.cta");

  return (
    <section className="bg-gradient-to-br from-orange-500 to-orange-600 py-20 md:py-28">
      <Container className="max-w-3xl">
        <div className="text-center">
          <h2 className="mb-4 font-bold text-3xl text-white tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mb-10 text-lg text-white/90">{t("subtitle")}</p>
          <Link
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-full px-10 py-4",
              "bg-white font-semibold text-orange-600",
              "shadow-lg",
              "transition-all duration-300",
              "hover:bg-neutral-50 hover:shadow-xl"
            )}
            href="/become-a-pro/signup"
          >
            {t("button")}
            <HugeiconsIcon className="h-5 w-5" icon={ArrowRight01Icon} />
          </Link>
          <p className="mt-6 text-sm text-white/70">{t("note")}</p>
        </div>
      </Container>
    </section>
  );
}
