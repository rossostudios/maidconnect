import { unstable_noStore } from "next/cache";
import { getTranslations } from "next-intl/server";
import { geistSans } from "@/app/fonts";
import { ServiceAddonsManager } from "@/components/service-addons/service-addons-manager";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { cn } from "@/lib/utils";

type AddonRow = {
  id: string;
  professional_id: string;
  name: string;
  description: string | null;
  price_cop: number;
  duration_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export default async function ProServiceAddonsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  unstable_noStore();

  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.pro.serviceAddons" });

  const user = await requireUser({ allowedRoles: ["professional"] });
  const supabase = await createSupabaseServerClient();

  const { data: addonsData } = await supabase
    .from("service_addons")
    .select(
      "id, professional_id, name, description, price_cop, duration_minutes, is_active, created_at, updated_at"
    )
    .eq("professional_id", user.id)
    .order("created_at", { ascending: false });

  const addons = (addonsData as AddonRow[] | null) ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1
          className={cn(
            "font-semibold text-3xl text-neutral-900 uppercase tracking-tight",
            geistSans.className
          )}
        >
          {t("title")}
        </h1>
        <p
          className={cn(
            "mt-2 font-normal text-neutral-700 text-sm leading-relaxed",
            geistSans.className
          )}
        >
          {t("description")}
        </p>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-6">
        <ServiceAddonsManager addons={addons} professionalId={user.id} />
      </div>
    </div>
  );
}
