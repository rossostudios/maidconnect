import { ContactHero } from "@/components/contact/contact-hero";
import { ContactCards } from "@/components/contact/contact-cards";
import { ContactFAQ } from "@/components/contact/contact-faq";
import { SiteHeader } from "@/components/sections/site-header";
import { SiteFooter } from "@/components/sections/site-footer";

export const metadata = {
  title: "Contact Us | MaidConnect",
  description: "Get in touch with our support team, learn about becoming a professional, or reach out for partnership opportunities.",
};

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
