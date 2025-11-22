"use client";

import { geistSans } from "@/app/fonts";
import { cn } from "@/lib/utils";

type TypingUser = {
  id: string;
  name: string;
  typingAt: number;
};

type TypingIndicatorProps = {
  typingUsers: TypingUser[];
  className?: string;
};

/**
 * Displays a typing indicator with animated dots and user name(s).
 * Shows who is currently typing in a conversation.
 */
export function TypingIndicator({ typingUsers, className }: TypingIndicatorProps) {
  if (typingUsers.length === 0) {
    return null;
  }

  // Get display text based on number of users typing
  const getTypingText = () => {
    if (typingUsers.length === 1) {
      const firstName = typingUsers[0].name.split(" ")[0];
      return `${firstName} is typing`;
    }
    if (typingUsers.length === 2) {
      const name1 = typingUsers[0].name.split(" ")[0];
      const name2 = typingUsers[1].name.split(" ")[0];
      return `${name1} and ${name2} are typing`;
    }
    return "Several people are typing";
  };

  return (
    <div className={cn("flex items-center gap-2 px-4 py-2", className)}>
      {/* Animated dots */}
      <div className="flex items-center gap-1">
        <span
          className="h-2 w-2 animate-bounce rounded-full bg-neutral-400"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="h-2 w-2 animate-bounce rounded-full bg-neutral-400"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="h-2 w-2 animate-bounce rounded-full bg-neutral-400"
          style={{ animationDelay: "300ms" }}
        />
      </div>

      {/* Typing text */}
      <span className={cn("text-neutral-500 text-sm italic", geistSans.className)}>
        {getTypingText()}
      </span>
    </div>
  );
}
