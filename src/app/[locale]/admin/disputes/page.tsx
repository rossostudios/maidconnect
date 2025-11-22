import { unstable_noStore } from "next/cache";
import { geistSans } from "@/app/fonts";
import { DisputeResolutionDashboard } from "@/components/admin/dispute-resolution-dashboard";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { cn } from "@/lib/utils";

export default async function AdminDisputesPage() {
  unstable_noStore();
  await requireUser({ allowedRoles: ["admin"] });

  const supabase = await createSupabaseServerClient();
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const seventyTwoHoursAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000);

  const [
    totalResult,
    openResult,
    investigatingResult,
    resolvedResult,
    closedResult,
    urgentResult,
    unassignedResult,
    resolved30Result,
    agingResult,
    refundExposureResult,
  ] = await Promise.all([
    supabase.from("disputes").select("id", { count: "exact", head: true }),
    supabase.from("disputes").select("id", { count: "exact", head: true }).eq("status", "open"),
    supabase
      .from("disputes")
      .select("id", { count: "exact", head: true })
      .eq("status", "investigating"),
    supabase.from("disputes").select("id", { count: "exact", head: true }).eq("status", "resolved"),
    supabase.from("disputes").select("id", { count: "exact", head: true }).eq("status", "closed"),
    supabase
      .from("disputes")
      .select("id", { count: "exact", head: true })
      .in("priority", ["urgent", "high"]),
    supabase
      .from("disputes")
      .select("id", { count: "exact", head: true })
      .is("assigned_to", null)
      .not("status", "in", "(resolved,closed)"),
    supabase
      .from("disputes")
      .select("id", { count: "exact", head: true })
      .eq("status", "resolved")
      .gte("resolved_at", thirtyDaysAgo.toISOString()),
    supabase
      .from("disputes")
      .select("id", { count: "exact", head: true })
      .eq("status", "open")
      .lt("created_at", seventyTwoHoursAgo.toISOString()),
    supabase
      .from("disputes")
      .select("refund_amount")
      .gt("refund_amount", 0)
      .not("status", "in", "(resolved,closed)"),
  ]);

  const totalDisputes = totalResult.count ?? 0;
  const openDisputes = openResult.count ?? 0;
  const investigatingDisputes = investigatingResult.count ?? 0;
  const resolvedDisputes = resolvedResult.count ?? 0;
  const closedDisputes = closedResult.count ?? 0;
  const urgentDisputes = urgentResult.count ?? 0;
  const unassignedDisputes = unassignedResult.count ?? 0;
  const resolvedLast30 = resolved30Result.count ?? 0;
  const agingDisputes = agingResult.count ?? 0;
  const refundExposure = (refundExposureResult.data || []).reduce(
    (sum, row) => sum + (row.refund_amount ?? 0),
    0
  );

  const statusBreakdown = [
    { label: "Open", value: openDisputes },
    { label: "Investigating", value: investigatingDisputes },
    { label: "Resolved", value: resolvedDisputes },
    { label: "Closed", value: closedDisputes },
  ];

  const summaryCards = [
    {
      label: "Total Cases",
      value: totalDisputes,
      descriptor: "All time",
    },
    {
      label: "Open Cases",
      value: openDisputes,
      descriptor: "Need action",
    },
    {
      label: "Investigating",
      value: investigatingDisputes,
      descriptor: "On analyst desk",
    },
    {
      label: "Resolved 30d",
      value: resolvedLast30,
      descriptor: "Closed last month",
    },
  ];

  const currencyFormatter = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

  const queueInsights = [
    { label: "Urgent Queue", value: urgentDisputes, descriptor: "Priority urgent/high" },
    { label: "Unassigned", value: unassignedDisputes, descriptor: "Need owner" },
    { label: "Aging >72h", value: agingDisputes, descriptor: "Watch SLA" },
    {
      label: "Refund Exposure",
      value: currencyFormatter.format(refundExposure || 0),
      descriptor: "Pending payouts",
    },
  ];

  return (
    <div className="space-y-10">
      <section className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          <p
            className={cn(
              "font-semibold text-neutral-700 text-xs uppercase tracking-wide",
              geistSans.className
            )}
          >
            Resolution Command Center
          </p>
          <div>
            <h1
              className={cn(
                "font-semibold text-3xl text-neutral-900 uppercase tracking-tight",
                geistSans.className
              )}
            >
              Dispute Resolution
            </h1>
            <p className={cn("mt-1.5 text-neutral-700 text-sm", geistSans.className)}>
              Lia view of every dispute, prioritised by risk and SLA. Built for rapid triage.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {statusBreakdown.map((status) => (
              <div
                className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5"
                key={status.label}
              >
                <span
                  className={cn(
                    "font-semibold text-neutral-600 text-xs uppercase tracking-wide",
                    geistSans.className
                  )}
                >
                  {status.label}
                </span>
                <span className={cn("ml-2 text-base text-neutral-900", geistSans.className)}>
                  {status.value}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-4">
          <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p
                  className={cn(
                    "font-semibold text-neutral-700 text-xs uppercase tracking-wide",
                    geistSans.className
                  )}
                >
                  SLA Pulse
                </p>
                <p className={cn("mt-1 text-neutral-900 text-sm", geistSans.className)}>
                  {agingDisputes} cases aging
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-orange-100 bg-orange-50">
                <span className={cn("font-semibold text-orange-600 text-xs", geistSans.className)}>
                  72h
                </span>
              </div>
            </div>
            <p className={cn("mt-3 text-neutral-700 text-sm", geistSans.className)}>
              Monitor disputes breaching the 72h promise. Escalate from here before they turn into
              chargebacks.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
                <p
                  className={cn(
                    "text-neutral-600 text-xs uppercase tracking-wide",
                    geistSans.className
                  )}
                >
                  Urgent
                </p>
                <p className={cn("mt-1 text-2xl text-neutral-900", geistSans.className)}>
                  {urgentDisputes}
                </p>
              </div>
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
                <p
                  className={cn(
                    "text-neutral-600 text-xs uppercase tracking-wide",
                    geistSans.className
                  )}
                >
                  Refund Exposure
                </p>
                <p className={cn("mt-1 text-lg text-neutral-900", geistSans.className)}>
                  {currencyFormatter.format(refundExposure || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div>
          <h2
            className={cn(
              "font-semibold text-neutral-700 text-xs uppercase tracking-wide",
              geistSans.className
            )}
          >
            Queue Telemetry
          </h2>
          <p className={cn("mt-1 text-neutral-700 text-sm", geistSans.className)}>
            High-level counts for ops leads to act instantly.
          </p>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {summaryCards.map((metric) => (
            <div
              className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm transition hover:border-orange-500"
              key={metric.label}
            >
              <p
                className={cn(
                  "font-semibold text-neutral-700 text-xs uppercase tracking-wide",
                  geistSans.className
                )}
              >
                {metric.label}
              </p>
              <p className={cn("mt-3 text-4xl text-neutral-900", geistSans.className)}>
                {metric.value}
              </p>
              <p
                className={cn(
                  "mt-2 text-neutral-600 text-xs uppercase tracking-wide",
                  geistSans.className
                )}
              >
                {metric.descriptor}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div>
          <h2
            className={cn(
              "font-semibold text-neutral-700 text-xs uppercase tracking-wide",
              geistSans.className
            )}
          >
            Ops Alerts
          </h2>
          <p className={cn("mt-1 text-neutral-700 text-sm", geistSans.className)}>
            Urgent queues and financial exposure at a glance.
          </p>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {queueInsights.map((insight) => (
            <div
              className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm"
              key={insight.label}
            >
              <p
                className={cn(
                  "font-semibold text-neutral-700 text-xs uppercase tracking-wide",
                  geistSans.className
                )}
              >
                {insight.label}
              </p>
              <p className={cn("mt-3 text-3xl text-neutral-900", geistSans.className)}>
                {insight.value}
              </p>
              <p
                className={cn(
                  "mt-2 text-neutral-600 text-xs uppercase tracking-wide",
                  geistSans.className
                )}
              >
                {insight.descriptor}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="rounded-lg border border-neutral-200 bg-white">
          <div className="rounded-t-lg border-neutral-200 border-b bg-neutral-50 px-6 py-4">
            <p
              className={cn(
                "font-semibold text-neutral-600 text-xs uppercase tracking-wide",
                geistSans.className
              )}
            >
              Casework
            </p>
            <p className={cn("mt-1 text-neutral-600 text-xs", geistSans.className)}>
              Filter, assign, and resolve disputes using the Lia Precision Table.
            </p>
          </div>
          <div className="p-1">
            <DisputeResolutionDashboard />
          </div>
        </div>
      </section>
    </div>
  );
}
