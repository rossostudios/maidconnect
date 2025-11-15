import { unstable_noStore } from "next/cache";
import { getTranslations } from "next-intl/server";
import { FavoritesList } from "@/components/favorites/favorites-list";
import { requireUser } from "@/lib/auth";

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
        <h1 className="font-semibold text-3xl text-neutral-900">{t("title")}</h1>
        <p className="mt-2 text-base text-neutral-500 leading-relaxed">{t("description")}</p>
      </div>

      <div className="bg-neutral-50 p-8 shadow-[0_20px_60px_-15px_rgba(22,22,22,0.15)]">
        <FavoritesList />
      </div>
    </section>
  );
}
