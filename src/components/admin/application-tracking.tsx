"use client";

import {
  Calendar03Icon,
  CheckmarkCircle02Icon,
  ClockCircleIcon,
  FileEditIcon,
  Loading03Icon,
  TimeScheduleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type ApplicationMetrics = {
  totalApplications: number;
  pendingReview: number;
  approvalRate: number;
  averageReviewTime: number;
};

type FunnelStage = {
  stage: string;
  count: number;
  percentage: number;
};

type ApplicationTimeline = {
  event: string;
  timestamp: string;
  description: string;
  status: "completed" | "pending" | "current";
};

type ApplicationTrackingProps = {
  applicationId?: string;
  showTimeline?: boolean;
};

export function ApplicationTracking({
  applicationId,
  showTimeline = false,
}: ApplicationTrackingProps) {
  const [metrics, setMetrics] = useState<ApplicationMetrics | null>(null);
  const [funnel, setFunnel] = useState<FunnelStage[]>([]);
  const [timeline, setTimeline] = useState<ApplicationTimeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch metrics
        const metricsResponse = await fetch("/api/admin/applications/stats");
        if (!metricsResponse.ok) {
          throw new Error("Failed to fetch metrics");
        }
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData.metrics);
        setFunnel(metricsData.funnel);

        // Fetch timeline if applicationId is provided
        if (showTimeline && applicationId) {
          const timelineResponse = await fetch(`/api/admin/applications/${applicationId}/timeline`);
          if (timelineResponse.ok) {
            const timelineData = await timelineResponse.json();
            setTimeline(timelineData.timeline);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [applicationId, showTimeline]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <HugeiconsIcon className="h-12 w-12 animate-spin text-rausch-500" icon={Loading03Icon} />
          <p className="font-medium text-neutral-900">Loading application metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-neutral-200 bg-neutral-50">
        <CardContent className="p-8 text-center">
          <p className="mb-4 text-neutral-600 text-sm">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return null;
  }

  // Helper function to get timeline dot classes based on status
  const getTimelineDotClasses = (status: "completed" | "pending" | "current"): string => {
    if (status === "completed") {
      return "border-neutral-900 bg-neutral-900";
    }
    if (status === "current") {
      return "border-rausch-500 bg-rausch-500";
    }
    return "border-neutral-200 bg-white";
  };

  return (
    <div className="space-y-8">
      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Applications */}
        <Card className="border-neutral-200 bg-neutral-50 transition-shadow hover:shadow-md">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-neutral-50 p-3">
                <HugeiconsIcon className="h-6 w-6 text-neutral-900" icon={FileEditIcon} />
              </div>
              <p className="font-semibold text-neutral-500 text-xs tracking-wider">
                Total Applications
              </p>
            </div>
            <p className="mb-1 font-bold text-3xl text-neutral-900">{metrics.totalApplications}</p>
            <p className="text-neutral-600 text-sm">This month</p>
          </CardContent>
        </Card>

        {/* Pending Review */}
        <Card className="border-neutral-200 bg-neutral-50 transition-shadow hover:shadow-md">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-rausch-50 p-3">
                <HugeiconsIcon className="h-6 w-6 text-rausch-600" icon={ClockCircleIcon} />
              </div>
              <p className="font-semibold text-neutral-500 text-xs tracking-wider">
                Pending Review
              </p>
            </div>
            <p className="mb-1 font-bold text-3xl text-neutral-900">{metrics.pendingReview}</p>
            <p className="text-neutral-600 text-sm">Awaiting decision</p>
          </CardContent>
        </Card>

        {/* Approval Rate */}
        <Card className="border-neutral-200 bg-neutral-50 transition-shadow hover:shadow-md">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-neutral-50 p-3">
                <HugeiconsIcon className="h-6 w-6 text-neutral-900" icon={CheckmarkCircle02Icon} />
              </div>
              <p className="font-semibold text-neutral-500 text-xs tracking-wider">Approval Rate</p>
            </div>
            <p className="mb-1 font-bold text-3xl text-neutral-900">{metrics.approvalRate}%</p>
            <p className="text-neutral-600 text-sm">Professionals approved</p>
          </CardContent>
        </Card>

        {/* Average Review Time */}
        <Card className="border-neutral-200 bg-neutral-50 transition-shadow hover:shadow-md">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-neutral-50 p-3">
                <HugeiconsIcon className="h-6 w-6 text-neutral-900" icon={TimeScheduleIcon} />
              </div>
              <p className="font-semibold text-neutral-500 text-xs tracking-wider">
                Avg Review Time
              </p>
            </div>
            <p className="mb-1 font-bold text-3xl text-neutral-900">{metrics.averageReviewTime}</p>
            <p className="text-neutral-600 text-sm">Days to decision</p>
          </CardContent>
        </Card>
      </div>

      {/* Funnel Visualization */}
      <Card className="border-neutral-200 bg-neutral-50">
        <CardHeader className="pb-6">
          <div>
            <p className="mb-1 font-semibold text-neutral-500 text-xs tracking-wider">
              Application Funnel
            </p>
            <p className="text-neutral-500 text-sm">Drop-off rate at each stage</p>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {funnel.map((stage, _index) => (
              <div className="space-y-2" key={stage.stage}>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-neutral-900 text-sm">{stage.stage}</span>
                  <span className="font-semibold text-neutral-600 text-sm">
                    {stage.count} ({stage.percentage}%)
                  </span>
                </div>
                <div className="h-8 rounded-lg border border-neutral-200 bg-white">
                  <div
                    className="h-full rounded-lg bg-rausch-500 transition-all duration-500"
                    style={{ width: `${stage.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Timeline (shown when applicationId is provided) */}
      {showTimeline && timeline.length > 0 && (
        <Card className="border-neutral-200 bg-neutral-50">
          <CardHeader className="pb-6">
            <div>
              <p className="mb-1 font-semibold text-neutral-500 text-xs tracking-wider">
                Application Timeline
              </p>
              <p className="text-neutral-500 text-sm">Complete review history</p>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-6">
              {timeline.map((event, index) => (
                <div className="flex gap-4" key={`${event.event}-${index}`}>
                  {/* Timeline Dot */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full border ${getTimelineDotClasses(event.status)}`}
                    >
                      {event.status === "completed" && (
                        <HugeiconsIcon
                          className="h-4 w-4 text-white"
                          icon={CheckmarkCircle02Icon}
                        />
                      )}
                      {event.status === "current" && (
                        <HugeiconsIcon className="h-4 w-4 text-white" icon={Calendar03Icon} />
                      )}
                    </div>
                    {index < timeline.length - 1 && (
                      <div
                        className={`h-full w-px ${
                          event.status === "completed" ? "bg-neutral-900" : "bg-neutral-200"
                        }`}
                      />
                    )}
                  </div>

                  {/* Timeline Content */}
                  <div className="flex-1 pb-8">
                    <p className="mb-1 font-semibold text-neutral-900">{event.event}</p>
                    <p className="mb-2 text-neutral-600 text-sm">{event.description}</p>
                    <p className="text-neutral-500 text-xs">
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
