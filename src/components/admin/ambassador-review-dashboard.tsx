"use client";

import {
  Award01Icon,
  Calendar03Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Coins01Icon,
  FilterIcon,
  Loading03Icon,
  Mail01Icon,
  SmartPhone01Icon,
  TimeScheduleIcon,
  UserAccountIcon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusCard } from "@/components/ui/status-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Dynamic import for modal (lazy load on demand)
const AmbassadorReviewModal = dynamic(
  () => import("./ambassador-review-modal").then((mod) => mod.AmbassadorReviewModal),
  { ssr: false }
);

export type AmbassadorApplication = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  country: string | null;
  city: string | null;
  profession: string | null;
  company_name: string | null;
  referral_reach: string | null;
  motivation: string | null;
  social_media_links: string[] | null;
  referral_code: string;
  status: "pending" | "approved" | "rejected";
  is_active: boolean;
  applied_at: string;
  approved_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  total_referrals: number;
  successful_referrals: number;
  total_earnings_cents: number;
  waitingDays: number;
};

type AmbassadorQueueData = {
  ambassadors: AmbassadorApplication[];
  grouped: {
    pending: AmbassadorApplication[];
    approved: AmbassadorApplication[];
    rejected: AmbassadorApplication[];
  };
  counts: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
};

type SortOption = "waiting_time" | "recent" | "referral_reach" | "name";

export function AmbassadorReviewDashboard() {
  const [data, setData] = useState<AmbassadorQueueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAmbassador, setSelectedAmbassador] = useState<AmbassadorApplication | null>(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [sortBy, setSortBy] = useState<SortOption>("waiting_time");

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/ambassadors/queue");

      if (!response.ok) {
        throw new Error("Failed to load ambassador queue");
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load queue");
    } finally {
      setLoading(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: fetchQueue is intentionally excluded to prevent infinite re-renders
  useEffect(() => {
    fetchQueue();
  }, []);

  const handleReviewComplete = () => {
    setSelectedAmbassador(null);
    fetchQueue(); // Refresh the queue
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <HugeiconsIcon className="h-12 w-12 animate-spin text-orange-500" icon={Loading03Icon} />
          <p className="font-medium text-neutral-900">Loading ambassador queue...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-neutral-200 bg-neutral-50">
        <CardContent className="p-8 text-center">
          <p className="mb-4 text-neutral-600 text-sm">{error}</p>
          <button
            className="rounded-lg bg-neutral-600 px-6 py-3 font-semibold text-neutral-50 text-sm transition-colors hover:bg-neutral-700"
            onClick={fetchQueue}
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

  // Sort ambassadors based on selected option
  const sortAmbassadors = (ambassadors: AmbassadorApplication[]) => {
    const sorted = [...ambassadors];
    switch (sortBy) {
      case "waiting_time":
        return sorted.sort((a, b) => b.waitingDays - a.waitingDays);
      case "recent":
        return sorted.sort(
          (a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime()
        );
      case "referral_reach":
        const reachOrder: Record<string, number> = { "31+": 4, "16-30": 3, "6-15": 2, "1-5": 1 };
        return sorted.sort(
          (a, b) => (reachOrder[b.referral_reach || ""] || 0) - (reachOrder[a.referral_reach || ""] || 0)
        );
      case "name":
        return sorted.sort((a, b) =>
          (a.full_name || "").localeCompare(b.full_name || "")
        );
      default:
        return sorted;
    }
  };

  // Prepare chart data
  const chartData = [
    {
      name: "Pending",
      count: data.counts.pending,
      color: "#3b82f6", // blue-500 - action needed
    },
    {
      name: "Approved",
      count: data.counts.approved,
      color: "#10b981", // green-500 - success
    },
    {
      name: "Rejected",
      count: data.counts.rejected,
      color: "#ef4444", // red-500 - declined
    },
  ];

  // Get ambassadors for active tab
  const getActiveAmbassadors = () => {
    switch (activeTab) {
      case "pending":
        return sortAmbassadors(data.grouped.pending);
      case "approved":
        return sortAmbassadors(data.grouped.approved);
      case "rejected":
        return sortAmbassadors(data.grouped.rejected);
      default:
        return [];
    }
  };

  const activeAmbassadors = getActiveAmbassadors();

  const formatProfession = (profession: string | null) => {
    if (!profession) return "Not specified";
    return profession
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatusCard
          description="Waiting for admin review"
          icon={TimeScheduleIcon}
          title="PENDING REVIEW"
          value={data.counts.pending}
          variant="review"
        />

        <StatusCard
          description="Active ambassadors"
          icon={CheckmarkCircle02Icon}
          title="APPROVED"
          value={data.counts.approved}
          variant="approved"
        />

        <StatusCard
          description="Declined applications"
          icon={Cancel01Icon}
          title="REJECTED"
          value={data.counts.rejected}
          variant="error"
        />
      </div>

      {/* Queue Distribution Chart */}
      <Card className="rounded-lg border-neutral-200 bg-neutral-50 transition-shadow hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-6">
          <div>
            <p className="mb-1 font-semibold text-neutral-500 text-xs uppercase tracking-wider">
              Application Distribution
            </p>
            <p className="text-neutral-500 text-sm">Ambassador applications by status</p>
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
                  stroke="neutral-500"
                  tickLine={false}
                />
                <YAxis axisLine={false} fontSize={12} stroke="neutral-500" tickLine={false} />
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="pending">
              Pending
              {data.counts.pending > 0 && (
                <span className="ml-2 inline-flex items-center justify-center rounded-full bg-blue-100 px-2 py-0.5 font-semibold text-blue-700 text-xs">
                  {data.counts.pending}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved
              {data.counts.approved > 0 && (
                <span className="ml-2 inline-flex items-center justify-center rounded-full bg-green-100 px-2 py-0.5 font-semibold text-green-700 text-xs">
                  {data.counts.approved}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected
              {data.counts.rejected > 0 && (
                <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-100 px-2 py-0.5 font-semibold text-red-700 text-xs">
                  {data.counts.rejected}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Sort Filter */}
          <div className="flex items-center gap-3">
            <HugeiconsIcon className="h-4 w-4 text-neutral-500" icon={FilterIcon} />
            <Select onValueChange={(value) => setSortBy(value as SortOption)} value={sortBy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="waiting_time">Longest waiting</SelectItem>
                <SelectItem value="recent">Most recent</SelectItem>
                <SelectItem value="referral_reach">Highest reach</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Pending Tab */}
        <TabsContent value="pending">
          {activeAmbassadors.length === 0 ? (
            <Card className="rounded-lg border-neutral-200 bg-white">
              <CardContent className="flex min-h-[400px] items-center justify-center p-12">
                <div className="flex max-w-md flex-col items-center gap-4 text-center">
                  <div className="rounded-full bg-green-50 p-4">
                    <HugeiconsIcon
                      className="h-12 w-12 text-green-600"
                      icon={CheckmarkCircle02Icon}
                    />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg text-neutral-900">All caught up!</h3>
                    <p className="text-neutral-500 text-sm">
                      No ambassador applications are currently awaiting review. New applications
                      will appear here when submitted.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeAmbassadors.map((ambassador) => (
                <AmbassadorCard
                  ambassador={ambassador}
                  formatProfession={formatProfession}
                  key={ambassador.id}
                  onReview={() => setSelectedAmbassador(ambassador)}
                  variant="pending"
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Approved Tab */}
        <TabsContent value="approved">
          {activeAmbassadors.length === 0 ? (
            <Card className="rounded-lg border-neutral-200 bg-neutral-50">
              <CardContent className="flex min-h-[400px] items-center justify-center">
                <p className="text-neutral-500 text-sm">No approved ambassadors yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeAmbassadors.map((ambassador) => (
                <AmbassadorCard
                  ambassador={ambassador}
                  formatProfession={formatProfession}
                  key={ambassador.id}
                  onReview={() => setSelectedAmbassador(ambassador)}
                  variant="approved"
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Rejected Tab */}
        <TabsContent value="rejected">
          {activeAmbassadors.length === 0 ? (
            <Card className="rounded-lg border-neutral-200 bg-neutral-50">
              <CardContent className="flex min-h-[400px] items-center justify-center">
                <p className="text-neutral-500 text-sm">No rejected applications.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeAmbassadors.map((ambassador) => (
                <AmbassadorCard
                  ambassador={ambassador}
                  formatProfession={formatProfession}
                  key={ambassador.id}
                  onReview={() => setSelectedAmbassador(ambassador)}
                  variant="rejected"
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Review Modal */}
      {selectedAmbassador && (
        <AmbassadorReviewModal
          ambassador={selectedAmbassador}
          onClose={() => setSelectedAmbassador(null)}
          onComplete={handleReviewComplete}
        />
      )}
    </div>
  );
}

type AmbassadorCardProps = {
  ambassador: AmbassadorApplication;
  variant: "pending" | "approved" | "rejected";
  onReview: () => void;
  formatProfession: (profession: string | null) => string;
};

function AmbassadorCard({ ambassador, variant, onReview, formatProfession }: AmbassadorCardProps) {
  const statusConfig = {
    pending: {
      icon: TimeScheduleIcon,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      badge: "Pending Review",
      badgeBg: "bg-blue-100",
      badgeText: "text-blue-700",
      buttonText: "Review",
    },
    approved: {
      icon: CheckmarkCircle02Icon,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
      badge: "Approved",
      badgeBg: "bg-green-100",
      badgeText: "text-green-700",
      buttonText: "View Details",
    },
    rejected: {
      icon: Cancel01Icon,
      iconBg: "bg-red-50",
      iconColor: "text-red-600",
      badge: "Rejected",
      badgeBg: "bg-red-100",
      badgeText: "text-red-700",
      buttonText: "View Details",
    },
  };

  const config = statusConfig[variant];

  return (
    <Card className="rounded-lg border-neutral-200 bg-neutral-50 transition-shadow hover:shadow-md">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            {/* Header */}
            <div className="mb-4 flex flex-wrap items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <div className={`rounded-lg p-2 ${config.iconBg}`}>
                  <HugeiconsIcon className={`h-5 w-5 ${config.iconColor}`} icon={config.icon} />
                </div>
                <div className="min-w-0">
                  <h4 className="truncate font-semibold text-base text-neutral-900 sm:text-lg">
                    {ambassador.full_name || "Unnamed Applicant"}
                  </h4>
                  <p className="truncate text-neutral-500 text-xs">
                    {ambassador.city && ambassador.country
                      ? `${ambassador.city}, ${ambassador.country}`
                      : "Location not specified"}
                  </p>
                </div>
              </div>
              <span
                className={`whitespace-nowrap rounded-full px-2 py-1 font-semibold text-xs ${config.badgeBg} ${config.badgeText}`}
              >
                {config.badge}
              </span>
              {variant === "pending" && (
                <span className="whitespace-nowrap rounded-full bg-neutral-200 px-2 py-1 font-semibold text-neutral-600 text-xs">
                  <HugeiconsIcon className="mr-1 inline h-3 w-3" icon={Calendar03Icon} />
                  {ambassador.waitingDays}d waiting
                </span>
              )}
            </div>

            {/* Info Grid */}
            <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <HugeiconsIcon className="h-4 w-4 text-neutral-500" icon={UserAccountIcon} />
                  <span className="font-semibold text-neutral-500 text-xs uppercase tracking-wider">
                    Profession
                  </span>
                </div>
                <p className="font-medium text-neutral-900 text-sm">
                  {formatProfession(ambassador.profession)}
                </p>
              </div>

              <div>
                <div className="mb-1 flex items-center gap-2">
                  <HugeiconsIcon className="h-4 w-4 text-neutral-500" icon={UserMultiple02Icon} />
                  <span className="font-semibold text-neutral-500 text-xs uppercase tracking-wider">
                    Est. Reach
                  </span>
                </div>
                <p className="font-bold text-2xl text-neutral-900">
                  {ambassador.referral_reach || "N/A"}
                </p>
              </div>

              {variant === "approved" && (
                <>
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <HugeiconsIcon className="h-4 w-4 text-neutral-500" icon={Award01Icon} />
                      <span className="font-semibold text-neutral-500 text-xs uppercase tracking-wider">
                        Referrals
                      </span>
                    </div>
                    <p className="font-bold text-2xl text-neutral-900">
                      {ambassador.successful_referrals}
                      <span className="ml-1 font-normal text-neutral-500 text-sm">
                        / {ambassador.total_referrals}
                      </span>
                    </p>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <HugeiconsIcon className="h-4 w-4 text-neutral-500" icon={Coins01Icon} />
                      <span className="font-semibold text-neutral-500 text-xs uppercase tracking-wider">
                        Earnings
                      </span>
                    </div>
                    <p className="font-bold text-2xl text-neutral-900">
                      ${(ambassador.total_earnings_cents / 100).toFixed(0)}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Contact Info */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-neutral-600 text-sm">
                <HugeiconsIcon className="h-4 w-4" icon={Mail01Icon} />
                <span className="truncate">{ambassador.email}</span>
              </div>
              {ambassador.phone && (
                <div className="flex items-center gap-2 text-neutral-600 text-sm">
                  <HugeiconsIcon className="h-4 w-4" icon={SmartPhone01Icon} />
                  <span>{ambassador.phone}</span>
                </div>
              )}
            </div>

            {/* Referral Code for approved */}
            {variant === "approved" && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-2">
                <span className="text-neutral-600 text-sm">Referral Code:</span>
                <span className="font-mono font-bold text-orange-600">{ambassador.referral_code}</span>
              </div>
            )}

            {/* Rejection reason */}
            {variant === "rejected" && ambassador.rejection_reason && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="mb-1 font-semibold text-red-800 text-xs uppercase tracking-wider">
                  Rejection Reason
                </p>
                <p className="text-red-700 text-sm">{ambassador.rejection_reason}</p>
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            className="rounded-lg bg-orange-500 px-6 py-3 font-semibold text-sm text-white transition-colors hover:bg-orange-600 sm:ml-6"
            onClick={onReview}
            type="button"
          >
            {config.buttonText}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
