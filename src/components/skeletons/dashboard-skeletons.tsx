/**
 * Skeleton loading components for dashboard PPR implementation
 * These provide instant visual feedback while dynamic content loads
 */

function BookingsListSkeleton() {
  return (
    <div aria-label="Loading bookings" className="space-y-4" role="status">
      {[1, 2, 3].map((i) => (
        <div
          className="animate-pulse border border-neutral-200 bg-white p-6 shadow-sm ring-1 ring-black/5"
          key={i}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="h-5 w-3/4 rounded bg-neutral-200" />
              <div className="h-4 w-1/2 rounded bg-neutral-200" />
              <div className="h-4 w-2/3 rounded bg-neutral-200" />
            </div>
            <div className="h-8 w-24 bg-neutral-200" />
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
        <div
          className="animate-pulse border border-neutral-200 bg-white p-6 shadow-sm ring-1 ring-black/5"
          key={i}
        >
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-neutral-200" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-3/4 rounded bg-neutral-200" />
              <div className="h-4 w-1/2 rounded bg-neutral-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function BookingCalendarSkeleton() {
  return (
    <div aria-label="Loading calendar" className="space-y-6" role="status">
      <div className="animate-pulse">
        {/* Calendar header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="h-8 w-32 rounded bg-neutral-200" />
          <div className="flex gap-2">
            <div className="h-8 w-8 rounded bg-neutral-200" />
            <div className="h-8 w-8 rounded bg-neutral-200" />
          </div>
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {[...new Array(7)].map((_, i) => (
            <div className="h-8 rounded bg-neutral-200" key={`header-${i}`} />
          ))}
          {/* Calendar days */}
          {[...new Array(35)].map((_, i) => (
            <div className="h-20 bg-neutral-200" key={`day-${i}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfileMetricsSkeleton() {
  return (
    <dl aria-label="Loading metrics" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          className="animate-pulse border border-neutral-200 bg-white p-6 shadow-sm shadow-sm ring-1 ring-black/5"
          key={i}
        >
          <div className="h-4 w-24 rounded bg-neutral-200" />
          <div className="mt-3 h-8 w-16 rounded bg-neutral-200" />
        </div>
      ))}
    </dl>
  );
}

function ServiceAddonsSkeleton() {
  return (
    <div aria-label="Loading service addons" className="space-y-4" role="status">
      {[1, 2].map((i) => (
        <div
          className="animate-pulse border border-neutral-200 bg-white p-6 shadow-sm ring-1 ring-black/5"
          key={i}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="h-5 w-1/3 rounded bg-neutral-200" />
              <div className="h-4 w-full rounded bg-neutral-200" />
              <div className="h-4 w-1/4 rounded bg-neutral-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AddressesSkeleton() {
  return (
    <div aria-label="Loading addresses" className="space-y-4" role="status">
      {[1, 2].map((i) => (
        <div
          className="animate-pulse border border-neutral-200 bg-white p-6 shadow-sm ring-1 ring-black/5"
          key={i}
        >
          <div className="space-y-3">
            <div className="h-5 w-1/3 rounded bg-neutral-200" />
            <div className="h-4 w-full rounded bg-neutral-200" />
            <div className="h-4 w-2/3 rounded bg-neutral-200" />
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
      className="bg-white p-8 shadow-[0_20px_60px_-15px_rgba(22,22,22,0.15)] shadow-sm ring-1 ring-black/5"
      role="status"
    >
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-48 rounded bg-neutral-200" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div
              className="border border-neutral-200 bg-white p-6 shadow-sm ring-1 ring-black/5"
              key={i}
            >
              <div className="space-y-3">
                <div className="h-5 w-2/3 rounded bg-neutral-200" />
                <div className="h-4 w-1/2 rounded bg-neutral-200" />
                <div className="mt-4 h-10 w-full bg-neutral-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DocumentsSkeleton() {
  return (
    <ul aria-label="Loading documents" className="divide-y divide-neutral-200" role="status">
      {[1, 2, 3].map((i) => (
        <li className="animate-pulse py-4" key={i}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 space-y-2">
              <div className="h-5 w-1/3 rounded bg-neutral-200" />
              <div className="h-4 w-1/2 rounded bg-neutral-200" />
            </div>
            <div className="h-4 w-32 rounded bg-neutral-200" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function PaymentMethodSkeleton() {
  return (
    <div
      aria-label="Loading payment method"
      className="animate-pulse border border-neutral-200 bg-white p-6 shadow-sm ring-1 ring-black/5"
      role="status"
    >
      <div className="space-y-3">
        <div className="h-5 w-48 rounded bg-neutral-200" />
        <div className="h-4 w-full rounded bg-neutral-200" />
        <div className="mt-4 h-10 w-full bg-neutral-200" />
      </div>
    </div>
  );
}
