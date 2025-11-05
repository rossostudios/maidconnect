import { MagicWand01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
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
      <main className="flex flex-1 items-center justify-center bg-gradient-to-br from-[var(--background)] to-[#f3ece1] px-4 py-24">
        <div className="mx-auto max-w-2xl text-center">
          {/* Logo/Brand */}
          <div className="mb-8 inline-flex items-center justify-center rounded-full bg-[var(--red)]/10 p-6">
            <HugeiconsIcon className="h-12 w-12 text-[var(--red)]" icon={MagicWand01Icon} />
          </div>

          {/* Brand Name */}
          <h1 className="type-serif-display mb-6 text-[var(--foreground)] tracking-[0.15em]">
            AGUAORA
          </h1>

          {/* Tagline */}
          <p className="mb-8 text-[var(--muted-foreground)] text-xl leading-relaxed sm:text-2xl">
            {t("tagline")}
          </p>

          {/* Description */}
          <p className="mb-12 text-[#7a7165] text-lg leading-relaxed">{t("description")}</p>

          {/* Coming Soon Badge */}
          <div className="inline-flex items-center gap-3 rounded-full border-2 border-[var(--red)] bg-white px-8 py-4 shadow-[var(--shadow-card)]">
            <div className="flex h-2 w-2 items-center justify-center">
              <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-[var(--red)] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--red)]" />
            </div>
            <span className="font-semibold text-[var(--foreground)] text-lg uppercase tracking-wider">
              {t("comingSoon")}
            </span>
          </div>

          {/* Sister Company Link */}
          <p className="mt-12 text-[#7a7165] text-sm">
            {t("sisterCompany")}{" "}
            <a
              className="font-semibold text-[var(--red)] underline underline-offset-2 transition hover:text-[var(--red-hover)]"
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
