import { Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export default function MarketingLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-6 py-12">
      <div className="flex flex-col items-center gap-4">
        <HugeiconsIcon className="h-12 w-12 animate-spin text-orange-500" icon={Loading03Icon} />
        <p className="font-medium text-neutral-900">Preparing Casaora</p>
      </div>
      <p className="mt-4 max-w-md text-center text-neutral-600 text-sm">
        Fetching the latest listings, professionals, and concierge inventory.
      </p>
    </div>
  );
}
