"use client";

/**
 * Amara Message Actions Component
 *
 * Provides interactive actions for assistant messages:
 * - Thumbs up/down feedback
 * - Copy message content
 * - Retry message (for errors)
 */

import {
  Copy01Icon,
  RefreshIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { cn } from "@/lib/utils";

type AmaraMessageActionsProps = {
  messageId: string;
  content: string;
  onFeedback?: (messageId: string, feedback: "positive" | "negative") => void;
  onRetry?: () => void;
  showRetry?: boolean;
};

export function AmaraMessageActions({
  messageId,
  content,
  onFeedback,
  onRetry,
  showRetry = false,
}: AmaraMessageActionsProps) {
  const t = useTranslations("amara");
  const [feedback, setFeedback] = useState<"positive" | "negative" | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFeedback = async (type: "positive" | "negative") => {
    setFeedback(type);

    if (onFeedback) {
      onFeedback(messageId, type);
    }

    // Send feedback to API
    try {
      await fetch("/api/amara/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId,
          feedback: type,
        }),
      });
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <div className="mt-2 flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
      {/* Feedback Buttons */}
      <div className="flex items-center gap-0.5">
        <button
          aria-label={t("thumbsUp")}
          className={cn(
            "group rounded-md p-1.5 transition-all hover:bg-[#e2e8f0]/30",
            feedback === "positive" && "bg-[#64748b]/10 text-[#64748b]"
          )}
          onClick={() => handleFeedback("positive")}
          title={t("thumbsUp")}
          type="button"
        >
          <HugeiconsIcon
            className={cn(
              "h-3.5 w-3.5 transition-colors",
              feedback === "positive"
                ? "fill-[#64748b] text-[#64748b]"
                : "text-[#94a3b8]/70 group-hover:text-[#94a3b8]"
            )}
            icon={ThumbsUpIcon}
          />
        </button>

        <button
          aria-label={t("thumbsDown")}
          className={cn(
            "group rounded-md p-1.5 transition-all hover:bg-[#e2e8f0]/30",
            feedback === "negative" && "bg-[#64748b]/10 text-[#64748b]"
          )}
          onClick={() => handleFeedback("negative")}
          title={t("thumbsDown")}
          type="button"
        >
          <HugeiconsIcon
            className={cn(
              "h-3.5 w-3.5 transition-colors",
              feedback === "negative"
                ? "fill-[#64748b] text-[#64748b]"
                : "text-[#94a3b8]/70 group-hover:text-[#94a3b8]"
            )}
            icon={ThumbsDownIcon}
          />
        </button>
      </div>

      {/* Divider */}
      <div className="h-4 w-px bg-[#e2e8f0]" />

      {/* Copy Button */}
      <button
        aria-label={t("copyMessage")}
        className="group rounded-md p-1.5 transition-all hover:bg-[#e2e8f0]/30"
        onClick={handleCopy}
        title={t("copyMessage")}
        type="button"
      >
        {copied ? (
          <HugeiconsIcon className="h-3.5 w-3.5 text-[#64748b]" icon={Tick02Icon} />
        ) : (
          <HugeiconsIcon
            className="h-3.5 w-3.5 text-[#94a3b8]/70 transition-colors group-hover:text-[#94a3b8]"
            icon={Copy01Icon}
          />
        )}
      </button>

      {/* Retry Button (only shown for errors) */}
      {showRetry && onRetry && (
        <>
          <div className="h-4 w-px bg-[#e2e8f0]" />
          <button
            aria-label={t("retry")}
            className="group rounded-md p-1.5 transition-all hover:bg-[#e2e8f0]/30"
            onClick={onRetry}
            title={t("retry")}
            type="button"
          >
            <HugeiconsIcon
              className="h-3.5 w-3.5 text-[#94a3b8]/70 transition-colors group-hover:text-[#94a3b8]"
              icon={RefreshIcon}
            />
          </button>
        </>
      )}
    </div>
  );
}
