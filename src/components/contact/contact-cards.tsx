"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";

export function ContactCards() {
  const t = useTranslations("pages.contact.cards");

  const contactOptions = [
    {
      key: "support",
      buttonHref: "mailto:support@maidconnect.co",
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
              key={option.key}
              className="flex flex-col justify-between rounded-[32px] border border-[#ebe5d8] bg-gradient-to-br from-[#fbfafa] to-white p-10 shadow-[0_10px_40px_rgba(18,17,15,0.04)] transition hover:shadow-[0_20px_60px_rgba(18,17,15,0.08)]"
            >
              <div className="space-y-6">
                <h2 className="text-3xl font-semibold text-[#211f1a]">
                  {t(`${option.key}.title`)}
                </h2>
                <p className="text-base leading-relaxed text-[#5d574b]">
                  {t(`${option.key}.description`)}
                </p>
              </div>
              <Link
                href={option.buttonHref}
                className="mt-12 inline-flex w-fit items-center justify-center rounded-full bg-[#211f1a] px-8 py-4 text-base font-semibold text-white transition hover:bg-[#2d2822]"
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
