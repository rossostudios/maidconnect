"use client";

/**
 * Amara Message Actions Component
 *
 * Provides interactive actions for assistant messages:
 * - Thumbs up/down feedback
 * - Copy message content
 * - Retry message (for errors)
 */

import { Check, Copy, RotateCw, ThumbsDown, ThumbsUp } from "lucide-react";
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
            "group rounded-md p-1.5 transition-all hover:bg-gray-100",
            feedback === "positive" && "bg-green-50 text-green-600"
          )}
          onClick={() => handleFeedback("positive")}
          title={t("thumbsUp")}
          type="button"
        >
          <ThumbsUp
            className={cn(
              "h-3.5 w-3.5 transition-colors",
              feedback === "positive"
                ? "fill-green-600 text-green-600"
                : "text-gray-400 group-hover:text-gray-600"
            )}
          />
        </button>

        <button
          aria-label={t("thumbsDown")}
          className={cn(
            "group rounded-md p-1.5 transition-all hover:bg-gray-100",
            feedback === "negative" && "bg-red-50 text-red-600"
          )}
          onClick={() => handleFeedback("negative")}
          title={t("thumbsDown")}
          type="button"
        >
          <ThumbsDown
            className={cn(
              "h-3.5 w-3.5 transition-colors",
              feedback === "negative"
                ? "fill-red-600 text-red-600"
                : "text-gray-400 group-hover:text-gray-600"
            )}
          />
        </button>
      </div>

      {/* Divider */}
      <div className="h-4 w-px bg-gray-200" />

      {/* Copy Button */}
      <button
        aria-label={t("copyMessage")}
        className="group rounded-md p-1.5 transition-all hover:bg-gray-100"
        onClick={handleCopy}
        title={t("copyMessage")}
        type="button"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-green-600" />
        ) : (
          <Copy className="h-3.5 w-3.5 text-gray-400 transition-colors group-hover:text-gray-600" />
        )}
      </button>

      {/* Retry Button (only shown for errors) */}
      {showRetry && onRetry && (
        <>
          <div className="h-4 w-px bg-gray-200" />
          <button
            aria-label={t("retry")}
            className="group rounded-md p-1.5 transition-all hover:bg-gray-100"
            onClick={onRetry}
            title={t("retry")}
            type="button"
          >
            <RotateCw className="h-3.5 w-3.5 text-gray-400 transition-colors group-hover:text-gray-600" />
          </button>
        </>
      )}
    </div>
  );
}
