import { cn } from "@/lib/utils";

export function Skeleton({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-[#ebe5d8]/50", className)} {...props} />;
}

export function DashboardSectionSkeleton() {
  return (
    <section className="rounded-xl border border-[#f0ece5] bg-white/90 p-6 shadow-sm">
      <div className="space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>

        {/* Content */}
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    </section>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-lg border border-[#e5dfd4] bg-white p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ConversationSkeleton() {
  return (
    <div className="flex h-[600px] overflow-hidden rounded-lg border border-[#e5dfd4] bg-white">
      {/* Conversations List */}
      <div className="w-80 border-[#e5dfd4] border-r p-4">
        <Skeleton className="mb-4 h-6 w-32" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div className="flex items-start gap-3" key={i}>
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message Thread */}
      <div className="flex flex-1 flex-col">
        <div className="border-[#e5dfd4] border-b p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-4 p-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`} key={i}>
              <Skeleton className="h-16 w-64 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Table Skeleton
 *
 * Loading state for Tanstack tables with rows and columns.
 */
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)]">
      {/* Header */}
      <div className="mb-4 grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton className="h-6 w-full" key={`header-${i}`} />
        ))}
      </div>
      {/* Rows */}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            className="grid gap-4 rounded-xl border-2 border-[#ebe5d8] p-4"
            key={`row-${rowIndex}`}
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton className="h-8 w-full" key={`cell-${rowIndex}-${colIndex}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Profile Card Skeleton
 *
 * Loading state for user profile cards with avatar and info.
 */
export function ProfileCardSkeleton() {
  return (
    <div className="rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)]">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <Skeleton className="h-20 w-20 flex-shrink-0 rounded-full" />
        {/* Info */}
        <div className="flex-1 space-y-3">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-5 w-56" />
        </div>
      </div>
      {/* Details */}
      <div className="mt-8 space-y-4">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-5/6" />
        <Skeleton className="h-5 w-4/6" />
      </div>
    </div>
  );
}

/**
 * Dashboard Stats Skeleton
 *
 * Loading state for dashboard stat cards.
 */
export function StatCardSkeleton() {
  return (
    <div className="rounded-[28px] bg-white p-6 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)]">
      <div className="flex items-center justify-between">
        <div className="flex-1 space-y-3">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-9 w-36" />
        </div>
        <Skeleton className="h-14 w-14 flex-shrink-0 rounded-full" />
      </div>
    </div>
  );
}

/**
 * Form Skeleton
 *
 * Loading state for forms with multiple fields.
 */
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)]">
      <div className="space-y-6">
        {Array.from({ length: fields }).map((_, i) => (
          <div className="space-y-2" key={i}>
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        ))}
        <div className="flex gap-3 pt-4">
          <Skeleton className="h-12 w-32 rounded-full" />
          <Skeleton className="h-12 w-32 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/**
 * Calendar Skeleton
 *
 * Loading state for calendar components.
 */
export function CalendarSkeleton() {
  return (
    <div className="rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)]">
      {/* Month header */}
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-9 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
      {/* Day headers */}
      <div className="mb-3 grid grid-cols-7 gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton className="h-8 w-full" key={`day-${i}`} />
        ))}
      </div>
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton className="h-12 w-full rounded-lg" key={`date-${i}`} />
        ))}
      </div>
    </div>
  );
}

/**
 * Analytics Chart Skeleton
 *
 * Loading state for chart/graph components.
 */
export function ChartSkeleton() {
  return (
    <div className="rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)]">
      <div className="mb-6 flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-28 rounded-full" />
      </div>
      {/* Chart bars */}
      <div className="flex h-64 items-end gap-4">
        {Array.from({ length: 7 }).map((_, i) => {
          const height = Math.random() * 60 + 30;
          return (
            <div className="flex flex-1 flex-col items-center gap-2" key={i}>
              <Skeleton className="w-full rounded-t-lg" style={{ height: `${height}%` }} />
              <Skeleton className="h-4 w-8" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
