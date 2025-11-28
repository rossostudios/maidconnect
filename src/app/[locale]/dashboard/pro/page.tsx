import { unstable_noStore } from "next/cache";
import { NotificationPermissionPrompt } from "@/components/notifications/notification-permission-prompt";
import { ProDashboardV2 } from "@/components/professional/dashboard/ProDashboardV2";
import { requireUser } from "@/lib/auth";
import { getCurrencyForCountry } from "@/lib/shared/config/pricing";
import type { CountryCode } from "@/lib/shared/config/territories";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

/**
 * Professional Dashboard Page - High-Density Analytics Layout
 *
 * Three-row layout:
 * 1. MetricQuad - 4 KPI cards (Earnings, Bookings, Clients, Completion Rate)
 * 2. InsightEngine - Donut chart (service breakdown) + Bar chart (revenue flow)
 * 3. RecentBookingsTable - Data table with search/filter/sort
 *
 * Following Lia Design System with Casaora Dark Mode palette.
 * All data fetched client-side via ProDashboardV2.
 */

export default async function ProfessionalDashboardPage() {
  unstable_noStore();

  const user = await requireUser({ allowedRoles: ["professional"] });
  const supabase = await createSupabaseServerClient();

  // Fetch professional's profile for name and country
  const { data: professionalProfile } = await supabase
    .from("professional_profiles")
    .select("country_code, first_name")
    .eq("user_id", user.id)
    .maybeSingle();

  // Determine currency from country code (using centralized pricing config)
  const countryCode = (professionalProfile?.country_code ?? "CO") as CountryCode;
  const currencyCode = getCurrencyForCountry(countryCode);
  const displayName = professionalProfile?.first_name ?? "Professional";

  return (
    <>
      <NotificationPermissionPrompt variant="banner" />
      <ProDashboardV2 currencyCode={currencyCode} name={displayName} />
    </>
  );
}
