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
              className="flex flex-col justify-between rounded-[32px] border border-[#ebe5d8] bg-gradient-to-br from-[#fbfafa] to-white p-10 shadow-[0_10px_40px_rgba(18,17,15,0.04)] transition hover:shadow-[0_20px_60px_rgba(18,17,15,0.08)]"
              key={option.key}
            >
              <div className="space-y-6">
                <h2 className="font-semibold text-3xl text-[var(--foreground)]">
                  {t(`${option.key}.title`)}
                </h2>
                <p className="text-[var(--muted-foreground)] text-base leading-relaxed">
                  {t(`${option.key}.description`)}
                </p>
              </div>
              <Link
                className="mt-12 inline-flex w-fit items-center justify-center rounded-full bg-[var(--foreground)] px-8 py-4 font-semibold text-base text-white transition hover:bg-[#2d2822]"
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
