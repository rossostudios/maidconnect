"use client";

import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export function SearchTrigger() {
  return (
    <button
      className="flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 font-semibold text-sm text-stone-700 shadow-sm transition hover:border-stone-300 hover:bg-stone-50"
      type="button"
    >
      <HugeiconsIcon className="h-4 w-4" icon={Search01Icon} />
      Search platform
    </button>
  );
}
