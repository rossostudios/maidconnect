"use client";

import {
  AlertCircleIcon,
  CheckmarkCircle02Icon,
  FilterIcon,
  SecurityCheckIcon,
  TimeScheduleIcon,
  UserAccountIcon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import dynamic from "next/dynamic";
import { type ReactNode, useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusCard, StatusCardGrid } from "@/components/ui/status-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { BackgroundCheckResult } from "@/lib/background-checks/types";

// Dynamic import for modal (lazy load on demand)
const CheckDetailModal = dynamic(() => import("./CheckDetail").then((mod) => mod.CheckDetail), {
  ssr: false,
});

type BackgroundCheckWithProfile = BackgroundCheckResult & {
  professional: {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    city: string | null;
    country: string | null;
  };
  daysWaiting: number;
};

type CheckDashboardData = {
  checks: BackgroundCheckWithProfile[];
  grouped: {
    pending: BackgroundCheckWithProfile[];
    clear: BackgroundCheckWithProfile[];
    consider: BackgroundCheckWithProfile[];
    suspended: BackgroundCheckWithProfile[];
  };
  counts: {
    pending: number;
    clear: number;
    consider: number;
    suspended: number;
    total: number;
  };
};

type SortOption = "waiting_time" | "recent" | "provider";
type CheckTabValue = keyof CheckDashboardData["grouped"];

const CHECK_TABS: { label: string; value: CheckTabValue }[] = [
  { label: "Pending", value: "pending" },
  { label: "Consider", value: "consider" },
  { label: "Clear", value: "clear" },
  { label: "Suspended", value: "suspended" },
];

export function CheckDashboard() {
  const [data, setData] = useState<CheckDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCheck, setSelectedCheck] = useState<BackgroundCheckWithProfile | null>(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [sortBy, setSortBy] = useState<SortOption>("waiting_time");

  const fetchChecks = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/background-checks");

      if (!response.ok) {
        throw new Error("Failed to load background checks");
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load checks");
    } finally {
      setLoading(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: fetchChecks is intentionally excluded to prevent infinite re-renders
  useEffect(() => {
    fetchChecks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReviewComplete = () => {
    setSelectedCheck(null);
    fetchChecks(); // Refresh the checks
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              className="h-48 animate-pulse border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
              key={i}
            />
          ))}
        </div>
        <div className="h-96 animate-pulse border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
        <CardContent className="p-8 text-center">
          <p className="mb-4 text-neutral-800 text-sm dark:text-neutral-300">{error}</p>
          <button
            className="bg-neutral-900 px-6 py-3 font-semibold text-sm text-white transition-colors hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-200"
            onClick={fetchChecks}
            type="button"
          >
            Retry
          </button>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  // Sort checks based on selected option
  const sortChecks = (checks: BackgroundCheckWithProfile[]) => {
    const sorted = [...checks];
    switch (sortBy) {
      case "waiting_time":
        return sorted.sort((a, b) => b.daysWaiting - a.daysWaiting);
      case "recent":
        return sorted.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "provider":
        return sorted.sort((a, b) => a.provider.localeCompare(b.provider));
      default:
        return sorted;
    }
  };

  // Prepare chart data
  const chartData = [
    {
      name: "Pending",
      count: data.counts.pending,
      color: "neutral-500",
    },
    {
      name: "Clear",
      count: data.counts.clear,
      color: "neutral-500",
    },
    {
      name: "Consider",
      count: data.counts.consider,
      color: "neutral-500",
    },
    {
      name: "Suspended",
      count: data.counts.suspended,
      color: "neutral-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Summary Cards - Following 8px Grid Design System */}
      <StatusCardGrid className="md:grid-cols-4">
        {/* Pending Card */}
        <StatusCard
          description="Awaiting results"
          icon={TimeScheduleIcon}
          title="PENDING"
          value={data.counts.pending}
          variant="pending"
        />

        {/* Clear Card */}
        <StatusCard
          description="No issues found"
          icon={CheckmarkCircle02Icon}
          title="CLEAR"
          value={data.counts.clear}
          variant="approved"
        />

        {/* Consider Card */}
        <StatusCard
          description="Manual review needed"
          icon={AlertCircleIcon}
          title="CONSIDER"
          value={data.counts.consider}
          variant="warning"
        />

        {/* Suspended Card */}
        <StatusCard
          description="Failed verification"
          icon={SecurityCheckIcon}
          title="SUSPENDED"
          value={data.counts.suspended}
          variant="error"
        />
      </StatusCardGrid>

      {/* Check Distribution Chart */}
      <Card className="border-neutral-200 bg-white transition-shadow hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-950">
        <CardHeader className="flex flex-row items-center justify-between pb-6">
          <div>
            <p className="mb-1 font-semibold text-neutral-600 text-xs uppercase tracking-wider dark:text-neutral-400">
              Check Distribution
            </p>
            <p className="text-neutral-600 text-sm dark:text-neutral-400">
              Background checks by status
            </p>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-64">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={chartData}>
                <CartesianGrid stroke="neutral-200" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  axisLine={false}
                  dataKey="name"
                  fontSize={12}
                  stroke="neutral-400"
                  tickLine={false}
                />
                <YAxis axisLine={false} fontSize={12} stroke="neutral-400" tickLine={false} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell fill={entry.color} key={`cell-${index}`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Tabs & Filter */}
      <Tabs className="w-full" onValueChange={setActiveTab} value={activeTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            {CHECK_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
                {data.counts[tab.value] > 0 && (
                  <span className="rounded-full ml-2 inline-flex items-center justify-center bg-neutral-900 px-2 py-0.5 font-semibold text-white text-xs dark:bg-neutral-100/10 dark:text-neutral-100">
                    {data.counts[tab.value]}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Sort Filter */}
          <div className="flex items-center gap-3">
            <HugeiconsIcon
              className="h-4 w-4 text-neutral-600 dark:text-neutral-400"
              icon={FilterIcon}
            />
            <Select onValueChange={(value) => setSortBy(value as SortOption)} value={sortBy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="waiting_time">Longest waiting</SelectItem>
                <SelectItem value="recent">Most recent</SelectItem>
                <SelectItem value="provider">By provider</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tab Content */}
        {CHECK_TABS.map((tab) => {
          const checksForTab = sortChecks(data.grouped[tab.value]);
          return (
            <TabsContent key={tab.value} value={tab.value}>
              <CheckTabPanel
                checks={checksForTab}
                onSelectCheck={setSelectedCheck}
                tabValue={tab.value}
              />
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Detail Modal */}
      {selectedCheck && (
        <CheckDetailModal
          check={selectedCheck}
          onClose={() => setSelectedCheck(null)}
          onComplete={handleReviewComplete}
        />
      )}
    </div>
  );
}

type CheckTabPanelProps = {
  checks: BackgroundCheckWithProfile[];
  tabValue: CheckTabValue;
  onSelectCheck: (check: BackgroundCheckWithProfile) => void;
};

function CheckTabPanel({ checks, tabValue, onSelectCheck }: CheckTabPanelProps) {
  if (checks.length === 0) {
    return (
      <Card className="border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
        <CardContent className="flex min-h-[400px] items-center justify-center">
          <p className="text-neutral-600 text-sm dark:text-neutral-400">
            No {tabValue} background checks found.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {checks.map((check) => (
        <CheckCard check={check} key={check.id} onSelectCheck={onSelectCheck} />
      ))}
    </div>
  );
}

type CheckCardProps = {
  check: BackgroundCheckWithProfile;
  onSelectCheck: (check: BackgroundCheckWithProfile) => void;
};

function CheckCard({ check, onSelectCheck }: CheckCardProps) {
  return (
    <Card className="border-neutral-200 bg-white transition-shadow hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-950">
      <CardContent className="p-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CheckCardHeader check={check} />
            <CheckStatsGrid check={check} />
            <ChecksPerformedTags checks={check.checksPerformed} />
            <CriminalRecordsNotice records={check.results.criminal} />
          </div>
          <CheckCardActions onClick={() => onSelectCheck(check)} />
        </div>
      </CardContent>
    </Card>
  );
}

function CheckCardHeader({ check }: { check: BackgroundCheckWithProfile }) {
  const location =
    check.professional.city && check.professional.country
      ? `${check.professional.city}, ${check.professional.country}`
      : check.professional.email || "No contact info";

  return (
    <div className="mb-6 flex items-center gap-4">
      <div className="flex items-center gap-3">
        <div className="bg-white p-3 dark:bg-neutral-950">
          <HugeiconsIcon
            className="h-6 w-6 text-neutral-900 dark:text-neutral-100"
            icon={UserAccountIcon}
          />
        </div>
        <div>
          <h4 className="font-semibold text-lg text-neutral-900 dark:text-neutral-100">
            {check.professional.full_name || "Unnamed Professional"}
          </h4>
          <p className="text-neutral-600 text-sm dark:text-neutral-400">{location}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <StatusBadge status={check.status} />
        <ProviderBadge provider={check.provider} />
      </div>
    </div>
  );
}

function CheckStatsGrid({ check }: { check: BackgroundCheckWithProfile }) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-6 md:grid-cols-4">
      <CheckStat icon={TimeScheduleIcon} label="Waiting Time">
        <p className="font-bold text-2xl text-neutral-900 dark:text-neutral-100">
          {check.daysWaiting}
          <span className="ml-1 font-normal text-neutral-600 text-sm dark:text-neutral-400">
            days
          </span>
        </p>
      </CheckStat>
      <CheckStat icon={SecurityCheckIcon} label="Checks Performed">
        <p className="font-bold text-2xl text-neutral-900 dark:text-neutral-100">
          {check.checksPerformed?.length || 0}
        </p>
      </CheckStat>
      <CheckStat icon={CheckmarkCircle02Icon} label="Recommendation">
        <p className="font-bold text-neutral-800 text-sm dark:text-neutral-300">
          {check.recommendation === "approved" && "✓ Approved"}
          {check.recommendation === "review_required" && "⚠ Review Required"}
          {check.recommendation === "rejected" && "✗ Rejected"}
        </p>
      </CheckStat>
      <CheckStat icon={TimeScheduleIcon} label="Completed">
        <p className="text-neutral-800 text-sm dark:text-neutral-300">
          {check.completedAt ? new Date(check.completedAt).toLocaleDateString() : "Pending"}
        </p>
      </CheckStat>
    </div>
  );
}

type CheckStatProps = {
  icon: typeof CheckmarkCircle02Icon;
  label: string;
  children: ReactNode;
};

function CheckStat({ icon, label, children }: CheckStatProps) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-2">
        <HugeiconsIcon className="h-4 w-4 text-neutral-600 dark:text-neutral-400" icon={icon} />
        <span className="font-semibold text-neutral-600 text-xs uppercase tracking-wider dark:text-neutral-400">
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}

function ChecksPerformedTags({
  checks,
}: {
  checks: BackgroundCheckWithProfile["checksPerformed"];
}) {
  if (!checks || checks.length === 0) {
    return null;
  }

  const labels: Record<string, string> = {
    criminal: "Criminal Background",
    identity: "Identity Verification",
    disciplinary: "Disciplinary Records",
  };

  return (
    <div className="flex flex-wrap gap-2">
      {checks.map((checkType) => (
        <span
          className="bg-white px-3 py-1.5 font-medium text-neutral-900 text-xs dark:bg-neutral-950 dark:text-neutral-100"
          key={checkType}
        >
          {labels[checkType] || checkType}
        </span>
      ))}
    </div>
  );
}

type CriminalRecordList = BackgroundCheckResult["results"]["criminal"] | undefined;

function CriminalRecordsNotice({ records }: { records: CriminalRecordList }) {
  if (!records || records.records.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 border border-neutral-900 bg-white p-4 dark:border-neutral-100/30 dark:bg-neutral-950">
      <p className="mb-2 font-semibold text-neutral-800 text-sm dark:text-neutral-300">
        ⚠ Criminal Records Found
      </p>
      <p className="text-neutral-800 text-sm dark:text-neutral-300">
        {records.records.length} record(s) found. Click "View Details" to review.
      </p>
    </div>
  );
}

function CheckCardActions({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="ml-6 bg-neutral-900 px-6 py-3 font-semibold text-sm text-white transition-colors hover:bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-950"
      onClick={onClick}
      type="button"
    >
      <HugeiconsIcon className="mr-2 inline h-4 w-4" icon={ViewIcon} />
      View Details
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`px-3 py-1 font-semibold text-sm ${getStatusBadgeClass(status)}`}>
      {status}
    </span>
  );
}

function ProviderBadge({ provider }: { provider: string }) {
  return (
    <span className={`px-3 py-1 font-semibold text-sm ${getProviderBadgeClass(provider)}`}>
      {provider}
    </span>
  );
}

const statusBadgeClasses: Record<string, string> = {
  pending: "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100",
  clear: "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100",
  consider: "bg-neutral-900 dark:bg-neutral-100/5 text-white dark:text-neutral-100",
  suspended: "bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100",
};

function getStatusBadgeClass(status: string) {
  return (
    statusBadgeClasses[status] ||
    "bg-white dark:bg-neutral-950 text-neutral-600 dark:text-neutral-400"
  );
}

const providerBadgeClasses: Record<string, string> = {
  checkr: "bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100",
  truora: "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100",
};

function getProviderBadgeClass(provider: string) {
  return (
    providerBadgeClasses[provider.toLowerCase()] ||
    "bg-white dark:bg-neutral-950 text-neutral-600 dark:text-neutral-400"
  );
}
