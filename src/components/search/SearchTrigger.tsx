"use client";

import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export function SearchTrigger() {
  return (
    <button
      className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 font-semibold text-neutral-700 text-sm shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50"
      type="button"
    >
      <HugeiconsIcon className="h-4 w-4" icon={Search01Icon} />
      Search platform
    </button>
  );
}
