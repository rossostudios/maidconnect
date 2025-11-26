import { Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export default function Loading() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-4">
        <HugeiconsIcon className="h-12 w-12 animate-spin text-rausch-500" icon={Loading03Icon} />
        <p className="font-medium text-neutral-900">Loading professional profile...</p>
      </div>
    </div>
  );
}
