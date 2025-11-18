/**
 * Sanity Studio Loading State
 */

import { Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export default function StudioLoading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <HugeiconsIcon className="h-12 w-12 animate-spin text-orange-500" icon={Loading03Icon} />
        <p className="font-medium text-neutral-900">Loading Sanity Studio...</p>
      </div>
    </div>
  );
}
