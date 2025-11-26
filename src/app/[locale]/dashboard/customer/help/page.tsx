import {
  HeadsetIcon,
  Mail01Icon,
  Message01Icon,
  MessageQuestionIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { unstable_noStore } from "next/cache";
import { getTranslations } from "next-intl/server";
import { geistSans } from "@/app/fonts";
import { requireUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import type { HugeIcon } from "@/types/icons";

export default async function CustomerHelpPage(props: { params: Promise<{ locale: string }> }) {
  unstable_noStore();

  const params = await props.params;
  const t = await getTranslations({
    locale: params.locale,
    namespace: "dashboard.customer.helpPage",
  });

  // Ensure user is authenticated
  await requireUser({ allowedRoles: ["customer"] });

  const contactOptions: Array<{
    icon: HugeIcon;
    title: string;
    description: string;
    action: string;
    href?: string;
    bgColor: string;
    iconColor: string;
  }> = [
    {
      icon: Message01Icon,
      title: t("contact.liveChat.title"),
      description: t("contact.liveChat.description"),
      action: t("contact.liveChat.action"),
      bgColor: "bg-rausch-50",
      iconColor: "text-rausch-500",
    },
    {
      icon: Mail01Icon,
      title: t("contact.email.title"),
      description: t("contact.email.description"),
      action: t("contact.email.action"),
      href: "mailto:help@casaora.co",
      bgColor: "bg-babu-50",
      iconColor: "text-babu-500",
    },
    {
      icon: HeadsetIcon,
      title: t("contact.phone.title"),
      description: t("contact.phone.description"),
      action: t("contact.phone.action"),
      href: "tel:+571234567890",
      bgColor: "bg-green-50",
      iconColor: "text-green-500",
    },
  ];

  const faqItems = [
    {
      question: t("faq.booking.question"),
      answer: t("faq.booking.answer"),
    },
    {
      question: t("faq.payment.question"),
      answer: t("faq.payment.answer"),
    },
    {
      question: t("faq.cancellation.question"),
      answer: t("faq.cancellation.answer"),
    },
    {
      question: t("faq.professional.question"),
      answer: t("faq.professional.answer"),
    },
  ];

  return (
    <section className="space-y-8">
      {/* Header */}
      <div>
        <h1 className={cn("font-semibold text-3xl text-neutral-900", geistSans.className)}>
          {t("title")}
        </h1>
        <p className="mt-2 text-base text-neutral-600 leading-relaxed">{t("description")}</p>
      </div>

      {/* Contact Options Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {contactOptions.map((option) => (
          <div
            className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm transition hover:border-rausch-300 hover:shadow-md"
            key={option.title}
          >
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-lg",
                option.bgColor
              )}
            >
              <HugeiconsIcon className={cn("h-6 w-6", option.iconColor)} icon={option.icon} />
            </div>
            <h3 className={cn("mt-4 font-semibold text-lg text-neutral-900", geistSans.className)}>
              {option.title}
            </h3>
            <p className="mt-2 text-neutral-600 text-sm leading-relaxed">{option.description}</p>
            {option.href ? (
              <a
                className="mt-4 inline-flex items-center font-semibold text-rausch-600 text-sm transition hover:text-rausch-700"
                href={option.href}
              >
                {option.action} →
              </a>
            ) : (
              <button
                className="mt-4 inline-flex items-center font-semibold text-rausch-600 text-sm transition hover:text-rausch-700"
                type="button"
              >
                {option.action} →
              </button>
            )}
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 border-neutral-100 border-b pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
            <HugeiconsIcon className="h-5 w-5 text-amber-500" icon={MessageQuestionIcon} />
          </div>
          <h2 className={cn("font-semibold text-neutral-900 text-xl", geistSans.className)}>
            {t("faq.title")}
          </h2>
        </div>

        <div className="mt-6 space-y-6">
          {faqItems.map((item, index) => (
            <div
              className={cn(index < faqItems.length - 1 && "border-neutral-100 border-b pb-6")}
              key={item.question}
            >
              <h3 className={cn("font-semibold text-base text-neutral-900", geistSans.className)}>
                {item.question}
              </h3>
              <p className="mt-2 text-neutral-600 text-sm leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <h3 className={cn("font-semibold text-lg text-red-900", geistSans.className)}>
          {t("emergency.title")}
        </h3>
        <p className="mt-2 text-red-700 text-sm leading-relaxed">{t("emergency.description")}</p>
        <a
          className="mt-4 inline-flex items-center gap-2 font-semibold text-red-700 text-sm transition hover:text-red-800"
          href="tel:+571234567890"
        >
          {t("emergency.phone")}
        </a>
      </div>
    </section>
  );
}
