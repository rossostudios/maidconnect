/**
 * Settings Loading State
 *
 * Next.js loading.tsx file for instant loading feedback
 * Shows skeleton while admin settings page loads
 *
 * Week 2: Route-Level Loading States
 */

import { Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AdminSettingsSkeleton } from "@/components/admin/admin-settings-skeleton";

export default function SettingsLoading() {
  return (
    <section className="space-y-8">
      <div className="flex justify-center">
        <div className="flex flex-col items-center gap-4">
          <HugeiconsIcon className="h-12 w-12 animate-spin text-rausch-500" icon={Loading03Icon} />
          <p className="font-medium text-neutral-900">Syncing settings</p>
        </div>
      </div>
      {/* Page Header Skeleton */}
      <div>
        <div className="mb-2 h-9 w-48 animate-pulse bg-neutral-200" />
        <div className="h-6 w-80 animate-pulse bg-neutral-200" />
      </div>

      {/* Settings Content Skeleton */}
      <AdminSettingsSkeleton />
    </section>
  );
}
