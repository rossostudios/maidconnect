export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Section Skeleton */}
      <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        {/* Avatar & Name */}
        <div className="flex items-start gap-4">
          <div className="h-24 w-24 animate-pulse rounded-full bg-gray-200" />
          <div className="flex-1 space-y-3">
            <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <div className="h-10 w-32 animate-pulse rounded-full bg-gray-200" />
          <div className="h-10 w-24 animate-pulse rounded-full bg-gray-200" />
        </div>
      </div>

      {/* Stats Section */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div className="rounded-lg border border-gray-200 bg-white p-4" key={i}>
            <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
            <div className="mt-2 h-6 w-16 animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </div>

      {/* Bio Section */}
      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 h-6 w-32 animate-pulse rounded bg-gray-200" />
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
          <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
        </div>
      </div>

      {/* Services Section */}
      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 h-6 w-32 animate-pulse rounded bg-gray-200" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              className="flex items-center justify-between rounded-md border border-gray-100 p-3"
              key={i}
            >
              <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 h-6 w-32 animate-pulse rounded bg-gray-200" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div className="border-gray-100 border-b pb-4 last:border-0" key={i}>
              <div className="mb-2 flex items-center gap-2">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
                <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />
              </div>
              <div className="space-y-1">
                <div className="h-4 w-full animate-pulse rounded bg-gray-50" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-gray-50" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
