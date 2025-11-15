"use client";

import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

/**
 * Visual indicator for Sanity draft mode
 * Shows a banner at the top of the page when draft mode is enabled
 */
export function DraftModeIndicator() {
  const exitDraftMode = async () => {
    await fetch("/api/disable-draft");
    window.location.reload();
  };

  return (
    <div className="fixed top-0 right-0 left-0 z-50 flex items-center justify-between bg-[neutral-500] px-4 py-2 text-[neutral-50] shadow-lg">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 animate-pulse bg-[neutral-50]" />
        <span className="font-medium text-sm">Draft Mode Active - Viewing unpublished content</span>
      </div>
      <button
        className="flex items-center gap-2 bg-[neutral-50]/20 px-3 py-1 text-sm transition-colors hover:bg-[neutral-50]/30"
        onClick={exitDraftMode}
        type="button"
      >
        <HugeiconsIcon className="h-4 w-4" icon={Cancel01Icon} />
        Exit Draft Mode
      </button>
    </div>
  );
}
