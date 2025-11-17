import { Calendar03Icon, MoneyBag02Icon, RulerIcon, Shield01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { unstable_noStore } from "next/cache";
import { geistMono, geistSans } from "@/app/fonts";
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

  const rules = pricingRules ?? [];
  const now = new Date();

  const activeRules = rules.filter((rule) => rule.is_active ?? true);
  const upcomingRules = rules
    .filter((rule) => new Date(rule.effective_from) > now)
    .sort((a, b) => new Date(a.effective_from).getTime() - new Date(b.effective_from).getTime());
  const coverageCities = new Set(rules.filter((rule) => rule.city).map((rule) => rule.city))
    .size;
  const serviceCategories = new Set(
    rules.filter((rule) => rule.service_category).map((rule) => rule.service_category)
  ).size;
  const depositPrograms = rules.filter((rule) => (rule.deposit_percentage ?? 0) > 0).length;
  const cancellationPolicies = rules.filter(
    (rule) => (rule.late_cancel_fee_percentage ?? 0) > 0
  ).length;
  const avgCommission = rules.length
    ? Math.round((rules.reduce((sum, rule) => sum + rule.commission_rate, 0) / rules.length) * 100)
    : 0;

  const backgroundFees = rules
    .map((rule) => rule.background_check_fee_cop)
    .filter((fee): fee is number => typeof fee === "number" && fee > 0);
  const maxBackgroundFee = backgroundFees.length ? Math.max(...backgroundFees) : null;
  const minBackgroundFee = backgroundFees.length ? Math.min(...backgroundFees) : null;

  const coverageMetrics = [
    {
      label: "Ratebook Entries",
      value: rules.length,
      description: "All pricing rules",
    },
    {
      label: "Active Schedules",
      value: activeRules.length,
      description: "Live + billable",
    },
    {
      label: "Cities Covered",
      value: coverageCities,
      description: "Local pricing scopes",
    },
    {
      label: "Service Categories",
      value: serviceCategories,
      description: "Verticals configured",
    },
    {
      label: "Deposit Programs",
      value: depositPrograms,
      description: "Require upfront COP",
    },
    {
      label: "Cancel Policies",
      value: cancellationPolicies,
      description: "Late fee schedules",
    },
  ];

  const currencyFormatter = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
  const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

  const timeline = (upcomingRules.length > 0 ? upcomingRules : rules)
    .slice(0, 4)
    .map((rule) => ({
      id: rule.id,
      title: `${rule.service_category ?? "All services"} · ${rule.city ?? "All cities"}`,
      effectiveFrom: rule.effective_from,
      commission: `${(rule.commission_rate * 100).toFixed(1)}%`,
      isActive: rule.is_active,
    }));

  return (
    <div className="space-y-10">
      <section className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          <p
            className={cn(
              "font-semibold text-[11px] uppercase tracking-[0.35em] text-neutral-500",
              geistSans.className
            )}
          >
            Rate Command Center
          </p>
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
                "mt-1.5 text-sm text-neutral-700 tracking-wide",
                geistSans.className
              )}
            >
              House rules for commission, price floors, deposits, and cancellation logic—mirroring
              what ops enforces in Sanity.
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
                Avg Commission · {avgCommission}%
              </span>
            </div>
            {minBackgroundFee !== null && maxBackgroundFee !== null && (
              <div className="border border-neutral-200 bg-white px-3 py-1.5">
                <span
                  className={cn(
                    "text-[10px] font-semibold uppercase tracking-[0.3em] text-neutral-600",
                    geistSans.className
                  )}
                >
                  Background Fee Band
                </span>
                <span className={cn("ml-2 text-base text-neutral-900", geistMono.className)}>
                  {currencyFormatter.format(minBackgroundFee)} - {currencyFormatter.format(maxBackgroundFee)}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="lg:col-span-4">
          <div className="border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p
                  className={cn(
                    "text-[11px] font-semibold uppercase tracking-[0.3em] text-neutral-500",
                    geistSans.className
                  )}
                >
                  Ratebook Access
                </p>
                <p className={cn("mt-1 text-sm text-neutral-900", geistSans.className)}>
                  {activeRules.length} active schedules
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center border border-neutral-200 bg-neutral-900">
                <HugeiconsIcon className="h-6 w-6 text-white" icon={MoneyBag02Icon} />
              </div>
            </div>
            <p className={cn("mt-3 text-sm text-neutral-700", geistSans.className)}>
              Keep deposits, cancellation penalties, and commission curves in sync with ops.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <a
                className={cn(
                  "inline-flex items-center justify-center gap-2 border border-neutral-900 bg-neutral-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5200] focus-visible:ring-offset-2",
                  geistSans.className
                )}
                href="#ratebook"
              >
                <HugeiconsIcon className="h-4 w-4" icon={RulerIcon} />
                Edit Ratebook
              </a>
              <div className="flex items-center gap-3 border border-neutral-200 bg-neutral-50 px-4 py-2">
                <HugeiconsIcon className="h-5 w-5 text-neutral-600" icon={Shield01Icon} />
                <p className={cn("text-xs uppercase tracking-[0.3em] text-neutral-600", geistSans.className)}>
                  Compliance synced to payouts
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
              "font-semibold text-[11px] uppercase tracking-[0.35em] text-neutral-500",
              geistSans.className
            )}
          >
            Coverage Metrics
          </h2>
          <p className={cn("mt-1 text-sm text-neutral-700", geistSans.className)}>
            Lia numerics for ops and finance to trust instantly.
          </p>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {coverageMetrics.map((metric) => (
            <div
              className="border border-neutral-200 bg-white p-4 shadow-sm transition hover:border-[#FF5200]"
              key={metric.label}
            >
              <p
                className={cn(
                  "text-[11px] font-semibold uppercase tracking-[0.25em] text-neutral-500",
                  geistSans.className
                )}
              >
                {metric.label}
              </p>
              <p
                className={cn(
                  "mt-2 text-3xl text-neutral-900 tracking-tight",
                  geistMono.className
                )}
              >
                {metric.value}
              </p>
              <p
                className={cn(
                  "mt-2 text-[10px] uppercase tracking-[0.25em] text-neutral-600",
                  geistSans.className
                )}
              >
                {metric.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="border border-neutral-200 bg-white">
              <div className="border-b border-neutral-200 bg-neutral-50 px-6 py-4">
                <p
                  className={cn(
                    "font-semibold text-[11px] uppercase tracking-[0.3em] text-neutral-600",
                    geistSans.className
                  )}
                >
                  Revision Timeline
                </p>
                <p className={cn("mt-1 text-xs text-neutral-600", geistSans.className)}>
                  Next launches + recent activity
                </p>
              </div>
              <div className="divide-y divide-neutral-100">
                {timeline.length > 0 ? (
                  timeline.map((entry) => (
                    <div className="flex items-center gap-3 px-6 py-4" key={entry.id}>
                      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center border border-neutral-200 bg-white">
                        <HugeiconsIcon className="h-5 w-5 text-neutral-900" icon={Calendar03Icon} />
                      </div>
                      <div className="flex-1">
                        <p className={cn("text-sm font-medium text-neutral-900", geistSans.className)}>
                          {entry.title}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-neutral-600">
                          <span>{dateFormatter.format(new Date(entry.effectiveFrom))}</span>
                          <span>•</span>
                          <span>{entry.commission}</span>
                          <span>•</span>
                          <span>{entry.isActive ? "Active" : "Pending"}</span>
                        </div>
                      </div>
                      <HugeiconsIcon
                        className="h-4 w-4 text-neutral-500"
                        icon={entry.isActive ? Shield01Icon : MoneyBag02Icon}
                      />
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-8 text-center">
                    <p className={cn("text-sm text-neutral-600", geistSans.className)}>
                      No pricing activity yet. Create your first rule below.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="lg:col-span-7">
            <section id="ratebook" className="border border-neutral-200 bg-white">
              <div className="border-b border-neutral-200 bg-neutral-50 px-6 py-4">
                <p
                  className={cn(
                    "font-semibold text-[11px] uppercase tracking-[0.3em] text-neutral-600",
                    geistSans.className
                  )}
                >
                  Ratebook Controls
                </p>
                <p className={cn("mt-1 text-xs text-neutral-600", geistSans.className)}>
                  Update rules directly in Lia; changes sync instantly.
                </p>
              </div>
              <div className="p-1">
                <PricingControlsManager initialRules={rules} />
              </div>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
