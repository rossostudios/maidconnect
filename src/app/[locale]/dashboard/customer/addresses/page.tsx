import { getTranslations } from "next-intl/server";
import { SavedAddressesManager } from "@/components/addresses/saved-addresses-manager";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export default async function CustomerAddressesPage(props: Promise<{ locale: string }>) {
  const params = await props;
  const t = await getTranslations({
    locale: params.locale,
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
  const savedAddresses = (customerProfile?.saved_addresses as any[]) || [];

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-semibold text-3xl text-[#211f1a]">{t("title")}</h1>
        <p className="mt-2 text-[#5d574b] text-base leading-relaxed">{t("description")}</p>
      </div>

      <div className="rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)] backdrop-blur-sm">
        <SavedAddressesManager addresses={savedAddresses} />
      </div>
    </section>
  );
}
