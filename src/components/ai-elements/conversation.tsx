"use client";

import { ArrowDownIcon } from "lucide-react";
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
      "flex size-full flex-col items-center justify-center gap-3 p-8 text-center text-sm",
      className
    )}
    {...props}
  >
    {children ?? (
      <>
        {icon && <div className="text-muted-foreground">{icon}</div>}
        <div className="space-y-1">
          <h3 className="font-semibold">{title}</h3>
          {description && <p className="text-muted-foreground">{description}</p>}
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
        "-tranneutral-x-1/2 absolute bottom-4 left-1/2 flex items-center gap-2 rounded-full border border-[neutral-200] bg-[neutral-50] px-3 py-2 font-medium text-[neutral-400] text-sm shadow hover:bg-[neutral-50] focus:outline-none focus-visible:ring-2 focus-visible:ring-[neutral-500]/60",
        className
      )}
      onClick={handleScrollToBottom}
      type="button"
      {...props}
    >
      <ArrowDownIcon className="size-4" />
      Scroll to newest
    </button>
  );
};
