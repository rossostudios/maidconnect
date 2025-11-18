/**
 * Moderation Queue Dashboard Page
 * /admin/moderation
 *
 * Displays flagged users with suspicious activity patterns
 * organized by severity and status.
 */

import { Metadata } from "next";
import { ModerationQueueDashboard } from "@/components/admin/moderation-queue-dashboard";

export const metadata: Metadata = {
  title: "Moderation Queue | Admin",
  description: "Review flagged users and suspicious activity",
};

export default function ModerationPage() {
  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="type-display-sm mb-2 text-neutral-900">Moderation Queue</h1>
          <p className="type-body-md text-neutral-700">
            Review flagged users and take action on suspicious activity
          </p>
        </div>

        <ModerationQueueDashboard />
      </div>
    </div>
  );
}
