/**
 * AdminSettingsSkeleton - Loading state for admin settings page
 *
 * Features:
 * - Tab navigation skeleton
 * - Settings panel skeleton
 * - Form sections skeleton
 *
 * Week 2: Route-Level Loading States
 */

export function AdminSettingsSkeleton() {
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-8">
      {/* Tabs Navigation Skeleton */}
      <div className="mb-8 flex gap-2 border-neutral-200 border-b pb-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div className="h-10 w-32 animate-pulse rounded-lg bg-neutral-200" key={i} />
        ))}
      </div>

      {/* Content Area Skeleton */}
      <div className="space-y-6">
        {/* Section Header */}
        <div>
          <div className="mb-1 h-7 w-64 animate-pulse rounded-lg bg-neutral-200" />
          <div className="h-5 w-96 animate-pulse rounded-lg bg-neutral-200" />
        </div>

        {/* Form Sections */}
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div className="rounded-lg border border-neutral-200 bg-white p-6" key={i}>
              {/* Section Title */}
              <div className="mb-4 h-6 w-48 animate-pulse rounded-lg bg-neutral-200" />

              {/* Form Fields */}
              <div className="space-y-4">
                {[1, 2].map((j) => (
                  <div key={j}>
                    <div className="mb-2 h-4 w-32 animate-pulse rounded-lg bg-neutral-200" />
                    <div className="h-12 w-full animate-pulse rounded-lg bg-neutral-200" />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Save Button */}
          <div className="flex justify-end">
            <div className="h-12 w-32 animate-pulse rounded-lg bg-neutral-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
