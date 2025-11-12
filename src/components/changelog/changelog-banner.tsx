"use client";

import { Cancel01Icon, MagicWand01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useLatestChangelog } from "@/hooks/use-latest-changelog";

// Dynamic import for modal (lazy load on demand)
const ChangelogModal = dynamic(
  () => import("./changelog-modal").then((mod) => mod.ChangelogModal),
  { ssr: false }
);

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
      <div className="sticky top-0 z-40 border-[neutral-200] border-b bg-gradient-to-r from-[neutral-500]/10 to-[neutral-500]/10 px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          {/* Content */}
          <button
            className="group flex flex-1 items-center gap-3 text-left transition hover:opacity-80"
            onClick={handleClick}
            type="button"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[neutral-500]/10">
              <HugeiconsIcon className="h-4 w-4 text-[neutral-500]" icon={MagicWand01Icon} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[neutral-900] text-sm sm:text-base">
                <span className="hidden sm:inline">New update: </span>
                {changelog.title}
              </p>
              <p className="text-[neutral-400] text-xs sm:text-sm">
                Sprint {changelog.sprint_number} •{" "}
                {new Date(changelog.published_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
            <span className="hidden rounded-full border border-[neutral-500] px-3 py-1 font-medium text-[neutral-500] text-sm transition group-hover:bg-[neutral-500] group-hover:text-[neutral-50] sm:inline-block">
              View Details
            </span>
          </button>

          {/* Dismiss Button */}
          <button
            aria-label="Dismiss"
            className="rounded-full p-1.5 text-[neutral-400] transition hover:bg-[neutral-50]/50 hover:text-[neutral-900]"
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
