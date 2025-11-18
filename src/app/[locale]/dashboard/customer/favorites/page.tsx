import { unstable_noStore } from "next/cache";
import { getTranslations } from "next-intl/server";
import { geistSans } from "@/app/fonts";
import { FavoritesList } from "@/components/favorites/favorites-list";
import { requireUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default async function CustomerFavoritesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  unstable_noStore(); // Opt out of caching for dynamic page

  await requireUser({ allowedRoles: ["customer"] });

  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.customer.favoritesPage" });

  return (
    <section className="space-y-6">
      <div>
        <h1 className={cn("font-semibold text-3xl text-neutral-900", geistSans.className)}>
          {t("title")}
        </h1>
        <p className="mt-2 text-base text-neutral-700 leading-relaxed">{t("description")}</p>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">
        <FavoritesList />
      </div>
    </section>
  );
}
