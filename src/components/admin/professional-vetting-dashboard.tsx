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
      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              className="h-48 animate-pulse rounded-xl border border-[#E5E5E5] bg-white"
              key={i}
            />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-xl border border-[#E5E5E5] bg-white" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-[#E5E5E5] bg-white">
        <CardContent className="p-8 text-center">
          <p className="mb-4 text-[#E63946] text-sm">{error}</p>
          <button
            className="rounded-lg bg-[#E63946] px-6 py-3 font-semibold text-sm text-white transition-colors hover:bg-[#D32F40]"
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
      color: "#f97316",
    },
    {
      name: "Approved",
      count: data.counts.approved,
      color: "#10b981",
    },
    {
      name: "Incomplete",
      count: data.counts.application_pending,
      color: "#737373",
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
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Needs Review Card */}
        <Card className="border-[#E5E5E5] bg-white transition-shadow hover:shadow-lg">
          <CardContent className="p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-orange-50 p-3">
                <HugeiconsIcon className="h-6 w-6 text-orange-600" icon={TimeScheduleIcon} />
              </div>
              <p className="font-semibold text-[#A3A3A3] text-xs uppercase tracking-wider">
                Needs Review
              </p>
            </div>
            <p className="mb-2 font-bold text-4xl text-[#171717]">
              {data.counts.application_in_review}
            </p>
            <p className="text-[#737373] text-sm">Waiting for admin review</p>
          </CardContent>
        </Card>

        {/* Approved Card */}
        <Card className="border-[#E5E5E5] bg-white transition-shadow hover:shadow-lg">
          <CardContent className="p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-green-50 p-3">
                <HugeiconsIcon className="h-6 w-6 text-green-600" icon={CheckmarkCircle02Icon} />
              </div>
              <p className="font-semibold text-[#A3A3A3] text-xs uppercase tracking-wider">
                Approved
              </p>
            </div>
            <p className="mb-2 font-bold text-4xl text-[#171717]">{data.counts.approved}</p>
            <p className="text-[#737373] text-sm">Ready to accept bookings</p>
          </CardContent>
        </Card>

        {/* Incomplete Card */}
        <Card className="border-[#E5E5E5] bg-white transition-shadow hover:shadow-lg">
          <CardContent className="p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-gray-50 p-3">
                <HugeiconsIcon className="h-6 w-6 text-[#737373]" icon={FileEditIcon} />
              </div>
              <p className="font-semibold text-[#A3A3A3] text-xs uppercase tracking-wider">
                Incomplete
              </p>
            </div>
            <p className="mb-2 font-bold text-4xl text-[#171717]">
              {data.counts.application_pending}
            </p>
            <p className="text-[#737373] text-sm">Applications in progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Queue Distribution Chart */}
      <Card className="border-[#E5E5E5] bg-white transition-shadow hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-6">
          <div>
            <p className="mb-1 font-semibold text-[#A3A3A3] text-xs uppercase tracking-wider">
              Queue Distribution
            </p>
            <p className="text-[#737373] text-sm">Professionals by vetting status</p>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-64">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={chartData}>
                <CartesianGrid stroke="#E5E5E5" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  axisLine={false}
                  dataKey="name"
                  fontSize={12}
                  stroke="#A3A3A3"
                  tickLine={false}
                />
                <YAxis axisLine={false} fontSize={12} stroke="#A3A3A3" tickLine={false} />
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
                <span className="ml-2 inline-flex items-center justify-center rounded-full bg-orange-100 px-2 py-0.5 font-semibold text-orange-600 text-xs">
                  {data.counts.application_in_review}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved
              {data.counts.approved > 0 && (
                <span className="ml-2 inline-flex items-center justify-center rounded-full bg-green-100 px-2 py-0.5 font-semibold text-green-600 text-xs">
                  {data.counts.approved}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="incomplete">
              Incomplete
              {data.counts.application_pending > 0 && (
                <span className="ml-2 inline-flex items-center justify-center rounded-full bg-gray-100 px-2 py-0.5 font-semibold text-[#737373] text-xs">
                  {data.counts.application_pending}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Sort Filter */}
          <div className="flex items-center gap-3">
            <HugeiconsIcon className="h-4 w-4 text-[#737373]" icon={FilterIcon} />
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
            <Card className="border-[#E5E5E5] bg-white">
              <CardContent className="flex min-h-[400px] items-center justify-center">
                <p className="text-[#737373] text-sm">No professionals need review.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {activeProfessionals.map((professional) => (
                <Card
                  className="border-[#E5E5E5] bg-white transition-shadow hover:shadow-lg"
                  key={professional.profile_id}
                >
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Header */}
                        <div className="mb-6 flex items-center gap-4">
                          <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-[#F5F5F5] p-3">
                              <HugeiconsIcon
                                className="h-6 w-6 text-[#171717]"
                                icon={UserAccountIcon}
                              />
                            </div>
                            <div>
                              <h4 className="font-semibold text-[#171717] text-lg">
                                {professional.full_name || "Unnamed Professional"}
                              </h4>
                              <p className="text-[#737373] text-sm">
                                {professional.profile?.city && professional.profile?.country
                                  ? `${professional.profile.city}, ${professional.profile.country}`
                                  : "Location not specified"}
                              </p>
                            </div>
                          </div>
                          <span className="rounded-full bg-orange-50 px-3 py-1 font-semibold text-orange-600 text-sm">
                            <HugeiconsIcon className="mr-1 inline h-4 w-4" icon={Calendar03Icon} />
                            {professional.waitingDays}d waiting
                          </span>
                        </div>

                        {/* Stats Grid */}
                        <div className="mb-6 grid grid-cols-2 gap-6 md:grid-cols-4">
                          <div>
                            <div className="mb-1 flex items-center gap-2">
                              <HugeiconsIcon
                                className="h-4 w-4 text-[#737373]"
                                icon={UserMultiple02Icon}
                              />
                              <span className="font-semibold text-[#A3A3A3] text-xs uppercase tracking-wider">
                                Services
                              </span>
                            </div>
                            <p className="font-bold text-2xl text-[#171717]">
                              {professional.primary_services?.length || 0}
                            </p>
                          </div>

                          <div>
                            <div className="mb-1 flex items-center gap-2">
                              <HugeiconsIcon
                                className="h-4 w-4 text-[#737373]"
                                icon={Award01Icon}
                              />
                              <span className="font-semibold text-[#A3A3A3] text-xs uppercase tracking-wider">
                                Experience
                              </span>
                            </div>
                            <p className="font-bold text-2xl text-[#171717]">
                              {professional.experience_years || 0}
                              <span className="ml-1 font-normal text-[#737373] text-sm">years</span>
                            </p>
                          </div>

                          <div>
                            <div className="mb-1 flex items-center gap-2">
                              <HugeiconsIcon
                                className="h-4 w-4 text-[#737373]"
                                icon={DocumentValidationIcon}
                              />
                              <span className="font-semibold text-[#A3A3A3] text-xs uppercase tracking-wider">
                                Documents
                              </span>
                            </div>
                            <p className="font-bold text-2xl text-[#171717]">
                              {professional.documentsCount}
                            </p>
                          </div>

                          <div>
                            <div className="mb-1 flex items-center gap-2">
                              <HugeiconsIcon
                                className="h-4 w-4 text-[#737373]"
                                icon={UserMultiple02Icon}
                              />
                              <span className="font-semibold text-[#A3A3A3] text-xs uppercase tracking-wider">
                                References
                              </span>
                            </div>
                            <p className="font-bold text-2xl text-[#171717]">
                              {professional.references_data?.length || 0}
                            </p>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                          {professional.consent_background_check && (
                            <span className="rounded-lg bg-green-50 px-3 py-1.5 font-medium text-green-700 text-xs">
                              ✓ Background check consent
                            </span>
                          )}
                          {professional.stripe_connect_account_id && (
                            <span className="rounded-lg bg-purple-50 px-3 py-1.5 font-medium text-purple-700 text-xs">
                              ✓ Stripe connected
                            </span>
                          )}
                          {professional.languages && professional.languages.length > 0 && (
                            <span className="rounded-lg bg-blue-50 px-3 py-1.5 font-medium text-blue-700 text-xs">
                              {professional.languages.join(", ")}
                            </span>
                          )}
                        </div>

                        {/* Latest Review */}
                        {professional.latestReview && (
                          <div className="mt-6 rounded-lg border border-[#E5E5E5] bg-[#FAFAF9] p-4">
                            <p className="mb-2 font-semibold text-[#A3A3A3] text-xs uppercase tracking-wider">
                              Latest Review
                            </p>
                            <p className="mb-1 text-[#737373] text-sm">
                              <span className="font-medium text-[#171717]">Status:</span>{" "}
                              {professional.latestReview.status} •{" "}
                              {new Date(professional.latestReview.created_at).toLocaleDateString()}
                            </p>
                            {professional.latestReview.notes && (
                              <p className="mt-2 text-[#171717] text-sm">
                                {professional.latestReview.notes}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Review Button */}
                      <button
                        className="ml-6 rounded-lg bg-[#E63946] px-6 py-3 font-semibold text-sm text-white transition-colors hover:bg-[#D32F40]"
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
            <Card className="border-[#E5E5E5] bg-white">
              <CardContent className="flex min-h-[400px] items-center justify-center">
                <p className="text-[#737373] text-sm">No approved professionals yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {activeProfessionals.map((professional) => (
                <Card
                  className="border-[#E5E5E5] bg-white transition-shadow hover:shadow-lg"
                  key={professional.profile_id}
                >
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Same card structure as needs_review but without Review button */}
                        <div className="mb-6 flex items-center gap-4">
                          <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-green-50 p-3">
                              <HugeiconsIcon
                                className="h-6 w-6 text-green-600"
                                icon={CheckmarkCircle02Icon}
                              />
                            </div>
                            <div>
                              <h4 className="font-semibold text-[#171717] text-lg">
                                {professional.full_name || "Unnamed Professional"}
                              </h4>
                              <p className="text-[#737373] text-sm">
                                {professional.profile?.city && professional.profile?.country
                                  ? `${professional.profile.city}, ${professional.profile.country}`
                                  : "Location not specified"}
                              </p>
                            </div>
                          </div>
                          <span className="rounded-full bg-green-50 px-3 py-1 font-semibold text-green-600 text-sm">
                            ✓ Approved
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                          <div>
                            <div className="mb-1 flex items-center gap-2">
                              <HugeiconsIcon
                                className="h-4 w-4 text-[#737373]"
                                icon={UserMultiple02Icon}
                              />
                              <span className="font-semibold text-[#A3A3A3] text-xs uppercase tracking-wider">
                                Services
                              </span>
                            </div>
                            <p className="font-bold text-2xl text-[#171717]">
                              {professional.primary_services?.length || 0}
                            </p>
                          </div>

                          <div>
                            <div className="mb-1 flex items-center gap-2">
                              <HugeiconsIcon
                                className="h-4 w-4 text-[#737373]"
                                icon={Award01Icon}
                              />
                              <span className="font-semibold text-[#A3A3A3] text-xs uppercase tracking-wider">
                                Experience
                              </span>
                            </div>
                            <p className="font-bold text-2xl text-[#171717]">
                              {professional.experience_years || 0}
                              <span className="ml-1 font-normal text-[#737373] text-sm">years</span>
                            </p>
                          </div>

                          <div>
                            <div className="mb-1 flex items-center gap-2">
                              <HugeiconsIcon
                                className="h-4 w-4 text-[#737373]"
                                icon={DocumentValidationIcon}
                              />
                              <span className="font-semibold text-[#A3A3A3] text-xs uppercase tracking-wider">
                                Documents
                              </span>
                            </div>
                            <p className="font-bold text-2xl text-[#171717]">
                              {professional.documentsCount}
                            </p>
                          </div>

                          <div>
                            <div className="mb-1 flex items-center gap-2">
                              <HugeiconsIcon
                                className="h-4 w-4 text-[#737373]"
                                icon={UserMultiple02Icon}
                              />
                              <span className="font-semibold text-[#A3A3A3] text-xs uppercase tracking-wider">
                                References
                              </span>
                            </div>
                            <p className="font-bold text-2xl text-[#171717]">
                              {professional.references_data?.length || 0}
                            </p>
                          </div>
                        </div>
                      </div>

                      <button
                        className="ml-6 rounded-lg bg-[#171717] px-6 py-3 font-semibold text-sm text-white transition-colors hover:bg-[#404040]"
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
            <Card className="border-[#E5E5E5] bg-white">
              <CardContent className="flex min-h-[400px] items-center justify-center">
                <p className="text-[#737373] text-sm">No incomplete applications.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {activeProfessionals.map((professional) => (
                <Card
                  className="border-[#E5E5E5] bg-white transition-shadow hover:shadow-lg"
                  key={professional.profile_id}
                >
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-6 flex items-center gap-4">
                          <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-gray-50 p-3">
                              <HugeiconsIcon
                                className="h-6 w-6 text-[#737373]"
                                icon={FileEditIcon}
                              />
                            </div>
                            <div>
                              <h4 className="font-semibold text-[#171717] text-lg">
                                {professional.full_name || "Unnamed Professional"}
                              </h4>
                              <p className="text-[#737373] text-sm">
                                {professional.profile?.city && professional.profile?.country
                                  ? `${professional.profile.city}, ${professional.profile.country}`
                                  : "Location not specified"}
                              </p>
                            </div>
                          </div>
                          <span className="rounded-full bg-gray-100 px-3 py-1 font-semibold text-[#737373] text-sm">
                            Incomplete
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                          <div>
                            <div className="mb-1 flex items-center gap-2">
                              <HugeiconsIcon
                                className="h-4 w-4 text-[#737373]"
                                icon={UserMultiple02Icon}
                              />
                              <span className="font-semibold text-[#A3A3A3] text-xs uppercase tracking-wider">
                                Services
                              </span>
                            </div>
                            <p className="font-bold text-2xl text-[#171717]">
                              {professional.primary_services?.length || 0}
                            </p>
                          </div>

                          <div>
                            <div className="mb-1 flex items-center gap-2">
                              <HugeiconsIcon
                                className="h-4 w-4 text-[#737373]"
                                icon={Award01Icon}
                              />
                              <span className="font-semibold text-[#A3A3A3] text-xs uppercase tracking-wider">
                                Experience
                              </span>
                            </div>
                            <p className="font-bold text-2xl text-[#171717]">
                              {professional.experience_years || 0}
                              <span className="ml-1 font-normal text-[#737373] text-sm">years</span>
                            </p>
                          </div>

                          <div>
                            <div className="mb-1 flex items-center gap-2">
                              <HugeiconsIcon
                                className="h-4 w-4 text-[#737373]"
                                icon={DocumentValidationIcon}
                              />
                              <span className="font-semibold text-[#A3A3A3] text-xs uppercase tracking-wider">
                                Documents
                              </span>
                            </div>
                            <p className="font-bold text-2xl text-[#171717]">
                              {professional.documentsCount}
                            </p>
                          </div>

                          <div>
                            <div className="mb-1 flex items-center gap-2">
                              <HugeiconsIcon
                                className="h-4 w-4 text-[#737373]"
                                icon={UserMultiple02Icon}
                              />
                              <span className="font-semibold text-[#A3A3A3] text-xs uppercase tracking-wider">
                                References
                              </span>
                            </div>
                            <p className="font-bold text-2xl text-[#171717]">
                              {professional.references_data?.length || 0}
                            </p>
                          </div>
                        </div>
                      </div>

                      <button
                        className="ml-6 rounded-lg bg-[#737373] px-6 py-3 font-semibold text-sm text-white transition-colors hover:bg-[#525252]"
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
