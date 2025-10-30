/**
 * Skeleton loading components for dashboard PPR implementation
 * These provide instant visual feedback while dynamic content loads
 */

export function BookingsListSkeleton() {
  return (
    <div aria-label="Loading bookings" className="space-y-4" role="status">
      {[1, 2, 3].map((i) => (
        <div className="animate-pulse rounded-2xl border border-[#ebe5d8] bg-white p-6" key={i}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="h-5 w-3/4 rounded bg-[#ebe5d8]" />
              <div className="h-4 w-1/2 rounded bg-[#ebe5d8]" />
              <div className="h-4 w-2/3 rounded bg-[#ebe5d8]" />
            </div>
            <div className="h-8 w-24 rounded-full bg-[#ebe5d8]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function FavoritesListSkeleton() {
  return (
    <div
      aria-label="Loading favorites"
      className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      role="status"
    >
      {[1, 2, 3].map((i) => (
        <div className="animate-pulse rounded-[28px] border border-[#ebe5d8] bg-white p-6" key={i}>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-[#ebe5d8]" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-3/4 rounded bg-[#ebe5d8]" />
              <div className="h-4 w-1/2 rounded bg-[#ebe5d8]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function BookingCalendarSkeleton() {
  return (
    <div aria-label="Loading calendar" className="space-y-6" role="status">
      <div className="animate-pulse">
        {/* Calendar header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="h-8 w-32 rounded bg-[#ebe5d8]" />
          <div className="flex gap-2">
            <div className="h-8 w-8 rounded bg-[#ebe5d8]" />
            <div className="h-8 w-8 rounded bg-[#ebe5d8]" />
          </div>
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {[...Array(7)].map((_, i) => (
            <div className="h-8 rounded bg-[#ebe5d8]" key={`header-${i}`} />
          ))}
          {/* Calendar days */}
          {[...Array(35)].map((_, i) => (
            <div className="h-20 rounded-lg bg-[#ebe5d8]" key={`day-${i}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProfileMetricsSkeleton() {
  return (
    <dl
      aria-label="Loading metrics"
      className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
      role="status"
    >
      {[1, 2, 3, 4].map((i) => (
        <div
          className="animate-pulse rounded-2xl border border-[#ebe5d8] bg-white p-6 shadow-sm"
          key={i}
        >
          <div className="h-4 w-24 rounded bg-[#ebe5d8]" />
          <div className="mt-3 h-8 w-16 rounded bg-[#ebe5d8]" />
        </div>
      ))}
    </dl>
  );
}

export function ServiceAddonsSkeleton() {
  return (
    <div aria-label="Loading service addons" className="space-y-4" role="status">
      {[1, 2].map((i) => (
        <div className="animate-pulse rounded-2xl border border-[#ebe5d8] bg-white p-6" key={i}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="h-5 w-1/3 rounded bg-[#ebe5d8]" />
              <div className="h-4 w-full rounded bg-[#ebe5d8]" />
              <div className="h-4 w-1/4 rounded bg-[#ebe5d8]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AddressesSkeleton() {
  return (
    <div aria-label="Loading addresses" className="space-y-4" role="status">
      {[1, 2].map((i) => (
        <div className="animate-pulse rounded-2xl border border-[#ebe5d8] bg-white p-6" key={i}>
          <div className="space-y-3">
            <div className="h-5 w-1/3 rounded bg-[#ebe5d8]" />
            <div className="h-4 w-full rounded bg-[#ebe5d8]" />
            <div className="h-4 w-2/3 rounded bg-[#ebe5d8]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PendingRatingsSkeleton() {
  return (
    <div
      aria-label="Loading pending ratings"
      className="rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)] backdrop-blur-sm"
      role="status"
    >
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-48 rounded bg-[#ebe5d8]" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div className="rounded-2xl border border-[#ebe5d8] bg-white p-6" key={i}>
              <div className="space-y-3">
                <div className="h-5 w-2/3 rounded bg-[#ebe5d8]" />
                <div className="h-4 w-1/2 rounded bg-[#ebe5d8]" />
                <div className="mt-4 h-10 w-full rounded-full bg-[#ebe5d8]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DocumentsSkeleton() {
  return (
    <ul aria-label="Loading documents" className="divide-y divide-[#efe7dc]" role="status">
      {[1, 2, 3].map((i) => (
        <li className="animate-pulse py-4" key={i}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 space-y-2">
              <div className="h-5 w-1/3 rounded bg-[#ebe5d8]" />
              <div className="h-4 w-1/2 rounded bg-[#ebe5d8]" />
            </div>
            <div className="h-4 w-32 rounded bg-[#ebe5d8]" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function PaymentMethodSkeleton() {
  return (
    <div
      aria-label="Loading payment method"
      className="animate-pulse rounded-2xl border border-[#ebe5d8] bg-white p-6"
      role="status"
    >
      <div className="space-y-3">
        <div className="h-5 w-48 rounded bg-[#ebe5d8]" />
        <div className="h-4 w-full rounded bg-[#ebe5d8]" />
        <div className="mt-4 h-10 w-full rounded-full bg-[#ebe5d8]" />
      </div>
    </div>
  );
}
