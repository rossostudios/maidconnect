export default function Loading() {
  return (
    <div className="space-y-8 p-6">
      {/* Welcome Section */}
      <div className="space-y-3">
        <div className="h-8 w-80 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-96 animate-pulse rounded bg-gray-100" />
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm" key={i}>
            <div className="mb-2 h-4 w-28 animate-pulse rounded bg-gray-100" />
            <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
            <div className="mt-2 flex items-center gap-2">
              <div className="h-3 w-12 animate-pulse rounded bg-gray-50" />
              <div className="h-3 w-16 animate-pulse rounded bg-green-100" />
            </div>
          </div>
        ))}
      </div>

      {/* Today's Schedule */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />
          <div className="h-8 w-32 animate-pulse rounded-full bg-gray-100" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div className="flex items-start gap-4 rounded-md border border-gray-100 p-4" key={i}>
              <div className="flex h-16 w-16 animate-pulse flex-col items-center justify-center rounded-lg bg-gray-200">
                <div className="h-4 w-8 rounded bg-gray-300" />
                <div className="mt-1 h-3 w-6 rounded bg-gray-300" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="h-5 w-56 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-72 animate-pulse rounded bg-gray-100" />
                <div className="mt-2 flex gap-2">
                  <div className="h-6 w-28 animate-pulse rounded-full bg-gray-100" />
                  <div className="h-6 w-24 animate-pulse rounded-full bg-gray-100" />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-9 w-20 animate-pulse rounded-full bg-gray-200" />
                <div className="h-9 w-20 animate-pulse rounded-full bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue & Bookings Chart */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-6 h-6 w-32 animate-pulse rounded bg-gray-200" />
          <div className="h-64 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-6 h-6 w-40 animate-pulse rounded bg-gray-200" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div className="flex items-center justify-between" key={i}>
                <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
                <div className="h-6 w-16 animate-pulse rounded-full bg-gray-200" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Reviews */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-6 h-6 w-36 animate-pulse rounded bg-gray-200" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div className="border-gray-100 border-b pb-4 last:border-0" key={i}>
              <div className="mb-2 flex items-center gap-2">
                <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
                <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
              </div>
              <div className="space-y-1">
                <div className="h-4 w-full animate-pulse rounded bg-gray-50" />
                <div className="h-4 w-4/5 animate-pulse rounded bg-gray-50" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
