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
              className="flex flex-col justify-between rounded-[32px] border border-[#e2e8f0] bg-gradient-to-br from-[bg-[#f8fafc]] to-[#f8fafc] p-10 shadow-[0_10px_40px_rgba(22,22,22,0.04)] transition hover:shadow-[0_20px_60px_rgba(22,22,22,0.08)]"
              key={option.key}
            >
              <div className="space-y-6">
                <h2 className="serif-headline-lg text-[#0f172a]">{t(`${option.key}.title`)}</h2>
                <p className="text-[#0f172a]/70 text-base leading-relaxed">
                  {t(`${option.key}.description`)}
                </p>
              </div>
              <Link
                className="mt-12 inline-flex w-fit items-center justify-center rounded-full bg-[#64748b] px-8 py-4 font-semibold text-[#f8fafc] text-base transition hover:bg-[#64748b]"
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
