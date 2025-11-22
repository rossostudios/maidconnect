import {
  Alert01Icon,
  ArrowUpRight01Icon,
  ClipboardIcon,
  Shield01Icon,
  UserCheck01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { unstable_noStore } from "next/cache";
import { geistSans } from "@/app/fonts";
import { UserManagementDashboard } from "@/components/admin/user-management-dashboard";
import { Link } from "@/i18n/routing";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { cn } from "@/lib/utils";

export default async function AdminUsersPage() {
  unstable_noStore();
  await requireUser({ allowedRoles: ["admin"] });

  const supabase = await createSupabaseServerClient();

  const [
    totalUsersResult,
    adminResult,
    professionalResult,
    customerResult,
    reviewQueueResult,
    activeProsResult,
    suspendedResult,
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "admin"),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "professional"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "customer"),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "professional")
      .in("onboarding_status", ["pending_review", "application_in_review", "application_pending"]),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "professional")
      .in("onboarding_status", ["approved", "active"]),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .in("onboarding_status", ["suspended", "rejected"]),
  ]);

  const totalUsers = totalUsersResult.count ?? 0;
  const adminCount = adminResult.count ?? 0;
  const professionalCount = professionalResult.count ?? 0;
  const customerCount = customerResult.count ?? 0;
  const reviewQueueCount = reviewQueueResult.count ?? 0;
  const activeProfessionalCount = activeProsResult.count ?? 0;
  const flaggedCount = suspendedResult.count ?? 0;

  const approvalRate = professionalCount
    ? Math.round((activeProfessionalCount / professionalCount) * 100)
    : 0;

  const metrics = [
    {
      label: "Total Accounts",
      value: totalUsers,
      description: "Profiles across all roles",
    },
    {
      label: "Professionals",
      value: professionalCount,
      description: "Vetted service providers",
    },
    {
      label: "Customers",
      value: customerCount,
      description: "Concierge clients",
    },
    {
      label: "Admins",
      value: adminCount,
      description: "Casaora employees",
    },
    {
      label: "Active Pros",
      value: activeProfessionalCount,
      description: "Approved + active",
    },
    {
      label: "Review Queue",
      value: reviewQueueCount,
      description: "Applications waiting",
    },
  ];

  const oversightPanels = [
    {
      label: "Application Queue",
      value: reviewQueueCount,
      description: "Pro files in pre-approval",
      icon: ClipboardIcon,
      href: "/admin/users?role=professional&status=pending_review",
    },
    {
      label: "Active Coverage",
      value: `${approvalRate}%`,
      description: "Share of pros cleared",
      icon: UserCheck01Icon,
      href: "/admin/users?role=professional",
    },
    {
      label: "Risk + Suspensions",
      value: flaggedCount,
      description: "Accounts under restriction",
      icon: Shield01Icon,
      href: "/admin/users?status=suspended",
    },
  ];

  return (
    <div className="space-y-10">
      <section className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          <p
            className={cn(
              "font-medium text-neutral-700 text-xs uppercase tracking-wide",
              geistSans.className
            )}
          >
            User Management
          </p>
          <div>
            <h1
              className={cn(
                "font-semibold text-3xl text-neutral-900 tracking-tight",
                geistSans.className
              )}
            >
              User Directory
            </h1>
            <p className={cn("mt-1.5 text-neutral-700 text-sm", geistSans.className)}>
              Monitor every account, see review queues, and launch disciplinary workflows.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-lg border border-orange-500 bg-orange-500 px-4 py-2 shadow-sm">
              <span
                className={cn(
                  "font-medium text-white text-xs uppercase tracking-wide",
                  geistSans.className
                )}
              >
                Approval Rate · {approvalRate}%
              </span>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2">
              <span
                className={cn(
                  "font-medium text-neutral-600 text-xs uppercase tracking-wide",
                  geistSans.className
                )}
              >
                Queue Load
              </span>
              <span
                className={cn("ml-2 font-semibold text-base text-neutral-900", geistSans.className)}
              >
                {reviewQueueCount}
              </span>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2">
              <span
                className={cn(
                  "font-medium text-neutral-600 text-xs uppercase tracking-wide",
                  geistSans.className
                )}
              >
                Admin Surface
              </span>
              <span
                className={cn("ml-2 font-semibold text-base text-neutral-900", geistSans.className)}
              >
                {adminCount}
              </span>
            </div>
          </div>
        </div>
        <div className="lg:col-span-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p
                  className={cn(
                    "font-medium text-neutral-700 text-xs uppercase tracking-wide",
                    geistSans.className
                  )}
                >
                  Security & Compliance
                </p>
                <p
                  className={cn("mt-1 font-semibold text-neutral-900 text-sm", geistSans.className)}
                >
                  Suspensions + AML Flags
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-orange-100 bg-orange-50">
                <HugeiconsIcon className="h-6 w-6 text-orange-600" icon={Alert01Icon} />
              </div>
            </div>
            <p className={cn("mt-3 text-neutral-700 text-sm", geistSans.className)}>
              {flaggedCount} account{flaggedCount === 1 ? "" : "s"} under investigation. Escalate
              from here for compliance review.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <Link
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-lg border border-orange-500 bg-orange-500 px-4 py-2.5 font-medium text-sm text-white transition hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2",
                  geistSans.className
                )}
                href="/admin/users?status=suspended"
              >
                <HugeiconsIcon className="h-4 w-4" icon={Shield01Icon} />
                Review Suspensions
              </Link>
              <a
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 font-medium text-neutral-900 text-sm transition hover:border-neutral-300 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2",
                  geistSans.className
                )}
                href="#directory"
              >
                <HugeiconsIcon className="h-4 w-4" icon={UserGroupIcon} />
                Jump to Directory
              </a>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div>
          <h2
            className={cn(
              "font-medium text-neutral-700 text-xs uppercase tracking-wide",
              geistSans.className
            )}
          >
            User Statistics
          </h2>
          <p className={cn("mt-1 text-neutral-700 text-sm", geistSans.className)}>
            Real-time population metrics.
          </p>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {metrics.map((metric) => (
            <div
              className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm transition hover:shadow-md"
              key={metric.label}
            >
              <p
                className={cn(
                  "font-medium text-neutral-700 text-xs uppercase tracking-wide",
                  geistSans.className
                )}
              >
                {metric.label}
              </p>
              <p
                className={cn(
                  "mt-2 font-semibold text-3xl text-neutral-900 tracking-tight",
                  geistSans.className
                )}
              >
                {metric.value}
              </p>
              <p className={cn("mt-2 text-neutral-600 text-xs", geistSans.className)}>
                {metric.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex flex-col gap-1">
          <h2
            className={cn(
              "font-medium text-neutral-700 text-xs uppercase tracking-wide",
              geistSans.className
            )}
          >
            Quick Actions
          </h2>
          <p className={cn("text-neutral-700 text-sm", geistSans.className)}>
            Shortcut cards for common operations flows.
          </p>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {oversightPanels.map((panel) => (
            <Link
              className="group flex flex-col rounded-lg border border-neutral-200 bg-white p-6 shadow-sm transition hover:border-orange-200 hover:shadow-md"
              href={panel.href}
              key={panel.label}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p
                    className={cn(
                      "font-medium text-neutral-700 text-xs uppercase tracking-wide",
                      geistSans.className
                    )}
                  >
                    {panel.label}
                  </p>
                  <p className={cn("mt-1 text-neutral-700 text-sm", geistSans.className)}>
                    {panel.description}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-orange-100 bg-orange-50">
                  <HugeiconsIcon className="h-5 w-5 text-orange-600" icon={panel.icon} />
                </div>
              </div>
              <div className="mt-6 flex items-end justify-between">
                <p className={cn("font-semibold text-4xl text-neutral-900", geistSans.className)}>
                  {panel.value}
                </p>
                <HugeiconsIcon
                  className="h-4 w-4 text-neutral-400 transition group-hover:text-orange-500"
                  icon={ArrowUpRight01Icon}
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section id="directory">
        <div className="rounded-lg border border-neutral-200 bg-white">
          <div className="rounded-t-lg border-neutral-200 border-b bg-neutral-50 px-6 py-4">
            <p
              className={cn(
                "font-medium text-neutral-600 text-xs uppercase tracking-wide",
                geistSans.className
              )}
            >
              User Directory
            </p>
            <p className={cn("mt-1 text-neutral-600 text-xs", geistSans.className)}>
              Search, filter, and manage user accounts.
            </p>
          </div>
          <div className="p-1">
            <UserManagementDashboard />
          </div>
        </div>
      </section>
    </div>
  );
}
