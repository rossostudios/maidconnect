import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/routing";

export async function ContactCards() {
  const t = await getTranslations("pages.contact.cards");

  const contactOptions = [
    {
      key: "support",
      buttonHref: "mailto:support@casaora.co",
    },
    {
      key: "customers",
      buttonHref: "/professionals",
    },
    {
      key: "professionals",
      buttonHref: "/auth/sign-up?role=professional",
    },
  ];

  return (
    <section className="py-20 sm:py-24 lg:py-32">
      <Container className="max-w-[1400px]">
        <div className="grid gap-8 md:grid-cols-3">
          {contactOptions.map((option) => (
            <div
              className="flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-10 shadow-sm transition-shadow hover:shadow-lg dark:border-rausch-700 dark:bg-rausch-800"
              key={option.key}
            >
              <div className="space-y-6">
                <h2 className="font-semibold text-2xl text-neutral-900 dark:text-white">
                  {t(`${option.key}.title`)}
                </h2>
                <p className="text-base text-neutral-600 leading-relaxed dark:text-rausch-200">
                  {t(`${option.key}.description`)}
                </p>
              </div>
              <Link
                className="mt-12 inline-flex w-fit items-center justify-center rounded-lg bg-rausch-500 px-8 py-4 font-semibold text-base text-white transition-colors hover:bg-rausch-600 dark:bg-white dark:text-rausch-700 dark:hover:bg-rausch-50"
                href={option.buttonHref}
              >
                {t(`${option.key}.buttonText`)}
              </Link>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
