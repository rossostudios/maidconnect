import { MagicWand01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";
import { unstable_noStore } from "next/cache";
import { SiteFooter } from "@/components/sections/site-footer";
import { SiteHeader } from "@/components/sections/site-header";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const isSpanish = locale === "es";

  return {
    title: isSpanish ? "Aguaora - Próximamente" : "Aguaora - Coming Soon",
    description: isSpanish
      ? "Servicios de agua potable a domicilio. Próximamente disponible."
      : "Water delivery services. Coming soon.",
    openGraph: {
      title: isSpanish ? "Aguaora - Próximamente" : "Aguaora - Coming Soon",
      description: isSpanish
        ? "Servicios de agua potable a domicilio. Próximamente disponible."
        : "Water delivery services. Coming soon.",
      type: "website",
    },
  };
}

export default async function AguaoraPage({ params }: { params: Promise<{ locale: string }> }) {
  unstable_noStore(); // Opt out of caching for dynamic page

  const { locale } = await params;
  const isSpanish = locale === "es";

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center bg-gradient-to-br from-[bg-[#FFEEFF8E8]] to-[bg-[#FFEEFF8E8]] px-4 py-24">
        <div className="mx-auto max-w-2xl text-center">
          {/* Logo/Brand */}
          <div className="mb-8 inline-flex items-center justify-center rounded-full bg-[#FF4444A22]/10 p-6">
            <HugeiconsIcon className="h-12 w-12 text-[#FF4444A22]" icon={MagicWand01Icon} />
          </div>

          {/* Brand Name */}
          <h1 className="type-serif-display mb-6 text-[#116611616] tracking-[0.15em]">AGUAORA</h1>

          {/* Tagline */}
          <p className="mb-8 text-[#AA88AAAAC] text-xl leading-relaxed sm:text-2xl">
            {isSpanish ? "Agua potable a tu puerta" : "Fresh water at your doorstep"}
          </p>

          {/* Description */}
          <p className="mb-12 text-[#AA88AAAAC] text-lg leading-relaxed">
            {isSpanish
              ? "Pronto podrás solicitar servicios de entrega de agua potable directamente a tu hogar u oficina. Agua limpia, fresca y confiable cuando la necesites."
              : "Soon you'll be able to request water delivery services directly to your home or office. Clean, fresh, and reliable water when you need it."}
          </p>

          {/* Coming Soon Badge */}
          <div className="inline-flex items-center gap-3 rounded-full border-2 border-[#FF4444A22] bg-[#FFEEFF8E8] px-8 py-4 shadow-sm">
            <div className="flex h-2 w-2 items-center justify-center">
              <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-[#FF4444A22] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#FF4444A22]" />
            </div>
            <span className="font-semibold text-[#116611616] text-lg uppercase tracking-wider">
              {isSpanish ? "Próximamente" : "Coming Soon"}
            </span>
          </div>

          {/* Sister Company Link */}
          <p className="mt-12 text-[#AA88AAAAC] text-sm">
            {isSpanish ? "Una empresa hermana de" : "A sister company of"}{" "}
            <a
              className="font-semibold text-[#FF4444A22] underline underline-offset-2 transition hover:text-[#FF4444A22]"
              href="/"
            >
              Casaora
            </a>
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
