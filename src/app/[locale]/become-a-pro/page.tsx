import {
  ArrowRight01Icon,
  Calendar03Icon,
  CheckmarkCircle02Icon,
  Coins01Icon,
  SecurityCheckIcon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { getTranslations } from "next-intl/server";
import { EarningsCalculator } from "@/components/become-a-pro/earnings-calculator";
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

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "becomeAPro" });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

export default async function BecomeAProPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-rausch-950">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <BenefitsSection />
        <FilterSection />
        <EarningsSection />
        <HowItWorksSection />
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
    <section className="relative overflow-hidden bg-rausch-950 py-24 md:py-32 lg:py-40">
      {/* Background - clean solid with subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-rausch-950 to-rausch-900" />

      {/* Subtle dot pattern overlay - refined minimal */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <Container className="relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge - refined styling */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-rausch-400/20 bg-rausch-400/10 px-5 py-2">
            <span className="font-medium text-rausch-200 text-sm">{t("badge")}</span>
          </div>

          {/* Headline - larger with better spacing */}
          <h1 className="mb-8 font-bold text-4xl text-white leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            {t("title")}
          </h1>

          {/* Subheadline - better readability */}
          <p className="mb-12 text-lg text-rausch-100/90 leading-relaxed sm:text-xl">
            {t("subtitle")}
          </p>

          {/* CTAs - refined button hierarchy */}
          <div className="flex flex-col justify-center gap-4 sm:flex-row sm:gap-6">
            <Link
              className={cn(
                "inline-flex items-center justify-center gap-3 rounded-full px-10 py-4",
                "bg-white font-semibold text-lg text-rausch-700",
                "shadow-lg shadow-rausch-950/20",
                "transition-all duration-200",
                "hover:scale-[1.02] hover:bg-rausch-50 hover:shadow-xl"
              )}
              href="/become-a-pro/signup"
            >
              {t("primaryCta")}
              <HugeiconsIcon className="h-5 w-5" icon={ArrowRight01Icon} />
            </Link>
            <Link
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-full px-10 py-4",
                "border border-white/30 font-medium text-white",
                "transition-all duration-200",
                "hover:border-white/50 hover:bg-white/10"
              )}
              href="#how-it-works"
            >
              {t("secondaryCta")}
            </Link>
          </div>

          {/* Trust indicators - cleaner styling */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-rausch-200/80 text-sm">
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
      icon: SecurityCheckIcon,
      title: t("items.safety.title"),
      description: t("items.safety.description"),
    },
    {
      icon: Coins01Icon,
      title: t("items.financial.title"),
      description: t("items.financial.description"),
    },
    {
      icon: StarIcon,
      title: t("items.growth.title"),
      description: t("items.growth.description"),
    },
  ];

  return (
    <section className="bg-white py-24 md:py-32 dark:bg-rausch-950">
      <Container>
        {/* Section header - refined typography */}
        <div className="mx-auto mb-20 max-w-2xl text-center">
          <h2 className="mb-6 font-bold text-3xl text-neutral-900 tracking-tight sm:text-4xl lg:text-5xl dark:text-white">
            {t("title")}
          </h2>
          <p className="text-lg text-neutral-600 leading-relaxed sm:text-xl dark:text-rausch-100/80">
            {t("subtitle")}
          </p>
        </div>

        {/* Benefits grid - 3 cards centered */}
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
          {benefits.map((benefit, index) => (
            <div
              className={cn(
                "group rounded-2xl border border-neutral-200 bg-white p-10",
                "transition-all duration-200",
                "hover:border-rausch-200 hover:shadow-lg hover:shadow-rausch-500/5",
                "dark:border-rausch-800 dark:bg-rausch-900/50",
                "dark:hover:border-rausch-700 dark:hover:shadow-rausch-950/20"
              )}
              key={index}
            >
              {/* Larger icon container */}
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-rausch-50 transition-colors group-hover:bg-rausch-100 dark:bg-rausch-800 dark:group-hover:bg-rausch-700">
                <HugeiconsIcon
                  className="h-7 w-7 text-rausch-600 dark:text-rausch-300"
                  icon={benefit.icon}
                />
              </div>
              <h3 className="mb-3 font-semibold text-lg text-neutral-900 dark:text-white">
                {benefit.title}
              </h3>
              <p className="text-neutral-600 leading-relaxed dark:text-rausch-100/70">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

async function FilterSection() {
  const t = await getTranslations("becomeAPro.filter");

  const requirements = [
    { key: "experience" },
    { key: "background" },
    { key: "references" },
    { key: "commitment" },
  ];

  return (
    <section className="bg-neutral-50 py-24 md:py-32 dark:bg-rausch-900">
      <Container className="max-w-4xl">
        <div className="text-center">
          {/* Section header */}
          <h2 className="mb-6 font-bold text-3xl text-neutral-900 tracking-tight sm:text-4xl lg:text-5xl dark:text-white">
            {t("title")}
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-lg text-neutral-600 leading-relaxed sm:text-xl dark:text-rausch-100/80">
            {t("subtitle")}
          </p>

          {/* Requirements checklist */}
          <div className="mx-auto max-w-xl">
            <div className="space-y-4">
              {requirements.map((req) => (
                <div
                  className={cn(
                    "flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-5",
                    "dark:border-rausch-800 dark:bg-rausch-900/50"
                  )}
                  key={req.key}
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <HugeiconsIcon
                      className="h-5 w-5 text-green-600 dark:text-green-400"
                      icon={CheckmarkCircle02Icon}
                    />
                  </div>
                  <span className="text-left font-medium text-neutral-900 dark:text-white">
                    {t(`requirements.${req.key}`)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

async function EarningsSection() {
  const t = await getTranslations("becomeAPro.earnings");

  return (
    <section className="bg-white py-24 md:py-32 dark:bg-rausch-950">
      <Container className="max-w-4xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          {/* Content */}
          <div>
            <h2 className="mb-6 font-bold text-3xl text-neutral-900 tracking-tight sm:text-4xl dark:text-white">
              {t("title")}
            </h2>
            <p className="mb-8 text-lg text-neutral-600 leading-relaxed dark:text-rausch-100/80">
              {t("subtitle")}
            </p>

            {/* Key points */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <HugeiconsIcon
                    className="h-4 w-4 text-green-600 dark:text-green-400"
                    icon={CheckmarkCircle02Icon}
                  />
                </div>
                <span className="text-neutral-700 dark:text-rausch-100/90">
                  {t("points.setRates")}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <HugeiconsIcon
                    className="h-4 w-4 text-green-600 dark:text-green-400"
                    icon={CheckmarkCircle02Icon}
                  />
                </div>
                <span className="text-neutral-700 dark:text-rausch-100/90">
                  {t("points.noDeductions")}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <HugeiconsIcon
                    className="h-4 w-4 text-green-600 dark:text-green-400"
                    icon={CheckmarkCircle02Icon}
                  />
                </div>
                <span className="text-neutral-700 dark:text-rausch-100/90">
                  {t("points.escrow")}
                </span>
              </div>
            </div>
          </div>

          {/* Calculator */}
          <EarningsCalculator />
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
    <section className="relative bg-neutral-50 py-24 md:py-32 dark:bg-rausch-900" id="how-it-works">
      {/* Subtle dot pattern - consistent with other sections */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <Container className="relative z-10">
        {/* Section header - larger typography */}
        <div className="mx-auto mb-20 max-w-2xl text-center">
          <h2 className="mb-6 font-bold text-3xl text-neutral-900 tracking-tight sm:text-4xl lg:text-5xl dark:text-white">
            {t("title")}
          </h2>
          <p className="text-lg text-neutral-600 leading-relaxed sm:text-xl dark:text-rausch-100/80">
            {t("subtitle")}
          </p>
        </div>

        <div className="relative">
          {/* Clean connection line - hidden on mobile */}
          <div className="absolute top-10 right-0 left-0 hidden h-px bg-neutral-200 lg:block dark:bg-rausch-700" />

          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {steps.map((step, index) => (
              <div className="relative text-center" key={index}>
                {/* Cleaner step number - minimal circle */}
                <div className="relative z-10 mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full border-2 border-neutral-200 bg-white dark:border-rausch-700 dark:bg-rausch-800">
                  <span className="font-bold text-2xl text-rausch-500 dark:text-rausch-300">
                    {step.number}
                  </span>
                </div>
                <h3 className="mb-3 font-semibold text-lg text-neutral-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="text-neutral-600 leading-relaxed dark:text-rausch-100/70">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA - refined styling */}
        <div className="mt-20 text-center">
          <Link
            className={cn(
              "inline-flex items-center justify-center gap-3 rounded-full px-10 py-4",
              "bg-rausch-500 font-semibold text-lg text-white",
              "shadow-lg shadow-rausch-500/20",
              "transition-all duration-200",
              "hover:scale-[1.02] hover:bg-rausch-600 hover:shadow-xl",
              "dark:bg-white dark:text-rausch-700 dark:shadow-white/10 dark:hover:bg-rausch-50"
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

async function FAQSection() {
  const t = await getTranslations("becomeAPro.faq");

  const faqs = [{ key: "payment" }, { key: "fee" }, { key: "verification" }, { key: "schedule" }];

  return (
    <section className="bg-white py-24 md:py-32 dark:bg-rausch-950">
      <Container className="max-w-3xl">
        {/* Section header - refined typography */}
        <div className="mb-16 text-center">
          <h2 className="mb-6 font-bold text-3xl text-neutral-900 tracking-tight sm:text-4xl lg:text-5xl dark:text-white">
            {t("title")}
          </h2>
          <p className="text-lg text-neutral-600 leading-relaxed sm:text-xl dark:text-rausch-100/80">
            {t("subtitle")}
          </p>
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
    <section className="bg-rausch-500 py-24 md:py-32 dark:bg-rausch-700">
      <Container className="max-w-3xl">
        <div className="space-y-8 text-center">
          {/* Headline - larger for impact */}
          <h2 className="font-bold text-3xl text-white tracking-tight sm:text-4xl lg:text-5xl">
            {t("title")}
          </h2>

          {/* Subtitle with more breathing room */}
          <p className="mx-auto max-w-xl text-lg text-white/90 leading-relaxed sm:text-xl">
            {t("subtitle")}
          </p>

          {/* CTA button - refined styling */}
          <div className="pt-4">
            <Link
              className={cn(
                "inline-flex items-center justify-center gap-3 rounded-full px-10 py-4",
                "bg-white font-semibold text-lg text-rausch-600",
                "shadow-lg shadow-rausch-600/20",
                "transition-all duration-200",
                "hover:scale-[1.02] hover:bg-neutral-50 hover:shadow-xl",
                "dark:text-rausch-700"
              )}
              href="/become-a-pro/signup"
            >
              {t("button")}
              <HugeiconsIcon className="h-5 w-5" icon={ArrowRight01Icon} />
            </Link>
          </div>

          {/* Note - subtle trust indicator */}
          <p className="pt-4 text-sm text-white/70">{t("note")}</p>
        </div>
      </Container>
    </section>
  );
}
