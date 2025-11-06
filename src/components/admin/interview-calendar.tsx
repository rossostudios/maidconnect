"use client";

import {
  Calendar03Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Location01Icon,
  TimeScheduleIcon,
  UserAccountIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type InterviewSlot = {
  id: string;
  professional_id: string;
  scheduled_at: string;
  location: string;
  location_address: {
    street?: string;
    city?: string;
    directions?: string;
  };
  status: "scheduled" | "completed" | "no_show" | "rescheduled" | "cancelled";
  interview_notes: string | null;
  completed_by: string | null;
  completed_at: string | null;
  created_at: string;
  professional: {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    city: string | null;
    country: string | null;
  };
};

type InterviewCalendarData = {
  interviews: InterviewSlot[];
  grouped: {
    scheduled: InterviewSlot[];
    completed: InterviewSlot[];
    no_show: InterviewSlot[];
    cancelled: InterviewSlot[];
  };
  counts: {
    scheduled: number;
    completed: number;
    no_show: number;
    cancelled: number;
    total: number;
  };
};

export function InterviewCalendar() {
  const [data, setData] = useState<InterviewCalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInterview, setSelectedInterview] = useState<InterviewSlot | null>(null);
  const [activeTab, setActiveTab] = useState("scheduled");
  const [filterLocation, setFilterLocation] = useState<string>("all");

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/interviews");

      if (!response.ok) {
        throw new Error("Failed to load interviews");
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load interviews");
    } finally {
      setLoading(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: fetchInterviews is intentionally excluded
  useEffect(() => {
    fetchInterviews();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              className="h-48 animate-pulse rounded-xl border border-[#E5E5E5] bg-white"
              key={i}
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-[#E5E5E5] bg-white">
        <CardContent className="p-8 text-center">
          <p className="mb-4 text-[#E85D48] text-sm">{error}</p>
          <button
            className="rounded-lg bg-[#E85D48] px-6 py-3 font-semibold text-sm text-white transition-colors hover:bg-[#D32F40]"
            onClick={fetchInterviews}
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

  // Get unique locations for filter
  const locations = Array.from(
    new Set(data.interviews.map((interview) => interview.location).filter(Boolean))
  );

  // Get interviews for active tab
  const getActiveInterviews = () => {
    let interviews: InterviewSlot[] = [];

    switch (activeTab) {
      case "scheduled":
        interviews = data.grouped.scheduled;
        break;
      case "completed":
        interviews = data.grouped.completed;
        break;
      case "no_show":
        interviews = data.grouped.no_show;
        break;
      case "cancelled":
        interviews = data.grouped.cancelled;
        break;
      default:
        interviews = [];
    }

    // Apply location filter
    if (filterLocation !== "all") {
      interviews = interviews.filter((interview) => interview.location === filterLocation);
    }

    // Sort by scheduled date (upcoming first)
    return interviews.sort(
      (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
    );
  };

  const activeInterviews = getActiveInterviews();

  // Helper function to get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-50 text-blue-600";
      case "completed":
        return "bg-green-50 text-green-600";
      case "no_show":
        return "bg-red-50 text-red-600";
      case "cancelled":
        return "bg-gray-50 text-[#737373]";
      case "rescheduled":
        return "bg-yellow-50 text-yellow-600";
      default:
        return "bg-gray-50 text-[#737373]";
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format time for display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Check if interview is upcoming (within next 7 days)
  const isUpcoming = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const daysUntil = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil >= 0 && daysUntil <= 7;
  };

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        {/* Scheduled Card */}
        <Card className="border-[#E5E5E5] bg-white transition-shadow hover:shadow-lg">
          <CardContent className="p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-3">
                <HugeiconsIcon className="h-6 w-6 text-blue-600" icon={Calendar03Icon} />
              </div>
              <p className="font-semibold text-[#A3A3A3] text-xs uppercase tracking-wider">
                Scheduled
              </p>
            </div>
            <p className="mb-2 font-bold text-4xl text-[#171717]">{data.counts.scheduled}</p>
            <p className="text-[#737373] text-sm">Upcoming interviews</p>
          </CardContent>
        </Card>

        {/* Completed Card */}
        <Card className="border-[#E5E5E5] bg-white transition-shadow hover:shadow-lg">
          <CardContent className="p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-green-50 p-3">
                <HugeiconsIcon className="h-6 w-6 text-green-600" icon={CheckmarkCircle02Icon} />
              </div>
              <p className="font-semibold text-[#A3A3A3] text-xs uppercase tracking-wider">
                Completed
              </p>
            </div>
            <p className="mb-2 font-bold text-4xl text-[#171717]">{data.counts.completed}</p>
            <p className="text-[#737373] text-sm">Interviews finished</p>
          </CardContent>
        </Card>

        {/* No Show Card */}
        <Card className="border-[#E5E5E5] bg-white transition-shadow hover:shadow-lg">
          <CardContent className="p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-red-50 p-3">
                <HugeiconsIcon className="h-6 w-6 text-red-600" icon={Cancel01Icon} />
              </div>
              <p className="font-semibold text-[#A3A3A3] text-xs uppercase tracking-wider">
                No Show
              </p>
            </div>
            <p className="mb-2 font-bold text-4xl text-[#171717]">{data.counts.no_show}</p>
            <p className="text-[#737373] text-sm">Missed interviews</p>
          </CardContent>
        </Card>

        {/* Cancelled Card */}
        <Card className="border-[#E5E5E5] bg-white transition-shadow hover:shadow-lg">
          <CardContent className="p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-gray-50 p-3">
                <HugeiconsIcon className="h-6 w-6 text-[#737373]" icon={TimeScheduleIcon} />
              </div>
              <p className="font-semibold text-[#A3A3A3] text-xs uppercase tracking-wider">
                Cancelled
              </p>
            </div>
            <p className="mb-2 font-bold text-4xl text-[#171717]">{data.counts.cancelled}</p>
            <p className="text-[#737373] text-sm">Cancelled by user</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs & Filters */}
      <Tabs className="w-full" onValueChange={setActiveTab} value={activeTab}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <TabsList>
            <TabsTrigger value="scheduled">
              Scheduled
              {data.counts.scheduled > 0 && (
                <span className="ml-2 inline-flex items-center justify-center rounded-full bg-blue-100 px-2 py-0.5 font-semibold text-blue-600 text-xs">
                  {data.counts.scheduled}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="no_show">No Show</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          {/* Location Filter */}
          {locations.length > 1 && (
            <div className="flex items-center gap-3">
              <HugeiconsIcon className="h-4 w-4 text-[#737373]" icon={Location01Icon} />
              <Select onValueChange={setFilterLocation} value={filterLocation}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Tab Content */}
        {["scheduled", "completed", "no_show", "cancelled"].map((tabValue) => (
          <TabsContent key={tabValue} value={tabValue}>
            {activeInterviews.length === 0 ? (
              <Card className="border-[#E5E5E5] bg-white">
                <CardContent className="flex min-h-[400px] items-center justify-center">
                  <p className="text-[#737373] text-sm">No {tabValue} interviews found.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {activeInterviews.map((interview) => (
                  <Card
                    className="border-[#E5E5E5] bg-white transition-shadow hover:shadow-lg"
                    key={interview.id}
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
                                  {interview.professional.full_name || "Unnamed Professional"}
                                </h4>
                                <p className="text-[#737373] text-sm">
                                  {interview.professional.email || interview.professional.phone}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <span
                                className={`rounded-full px-3 py-1 font-semibold text-sm ${getStatusBadge(interview.status)}`}
                              >
                                {interview.status.replace("_", " ")}
                              </span>
                              {isUpcoming(interview.scheduled_at) &&
                                interview.status === "scheduled" && (
                                  <span className="rounded-full bg-orange-50 px-3 py-1 font-semibold text-orange-600 text-sm">
                                    Upcoming
                                  </span>
                                )}
                            </div>
                          </div>

                          {/* Interview Details */}
                          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                            <div>
                              <div className="mb-2 flex items-center gap-2">
                                <HugeiconsIcon
                                  className="h-4 w-4 text-[#737373]"
                                  icon={Calendar03Icon}
                                />
                                <span className="font-semibold text-[#A3A3A3] text-xs uppercase tracking-wider">
                                  Date
                                </span>
                              </div>
                              <p className="font-semibold text-[#171717]">
                                {formatDate(interview.scheduled_at)}
                              </p>
                            </div>

                            <div>
                              <div className="mb-2 flex items-center gap-2">
                                <HugeiconsIcon
                                  className="h-4 w-4 text-[#737373]"
                                  icon={TimeScheduleIcon}
                                />
                                <span className="font-semibold text-[#A3A3A3] text-xs uppercase tracking-wider">
                                  Time
                                </span>
                              </div>
                              <p className="font-semibold text-[#171717]">
                                {formatTime(interview.scheduled_at)}
                              </p>
                            </div>

                            <div>
                              <div className="mb-2 flex items-center gap-2">
                                <HugeiconsIcon
                                  className="h-4 w-4 text-[#737373]"
                                  icon={Location01Icon}
                                />
                                <span className="font-semibold text-[#A3A3A3] text-xs uppercase tracking-wider">
                                  Location
                                </span>
                              </div>
                              <p className="font-semibold text-[#171717]">{interview.location}</p>
                            </div>
                          </div>

                          {/* Location Address */}
                          {interview.location_address && (
                            <div className="mb-6 rounded-lg border border-[#E5E5E5] bg-[#FAFAF9] p-4">
                              <p className="mb-1 font-semibold text-[#171717] text-sm">
                                {interview.location_address.street}
                              </p>
                              <p className="text-[#737373] text-sm">
                                {interview.location_address.city}
                              </p>
                              {interview.location_address.directions && (
                                <p className="mt-2 text-[#737373] text-xs">
                                  {interview.location_address.directions}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Interview Notes */}
                          {interview.interview_notes && (
                            <div className="rounded-lg border border-[#E5E5E5] bg-[#FAFAF9] p-4">
                              <p className="mb-2 font-semibold text-[#A3A3A3] text-xs uppercase tracking-wider">
                                Interview Notes
                              </p>
                              <p className="text-[#171717] text-sm">{interview.interview_notes}</p>
                            </div>
                          )}
                        </div>

                        {/* Action Button */}
                        {interview.status === "scheduled" && (
                          <button
                            className="ml-6 rounded-lg bg-[#E85D48] px-6 py-3 font-semibold text-sm text-white transition-colors hover:bg-[#D32F40]"
                            onClick={() => setSelectedInterview(interview)}
                            type="button"
                          >
                            Manage Interview
                          </button>
                        )}
                        {interview.status !== "scheduled" && (
                          <button
                            className="ml-6 rounded-lg bg-[#171717] px-6 py-3 font-semibold text-sm text-white transition-colors hover:bg-[#404040]"
                            onClick={() => setSelectedInterview(interview)}
                            type="button"
                          >
                            View Details
                          </button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Interview Management Modal would go here */}
      {selectedInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-auto rounded-xl border border-[#E5E5E5] bg-white p-8 shadow-2xl">
            <button
              className="absolute top-6 right-6 rounded-lg p-2 text-[#737373] transition-colors hover:bg-[#F5F5F5] hover:text-[#171717]"
              onClick={() => setSelectedInterview(null)}
              type="button"
            >
              <HugeiconsIcon className="h-6 w-6" icon={Cancel01Icon} />
            </button>
            <p className="text-center text-[#737373]">
              Interview management modal content will go here
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
