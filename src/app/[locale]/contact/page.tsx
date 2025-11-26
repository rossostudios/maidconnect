import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ContactCards } from "@/components/contact/contact-cards";
import { ContactFAQ } from "@/components/contact/contact-faq";
import { ContactHero } from "@/components/contact/contact-hero";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { SiteHeader } from "@/components/sections/SiteHeader";

// Revalidate daily (86400 seconds) - contact page is mostly static

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.contact.meta" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900 dark:bg-rausch-950 dark:text-white">
      <SiteHeader />
      <main>
        <ContactHero />
        <ContactCards />
        <ContactFAQ />
      </main>
      <SiteFooter />
    </div>
  );
}
