"use client";

import { useState } from "react";
import { X, Sparkles } from "lucide-react";
import { useLatestChangelog } from "@/hooks/use-latest-changelog";
import { ChangelogModal } from "./changelog-modal";

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
      <div className="sticky top-0 z-40 border-b border-[#ebe5d8] bg-gradient-to-r from-purple-50 to-blue-50 px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          {/* Content */}
          <button
            onClick={handleClick}
            className="group flex flex-1 items-center gap-3 text-left transition hover:opacity-80"
            type="button"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
              <Sparkles className="h-4 w-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[#211f1a] text-sm sm:text-base">
                <span className="hidden sm:inline">New update: </span>
                {changelog.title}
              </p>
              <p className="text-[#7a6d62] text-xs sm:text-sm">
                Sprint {changelog.sprint_number} •{" "}
                {new Date(changelog.published_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
            <span className="hidden rounded-full border border-[#ff5d46] px-3 py-1 font-medium text-[#ff5d46] text-sm transition group-hover:bg-[#ff5d46] group-hover:text-white sm:inline-block">
              View Details
            </span>
          </button>

          {/* Dismiss Button */}
          <button
            onClick={handleDismiss}
            className="rounded-full p-1.5 text-[#7a6d62] transition hover:bg-white/50 hover:text-[#211f1a]"
            type="button"
            aria-label="Dismiss"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Modal */}
      <ChangelogModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          handleDismiss();
        }}
        changelog={changelog}
      />
    </>
  );
}
