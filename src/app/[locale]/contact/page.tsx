import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ContactHero } from "@/components/contact/contact-hero";
import { ContactCards } from "@/components/contact/contact-cards";
import { ContactFAQ } from "@/components/contact/contact-faq";
import { SiteHeader } from "@/components/sections/site-header";
import { SiteFooter } from "@/components/sections/site-footer";

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "pages.contact.meta" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
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
