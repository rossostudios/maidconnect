import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ContactCards } from "@/components/contact/contact-cards";
import { ContactFAQ } from "@/components/contact/contact-faq";
import { ContactHero } from "@/components/contact/contact-hero";
import { SiteFooter } from "@/components/sections/site-footer";
import { SiteHeader } from "@/components/sections/site-header";

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
    <div className="min-h-screen bg-[#F5F0E8] text-[#1A1614]">
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
