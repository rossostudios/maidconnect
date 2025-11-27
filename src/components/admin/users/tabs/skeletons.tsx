/**
 * User Details Tabs - Skeleton Components
 *
 * Loading state skeletons for lazy-loaded tab content
 */

export function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-neutral-200 bg-white p-6">
        <div className="mb-4 h-6 w-32 animate-pulse rounded-lg bg-neutral-200" />
        <div className="space-y-4">
          <div className="h-4 w-full animate-pulse rounded-lg bg-neutral-100" />
          <div className="h-4 w-3/4 animate-pulse rounded-lg bg-neutral-100" />
          <div className="h-4 w-5/6 animate-pulse rounded-lg bg-neutral-100" />
        </div>
      </div>
    </div>
  );
}

export function ActivitySkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div className="rounded-lg border border-neutral-200 bg-white p-6" key={i}>
          <div className="mb-2 h-5 w-48 animate-pulse rounded-lg bg-neutral-200" />
          <div className="h-4 w-full animate-pulse rounded-lg bg-neutral-100" />
        </div>
      ))}
    </div>
  );
}

export function FinancesSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-lg border border-neutral-200 bg-white p-6">
        <div className="mb-4 h-6 w-32 animate-pulse rounded-lg bg-neutral-200" />
        <div className="h-12 w-full animate-pulse rounded-lg bg-neutral-100" />
      </div>
      <div className="rounded-lg border border-neutral-200 bg-white p-6">
        <div className="mb-4 h-6 w-32 animate-pulse rounded-lg bg-neutral-200" />
        <div className="h-12 w-full animate-pulse rounded-lg bg-neutral-100" />
      </div>
    </div>
  );
}

export function ReviewsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2].map((i) => (
        <div className="rounded-lg border border-neutral-200 bg-white p-6" key={i}>
          <div className="mb-2 flex items-center gap-2">
            <div className="h-5 w-5 animate-pulse rounded-lg bg-neutral-200" />
            <div className="h-5 w-24 animate-pulse rounded-lg bg-neutral-200" />
          </div>
          <div className="h-4 w-full animate-pulse rounded-lg bg-neutral-100" />
        </div>
      ))}
    </div>
  );
}
