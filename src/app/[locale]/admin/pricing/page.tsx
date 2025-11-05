import { PricingControlsManager } from "@/components/admin/pricing-controls-manager";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export const metadata = {
  title: "Pricing Controls | Admin",
  description: "Manage commission rates and pricing rules",
};

export default async function AdminPricingPage() {
  await requireUser({ allowedRoles: ["admin"] });

  const supabase = await createSupabaseServerClient();

  // Fetch all pricing controls
  const { data: pricingRules } = await supabase
    .from("pricing_controls")
    .select("*")
    .order("effective_from", { ascending: false });

  return (
    <section className="space-y-8">
      <div>
        <h1 className="font-bold text-3xl text-[#171717]">Pricing Controls</h1>
        <p className="mt-2 text-[#737373]">
          Manage commission rates, price floors/ceilings, and deposit rules by service category and
          city
        </p>
      </div>

      <PricingControlsManager initialRules={pricingRules || []} />
    </section>
  );
}
