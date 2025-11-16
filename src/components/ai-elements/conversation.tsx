"use client";

/**
 * Conversation Components - Lia Design System
 *
 * Chat conversation container with scroll management, empty states, and Geist Sans typography.
 */

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import type { ButtonHTMLAttributes, ComponentProps } from "react";
import { useCallback } from "react";
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom";
import { cn } from "@/lib/utils";

export type ConversationProps = ComponentProps<typeof StickToBottom>;

export const Conversation = ({ className, ...props }: ConversationProps) => (
  <StickToBottom
    className={cn("relative flex-1 overflow-y-auto", className)}
    initial="smooth"
    resize="smooth"
    role="log"
    {...props}
  />
);

export type ConversationContentProps = ComponentProps<typeof StickToBottom.Content>;

export const ConversationContent = ({ className, ...props }: ConversationContentProps) => (
  <StickToBottom.Content className={cn("flex flex-col gap-4 p-4", className)} {...props} />
);

export type ConversationEmptyStateProps = ComponentProps<"div"> & {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
};

export const ConversationEmptyState = ({
  className,
  title = "No messages yet",
  description = "Start a conversation to see messages here",
  icon,
  children,
  ...props
}: ConversationEmptyStateProps) => (
  <div
    className={cn(
      "flex size-full flex-col items-center justify-center gap-3 p-8 text-center font-[family-name:var(--font-geist-sans)] text-sm",
      className
    )}
    {...props}
  >
    {children ?? (
      <>
        {icon && <div className="text-neutral-600">{icon}</div>}
        <div className="space-y-1">
          <h3 className="font-semibold text-neutral-900">{title}</h3>
          {description && <p className="text-neutral-600">{description}</p>}
        </div>
      </>
    )}
  </div>
);

export type ConversationScrollButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export const ConversationScrollButton = ({
  className,
  ...props
}: ConversationScrollButtonProps) => {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  const handleScrollToBottom = useCallback(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  if (isAtBottom) {
    return null;
  }

  return (
    <button
      className={cn(
        "-translate-x-1/2 absolute bottom-4 left-1/2 flex items-center gap-2 border border-neutral-200 bg-white px-3 py-2 font-[family-name:var(--font-geist-sans)] font-medium text-neutral-700 text-sm shadow-sm transition-all hover:border-orange-500 hover:bg-orange-50 hover:text-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500/25 active:scale-95",
        className
      )}
      onClick={handleScrollToBottom}
      type="button"
      {...props}
    >
      <HugeiconsIcon icon={ArrowDown01Icon} className="size-4" size={16} />
      Scroll to newest
    </button>
  );
};
