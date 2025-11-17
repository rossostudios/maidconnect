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
import { LoadingCamper } from "@/components/ui/loading-camper";
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
const BackgroundCheckDetailModal = dynamic(
  () => import("./background-check-detail-modal").then((mod) => mod.BackgroundCheckDetailModal),
  { ssr: false }
);

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

type BackgroundCheckDashboardData = {
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

const statusBadgeMap: Record<string, string> = {
  pending: "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100",
  clear: "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100",
  consider: "bg-neutral-900 dark:bg-neutral-100/5 text-white dark:text-neutral-100",
  suspended: "bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100",
  default: "bg-white dark:bg-neutral-950 text-neutral-600 dark:text-neutral-300",
};

const providerBadgeMap: Record<string, string> = {
  checkr: "bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100",
  truora: "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100",
  default: "bg-white dark:bg-neutral-950 text-neutral-600 dark:text-neutral-300",
};

const getStatusBadge = (status: string) => statusBadgeMap[status] ?? statusBadgeMap.default;
const getProviderBadge = (provider: string) =>
  providerBadgeMap[provider.toLowerCase()] ?? providerBadgeMap.default;

type BackgroundCheckCardProps = {
  check: BackgroundCheckWithProfile;
  onViewDetails: (check: BackgroundCheckWithProfile) => void;
};

function BackgroundCheckCard({ check, onViewDetails }: BackgroundCheckCardProps) {
  return (
    <Card className="border-neutral-200 bg-white transition-shadow hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-950">
      <CardContent className="p-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Header */}
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
                  <p className="text-neutral-600 text-sm dark:text-neutral-300">
                    {check.professional.city && check.professional.country
                      ? `${check.professional.city}, ${check.professional.country}`
                      : check.professional.email || "No contact info"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <span className={`px-3 py-1 font-semibold text-sm ${getStatusBadge(check.status)}`}>
                  {check.status}
                </span>
                <span
                  className={`px-3 py-1 font-semibold text-sm ${getProviderBadge(check.provider)}`}
                >
                  {check.provider}
                </span>
              </div>
            </div>

            {/* Stats Grid */}
            <BackgroundCheckStats check={check} />

            {/* Checks Performed Tags */}
            {check.checksPerformed && check.checksPerformed.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {check.checksPerformed.map((checkType) => (
                  <span
                    className="bg-white px-3 py-1.5 font-medium text-neutral-900 text-xs dark:bg-neutral-950 dark:text-neutral-100"
                    key={checkType}
                  >
                    {checkType === "criminal" && "Criminal Background"}
                    {checkType === "identity" && "Identity Verification"}
                    {checkType === "disciplinary" && "Disciplinary Records"}
                  </span>
                ))}
              </div>
            )}

            {/* Criminal Records Warning */}
            {check.results.criminal && check.results.criminal.records.length > 0 && (
              <div className="mt-6 border border-neutral-900 bg-white p-4 dark:border-neutral-100/30 dark:bg-neutral-950">
                <p className="mb-2 font-semibold text-red-700 text-sm dark:text-red-200">
                  ⚠ Criminal Records Found
                </p>
                <p className="text-red-700 text-sm dark:text-red-200">
                  {check.results.criminal.records.length} record(s) found. Click "View Details" to
                  review.
                </p>
              </div>
            )}
          </div>

          {/* View Details Button */}
          <button
            className="ml-6 bg-neutral-900 px-6 py-3 font-semibold text-sm text-white transition-colors hover:bg-neutral-900 dark:bg-neutral-100 dark:bg-neutral-100 dark:text-neutral-950"
            onClick={() => onViewDetails(check)}
            type="button"
          >
            <HugeiconsIcon className="mr-2 inline h-4 w-4" icon={ViewIcon} />
            View Details
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

type BackgroundCheckStatsProps = {
  check: BackgroundCheckWithProfile;
};

function BackgroundCheckStats({ check }: BackgroundCheckStatsProps) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-6 md:grid-cols-4">
      <BackgroundCheckStat
        icon={TimeScheduleIcon}
        label="Waiting Time"
        value={
          <>
            {check.daysWaiting}
            <span className="ml-1 font-normal text-neutral-600 text-sm dark:text-neutral-300">
              days
            </span>
          </>
        }
      />
      <BackgroundCheckStat
        icon={SecurityCheckIcon}
        label="Checks Performed"
        value={check.checksPerformed?.length || 0}
      />
      <BackgroundCheckStat
        icon={CheckmarkCircle02Icon}
        label="Recommendation"
        value={
          <span className="font-bold text-red-700 text-sm dark:text-red-200">
            {check.recommendation === "approved" && "✓ Approved"}
            {check.recommendation === "review_required" && "⚠ Review Required"}
            {check.recommendation === "rejected" && "✗ Rejected"}
          </span>
        }
      />
      <BackgroundCheckStat
        icon={TimeScheduleIcon}
        label="Completed"
        value={
          <span className="text-red-700 text-sm dark:text-red-200">
            {check.completedAt ? new Date(check.completedAt).toLocaleDateString() : "Pending"}
          </span>
        }
      />
    </div>
  );
}

type BackgroundCheckStatProps = {
  icon: typeof TimeScheduleIcon;
  label: string;
  value: ReactNode;
};

function BackgroundCheckStat({ icon, label, value }: BackgroundCheckStatProps) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-2">
        <HugeiconsIcon className="h-4 w-4 text-neutral-600 dark:text-neutral-300" icon={icon} />
        <span className="font-semibold text-neutral-600 text-xs uppercase tracking-wider dark:text-neutral-300">
          {label}
        </span>
      </div>
      <p className="font-bold text-2xl text-neutral-900 dark:text-neutral-100">{value}</p>
    </div>
  );
}

export function BackgroundCheckDashboard() {
  const [data, setData] = useState<BackgroundCheckDashboardData | null>(null);
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
      <div className="flex min-h-[400px] items-center justify-center">
        <LoadingCamper size="lg" text="Loading background checks..." />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
        <CardContent className="p-8 text-center">
          <p className="mb-4 text-red-700 text-sm dark:text-red-200">{error}</p>
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

  // Prepare chart data (using stone palette)
  const chartData = [
    {
      name: "Pending",
      count: data.counts.pending,
      color: "#78716C", // neutral-500
    },
    {
      name: "Clear",
      count: data.counts.clear,
      color: "#78716C", // neutral-500
    },
    {
      name: "Consider",
      count: data.counts.consider,
      color: "#78716C", // neutral-500
    },
    {
      name: "Suspended",
      count: data.counts.suspended,
      color: "#78716C", // neutral-500
    },
  ];

  // Get checks for active tab
  const getActiveChecks = () => {
    switch (activeTab) {
      case "pending":
        return sortChecks(data.grouped.pending);
      case "clear":
        return sortChecks(data.grouped.clear);
      case "consider":
        return sortChecks(data.grouped.consider);
      case "suspended":
        return sortChecks(data.grouped.suspended);
      default:
        return [];
    }
  };

  const activeChecks = getActiveChecks();

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
            <p className="mb-1 font-semibold text-neutral-600 text-xs uppercase tracking-wider dark:text-neutral-300">
              Check Distribution
            </p>
            <p className="text-neutral-600 text-sm dark:text-neutral-300">
              Background checks by status
            </p>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-64">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={chartData}>
                <CartesianGrid stroke="#E7E5E4" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  axisLine={false}
                  dataKey="name"
                  fontSize={12}
                  stroke="#A8A29E"
                  tickLine={false}
                />
                <YAxis axisLine={false} fontSize={12} stroke="#A8A29E" tickLine={false} />
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
            <TabsTrigger value="pending">
              Pending
              {data.counts.pending > 0 && (
                <span className="ml-2 inline-flex items-center justify-center rounded-full bg-neutral-900 px-2 py-0.5 font-semibold text-white text-xs dark:bg-neutral-100/10 dark:text-neutral-100">
                  {data.counts.pending}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="consider">
              Consider
              {data.counts.consider > 0 && (
                <span className="ml-2 inline-flex items-center justify-center rounded-full bg-neutral-900 px-2 py-0.5 font-semibold text-white text-xs dark:bg-neutral-100/10 dark:text-neutral-100">
                  {data.counts.consider}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="clear">
              Clear
              {data.counts.clear > 0 && (
                <span className="ml-2 inline-flex items-center justify-center rounded-full bg-neutral-900 px-2 py-0.5 font-semibold text-white text-xs dark:bg-neutral-100/10 dark:text-neutral-100">
                  {data.counts.clear}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="suspended">
              Suspended
              {data.counts.suspended > 0 && (
                <span className="ml-2 inline-flex items-center justify-center rounded-full bg-neutral-900 px-2 py-0.5 font-semibold text-white text-xs dark:bg-neutral-100/10 dark:text-neutral-100">
                  {data.counts.suspended}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Sort Filter */}
          <div className="flex items-center gap-3">
            <HugeiconsIcon
              className="h-4 w-4 text-neutral-600 dark:text-neutral-300"
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
        {["pending", "consider", "clear", "suspended"].map((tabValue) => (
          <TabsContent key={tabValue} value={tabValue}>
            {activeChecks.length === 0 ? (
              <Card className="border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
                <CardContent className="flex min-h-[400px] items-center justify-center">
                  <p className="text-neutral-600 text-sm dark:text-neutral-300">
                    No {tabValue} background checks found.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {activeChecks.map((check) => (
                  <BackgroundCheckCard
                    check={check}
                    key={check.id}
                    onViewDetails={setSelectedCheck}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Detail Modal */}
      {selectedCheck && (
        <BackgroundCheckDetailModal
          check={selectedCheck}
          onClose={() => setSelectedCheck(null)}
          onComplete={handleReviewComplete}
        />
      )}
    </div>
  );
}
