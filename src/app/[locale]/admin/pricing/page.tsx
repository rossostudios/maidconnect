import { unstable_noStore } from "next/cache";
import { geistSans } from "@/app/fonts";
import { PricingControlsManager } from "@/components/admin/pricing-controls-manager";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Pricing Controls | Admin",
  description: "Manage commission rates and pricing rules",
};

export default async function AdminPricingPage() {
  unstable_noStore(); // Opt out of caching for dynamic page

  await requireUser({ allowedRoles: ["admin"] });

  const supabase = await createSupabaseServerClient();

  // Fetch all pricing controls
  const { data: pricingRules } = await supabase
    .from("pricing_controls")
    .select("*")
    .order("effective_from", { ascending: false });

  return (
    <section className="space-y-8">
      {/* Page Header - Lia Design */}
      <div>
        <h1
          className={cn(
            "font-semibold text-3xl text-neutral-900 uppercase tracking-tight",
            geistSans.className
          )}
        >
          Pricing Controls
        </h1>
        <p
          className={cn(
            "mt-1.5 font-normal text-neutral-700 text-sm tracking-wide",
            geistSans.className
          )}
        >
          Manage commission rates, price floors/ceilings, and deposit rules by service category and
          city
        </p>
      </div>

      <PricingControlsManager initialRules={pricingRules || []} />
    </section>
  );
}
