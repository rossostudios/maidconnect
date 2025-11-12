"use client";

import {
  Award01Icon,
  Calendar03Icon,
  CheckmarkCircle02Icon,
  DocumentValidationIcon,
  FileEditIcon,
  FilterIcon,
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
import { StatusCard, StatusCardGrid } from "@/components/ui/status-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Dynamic import for modal (lazy load on demand)
const ProfessionalReviewModal = dynamic(
  () => import("./ProfessionalReview").then((mod) => mod.ProfessionalReviewModal),
  { ssr: false }
);

type ProfessionalInQueue = {
  profile_id: string;
  full_name: string | null;
  status: string;
  bio: string | null;
  primary_services: string[] | null;
  experience_years: number | null;
  rate_expectations: { hourly_cop?: number } | null;
  languages: string[] | null;
  references_data: any[] | null;
  consent_background_check: boolean;
  stripe_connect_account_id: string | null;
  created_at: string;
  profile: {
    id: string;
    onboarding_status: string;
    phone: string | null;
    country: string | null;
    city: string | null;
    created_at: string;
  } | null;
  documents: any[];
  reviews: any[];
  documentsCount: number;
  latestReview: any | null;
  waitingDays: number;
};

type VettingQueueData = {
  professionals: ProfessionalInQueue[];
  grouped: {
    application_in_review: ProfessionalInQueue[];
    approved: ProfessionalInQueue[];
    application_pending: ProfessionalInQueue[];
  };
  counts: {
    application_in_review: number;
    approved: number;
    application_pending: number;
    total: number;
  };
};

type SortOption = "waiting_time" | "experience" | "documents" | "recent";

export function ProfessionalVettingDashboard() {
  const [data, setData] = useState<VettingQueueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<ProfessionalInQueue | null>(
    null
  );
  const [activeTab, setActiveTab] = useState("needs_review");
  const [sortBy, setSortBy] = useState<SortOption>("waiting_time");

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/professionals/queue");

      if (!response.ok) {
        throw new Error("Failed to load vetting queue");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReviewComplete = () => {
    setSelectedProfessional(null);
    fetchQueue(); // Refresh the queue
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              className="h-48 animate-pulse rounded-xl border border-stone-200 bg-stone-50"
              key={i}
            />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-xl border border-stone-200 bg-stone-50" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-stone-200 bg-stone-50">
        <CardContent className="p-8 text-center">
          <p className="mb-4 text-sm text-stone-600">{error}</p>
          <button
            className="rounded-lg bg-stone-600 px-6 py-3 font-semibold text-sm text-stone-50 transition-colors hover:bg-stone-600"
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

  // Sort professionals based on selected option
  const sortProfessionals = (professionals: ProfessionalInQueue[]) => {
    const sorted = [...professionals];
    switch (sortBy) {
      case "waiting_time":
        return sorted.sort((a, b) => b.waitingDays - a.waitingDays);
      case "experience":
        return sorted.sort((a, b) => (b.experience_years || 0) - (a.experience_years || 0));
      case "documents":
        return sorted.sort((a, b) => b.documentsCount - a.documentsCount);
      case "recent":
        return sorted.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      default:
        return sorted;
    }
  };

  // Prepare chart data
  const chartData = [
    {
      name: "Needs Review",
      count: data.counts.application_in_review,
      color: "#3b82f6", // stone-600 - action needed
    },
    {
      name: "Approved",
      count: data.counts.approved,
      color: "#10b981", // stone-600 - success
    },
    {
      name: "Incomplete",
      count: data.counts.application_pending,
      color: "#f59e0b", // stone-500 - warning
    },
  ];

  // Get professionals for active tab
  const getActiveProfessionals = () => {
    switch (activeTab) {
      case "needs_review":
        return sortProfessionals(data.grouped.application_in_review);
      case "approved":
        return sortProfessionals(data.grouped.approved);
      case "incomplete":
        return sortProfessionals(data.grouped.application_pending);
      default:
        return [];
    }
  };

  const activeProfessionals = getActiveProfessionals();

  return (
    <div className="space-y-8">
      {/* Summary Cards - Following 8px Grid Design System */}
      <StatusCardGrid>
        {/* Needs Review Card */}
        <StatusCard
          description="Waiting for admin review"
          icon={TimeScheduleIcon}
          title="NEEDS REVIEW"
          value={data.counts.application_in_review}
          variant="review"
        />

        {/* Approved Card */}
        <StatusCard
          description="Ready to accept bookings"
          icon={CheckmarkCircle02Icon}
          title="APPROVED"
          value={data.counts.approved}
          variant="approved"
        />

        {/* Incomplete Card */}
        <StatusCard
          description="Applications in progress"
          icon={FileEditIcon}
          title="INCOMPLETE"
          value={data.counts.application_pending}
          variant="warning"
        />
      </StatusCardGrid>

      {/* Queue Distribution Chart */}
      <Card className="border-stone-200 bg-stone-50 transition-shadow hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-6">
          <div>
            <p className="mb-1 font-semibold text-stone-500 text-xs uppercase tracking-wider">
              Queue Distribution
            </p>
            <p className="text-sm text-stone-500">Professionals by vetting status</p>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-64">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={chartData}>
                <CartesianGrid stroke="stone-200" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  axisLine={false}
                  dataKey="name"
                  fontSize={12}
                  stroke="stone-500"
                  tickLine={false}
                />
                <YAxis axisLine={false} fontSize={12} stroke="stone-500" tickLine={false} />
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
            <TabsTrigger value="needs_review">
              Needs Review
              {data.counts.application_in_review > 0 && (
                <span className="ml-2 inline-flex items-center justify-center rounded-full bg-stone-600/10 px-2 py-0.5 font-semibold text-stone-600 text-xs">
                  {data.counts.application_in_review}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved
              {data.counts.approved > 0 && (
                <span className="ml-2 inline-flex items-center justify-center rounded-full bg-stone-600/10 px-2 py-0.5 font-semibold text-stone-600 text-xs">
                  {data.counts.approved}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="incomplete">
              Incomplete
              {data.counts.application_pending > 0 && (
                <span className="ml-2 inline-flex items-center justify-center rounded-full bg-stone-200/30 px-2 py-0.5 font-semibold text-stone-500 text-xs">
                  {data.counts.application_pending}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Sort Filter */}
          <div className="flex items-center gap-3">
            <HugeiconsIcon className="h-4 w-4 text-stone-500" icon={FilterIcon} />
            <Select onValueChange={(value) => setSortBy(value as SortOption)} value={sortBy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="waiting_time">Longest waiting</SelectItem>
                <SelectItem value="experience">Most experienced</SelectItem>
                <SelectItem value="documents">Most documents</SelectItem>
                <SelectItem value="recent">Most recent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Needs Review Tab */}
        <TabsContent value="needs_review">
          {activeProfessionals.length === 0 ? (
            <Card className="border-stone-200 bg-white">
              <CardContent className="flex min-h-[400px] items-center justify-center p-12">
                <div className="flex max-w-md flex-col items-center gap-4 text-center">
                  <div className="rounded-full bg-stone-100 p-4">
                    <HugeiconsIcon
                      className="h-12 w-12 text-stone-700"
                      icon={CheckmarkCircle02Icon}
                    />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg text-stone-900">All caught up!</h3>
                    <p className="text-sm text-stone-500">
                      No professionals are currently awaiting review. New applications will appear
                      here when submitted.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {activeProfessionals.map((professional) => (
                <Card
                  className="border-stone-200 bg-stone-50 transition-shadow hover:shadow-lg"
                  key={professional.profile_id}
                >
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Header */}
                        <div className="mb-6 flex items-center gap-4">
                          <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-stone-50 p-3">
                              <HugeiconsIcon
                                className="h-6 w-6 text-stone-900"
                                icon={UserAccountIcon}
                              />
                            </div>
                            <div>
                              <h4 className="font-semibold text-lg text-stone-900">
                                {professional.full_name || "Unnamed Professional"}
                              </h4>
                              <p className="text-sm text-stone-500">
                                {professional.profile?.city && professional.profile?.country
                                  ? `${professional.profile.city}, ${professional.profile.country}`
                                  : "Location not specified"}
                              </p>
                            </div>
                          </div>
                          <span className="rounded-full bg-stone-600/10 px-3 py-1 font-semibold text-sm text-stone-600">
                            <HugeiconsIcon className="mr-1 inline h-4 w-4" icon={Calendar03Icon} />
                            {professional.waitingDays}d waiting
                          </span>
                        </div>

                        {/* Stats Grid */}
                        <div className="mb-6 grid grid-cols-2 gap-6 md:grid-cols-4">
                          <div>
                            <div className="mb-1 flex items-center gap-2">
                              <HugeiconsIcon
                                className="h-4 w-4 text-stone-500"
                                icon={UserMultiple02Icon}
                              />
                              <span className="font-semibold text-stone-500 text-xs uppercase tracking-wider">
                                Services
                              </span>
                            </div>
                            <p className="font-bold text-2xl text-stone-900">
                              {professional.primary_services?.length || 0}
                            </p>
                          </div>

                          <div>
                            <div className="mb-1 flex items-center gap-2">
                              <HugeiconsIcon
                                className="h-4 w-4 text-stone-500"
                                icon={Award01Icon}
                              />
                              <span className="font-semibold text-stone-500 text-xs uppercase tracking-wider">
                                Experience
                              </span>
                            </div>
                            <p className="font-bold text-2xl text-stone-900">
                              {professional.experience_years || 0}
                              <span className="ml-1 font-normal text-sm text-stone-500">years</span>
                            </p>
                          </div>

                          <div>
                            <div className="mb-1 flex items-center gap-2">
                              <HugeiconsIcon
                                className="h-4 w-4 text-stone-500"
                                icon={DocumentValidationIcon}
                              />
                              <span className="font-semibold text-stone-500 text-xs uppercase tracking-wider">
                                Documents
                              </span>
                            </div>
                            <p className="font-bold text-2xl text-stone-900">
                              {professional.documentsCount}
                            </p>
                          </div>

                          <div>
                            <div className="mb-1 flex items-center gap-2">
                              <HugeiconsIcon
                                className="h-4 w-4 text-stone-500"
                                icon={UserMultiple02Icon}
                              />
                              <span className="font-semibold text-stone-500 text-xs uppercase tracking-wider">
                                References
                              </span>
                            </div>
                            <p className="font-bold text-2xl text-stone-900">
                              {professional.references_data?.length || 0}
                            </p>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                          {professional.consent_background_check && (
                            <span className="rounded-lg bg-stone-600/10 px-3 py-1.5 font-medium text-stone-600 text-xs">
                              ✓ Background check consent
                            </span>
                          )}
                          {professional.stripe_connect_account_id && (
                            <span className="rounded-lg bg-stone-600/10 px-3 py-1.5 font-medium text-stone-600 text-xs">
                              ✓ Stripe connected
                            </span>
                          )}
                          {professional.languages && professional.languages.length > 0 && (
                            <span className="rounded-lg bg-stone-50 px-3 py-1.5 font-medium text-stone-600 text-xs">
                              {professional.languages.join(", ")}
                            </span>
                          )}
                        </div>

                        {/* Latest Review */}
                        {professional.latestReview && (
                          <div className="mt-6 rounded-lg border border-stone-200 bg-stone-50 p-4">
                            <p className="mb-2 font-semibold text-stone-500 text-xs uppercase tracking-wider">
                              Latest Review
                            </p>
                            <p className="mb-1 text-sm text-stone-500">
                              <span className="font-medium text-stone-900">Status:</span>{" "}
                              {professional.latestReview.status} •{" "}
                              {new Date(professional.latestReview.created_at).toLocaleDateString()}
                            </p>
                            {professional.latestReview.notes && (
                              <p className="mt-2 text-sm text-stone-900">
                                {professional.latestReview.notes}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Review Button */}
                      <button
                        className="ml-6 rounded-lg bg-stone-600 px-6 py-3 font-semibold text-sm text-stone-50 transition-colors hover:bg-stone-600"
                        onClick={() => setSelectedProfessional(professional)}
                        type="button"
                      >
                        Review
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Approved Tab */}
        <TabsContent value="approved">
          {activeProfessionals.length === 0 ? (
            <Card className="border-stone-200 bg-stone-50">
              <CardContent className="flex min-h-[400px] items-center justify-center">
                <p className="text-sm text-stone-500">No approved professionals yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {activeProfessionals.map((professional) => (
                <Card
                  className="border-stone-200 bg-stone-50 transition-shadow hover:shadow-lg"
                  key={professional.profile_id}
                >
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Same card structure as needs_review but without Review button */}
                        <div className="mb-6 flex items-center gap-4">
                          <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-stone-600/10 p-3">
                              <HugeiconsIcon
                                className="h-6 w-6 text-stone-600"
                                icon={CheckmarkCircle02Icon}
                              />
                            </div>
                            <div>
                              <h4 className="font-semibold text-lg text-stone-900">
                                {professional.full_name || "Unnamed Professional"}
                              </h4>
                              <p className="text-sm text-stone-500">
                                {professional.profile?.city && professional.profile?.country
                                  ? `${professional.profile.city}, ${professional.profile.country}`
                                  : "Location not specified"}
                              </p>
                            </div>
                          </div>
                          <span className="rounded-full bg-stone-600/10 px-3 py-1 font-semibold text-sm text-stone-600">
                            ✓ Approved
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                          <div>
                            <div className="mb-1 flex items-center gap-2">
                              <HugeiconsIcon
                                className="h-4 w-4 text-stone-500"
                                icon={UserMultiple02Icon}
                              />
                              <span className="font-semibold text-stone-500 text-xs uppercase tracking-wider">
                                Services
                              </span>
                            </div>
                            <p className="font-bold text-2xl text-stone-900">
                              {professional.primary_services?.length || 0}
                            </p>
                          </div>

                          <div>
                            <div className="mb-1 flex items-center gap-2">
                              <HugeiconsIcon
                                className="h-4 w-4 text-stone-500"
                                icon={Award01Icon}
                              />
                              <span className="font-semibold text-stone-500 text-xs uppercase tracking-wider">
                                Experience
                              </span>
                            </div>
                            <p className="font-bold text-2xl text-stone-900">
                              {professional.experience_years || 0}
                              <span className="ml-1 font-normal text-sm text-stone-500">years</span>
                            </p>
                          </div>

                          <div>
                            <div className="mb-1 flex items-center gap-2">
                              <HugeiconsIcon
                                className="h-4 w-4 text-stone-500"
                                icon={DocumentValidationIcon}
                              />
                              <span className="font-semibold text-stone-500 text-xs uppercase tracking-wider">
                                Documents
                              </span>
                            </div>
                            <p className="font-bold text-2xl text-stone-900">
                              {professional.documentsCount}
                            </p>
                          </div>

                          <div>
                            <div className="mb-1 flex items-center gap-2">
                              <HugeiconsIcon
                                className="h-4 w-4 text-stone-500"
                                icon={UserMultiple02Icon}
                              />
                              <span className="font-semibold text-stone-500 text-xs uppercase tracking-wider">
                                References
                              </span>
                            </div>
                            <p className="font-bold text-2xl text-stone-900">
                              {professional.references_data?.length || 0}
                            </p>
                          </div>
                        </div>
                      </div>

                      <button
                        className="ml-6 rounded-lg bg-stone-900 px-6 py-3 font-semibold text-sm text-stone-50 transition-colors hover:bg-stone-900"
                        onClick={() => setSelectedProfessional(professional)}
                        type="button"
                      >
                        View Details
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Incomplete Tab */}
        <TabsContent value="incomplete">
          {activeProfessionals.length === 0 ? (
            <Card className="border-stone-200 bg-stone-50">
              <CardContent className="flex min-h-[400px] items-center justify-center">
                <p className="text-sm text-stone-500">No incomplete applications.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {activeProfessionals.map((professional) => (
                <Card
                  className="border-stone-200 bg-stone-50 transition-shadow hover:shadow-lg"
                  key={professional.profile_id}
                >
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-6 flex items-center gap-4">
                          <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-stone-50 p-3">
                              <HugeiconsIcon
                                className="h-6 w-6 text-stone-500"
                                icon={FileEditIcon}
                              />
                            </div>
                            <div>
                              <h4 className="font-semibold text-lg text-stone-900">
                                {professional.full_name || "Unnamed Professional"}
                              </h4>
                              <p className="text-sm text-stone-500">
                                {professional.profile?.city && professional.profile?.country
                                  ? `${professional.profile.city}, ${professional.profile.country}`
                                  : "Location not specified"}
                              </p>
                            </div>
                          </div>
                          <span className="rounded-full bg-stone-200/30 px-3 py-1 font-semibold text-sm text-stone-500">
                            Incomplete
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                          <div>
                            <div className="mb-1 flex items-center gap-2">
                              <HugeiconsIcon
                                className="h-4 w-4 text-stone-500"
                                icon={UserMultiple02Icon}
                              />
                              <span className="font-semibold text-stone-500 text-xs uppercase tracking-wider">
                                Services
                              </span>
                            </div>
                            <p className="font-bold text-2xl text-stone-900">
                              {professional.primary_services?.length || 0}
                            </p>
                          </div>

                          <div>
                            <div className="mb-1 flex items-center gap-2">
                              <HugeiconsIcon
                                className="h-4 w-4 text-stone-500"
                                icon={Award01Icon}
                              />
                              <span className="font-semibold text-stone-500 text-xs uppercase tracking-wider">
                                Experience
                              </span>
                            </div>
                            <p className="font-bold text-2xl text-stone-900">
                              {professional.experience_years || 0}
                              <span className="ml-1 font-normal text-sm text-stone-500">years</span>
                            </p>
                          </div>

                          <div>
                            <div className="mb-1 flex items-center gap-2">
                              <HugeiconsIcon
                                className="h-4 w-4 text-stone-500"
                                icon={DocumentValidationIcon}
                              />
                              <span className="font-semibold text-stone-500 text-xs uppercase tracking-wider">
                                Documents
                              </span>
                            </div>
                            <p className="font-bold text-2xl text-stone-900">
                              {professional.documentsCount}
                            </p>
                          </div>

                          <div>
                            <div className="mb-1 flex items-center gap-2">
                              <HugeiconsIcon
                                className="h-4 w-4 text-stone-500"
                                icon={UserMultiple02Icon}
                              />
                              <span className="font-semibold text-stone-500 text-xs uppercase tracking-wider">
                                References
                              </span>
                            </div>
                            <p className="font-bold text-2xl text-stone-900">
                              {professional.references_data?.length || 0}
                            </p>
                          </div>
                        </div>
                      </div>

                      <button
                        className="ml-6 rounded-lg bg-stone-500 px-6 py-3 font-semibold text-sm text-stone-50 transition-colors hover:bg-stone-500"
                        onClick={() => setSelectedProfessional(professional)}
                        type="button"
                      >
                        View Details
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Review Modal */}
      {selectedProfessional && (
        <ProfessionalReviewModal
          onClose={() => setSelectedProfessional(null)}
          onComplete={handleReviewComplete}
          professional={selectedProfessional}
        />
      )}
    </div>
  );
}
