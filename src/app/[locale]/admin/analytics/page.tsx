import { unstable_noStore } from "next/cache";
import { geistSans } from "@/app/fonts";
import { EnhancedAnalyticsDashboard } from "@/components/admin/enhanced-analytics-dashboard";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { cn } from "@/lib/utils/core";

export const metadata = {
  title: "Analytics | Admin",
  description: "Platform metrics and concierge matching insights",
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
    directHireResult,
    directHire30Result,
    directHirePaidResult,
  ] = await Promise.all([
    supabase.from("bookings").select("id", { count: "exact", head: true }),
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("status", "completed"),
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
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "customer"),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "customer")
      .gte("created_at", thirtyDaysAgo.toISOString()),
    // Direct hire metrics - all time
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("booking_type", "direct_hire"),
    // Direct hire metrics - last 30 days
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("booking_type", "direct_hire")
      .gte("created_at", thirtyDaysAgo.toISOString()),
    // Direct hire paid/completed transactions
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("booking_type", "direct_hire")
      .eq("direct_hire_fee_paid", true),
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
  const directHireTotal = directHireResult.count ?? 0;
  const directHireLast30 = directHire30Result.count ?? 0;
  const directHirePaid = directHirePaidResult.count ?? 0;

  const completionRate = totalBookings ? Math.round((completedBookings / totalBookings) * 100) : 0;
  const fillRate30 = requestsLast30 ? Math.round((completedLast30 / requestsLast30) * 100) : 0;
  const activeCoverage = totalProfessionals
    ? Math.round((activeProfessionals / totalProfessionals) * 100)
    : 0;

  // Direct hire revenue calculations (default fee: 2,000,000 COP = ~$500 USD)
  const defaultDirectHireFee = 2000000; // COP
  const directHireRevenueCOP = directHirePaid * defaultDirectHireFee;
  const directHireRevenueUSD = Math.round(directHireRevenueCOP / 4000); // ~4000 COP/USD
  const directHireConversionRate = directHireTotal
    ? Math.round((directHirePaid / directHireTotal) * 100)
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
      label: "Match Rate (30d)",
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
    {
      label: "Direct Hire (30d)",
      value: directHireLast30,
      descriptor: "Finder fees",
    },
    {
      label: "Direct Hire Revenue",
      value: `$${directHireRevenueUSD.toLocaleString()}`,
      descriptor: "Lifetime USD",
    },
    {
      label: "Direct Hire Rate",
      value: `${directHireConversionRate}%`,
      descriptor: "Conversion",
    },
  ];

  return (
    <div className="space-y-10">
      <section className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          <p
            className={cn(
              "font-semibold text-neutral-500 text-xs uppercase tracking-wider",
              geistSans.className
            )}
          >
            Concierge Operations Center
          </p>
          <div>
            <h1
              className={cn(
                "font-semibold text-3xl text-neutral-900 tracking-tight",
                geistSans.className
              )}
            >
              Platform Analytics
            </h1>
            <p className={cn("mt-1.5 text-neutral-700 text-sm", geistSans.className)}>
              Track professional network, customer requests, and matching performance without
              leaving Lia. Live data sourced directly from Supabase.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-lg border border-neutral-900 bg-neutral-900 px-4 py-1.5">
              <span
                className={cn(
                  "font-semibold text-white text-xs uppercase tracking-wide",
                  geistSans.className
                )}
              >
                Completion · {completionRate}%
              </span>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5">
              <span
                className={cn(
                  "font-semibold text-neutral-600 text-xs uppercase tracking-wide",
                  geistSans.className
                )}
              >
                Requests 30d
              </span>
              <span
                className={cn("ml-2 font-semibold text-base text-neutral-900", geistSans.className)}
              >
                {requestsLast30}
              </span>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5">
              <span
                className={cn(
                  "font-semibold text-neutral-600 text-xs uppercase tracking-wide",
                  geistSans.className
                )}
              >
                Active Pros
              </span>
              <span className={cn("ml-2 text-base text-neutral-900", geistSans.className)}>
                {activeProfessionals}
              </span>
            </div>
          </div>
        </div>
        <div className="lg:col-span-4">
          <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p
                  className={cn(
                    "font-semibold text-neutral-500 text-xs uppercase tracking-wider",
                    geistSans.className
                  )}
                >
                  Ops Snapshot
                </p>
                <p
                  className={cn("mt-1 font-semibold text-neutral-900 text-sm", geistSans.className)}
                >
                  {pendingBookings} bookings waiting
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-900">
                <span className={cn("font-semibold text-white text-xs", geistSans.className)}>
                  24h
                </span>
              </div>
            </div>
            <p className={cn("mt-3 text-neutral-600 text-sm", geistSans.className)}>
              Pending queue shows assignments awaiting professional matching by concierge team.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
                <p
                  className={cn(
                    "font-semibold text-neutral-500 text-xs uppercase tracking-wide",
                    geistSans.className
                  )}
                >
                  Match 30d
                </p>
                <p
                  className={cn(
                    "mt-1 font-semibold text-2xl text-neutral-900",
                    geistSans.className
                  )}
                >
                  {fillRate30}%
                </p>
              </div>
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
                <p
                  className={cn(
                    "font-semibold text-neutral-500 text-xs uppercase tracking-wide",
                    geistSans.className
                  )}
                >
                  New Cust
                </p>
                <p
                  className={cn(
                    "mt-1 font-semibold text-2xl text-neutral-900",
                    geistSans.className
                  )}
                >
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
              "font-semibold text-neutral-500 text-xs uppercase tracking-wider",
              geistSans.className
            )}
          >
            Headline Telemetry
          </h2>
          <p className={cn("mt-1 text-neutral-600 text-sm", geistSans.className)}>
            Lia numerics pull from Supabase counts for immediate context before diving into charts.
          </p>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {headlineMetrics.map((metric) => (
            <div
              className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm transition hover:border-orange-500"
              key={metric.label}
            >
              <p
                className={cn(
                  "font-semibold text-neutral-500 text-xs uppercase tracking-wide",
                  geistSans.className
                )}
              >
                {metric.label}
              </p>
              <p
                className={cn(
                  "mt-2 font-semibold text-4xl text-neutral-900 tracking-tight",
                  geistSans.className
                )}
              >
                {metric.value}
              </p>
              <p
                className={cn(
                  "text-neutral-500 text-xs uppercase tracking-wide",
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
        <div className="flex flex-col gap-1">
          <h2
            className={cn(
              "font-medium text-neutral-700 text-xs tracking-[0.35em]",
              geistSans.className
            )}
          >
            Pipeline Pressure
          </h2>
          <p className={cn("text-neutral-700 text-sm", geistSans.className)}>
            Ops quick-glance cards for requests, fill performance, and supply activation.
          </p>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {pipelineStats.map((stat) => (
            <div
              className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm"
              key={stat.label}
            >
              <p
                className={cn(
                  "font-medium text-neutral-700 text-xs tracking-[0.25em]",
                  geistSans.className
                )}
              >
                {stat.label}
              </p>
              <p className={cn("mt-3 text-3xl text-neutral-900", geistSans.className)}>
                {stat.value}
              </p>
              <p
                className={cn(
                  "mt-2 text-neutral-600 text-xs tracking-[0.25em]",
                  geistSans.className
                )}
              >
                {stat.descriptor}
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
                "font-medium text-neutral-600 text-xs tracking-[0.3em]",
                geistSans.className
              )}
            >
              Deep Dive Analytics
            </p>
            <p className={cn("mt-1 text-neutral-600 text-xs", geistSans.className)}>
              Trend lines, supply utilization, and category breakdowns powered by
              EnhancedAnalyticsDashboard.
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
