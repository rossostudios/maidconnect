/**
 * Skeleton loading components for professionals pages
 * Used with React Suspense for progressive page loading
 */

export function ProfessionalsGridSkeleton() {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="container mx-auto max-w-7xl px-6">
        <div
          aria-label="Loading professionals"
          className="space-y-6"
          role="status"
        >
          {/* Search and Filter Skeleton */}
          <div className="animate-pulse space-y-6 rounded-[32px] border border-[#ebe5d8] bg-white p-8 shadow-[0_10px_40px_rgba(18,17,15,0.04)]">
            <div className="h-14 w-full rounded-full bg-[#ebe5d8]" />
            <div className="flex flex-wrap gap-4">
              <div className="h-10 w-32 rounded-full bg-[#ebe5d8]" />
              <div className="h-10 w-32 rounded-full bg-[#ebe5d8]" />
              <div className="h-10 w-32 rounded-full bg-[#ebe5d8]" />
            </div>
          </div>

          {/* Professional Cards */}
          {[1, 2, 3].map((i) => (
            <div
              className="animate-pulse overflow-hidden rounded-[28px] border border-[#ebe5d8] bg-white p-6 shadow-[0_10px_40px_rgba(18,17,15,0.04)]"
              key={i}
            >
              {/* Header Row */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                {/* Profile Info */}
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 flex-shrink-0 rounded-full bg-[#ebe5d8]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-6 w-48 rounded bg-[#ebe5d8]" />
                    <div className="h-4 w-32 rounded bg-[#ebe5d8]" />
                    <div className="h-4 w-40 rounded bg-[#ebe5d8]" />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-[#ebe5d8]" />
                  <div className="h-11 w-32 rounded-full bg-[#ebe5d8]" />
                </div>
              </div>

              {/* Activity Indicators Skeleton */}
              <div className="mt-4 flex flex-wrap gap-2">
                <div className="h-7 w-40 rounded-full bg-blue-100" />
                <div className="h-7 w-36 rounded-full bg-green-100" />
              </div>

              {/* Stats Row */}
              <div className="mt-4 flex flex-wrap gap-6 border-[#ebe5d8] border-b pb-4">
                <div className="h-5 w-24 rounded bg-[#ebe5d8]" />
                <div className="h-5 w-20 rounded bg-[#ebe5d8]" />
                <div className="h-5 w-28 rounded bg-[#ebe5d8]" />
              </div>

              {/* Badges Row */}
              <div className="mt-4 flex flex-wrap gap-2">
                <div className="h-7 w-24 rounded-full bg-[#ebe5d8]" />
                <div className="h-7 w-32 rounded-full bg-[#ebe5d8]" />
              </div>

              {/* Bio */}
              <div className="mt-4 space-y-2">
                <div className="h-4 w-full rounded bg-[#ebe5d8]" />
                <div className="h-4 w-5/6 rounded bg-[#ebe5d8]" />
                <div className="h-4 w-4/6 rounded bg-[#ebe5d8]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProfessionalProfileHeroSkeleton() {
  return (
    <div
      aria-label="Loading profile"
      className="animate-pulse rounded-[32px] border border-[#ebe5d8] bg-white p-8"
      role="status"
    >
      <div className="flex flex-col gap-6 md:flex-row">
        {/* Avatar */}
        <div className="h-32 w-32 flex-shrink-0 rounded-full bg-[#ebe5d8]" />

        {/* Info */}
        <div className="flex-1 space-y-4">
          <div className="h-8 w-3/4 rounded bg-[#ebe5d8]" />
          <div className="h-5 w-1/2 rounded bg-[#ebe5d8]" />

          {/* Services */}
          <div className="flex flex-wrap gap-2">
            <div className="h-6 w-24 rounded-full bg-[#ebe5d8]" />
            <div className="h-6 w-20 rounded-full bg-[#ebe5d8]" />
            <div className="h-6 w-28 rounded-full bg-[#ebe5d8]" />
          </div>

          {/* Rating */}
          <div className="h-6 w-40 rounded bg-[#ebe5d8]" />

          {/* Button */}
          <div className="h-12 w-48 rounded-full bg-[#ebe5d8]" />
        </div>
      </div>
    </div>
  );
}

export function AvailabilityCalendarSkeleton() {
  return (
    <div
      aria-label="Loading calendar"
      className="animate-pulse rounded-[28px] border border-[#ebe5d8] bg-white p-6"
      role="status"
    >
      {/* Calendar header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="h-8 w-32 rounded bg-[#ebe5d8]" />
        <div className="flex gap-2">
          <div className="h-8 w-8 rounded bg-[#ebe5d8]" />
          <div className="h-8 w-8 rounded bg-[#ebe5d8]" />
        </div>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day headers */}
        {[...new Array(7)].map((_, i) => (
          <div className="h-8 rounded bg-[#ebe5d8]" key={`header-${i}`} />
        ))}
        {/* Calendar days */}
        {[...new Array(35)].map((_, i) => (
          <div className="h-20 rounded-lg bg-[#ebe5d8]" key={`day-${i}`} />
        ))}
      </div>
    </div>
  );
}

export function ReviewsListSkeleton() {
  return (
    <div aria-label="Loading reviews" className="space-y-4" role="status">
      {[1, 2, 3].map((i) => (
        <div className="animate-pulse rounded-2xl border border-[#ebe5d8] bg-white p-6" key={i}>
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#ebe5d8]" />
              <div className="space-y-2">
                <div className="h-4 w-32 rounded bg-[#ebe5d8]" />
                <div className="h-3 w-24 rounded bg-[#ebe5d8]" />
              </div>
            </div>
            <div className="h-5 w-20 rounded bg-[#ebe5d8]" />
          </div>

          {/* Review content */}
          <div className="mt-4 space-y-2">
            <div className="h-4 w-full rounded bg-[#ebe5d8]" />
            <div className="h-4 w-5/6 rounded bg-[#ebe5d8]" />
            <div className="h-4 w-4/6 rounded bg-[#ebe5d8]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function VettingQueueSkeleton() {
  return (
    <div aria-label="Loading vetting queue" className="animate-pulse space-y-4" role="status">
      <div className="rounded-2xl border border-[#ebe5d8] bg-white p-6">
        <div className="h-6 w-48 rounded bg-[#ebe5d8]" />

        <div className="mt-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              className="flex items-center justify-between border-[#ebe5d8] border-b pb-4"
              key={i}
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-[#ebe5d8]" />
                <div className="space-y-2">
                  <div className="h-5 w-40 rounded bg-[#ebe5d8]" />
                  <div className="h-4 w-32 rounded bg-[#ebe5d8]" />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-10 w-24 rounded-full bg-[#ebe5d8]" />
                <div className="h-10 w-24 rounded-full bg-[#ebe5d8]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TabContentSkeleton() {
  return (
    <div aria-label="Loading content" className="animate-pulse space-y-4" role="status">
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-[#ebe5d8]" />
        <div className="h-4 w-full rounded bg-[#ebe5d8]" />
        <div className="h-4 w-5/6 rounded bg-[#ebe5d8]" />
      </div>

      <div className="mt-6 space-y-2">
        <div className="h-4 w-full rounded bg-[#ebe5d8]" />
        <div className="h-4 w-4/6 rounded bg-[#ebe5d8]" />
      </div>
    </div>
  );
}
