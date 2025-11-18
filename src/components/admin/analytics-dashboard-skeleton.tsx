/**
 * AnalyticsDashboardSkeleton - Professional loading state with Lia design
 *
 * Features:
 * - Anthropic rounded corners (rounded-lg)
 * - Neutral-200 with neutral-50 pulse animation
 * - Matches final dashboard layout (time range, KPIs, overview, tables)
 * - WCAG AAA contrast-safe gray tones
 */

export function AnalyticsDashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      {/* Time Range Selector Skeleton */}
      <div className="flex justify-end gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div className="h-10 w-24 rounded-lg bg-neutral-200" key={i} />
        ))}
      </div>

      {/* KPI Cards Skeleton (4 cards) */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div className="rounded-lg border border-neutral-200 bg-white p-6" key={i}>
            {/* Header */}
            <div className="mb-2 h-4 w-32 rounded-lg bg-neutral-200" />
            {/* Value */}
            <div className="mb-2 h-10 w-24 rounded-lg bg-neutral-200" />
            {/* Description */}
            <div className="h-3 w-40 rounded-lg bg-neutral-200" />
          </div>
        ))}
      </div>

      {/* Platform Overview Skeleton (3 blocks) */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div className="rounded-lg border border-neutral-200 bg-white p-6" key={i}>
            {/* Header */}
            <div className="mb-2 h-4 w-32 rounded-lg bg-neutral-200" />
            {/* Value */}
            <div className="h-10 w-20 rounded-lg bg-neutral-200" />
          </div>
        ))}
      </div>

      {/* City Metrics Table Skeleton */}
      <div className="rounded-lg border border-neutral-200 bg-white p-6">
        {/* Table Header */}
        <div className="mb-4 h-6 w-48 rounded-lg bg-neutral-200" />

        {/* Table Content */}
        <div className="space-y-3">
          {/* Table Header Row */}
          <div className="flex gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div className="h-4 w-24 rounded-lg bg-neutral-200" key={i} />
            ))}
          </div>

          {/* Table Rows */}
          {[1, 2, 3, 4, 5].map((row) => (
            <div className="flex gap-4" key={row}>
              {[1, 2, 3, 4, 5].map((col) => (
                <div className="h-8 w-24 rounded-lg bg-neutral-100" key={col} />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Category Metrics Table Skeleton */}
      <div className="rounded-lg border border-neutral-200 bg-white p-6">
        {/* Table Header */}
        <div className="mb-4 h-6 w-64 rounded-lg bg-neutral-200" />

        {/* Table Content */}
        <div className="space-y-3">
          {/* Table Header Row */}
          <div className="flex gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div className="h-4 w-32 rounded-lg bg-neutral-200" key={i} />
            ))}
          </div>

          {/* Table Rows */}
          {[1, 2, 3, 4].map((row) => (
            <div className="flex gap-4" key={row}>
              {[1, 2, 3, 4].map((col) => (
                <div className="h-8 w-32 rounded-lg bg-neutral-100" key={col} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
