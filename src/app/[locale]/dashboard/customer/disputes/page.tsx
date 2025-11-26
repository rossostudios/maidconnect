"use server";

import { unstable_noStore } from "next/cache";
import { getTranslations } from "next-intl/server";
import { geistSans } from "@/app/fonts";
import { CustomerDisputesList } from "@/components/disputes/customer-disputes-list";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { cn } from "@/lib/utils";

export type CustomerDispute = {
  id: string;
  booking_id: string;
  reason: string;
  description: string;
  status: string;
  resolution_notes: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  booking: {
    id: string;
    service_name: string;
    scheduled_start: string | null;
    completed_at: string | null;
    total_amount_cents: number | null;
    currency: string | null;
  } | null;
  professional: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

export default async function CustomerDisputesPage(props: { params: Promise<{ locale: string }> }) {
  unstable_noStore(); // Opt out of caching for dynamic page

  const params = await props.params;
  const t = await getTranslations({
    locale: params.locale,
    namespace: "dashboard.customer.disputes",
  });

  const user = await requireUser({ allowedRoles: ["customer"] });
  const supabase = await createSupabaseServerClient();

  // Fetch customer's disputes with booking and professional details
  const { data: disputesData, error } = await supabase
    .from("booking_disputes")
    .select(`
      id,
      booking_id,
      reason,
      description,
      status,
      resolution_notes,
      resolved_at,
      created_at,
      updated_at,
      booking:bookings (
        id,
        service_name,
        scheduled_start,
        completed_at,
        total_amount_cents,
        currency
      ),
      professional:profiles!booking_disputes_professional_id_fkey (
        full_name,
        avatar_url
      )
    `)
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[CustomerDisputes] Failed to fetch disputes:", error);
  }

  const disputes: CustomerDispute[] = (disputesData || []).map((d) => ({
    id: d.id,
    booking_id: d.booking_id,
    reason: d.reason,
    description: d.description,
    status: d.status,
    resolution_notes: d.resolution_notes,
    resolved_at: d.resolved_at,
    created_at: d.created_at,
    updated_at: d.updated_at,
    booking: d.booking as CustomerDispute["booking"],
    professional: d.professional as CustomerDispute["professional"],
  }));

  // Calculate stats
  const totalDisputes = disputes.length;
  const pendingDisputes = disputes.filter((d) => d.status === "pending").length;
  const resolvedDisputes = disputes.filter((d) => d.status === "resolved").length;
  const rejectedDisputes = disputes.filter((d) => d.status === "rejected").length;

  return (
    <section className="space-y-6">
      <div>
        <h1 className={cn("font-semibold text-3xl text-neutral-900", geistSans.className)}>
          {t("title")}
        </h1>
        <p className="mt-2 text-base text-neutral-700 leading-relaxed">{t("description")}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="text-neutral-600 text-sm">Total Disputes</p>
          <p className={cn("mt-1 font-semibold text-2xl text-neutral-900", geistSans.className)}>
            {totalDisputes}
          </p>
        </div>
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 shadow-sm">
          <p className="text-sm text-yellow-700">Under Review</p>
          <p className={cn("mt-1 font-semibold text-2xl text-yellow-800", geistSans.className)}>
            {pendingDisputes}
          </p>
        </div>
        <div className="rounded-lg border border-green-200 bg-green-50 p-6 shadow-sm">
          <p className="text-green-700 text-sm">Resolved</p>
          <p className={cn("mt-1 font-semibold text-2xl text-green-800", geistSans.className)}>
            {resolvedDisputes}
          </p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6 shadow-sm">
          <p className="text-neutral-600 text-sm">Closed</p>
          <p className={cn("mt-1 font-semibold text-2xl text-neutral-900", geistSans.className)}>
            {rejectedDisputes}
          </p>
        </div>
      </div>

      {/* Disputes List */}
      <div className="rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">
        <h2 className={cn("mb-6 font-semibold text-neutral-900 text-xl", geistSans.className)}>
          Your Disputes
        </h2>
        <CustomerDisputesList disputes={disputes} />
      </div>

      {/* Info Section */}
      <div className="rounded-lg border border-rausch-200 bg-rausch-50 p-6">
        <h3 className={cn("font-semibold text-rausch-900", geistSans.className)}>
          How Disputes Work
        </h3>
        <div className="mt-3 space-y-2 text-rausch-800 text-sm">
          <p>
            <strong>48-Hour Window:</strong> You can file a dispute up to 48 hours after your
            booking is marked complete.
          </p>
          <p>
            <strong>Review Process:</strong> Our support team reviews each dispute within 24-48
            hours and may reach out for additional information.
          </p>
          <p>
            <strong>Resolution:</strong> We work with both parties to find a fair resolution, which
            may include partial or full refunds.
          </p>
          <p>
            <strong>Need Help?</strong> Contact support at support@casaora.com for urgent issues.
          </p>
        </div>
      </div>
    </section>
  );
}
