import { Sparkles } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SiteFooter } from "@/components/sections/site-footer";
import { SiteHeader } from "@/components/sections/site-header";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "aguaora.meta" });

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website",
    },
  };
}

export default async function AguaoraPage() {
  const t = await getTranslations("aguaora");

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center bg-gradient-to-br from-[#fbfaf9] to-[#f3ece1] px-4 py-24">
        <div className="mx-auto max-w-2xl text-center">
          {/* Logo/Brand */}
          <div className="mb-8 inline-flex items-center justify-center rounded-full bg-[#8B7355]/10 p-6">
            <Sparkles className="h-12 w-12 text-[#8B7355]" />
          </div>

          {/* Brand Name */}
          <h1 className="font-[family-name:var(--font-cinzel)] mb-6 text-5xl text-[#211f1a] tracking-[0.15em] sm:text-6xl lg:text-7xl">
            AGUAORA
          </h1>

          {/* Tagline */}
          <p className="mb-8 text-[#5d574b] text-xl leading-relaxed sm:text-2xl">
            {t("tagline")}
          </p>

          {/* Description */}
          <p className="mb-12 text-[#7a7165] text-lg leading-relaxed">
            {t("description")}
          </p>

          {/* Coming Soon Badge */}
          <div className="inline-flex items-center gap-3 rounded-full border-2 border-[#8B7355] bg-white px-8 py-4 shadow-[var(--shadow-card)]">
            <div className="flex h-2 w-2 items-center justify-center">
              <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-[#8B7355] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#8B7355]" />
            </div>
            <span className="font-semibold text-[#211f1a] text-lg uppercase tracking-wider">
              {t("comingSoon")}
            </span>
          </div>

          {/* Sister Company Link */}
          <p className="mt-12 text-[#7a7165] text-sm">
            {t("sisterCompany")}{" "}
            <a
              className="font-semibold text-[#8B7355] underline underline-offset-2 transition hover:text-[#9B8B7E]"
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
