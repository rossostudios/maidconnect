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
import { LoadingCamper } from "@/components/ui/loading-camper";
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
const ProfessionalReviewModal = dynamic(
  () => import("./professional-review-modal").then((mod) => mod.ProfessionalReviewModal),
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
      <div className="flex min-h-[400px] items-center justify-center">
        <LoadingCamper size="lg" text="Loading vetting queue..." />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-neutral-200 bg-neutral-50">
        <CardContent className="p-8 text-center">
          <p className="mb-4 text-neutral-600 text-sm">{error}</p>
          <button
            className="bg-neutral-600 px-6 py-3 font-semibold text-neutral-50 text-sm transition-colors hover:bg-neutral-600"
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
      color: "#3b82f6", // blue-500 - action needed
    },
    {
      name: "Approved",
      count: data.counts.approved,
      color: "#10b981", // green-500 - success
    },
    {
      name: "Incomplete",
      count: data.counts.application_pending,
      color: "#f59e0b", // amber-500 - warning
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
      {/* Summary Cards - Max 3 columns for comfortable card sizes */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
      </div>

      {/* Queue Distribution Chart */}
      <Card className="border-neutral-200 bg-neutral-50 transition-shadow hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-6">
          <div>
            <p className="mb-1 font-semibold text-neutral-500 text-xs uppercase tracking-wider">
              Queue Distribution
            </p>
            <p className="text-neutral-500 text-sm">Professionals by vetting status</p>
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
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="needs_review">
              Needs Review
              {data.counts.application_in_review > 0 && (
                <span className="-full ml-2 inline-flex items-center justify-center bg-neutral-600/10 px-2 py-0.5 font-semibold text-neutral-600 text-xs">
                  {data.counts.application_in_review}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved
              {data.counts.approved > 0 && (
                <span className="-full ml-2 inline-flex items-center justify-center bg-neutral-600/10 px-2 py-0.5 font-semibold text-neutral-600 text-xs">
                  {data.counts.approved}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="incomplete">
              Incomplete
              {data.counts.application_pending > 0 && (
                <span className="-full ml-2 inline-flex items-center justify-center bg-neutral-200/30 px-2 py-0.5 font-semibold text-neutral-500 text-xs">
                  {data.counts.application_pending}
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
            <Card className="border-neutral-200 bg-white">
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
                      No professionals are currently awaiting review. New applications will appear
                      here when submitted.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeProfessionals.map((professional) => (
                <Card
                  className="border-neutral-200 bg-neutral-50 transition-shadow hover:shadow-md"
                  key={professional.profile_id}
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        {/* Header */}
                        <div className="mb-4 flex flex-wrap items-center gap-2 sm:gap-4">
                          <div className="flex items-center gap-2">
                            <div className="bg-neutral-50 p-2">
                              <HugeiconsIcon
                                className="h-5 w-5 text-neutral-900"
                                icon={UserAccountIcon}
                              />
                            </div>
                            <div className="min-w-0">
                              <h4 className="truncate font-semibold text-base text-neutral-900 sm:text-lg">
                                {professional.full_name || "Unnamed Professional"}
                              </h4>
                              <p className="truncate text-neutral-500 text-xs">
                                {professional.profile?.city && professional.profile?.country
                                  ? `${professional.profile.city}, ${professional.profile.country}`
                                  : "Location not specified"}
                              </p>
                            </div>
                          </div>
                          <span className="whitespace-nowrap rounded-full bg-neutral-600/10 px-2 py-1 font-semibold text-neutral-600 text-xs">
                            <HugeiconsIcon className="mr-1 inline h-3 w-3" icon={Calendar03Icon} />
                            {professional.waitingDays}d waiting
                          </span>
                        </div>

                        {/* Stats Grid */}
                        <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                          <div>
                            <div className="mb-1 flex items-center gap-2">
                              <HugeiconsIcon
                                className="h-4 w-4 text-neutral-500"
                                icon={UserMultiple02Icon}
                              />
                              <span className="font-semibold text-neutral-500 text-xs uppercase tracking-wider">
                                Services
                              </span>
                            </div>
                            <p className="font-bold text-2xl text-neutral-900">
                              {professional.primary_services?.length || 0}
                            </p>
                          </div>

                          <div>
                            <div className="mb-1 flex items-center gap-2">
                              <HugeiconsIcon
                                className="h-4 w-4 text-neutral-500"
                                icon={Award01Icon}
                              />
                              <span className="font-semibold text-neutral-500 text-xs uppercase tracking-wider">
                                Experience
                              </span>
                            </div>
                            <p className="font-bold text-2xl text-neutral-900">
                              {professional.experience_years || 0}
                              <span className="ml-1 font-normal text-neutral-500 text-sm">
                                years
                              </span>
                            </p>
                          </div>

                          <div>
                            <div className="mb-1 flex items-center gap-2">
                              <HugeiconsIcon
                                className="h-4 w-4 text-neutral-500"
                                icon={DocumentValidationIcon}
                              />
                              <span className="font-semibold text-neutral-500 text-xs uppercase tracking-wider">
                                Documents
                              </span>
                            </div>
                            <p className="font-bold text-2xl text-neutral-900">
                              {professional.documentsCount}
                            </p>
                          </div>

                          <div>
                            <div className="mb-1 flex items-center gap-2">
                              <HugeiconsIcon
                                className="h-4 w-4 text-neutral-500"
                                icon={UserMultiple02Icon}
                              />
                              <span className="font-semibold text-neutral-500 text-xs uppercase tracking-wider">
                                References
                              </span>
                            </div>
                            <p className="font-bold text-2xl text-neutral-900">
                              {professional.references_data?.length || 0}
                            </p>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                          {professional.consent_background_check && (
                            <span className="bg-neutral-600/10 px-3 py-1.5 font-medium text-neutral-600 text-xs">
                              ✓ Background check consent
                            </span>
                          )}
                          {professional.stripe_connect_account_id && (
                            <span className="bg-neutral-600/10 px-3 py-1.5 font-medium text-neutral-600 text-xs">
                              ✓ Stripe connected
                            </span>
                          )}
                          {professional.languages && professional.languages.length > 0 && (
                            <span className="bg-neutral-50 px-3 py-1.5 font-medium text-neutral-600 text-xs">
                              {professional.languages.join(", ")}
                            </span>
                          )}
                        </div>

                        {/* Latest Review */}
                        {professional.latestReview && (
                          <div className="mt-6 border border-neutral-200 bg-neutral-50 p-4">
                            <p className="mb-2 font-semibold text-neutral-500 text-xs uppercase tracking-wider">
                              Latest Review
                            </p>
                            <p className="mb-1 text-neutral-500 text-sm">
                              <span className="font-medium text-neutral-900">Status:</span>{" "}
                              {professional.latestReview.status} •{" "}
                              {new Date(professional.latestReview.created_at).toLocaleDateString()}
                            </p>
                            {professional.latestReview.notes && (
                              <p className="mt-2 text-neutral-900 text-sm">
                                {professional.latestReview.notes}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Review Button */}
                      <button
                        className="ml-6 bg-neutral-600 px-6 py-3 font-semibold text-neutral-50 text-sm transition-colors hover:bg-neutral-600"
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
            <Card className="border-neutral-200 bg-neutral-50">
              <CardContent className="flex min-h-[400px] items-center justify-center">
                <p className="text-neutral-500 text-sm">No approved professionals yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeProfessionals.map((professional) => (
                <Card
                  className="border-neutral-200 bg-neutral-50 transition-shadow hover:shadow-md"
                  key={professional.profile_id}
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        {/* Header */}
                        <div className="mb-4 flex flex-wrap items-center gap-2 sm:gap-4">
                          <div className="flex items-center gap-2">
                            <div className="bg-neutral-600/10 p-2">
                              <HugeiconsIcon
                                className="h-5 w-5 text-neutral-600"
                                icon={CheckmarkCircle02Icon}
                              />
                            </div>
                            <div className="min-w-0">
                              <h4 className="truncate font-semibold text-base text-neutral-900 sm:text-lg">
                                {professional.full_name || "Unnamed Professional"}
                              </h4>
                              <p className="truncate text-neutral-500 text-xs">
                                {professional.profile?.city && professional.profile?.country
                                  ? `${professional.profile.city}, ${professional.profile.country}`
                                  : "Location not specified"}
                              </p>
                            </div>
                          </div>
                          <span className="whitespace-nowrap rounded-full bg-neutral-600/10 px-2 py-1 font-semibold text-neutral-600 text-xs">
                            ✓ Approved
                          </span>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                          <div>
                            <div className="mb-1 flex items-center gap-2">
                              <HugeiconsIcon
                                className="h-4 w-4 text-neutral-500"
                                icon={UserMultiple02Icon}
                              />
                              <span className="font-semibold text-neutral-500 text-xs uppercase tracking-wider">
                                Services
                              </span>
                            </div>
                            <p className="font-bold text-2xl text-neutral-900">
                              {professional.primary_services?.length || 0}
                            </p>
                          </div>

                          <div>
                            <div className="mb-1 flex items-center gap-2">
                              <HugeiconsIcon
                                className="h-4 w-4 text-neutral-500"
                                icon={Award01Icon}
                              />
                              <span className="font-semibold text-neutral-500 text-xs uppercase tracking-wider">
                                Experience
                              </span>
                            </div>
                            <p className="font-bold text-2xl text-neutral-900">
                              {professional.experience_years || 0}
                              <span className="ml-1 font-normal text-neutral-500 text-sm">
                                years
                              </span>
                            </p>
                          </div>

                          <div>
                            <div className="mb-1 flex items-center gap-2">
                              <HugeiconsIcon
                                className="h-4 w-4 text-neutral-500"
                                icon={DocumentValidationIcon}
                              />
                              <span className="font-semibold text-neutral-500 text-xs uppercase tracking-wider">
                                Documents
                              </span>
                            </div>
                            <p className="font-bold text-2xl text-neutral-900">
                              {professional.documentsCount}
                            </p>
                          </div>

                          <div>
                            <div className="mb-1 flex items-center gap-2">
                              <HugeiconsIcon
                                className="h-4 w-4 text-neutral-500"
                                icon={UserMultiple02Icon}
                              />
                              <span className="font-semibold text-neutral-500 text-xs uppercase tracking-wider">
                                References
                              </span>
                            </div>
                            <p className="font-bold text-2xl text-neutral-900">
                              {professional.references_data?.length || 0}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* View Details Button */}
                      <button
                        className="bg-neutral-900 px-4 py-2 font-semibold text-neutral-50 text-sm transition-colors hover:bg-neutral-900 sm:ml-6"
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
            <Card className="border-neutral-200 bg-neutral-50">
              <CardContent className="flex min-h-[400px] items-center justify-center">
                <p className="text-neutral-500 text-sm">No incomplete applications.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeProfessionals.map((professional) => (
                <Card
                  className="border-neutral-200 bg-neutral-50 transition-shadow hover:shadow-md"
                  key={professional.profile_id}
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        {/* Header */}
                        <div className="mb-4 flex flex-wrap items-center gap-2 sm:gap-4">
                          <div className="flex items-center gap-2">
                            <div className="bg-neutral-50 p-2">
                              <HugeiconsIcon
                                className="h-5 w-5 text-neutral-500"
                                icon={FileEditIcon}
                              />
                            </div>
                            <div className="min-w-0">
                              <h4 className="truncate font-semibold text-base text-neutral-900 sm:text-lg">
                                {professional.full_name || "Unnamed Professional"}
                              </h4>
                              <p className="truncate text-neutral-500 text-xs">
                                {professional.profile?.city && professional.profile?.country
                                  ? `${professional.profile.city}, ${professional.profile.country}`
                                  : "Location not specified"}
                              </p>
                            </div>
                          </div>
                          <span className="whitespace-nowrap rounded-full bg-neutral-200/30 px-2 py-1 font-semibold text-neutral-500 text-xs">
                            Incomplete
                          </span>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                          <div>
                            <div className="mb-1 flex items-center gap-2">
                              <HugeiconsIcon
                                className="h-4 w-4 text-neutral-500"
                                icon={UserMultiple02Icon}
                              />
                              <span className="font-semibold text-neutral-500 text-xs uppercase tracking-wider">
                                Services
                              </span>
                            </div>
                            <p className="font-bold text-2xl text-neutral-900">
                              {professional.primary_services?.length || 0}
                            </p>
                          </div>

                          <div>
                            <div className="mb-1 flex items-center gap-2">
                              <HugeiconsIcon
                                className="h-4 w-4 text-neutral-500"
                                icon={Award01Icon}
                              />
                              <span className="font-semibold text-neutral-500 text-xs uppercase tracking-wider">
                                Experience
                              </span>
                            </div>
                            <p className="font-bold text-2xl text-neutral-900">
                              {professional.experience_years || 0}
                              <span className="ml-1 font-normal text-neutral-500 text-sm">
                                years
                              </span>
                            </p>
                          </div>

                          <div>
                            <div className="mb-1 flex items-center gap-2">
                              <HugeiconsIcon
                                className="h-4 w-4 text-neutral-500"
                                icon={DocumentValidationIcon}
                              />
                              <span className="font-semibold text-neutral-500 text-xs uppercase tracking-wider">
                                Documents
                              </span>
                            </div>
                            <p className="font-bold text-2xl text-neutral-900">
                              {professional.documentsCount}
                            </p>
                          </div>

                          <div>
                            <div className="mb-1 flex items-center gap-2">
                              <HugeiconsIcon
                                className="h-4 w-4 text-neutral-500"
                                icon={UserMultiple02Icon}
                              />
                              <span className="font-semibold text-neutral-500 text-xs uppercase tracking-wider">
                                References
                              </span>
                            </div>
                            <p className="font-bold text-2xl text-neutral-900">
                              {professional.references_data?.length || 0}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* View Details Button */}
                      <button
                        className="bg-neutral-500 px-4 py-2 font-semibold text-neutral-50 text-sm transition-colors hover:bg-neutral-500 sm:ml-6"
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
