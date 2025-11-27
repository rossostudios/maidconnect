import { unstable_noStore } from "next/cache";
import { getTranslations } from "next-intl/server";

import { geistSans } from "@/app/fonts";
import { FinancesPageClient } from "@/components/finances/finances-page-client";
import { requireUser } from "@/lib/auth";
import { getCurrencyForCountry } from "@/lib/shared/config/pricing";
import type { CountryCode } from "@/lib/shared/config/territories";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { cn } from "@/lib/utils/core";

export default async function ProFinancesPage({ params }: { params: Promise<{ locale: string }> }) {
  unstable_noStore();

  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.pro.finances" });

  const user = await requireUser({ allowedRoles: ["professional"] });
  const supabase = await createSupabaseServerClient();

  // Fetch professional's currency code
  const { data: professionalProfile } = await supabase
    .from("professional_profiles")
    .select("country_code")
    .eq("user_id", user.id)
    .maybeSingle();

  // Determine currency from country code (using centralized pricing config)
  const countryCode = (professionalProfile?.country_code ?? "CO") as CountryCode;
  const currencyCode = getCurrencyForCountry(countryCode);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1
          className={cn(
            "font-semibold text-2xl text-foreground tracking-tight",
            geistSans.className
          )}
        >
          {t("title")}
        </h1>
        <p className={cn("mt-1 text-muted-foreground text-sm", geistSans.className)}>
          {t("description")}
        </p>
      </div>

      {/* Redesigned Finances Dashboard - Ultra-minimal Airbnb-inspired layout */}
      <FinancesPageClient currencyCode={currencyCode} />
    </div>
  );
}
