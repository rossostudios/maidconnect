import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/routing";

export async function ContactCards() {
  const t = await getTranslations("pages.contact.cards");

  const contactOptions = [
    {
      key: "support",
      buttonHref: "mailto:support@casaora.com",
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
              className="flex flex-col justify-between border border-[neutral-200] bg-gradient-to-br from-[bg-[neutral-50]] to-[neutral-50] p-10 shadow-[0_10px_40px_rgba(22,22,22,0.04)] transition hover:shadow-[0_20px_60px_rgba(22,22,22,0.08)]"
              key={option.key}
            >
              <div className="space-y-6">
                <h2 className="serif-headline-lg text-[neutral-900]">{t(`${option.key}.title`)}</h2>
                <p className="text-[neutral-900]/70 text-base leading-relaxed">
                  {t(`${option.key}.description`)}
                </p>
              </div>
              <Link
                className="mt-12 inline-flex w-fit items-center justify-center bg-[neutral-500] px-8 py-4 font-semibold text-[neutral-50] text-base transition hover:bg-[neutral-500]"
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
