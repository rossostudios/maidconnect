/**
 * UpcomingJobsList - Next 3 Jobs Preview
 *
 * Replaces ServiceBreakdownChart with a more actionable view:
 * - Shows next 3 upcoming jobs with client, service, time
 * - Clickable addresses open Google Maps
 * - Direct message/call actions
 *
 * This is what domestic workers care about: "What's next?"
 * Following Lia Design System with Casaora Dark Mode palette.
 */

"use client";

import {
  Calendar03Icon,
  Clock01Icon,
  Location01Icon,
  Message01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";
import Link from "next/link";
import { geistSans } from "@/app/fonts";
import { cn } from "@/lib/utils";

// ========================================
// Types
// ========================================

export type UpcomingJob = {
  id: string;
  client: {
    name: string;
    avatar?: string;
  };
  serviceType: string;
  date: string;
  time: string;
  address?: string;
  addressUrl?: string;
};

type UpcomingJobsListProps = {
  jobs: UpcomingJob[];
  className?: string;
  onViewAll?: () => void;
};

// ========================================
// Mock Data (Development)
// ========================================

export const MOCK_UPCOMING_JOBS: UpcomingJob[] = [
  {
    id: "1",
    client: { name: "Maria Garcia" },
    serviceType: "Cleaning",
    date: "Today",
    time: "2:00 PM",
    address: "Cra 15 #93-47, Bogotá",
    addressUrl: "https://maps.google.com/?q=Cra+15+93-47+Bogota",
  },
  {
    id: "2",
    client: { name: "Carlos Rodriguez" },
    serviceType: "Nanny",
    date: "Tomorrow",
    time: "8:00 AM",
    address: "Calle 72 #10-25, Bogotá",
    addressUrl: "https://maps.google.com/?q=Calle+72+10-25+Bogota",
  },
  {
    id: "3",
    client: { name: "Ana Martinez" },
    serviceType: "Cooking",
    date: "Nov 29",
    time: "6:00 PM",
    address: "Av. 19 #114-09, Bogotá",
    addressUrl: "https://maps.google.com/?q=Av+19+114-09+Bogota",
  },
];

// ========================================
// Utilities
// ========================================

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getServiceColor(service: string): string {
  const colors: Record<string, string> = {
    Cleaning: "bg-rausch-500/20 text-rausch-500",
    Nanny: "bg-babu-500/20 text-babu-500",
    Cooking: "bg-green-500/20 text-green-500",
    Errands: "bg-neutral-500/20 text-neutral-500",
  };
  return colors[service] ?? "bg-neutral-500/20 text-neutral-500";
}

// ========================================
// Components
// ========================================

function JobCard({ job, index }: { job: UpcomingJob; index: number }) {
  return (
    <motion.div
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "flex items-start gap-3 rounded-lg p-3",
        "bg-neutral-50 dark:bg-muted/50",
        "hover:bg-neutral-100 dark:hover:bg-muted/70",
        "transition-colors"
      )}
      initial={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.2, delay: index * 0.1 }}
    >
      {/* Client Avatar */}
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-medium text-sm",
          "bg-rausch-500/20 text-rausch-500"
        )}
      >
        {getInitials(job.client.name)}
      </div>

      {/* Job Details */}
      <div className="min-w-0 flex-1">
        {/* Client Name + Service Badge */}
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "truncate font-medium text-sm",
              "text-neutral-900 dark:text-foreground",
              geistSans.className
            )}
          >
            {job.client.name}
          </span>
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 font-medium text-xs",
              getServiceColor(job.serviceType)
            )}
          >
            {job.serviceType}
          </span>
        </div>

        {/* Date & Time */}
        <div className="mt-1 flex items-center gap-3 text-neutral-600 text-xs dark:text-muted-foreground">
          <span className="flex items-center gap-1">
            <HugeiconsIcon className="h-3 w-3" icon={Calendar03Icon} />
            {job.date}
          </span>
          <span className="flex items-center gap-1">
            <HugeiconsIcon className="h-3 w-3" icon={Clock01Icon} />
            {job.time}
          </span>
        </div>

        {/* Address (Clickable for Maps) */}
        {job.address && (
          <a
            className={cn(
              "mt-1.5 flex items-center gap-1 text-xs",
              "text-babu-500 hover:text-babu-400",
              "transition-colors"
            )}
            href={job.addressUrl ?? `https://maps.google.com/?q=${encodeURIComponent(job.address)}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            <HugeiconsIcon className="h-3 w-3" icon={Location01Icon} />
            <span className="truncate underline-offset-2 hover:underline">{job.address}</span>
          </a>
        )}
      </div>

      {/* Quick Action - Message */}
      <Link
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          "bg-neutral-200/50 text-neutral-600",
          "dark:bg-muted dark:text-muted-foreground",
          "hover:bg-rausch-500/10 hover:text-rausch-500",
          "transition-colors"
        )}
        href={`/dashboard/pro/messages?booking=${job.id}`}
      >
        <HugeiconsIcon className="h-4 w-4" icon={Message01Icon} />
      </Link>
    </motion.div>
  );
}

export function UpcomingJobsList({ jobs, className, onViewAll }: UpcomingJobsListProps) {
  const hasJobs = jobs.length > 0;

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-lg border p-5",
        "border-neutral-200 bg-white",
        "dark:border-border dark:bg-background",
        className
      )}
      initial={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3
          className={cn(
            "font-semibold text-sm",
            "text-neutral-900 dark:text-foreground",
            geistSans.className
          )}
        >
          Next Jobs
        </h3>
        {hasJobs && (
          <span className="rounded-full bg-rausch-500/10 px-2 py-0.5 font-medium text-rausch-500 text-xs">
            {jobs.length} upcoming
          </span>
        )}
      </div>

      {/* Jobs List */}
      {hasJobs ? (
        <div className="space-y-2">
          {jobs.slice(0, 3).map((job, index) => (
            <JobCard index={index} job={job} key={job.id} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-muted">
            <HugeiconsIcon
              className="h-6 w-6 text-neutral-400 dark:text-muted-foreground"
              icon={Calendar03Icon}
            />
          </div>
          <p
            className={cn(
              "font-medium text-sm",
              "text-neutral-700 dark:text-foreground",
              geistSans.className
            )}
          >
            No upcoming jobs
          </p>
          <p className="mt-1 text-neutral-500 text-xs dark:text-muted-foreground">
            New inquiries will appear here
          </p>
        </div>
      )}

      {/* View All Link */}
      {hasJobs && (
        <button
          className={cn(
            "mt-4 w-full font-medium text-sm",
            "text-rausch-500 hover:text-rausch-400",
            "transition-colors",
            geistSans.className
          )}
          onClick={onViewAll}
          type="button"
        >
          View all bookings
        </button>
      )}
    </motion.div>
  );
}

// ========================================
// Skeleton
// ========================================

export function UpcomingJobsListSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg border p-5",
        "border-neutral-200 bg-white",
        "dark:border-border dark:bg-background",
        className
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="h-4 w-20 rounded bg-neutral-200 dark:bg-muted" />
        <div className="h-5 w-16 rounded-full bg-neutral-200 dark:bg-muted" />
      </div>
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <div
            className="flex items-start gap-3 rounded-lg bg-neutral-50 p-3 dark:bg-muted/50"
            key={i}
          >
            <div className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 rounded bg-neutral-200 dark:bg-muted" />
              <div className="h-3 w-24 rounded bg-neutral-200 dark:bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
