import { unstable_noStore } from "next/cache";
import { geistMono, geistSans } from "@/app/fonts";
import { EnhancedAnalyticsDashboard } from "@/components/admin/enhanced-analytics-dashboard";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Analytics | Admin",
  description: "Platform metrics and liquidity insights",
};

export default async function AdminAnalyticsPage() {
  unstable_noStore();
  await requireUser({ allowedRoles: ["admin"] });

  const supabase = await createSupabaseServerClient();
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalBookingsResult,
    completedBookingsResult,
    pendingBookingsResult,
    requests30Result,
    completed30Result,
    totalProsResult,
    activeProsResult,
    totalCustomersResult,
    newCustomersResult,
  ] = await Promise.all([
    supabase.from("bookings").select("id", { count: "exact", head: true }),
    supabase.from("bookings").select("id", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("bookings").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo.toISOString()),
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("status", "completed")
      .gte("created_at", thirtyDaysAgo.toISOString()),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "professional"),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "professional")
      .in("onboarding_status", ["approved", "active"]),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "customer"),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "customer")
      .gte("created_at", thirtyDaysAgo.toISOString()),
  ]);

  const totalBookings = totalBookingsResult.count ?? 0;
  const completedBookings = completedBookingsResult.count ?? 0;
  const pendingBookings = pendingBookingsResult.count ?? 0;
  const requestsLast30 = requests30Result.count ?? 0;
  const completedLast30 = completed30Result.count ?? 0;
  const totalProfessionals = totalProsResult.count ?? 0;
  const activeProfessionals = activeProsResult.count ?? 0;
  const totalCustomers = totalCustomersResult.count ?? 0;
  const newCustomers = newCustomersResult.count ?? 0;

  const completionRate = totalBookings
    ? Math.round((completedBookings / totalBookings) * 100)
    : 0;
  const fillRate30 = requestsLast30 ? Math.round((completedLast30 / requestsLast30) * 100) : 0;
  const activeCoverage = totalProfessionals
    ? Math.round((activeProfessionals / totalProfessionals) * 100)
    : 0;

  const headlineMetrics = [
    {
      label: "Total Bookings",
      value: totalBookings,
      descriptor: "Lifetime platform requests",
    },
    {
      label: "Completion Rate",
      value: `${completionRate}%`,
      descriptor: "All-time",
    },
    {
      label: "Active Pros",
      value: activeProfessionals,
      descriptor: "Approved supply",
    },
    {
      label: "Customers",
      value: totalCustomers,
      descriptor: "Accounts",
    },
  ];

  const pipelineStats = [
    {
      label: "Requests (30d)",
      value: requestsLast30,
      descriptor: "New opportunities",
    },
    {
      label: "Fill Rate (30d)",
      value: `${fillRate30}%`,
      descriptor: "Completion velocity",
    },
    {
      label: "Pending Queue",
      value: pendingBookings,
      descriptor: "Awaiting ops",
    },
    {
      label: "New Customers",
      value: newCustomers,
      descriptor: "Past 30 days",
    },
    {
      label: "Active Coverage",
      value: `${activeCoverage}%`,
      descriptor: "Pros cleared",
    },
  ];

  return (
    <div className="space-y-10">
      <section className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          <p
            className={cn(
              "font-semibold text-[11px] uppercase tracking-[0.35em] text-neutral-700",
              geistSans.className
            )}
          >
            Liquidity Command Center
          </p>
          <div>
            <h1
              className={cn(
                "font-semibold text-3xl text-neutral-900 uppercase tracking-tight",
                geistSans.className
              )}
            >
              Platform Analytics
            </h1>
            <p className={cn("mt-1.5 text-sm text-neutral-700", geistSans.className)}>
              Track supply, demand, and conversion velocity without leaving Lia. Live data sourced
              directly from Supabase.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="border border-neutral-900 bg-neutral-900 px-4 py-1.5">
              <span
                className={cn(
                  "text-[10px] font-semibold uppercase tracking-[0.3em] text-white",
                  geistSans.className
                )}
              >
                Completion · {completionRate}%
              </span>
            </div>
            <div className="border border-neutral-200 bg-white px-3 py-1.5">
              <span
                className={cn(
                  "text-[10px] font-semibold uppercase tracking-[0.3em] text-neutral-600",
                  geistSans.className
                )}
              >
                Requests 30d
              </span>
              <span className={cn("ml-2 text-base text-neutral-900", geistMono.className)}>
                {requestsLast30}
              </span>
            </div>
            <div className="border border-neutral-200 bg-white px-3 py-1.5">
              <span
                className={cn(
                  "text-[10px] font-semibold uppercase tracking-[0.3em] text-neutral-600",
                  geistSans.className
                )}
              >
                Active Pros
              </span>
              <span className={cn("ml-2 text-base text-neutral-900", geistMono.className)}>
                {activeProfessionals}
              </span>
            </div>
          </div>
        </div>
        <div className="lg:col-span-4">
          <div className="border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p
                  className={cn(
                    "text-[11px] font-semibold uppercase tracking-[0.3em] text-neutral-700",
                    geistSans.className
                  )}
                >
                  Ops Snapshot
                </p>
                <p className={cn("mt-1 text-sm text-neutral-900", geistSans.className)}>
                  {pendingBookings} bookings waiting
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center border border-neutral-200 bg-neutral-900">
                <span className={cn("text-xs font-semibold text-white", geistSans.className)}>
                  24h
                </span>
              </div>
            </div>
            <p className={cn("mt-3 text-sm text-neutral-700", geistSans.className)}>
              Pending queue shows how much inventory ops must clear to keep fill rates healthy.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="border border-neutral-200 bg-neutral-50 px-3 py-2">
                <p className={cn("text-[10px] uppercase tracking-[0.3em] text-neutral-600", geistSans.className)}>
                  Fill 30d
                </p>
                <p className={cn("mt-1 text-2xl text-neutral-900", geistMono.className)}>
                  {fillRate30}%
                </p>
              </div>
              <div className="border border-neutral-200 bg-neutral-50 px-3 py-2">
                <p className={cn("text-[10px] uppercase tracking-[0.3em] text-neutral-600", geistSans.className)}>
                  New Cust
                </p>
                <p className={cn("mt-1 text-2xl text-neutral-900", geistMono.className)}>
                  {newCustomers}
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
              "font-semibold text-[11px] uppercase tracking-[0.35em] text-neutral-700",
              geistSans.className
            )}
          >
            Headline Telemetry
          </h2>
          <p className={cn("mt-1 text-sm text-neutral-700", geistSans.className)}>
            Lia numerics pull from Supabase counts for immediate context before diving into charts.
          </p>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {headlineMetrics.map((metric) => (
            <div
              className="border border-neutral-200 bg-white p-4 shadow-sm transition hover:border-[#FF5200]"
              key={metric.label}
            >
              <p
                className={cn(
                  "text-[11px] font-semibold uppercase tracking-[0.25em] text-neutral-700",
                  geistSans.className
                )}
              >
                {metric.label}
              </p>
              <p
                className={cn(
                  "mt-2 text-4xl text-neutral-900 tracking-tight",
                  geistMono.className
                )}
              >
                {metric.value}
              </p>
              <p className={cn("mt-2 text-[10px] uppercase tracking-[0.25em] text-neutral-600", geistSans.className)}>
                {metric.descriptor}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex flex-col gap-1">
          <h2
            className={cn(
              "font-semibold text-[11px] uppercase tracking-[0.35em] text-neutral-700",
              geistSans.className
            )}
          >
            Pipeline Pressure
          </h2>
          <p className={cn("text-sm text-neutral-700", geistSans.className)}>
            Ops quick-glance cards for requests, fill performance, and supply activation.
          </p>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {pipelineStats.map((stat) => (
            <div className="border border-neutral-200 bg-white p-4 shadow-sm" key={stat.label}>
              <p
                className={cn(
                  "text-[11px] font-semibold uppercase tracking-[0.25em] text-neutral-700",
                  geistSans.className
                )}
              >
                {stat.label}
              </p>
              <p className={cn("mt-3 text-3xl text-neutral-900", geistMono.className)}>{stat.value}</p>
              <p className={cn("mt-2 text-[10px] uppercase tracking-[0.25em] text-neutral-600", geistSans.className)}>
                {stat.descriptor}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="border border-neutral-200 bg-white">
          <div className="border-b border-neutral-200 bg-neutral-50 px-6 py-4">
            <p
              className={cn(
                "font-semibold text-[11px] uppercase tracking-[0.3em] text-neutral-600",
                geistSans.className
              )}
            >
              Deep Dive Analytics
            </p>
            <p className={cn("mt-1 text-xs text-neutral-600", geistSans.className)}>
              Trend lines, supply utilization, and category breakdowns powered by EnhancedAnalyticsDashboard.
            </p>
          </div>
          <div className="p-1">
            <EnhancedAnalyticsDashboard />
          </div>
        </div>
      </section>
    </div>
  );
}
