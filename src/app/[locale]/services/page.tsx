import {
  Cancel01Icon,
  CheckmarkCircle01Icon,
  Home01Icon,
  Restaurant01Icon,
  Shield01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
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

export default async function ServicesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-rausch-950">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <ServiceCategoriesSection />
        <PromiseSection />
      </main>
      <SiteFooter />
    </div>
  );
}

async function HeroSection() {
  const t = await getTranslations("services.page");

  return (
    <section className="bg-gradient-to-b from-neutral-50 to-white py-16 md:py-24 lg:py-32 dark:from-rausch-900 dark:to-rausch-950">
      <Container className="max-w-4xl text-center">
        <h1 className="font-medium text-4xl text-neutral-900 tracking-tight sm:text-5xl lg:text-6xl dark:text-white">
          {t("title")}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600 sm:text-xl dark:text-rausch-300">
          {t("subtitle")}
        </p>
      </Container>
    </section>
  );
}

async function ServiceCategoriesSection() {
  const t = await getTranslations("services");

  const categories = [
    {
      key: "homeCleaning",
      icon: Home01Icon,
      services: ["standardCleaning", "deepCleaning", "laundryIroning"],
    },
    {
      key: "familyCare",
      icon: UserGroupIcon,
      services: ["nannyChildcare", "seniorCompanionship"],
    },
    {
      key: "kitchen",
      icon: Restaurant01Icon,
      services: ["mealPrep", "eventCooking"],
    },
  ];

  return (
    <section className="py-16 md:py-24">
      <Container className="max-w-4xl">
        <div className="space-y-12">
          {categories.map((category) => (
            <div
              className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8 dark:border-rausch-800 dark:bg-rausch-900"
              key={category.key}
            >
              {/* Category Header */}
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rausch-100 dark:bg-rausch-800">
                  <HugeiconsIcon
                    className="h-6 w-6 text-rausch-600 dark:text-rausch-300"
                    icon={category.icon}
                  />
                </div>
                <h2 className="font-semibold text-2xl text-neutral-900 dark:text-white">
                  {t(`categories.${category.key}.label`)}
                </h2>
              </div>

              {/* Services Accordion */}
              <Accordion allowMultiple variant="default">
                {category.services.map((service) => (
                  <AccordionItem key={service} value={service}>
                    <AccordionTrigger>
                      {t(`categories.${category.key}.${service}.title`)}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid gap-6 md:grid-cols-2">
                        {/* Included */}
                        <div>
                          <div className="mb-3 flex items-center gap-2">
                            <HugeiconsIcon
                              className="h-5 w-5 text-green-600"
                              icon={CheckmarkCircle01Icon}
                            />
                            <h4 className="font-semibold text-neutral-900 dark:text-white">
                              {t("page.included")}
                            </h4>
                          </div>
                          <ul className="space-y-2">
                            {(
                              t.raw(`categories.${category.key}.${service}.included`) as string[]
                            ).map((item, index) => (
                              <li
                                className="flex items-start gap-2 text-neutral-600 text-sm dark:text-rausch-300"
                                key={index}
                              >
                                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-500" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Excluded */}
                        <div>
                          <div className="mb-3 flex items-center gap-2">
                            <HugeiconsIcon
                              className="h-5 w-5 text-neutral-400"
                              icon={Cancel01Icon}
                            />
                            <h4 className="font-semibold text-neutral-900 dark:text-white">
                              {t("page.excluded")}
                            </h4>
                          </div>
                          <ul className="space-y-2">
                            {(
                              t.raw(`categories.${category.key}.${service}.excluded`) as string[]
                            ).map((item, index) => (
                              <li
                                className="flex items-start gap-2 text-neutral-500 text-sm dark:text-rausch-400"
                                key={index}
                              >
                                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-neutral-400" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

async function PromiseSection() {
  const t = await getTranslations("services.promise");

  const promises = [
    { key: "happinessGuarantee", color: "bg-green-100 dark:bg-green-900/30" },
    { key: "propertyProtection", color: "bg-babu-100 dark:bg-babu-900/30" },
    { key: "theftMisconduct", color: "bg-rausch-100 dark:bg-rausch-900/30" },
    { key: "cancellations", color: "bg-neutral-100 dark:bg-neutral-800" },
  ];

  return (
    <section className="bg-neutral-50 py-16 md:py-24 dark:bg-rausch-900/50">
      <Container className="max-w-4xl">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-rausch-100 dark:bg-rausch-800">
            <HugeiconsIcon
              className="h-7 w-7 text-rausch-600 dark:text-rausch-300"
              icon={Shield01Icon}
            />
          </div>
          <h2 className="font-medium text-3xl text-neutral-900 tracking-tight sm:text-4xl dark:text-white">
            {t("title")}
          </h2>
        </div>

        {/* Promise Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {promises.map((promise) => (
            <div className={`rounded-2xl p-6 ${promise.color}`} key={promise.key}>
              <h3 className="mb-3 font-semibold text-lg text-neutral-900 dark:text-white">
                {t(`${promise.key}.title`)}
              </h3>
              <p className="text-neutral-600 text-sm leading-relaxed dark:text-rausch-200">
                {t(`${promise.key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
