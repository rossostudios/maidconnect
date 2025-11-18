import { Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="flex flex-col items-center gap-4">
        <HugeiconsIcon className="h-12 w-12 animate-spin text-orange-500" icon={Loading03Icon} />
        <p className="font-medium text-neutral-900">Loading your dashboard...</p>
      </div>
    </div>
  );
}
