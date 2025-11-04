import { getTranslations } from "next-intl/server";
import { FavoritesList } from "@/components/favorites/favorites-list";
import { requireUser } from "@/lib/auth";

export default async function CustomerFavoritesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await requireUser({ allowedRoles: ["customer"] });

  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.customer.favoritesPage" });

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-semibold text-3xl text-[var(--foreground)]">{t("title")}</h1>
        <p className="mt-2 text-[var(--muted-foreground)] text-base leading-relaxed">
          {t("description")}
        </p>
      </div>

      <div className="rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)] backdrop-blur-sm">
        <FavoritesList />
      </div>
    </section>
  );
}
