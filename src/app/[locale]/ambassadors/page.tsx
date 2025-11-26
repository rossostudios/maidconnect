import {
  ArrowRight01Icon,
  Award01Icon,
  Coins01Icon,
  Share01Icon,
  UserLove01Icon,
  UserMultiple02Icon,
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
  title: "Casaora Ambassador Program | Refer Professionals & Earn",
  description:
    "Join the Casaora Ambassador Program. Refer home service professionals and earn $15 for each successful referral. Help grow the home services community.",
};

export default async function AmbassadorsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <HowItWorksSection />
        <RewardsSection />
        <WhoCanJoinSection />
        <FAQSection />
        <CTASection />
      </main>
      <SiteFooter />
    </div>
  );
}

async function HeroSection() {
  const t = await getTranslations("ambassadors.hero");

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-rausch-500 via-rausch-600 to-rausch-700 py-20 md:py-28 lg:py-36">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
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
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5">
            <HugeiconsIcon className="h-4 w-4 text-white" icon={Award01Icon} />
            <span className="font-medium text-sm text-white">{t("badge")}</span>
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
                "bg-white font-semibold text-rausch-600",
                "shadow-lg",
                "transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]",
                "hover:bg-neutral-50 hover:shadow-xl",
                "active:scale-[0.98]"
              )}
              href="/ambassadors/apply"
            >
              {t("primaryCta")}
              <HugeiconsIcon className="h-5 w-5" icon={ArrowRight01Icon} />
            </Link>
            <Link
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-full px-8 py-4",
                "border border-white/30 font-semibold text-white",
                "transition-all duration-300",
                "hover:bg-white/10"
              )}
              href="#how-it-works"
            >
              {t("secondaryCta")}
            </Link>
          </div>

          {/* Reward highlight */}
          <div className="mt-12 inline-flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-6 py-3">
            <HugeiconsIcon className="h-6 w-6 text-green-300" icon={Coins01Icon} />
            <span className="font-bold text-2xl text-white">{t("rewardAmount")}</span>
            <span className="text-white/80">{t("rewardDescription")}</span>
          </div>
        </div>
      </Container>
    </section>
  );
}

async function HowItWorksSection() {
  const t = await getTranslations("ambassadors.howItWorks");

  const steps = [
    {
      number: "01",
      icon: UserLove01Icon,
      title: t("steps.apply.title"),
      description: t("steps.apply.description"),
    },
    {
      number: "02",
      icon: Share01Icon,
      title: t("steps.share.title"),
      description: t("steps.share.description"),
    },
    {
      number: "03",
      icon: UserMultiple02Icon,
      title: t("steps.signUp.title"),
      description: t("steps.signUp.description"),
    },
    {
      number: "04",
      icon: Coins01Icon,
      title: t("steps.earn.title"),
      description: t("steps.earn.description"),
    },
  ];

  return (
    <section className="bg-white py-20 md:py-28" id="how-it-works">
      <Container>
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 font-bold text-3xl text-neutral-900 tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
          <p className="text-lg text-neutral-600">{t("subtitle")}</p>
        </div>

        <div className="relative">
          {/* Connection line - hidden on mobile */}
          <div className="absolute top-12 right-0 left-0 hidden h-0.5 bg-gradient-to-r from-rausch-100 via-rausch-300 to-rausch-100 lg:block" />

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div className="relative text-center" key={index}>
                {/* Step number */}
                <div className="relative z-10 mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-rausch-500 to-rausch-600 shadow-lg">
                  <HugeiconsIcon className="h-10 w-10 text-white" icon={step.icon} />
                </div>
                <div className="mb-2 font-bold text-rausch-600 text-sm">{step.number}</div>
                <h3 className="mb-2 font-semibold text-lg text-neutral-900">{step.title}</h3>
                <p className="text-neutral-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

async function RewardsSection() {
  const t = await getTranslations("ambassadors.rewards");

  return (
    <section className="bg-neutral-50 py-20 md:py-28">
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
                  <h4 className="font-semibold text-neutral-900">{t("points.reward.title")}</h4>
                  <p className="text-neutral-600">{t("points.reward.description")}</p>
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
                  <h4 className="font-semibold text-neutral-900">{t("points.noLimit.title")}</h4>
                  <p className="text-neutral-600">{t("points.noLimit.description")}</p>
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
                  <h4 className="font-semibold text-neutral-900">{t("points.tracking.title")}</h4>
                  <p className="text-neutral-600">{t("points.tracking.description")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Stats card */}
          <div className="relative">
            <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-xl">
              <div className="mb-6 text-center">
                <p className="mb-2 text-neutral-600 text-sm">{t("card.label")}</p>
                <p className="font-bold text-5xl text-neutral-900">$15</p>
                <p className="text-neutral-500 text-sm">{t("card.perReferral")}</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-neutral-50 p-3">
                  <span className="text-neutral-600 text-sm">{t("card.example5")}</span>
                  <span className="font-semibold text-neutral-900">$75</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-neutral-50 p-3">
                  <span className="text-neutral-600 text-sm">{t("card.example10")}</span>
                  <span className="font-semibold text-neutral-900">$150</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-rausch-50 p-3">
                  <span className="text-rausch-600 text-sm">{t("card.example20")}</span>
                  <span className="font-semibold text-rausch-600">$300</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

async function WhoCanJoinSection() {
  const t = await getTranslations("ambassadors.whoCanJoin");

  const personas = [
    { key: "realtor", icon: "🏠" },
    { key: "lawyer", icon: "⚖️" },
    { key: "accountant", icon: "📊" },
    { key: "designer", icon: "🎨" },
    { key: "blogger", icon: "📝" },
    { key: "community", icon: "🤝" },
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

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {personas.map((persona) => (
            <div
              className="group rounded-2xl border border-neutral-200 bg-neutral-50 p-6 transition-all hover:border-rausch-200 hover:bg-rausch-50/50"
              key={persona.key}
            >
              <div className="mb-4 text-4xl">{persona.icon}</div>
              <h3 className="mb-2 font-semibold text-lg text-neutral-900">
                {t(`personas.${persona.key}.title`)}
              </h3>
              <p className="text-neutral-600 text-sm">{t(`personas.${persona.key}.description`)}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

async function FAQSection() {
  const t = await getTranslations("ambassadors.faq");

  const faqs = [
    { key: "howToEarn" },
    { key: "whenPaid" },
    { key: "referralLimit" },
    { key: "tracking" },
    { key: "requirements" },
  ];

  return (
    <section className="bg-neutral-50 py-20 md:py-28">
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
  const t = await getTranslations("ambassadors.cta");

  return (
    <section className="bg-gradient-to-br from-rausch-500 to-rausch-600 py-20 md:py-28">
      <Container className="max-w-3xl">
        <div className="text-center">
          <h2 className="mb-4 font-bold text-3xl text-white tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mb-10 text-lg text-white/90">{t("subtitle")}</p>
          <Link
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-full px-10 py-4",
              "bg-white font-semibold text-rausch-600",
              "shadow-lg",
              "transition-all duration-300",
              "hover:bg-neutral-50 hover:shadow-xl"
            )}
            href="/ambassadors/apply"
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
