/**
 * Moderation Queue Dashboard Page
 * /admin/moderation
 *
 * Displays flagged users with suspicious activity patterns
 * organized by severity and status.
 */

import { Metadata } from "next";
import { geistSans } from "@/app/fonts";
import { ModerationQueueDashboard } from "@/components/admin/moderation-queue-dashboard";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Moderation Queue | Admin",
  description: "Review flagged users and suspicious activity",
};

export default function ModerationPage() {
  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className={cn("mb-2 font-semibold text-3xl text-neutral-900 tracking-tight", geistSans.className)}>
            Moderation Queue
          </h1>
          <p className={cn("text-neutral-600 text-base", geistSans.className)}>
            Review flagged users and take action on suspicious activity
          </p>
        </div>

        <ModerationQueueDashboard />
      </div>
    </div>
  );
}
