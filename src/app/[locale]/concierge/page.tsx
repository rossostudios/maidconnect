import { setRequestLocale } from "next-intl/server";
import { ConciergeForm } from "@/components/concierge/concierge-form";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { SiteHeader } from "@/components/sections/SiteHeader";
import { Container } from "@/components/ui/container";

export default async function ConciergePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="relative min-h-screen bg-neutral-50 text-neutral-900">
      <SiteHeader />
      <main className="py-12 sm:py-16 lg:py-20">
        <Container className="max-w-6xl px-4 md:px-8">
          <ConciergeForm />
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}
