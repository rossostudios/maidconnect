"use client";

import { Cancel01Icon, MagicWand01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useLatestChangelog } from "@/hooks/useLatest";

// Dynamic import for modal (lazy load on demand)
const ChangelogModal = dynamic(() => import("./ChangelogModal").then((mod) => mod.ChangelogModal), {
  ssr: false,
});

/**
 * Banner notification for new changelog entries
 * Shows at the top of the page when there's an unread update
 * Can be dismissed or clicked to view details
 */
export function ChangelogBanner() {
  const { changelog, hasViewed, markAsRead } = useLatestChangelog();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Don't show if no changelog, already viewed, or dismissed
  if (!changelog || hasViewed || isDismissed) {
    return null;
  }

  const handleDismiss = async () => {
    setIsDismissed(true);
    await markAsRead();
  };

  const handleClick = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      {/* Banner */}
      <div className="sticky top-0 z-40 border-[#e2e8f0] border-b bg-gradient-to-r from-[#64748b]/10 to-[#64748b]/10 px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          {/* Content */}
          <button
            className="group flex flex-1 items-center gap-3 text-left transition hover:opacity-80"
            onClick={handleClick}
            type="button"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#64748b]/10">
              <HugeiconsIcon className="h-4 w-4 text-[#64748b]" icon={MagicWand01Icon} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[#0f172a] text-sm sm:text-base">
                <span className="hidden sm:inline">New update: </span>
                {changelog.title}
              </p>
              <p className="text-[#94a3b8] text-xs sm:text-sm">
                Sprint {changelog.sprint_number} •{" "}
                {new Date(changelog.published_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
            <span className="hidden rounded-full border border-[#64748b] px-3 py-1 font-medium text-[#64748b] text-sm transition group-hover:bg-[#64748b] group-hover:text-[#f8fafc] sm:inline-block">
              View Details
            </span>
          </button>

          {/* Dismiss Button */}
          <button
            aria-label="Dismiss"
            className="rounded-full p-1.5 text-[#94a3b8] transition hover:bg-[#f8fafc]/50 hover:text-[#0f172a]"
            onClick={handleDismiss}
            type="button"
          >
            <HugeiconsIcon className="h-5 w-5" icon={Cancel01Icon} />
          </button>
        </div>
      </div>

      {/* Modal */}
      <ChangelogModal
        changelog={changelog}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          handleDismiss();
        }}
      />
    </>
  );
}
