import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { SiteHeader } from "@/components/sections/SiteHeader";
import { DirectoryGridSkeleton } from "./DirectoryGridSkeleton";
import { ProfessionalsDirectory } from "./ProfessionalsDirectory";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "professionals" });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
    openGraph: {
      title: t("meta.title"),
      description: t("meta.description"),
    },
  };
}

export default function ProfessionalsPage() {
  return (
    <div className="bg-neutral-50 dark:bg-rausch-950 text-neutral-900 dark:text-white">
      <SiteHeader />
      <main className="min-h-screen">
        <Suspense fallback={<DirectoryGridSkeleton />}>
          <ProfessionalsDirectory />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
