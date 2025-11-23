import { unstable_noStore } from "next/cache";
import { getTranslations } from "next-intl/server";
import { geistSans } from "@/app/fonts";
import { NotificationsHistory } from "@/components/notifications/notifications-history";
import { requireUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default async function CustomerNotificationsPage(props: {
  params: Promise<{ locale: string }>;
}) {
  unstable_noStore();

  const params = await props.params;
  const t = await getTranslations({
    locale: params.locale,
    namespace: "dashboard.customer.notifications",
  });

  // Ensure user is authenticated
  await requireUser({ allowedRoles: ["customer"] });

  return (
    <section className="space-y-6">
      <div>
        <h1 className={cn("font-semibold text-3xl text-neutral-900", geistSans.className)}>
          {t("title")}
        </h1>
        <p className="mt-2 text-base text-neutral-600 leading-relaxed">{t("description")}</p>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <NotificationsHistory />
      </div>
    </section>
  );
}
