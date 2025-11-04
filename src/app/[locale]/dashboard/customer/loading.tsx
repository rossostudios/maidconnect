export default function Loading() {
  return (
    <div className="space-y-8 p-6">
      {/* Welcome Section */}
      <div className="space-y-3">
        <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-96 animate-pulse rounded bg-gray-100" />
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm" key={i}>
            <div className="mb-2 h-4 w-24 animate-pulse rounded bg-gray-100" />
            <div className="h-8 w-16 animate-pulse rounded bg-gray-200" />
            <div className="mt-2 h-3 w-32 animate-pulse rounded bg-gray-50" />
          </div>
        ))}
      </div>

      {/* Upcoming Bookings */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-6 h-6 w-48 animate-pulse rounded bg-gray-200" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div className="flex items-start gap-4 rounded-md border border-gray-100 p-4" key={i}>
              <div className="h-16 w-16 animate-pulse rounded-lg bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-48 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-64 animate-pulse rounded bg-gray-100" />
                <div className="mt-2 flex gap-2">
                  <div className="h-6 w-24 animate-pulse rounded-full bg-gray-100" />
                  <div className="h-6 w-32 animate-pulse rounded-full bg-gray-100" />
                </div>
              </div>
              <div className="h-9 w-24 animate-pulse rounded-full bg-gray-200" />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-6 h-6 w-40 animate-pulse rounded bg-gray-200" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div className="flex items-center gap-3 border-gray-50 border-b pb-3" key={i}>
              <div className="h-2 w-2 animate-pulse rounded-full bg-gray-300" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
              <div className="h-3 w-20 animate-pulse rounded bg-gray-50" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
