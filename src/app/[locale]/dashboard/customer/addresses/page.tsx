import { unstable_noStore } from "next/cache";
import { getTranslations } from "next-intl/server";
import {
  type SavedAddress,
  SavedAddressesManager,
} from "@/components/addresses/saved-addresses-manager";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export default async function CustomerAddressesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  unstable_noStore(); // Opt out of caching for dynamic page

  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "dashboard.customer.addressesPage",
  });

  const user = await requireUser({ allowedRoles: ["customer"] });
  const supabase = await createSupabaseServerClient();

  const { data: customerData } = await supabase
    .from("customer_profiles")
    .select("saved_addresses")
    .eq("profile_id", user.id)
    .maybeSingle();

  const customerProfile = customerData as { saved_addresses: unknown } | null;
  const savedAddressesRaw = customerProfile?.saved_addresses;
  const savedAddresses: SavedAddress[] = Array.isArray(savedAddressesRaw) ? savedAddressesRaw : [];

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-semibold text-3xl text-neutral-900">{t("title")}</h1>
        <p className="mt-2 text-base text-neutral-700 leading-relaxed">{t("description")}</p>
      </div>

      <div className="bg-neutral-50 p-8 shadow-[0_20px_60px_-15px_rgba(22,22,22,0.15)]">
        <SavedAddressesManager addresses={savedAddresses} />
      </div>
    </section>
  );
}
