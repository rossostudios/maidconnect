"use client";

/**
 * Message Components - Lia Design System
 *
 * Chat message bubbles with Geist Sans typography, sharp borders, and orange accents.
 */

import type { FileUIPart, UIMessage } from "ai";
import { type ButtonHTMLAttributes, memo, type ReactNode, useMemo } from "react";
import { Streamdown } from "streamdown";
import { cn } from "@/lib/utils";

type MessageBaseProps = {
  from: UIMessage["role"];
  className?: string;
};

export const Message = ({
  from,
  className,
  children,
}: MessageBaseProps & { children: ReactNode }) => (
  <div
    className={cn(
      "flex w-full gap-3",
      from === "user" ? "justify-end" : "justify-start",
      className
    )}
  >
    {children}
  </div>
);

export const MessageAvatar = ({ from, avatar }: MessageBaseProps & { avatar?: ReactNode }) =>
  from === "assistant" ? (
    <div className="mt-1 size-8 shrink-0 bg-[neutral-50] text-[neutral-500]">{avatar}</div>
  ) : (
    <div className="size-8 shrink-0" />
  );

export const MessageContent = ({
  from,
  className,
  children,
}: MessageBaseProps & { children: ReactNode }) => (
  <div
    className={cn(
      "max-w-full border px-4 py-3 font-[family-name:var(--font-geist-sans)] text-sm shadow-sm",
      from === "user"
        ? "border-orange-500 bg-orange-500 text-white"
        : "border-neutral-200 bg-white text-neutral-900",
      className
    )}
  >
    {children}
  </div>
);

export const MessageMarkdown = memo(function MessageMarkdown({ text }: { text: string }) {
  const compiled = useMemo(() => <Streamdown>{text}</Streamdown>, [text]);

  return (
    <div className="prose-sm prose font-[family-name:var(--font-geist-sans)] text-current [&_code]:bg-neutral-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-[family-name:var(--font-geist-mono)]">
      {compiled}
    </div>
  );
});

export const MessageAttachments = ({ files }: { files: FileUIPart[] }) => {
  if (!files?.length) {
    return null;
  }

  return (
    <div className="mt-3 space-y-2 font-[family-name:var(--font-geist-sans)] text-neutral-600 text-xs">
      {files.map((file, index) => (
        <div
          className="flex items-center justify-between border border-neutral-200 bg-neutral-50 px-3 py-2"
          key={file.url ?? index}
        >
          <div className="truncate font-medium">{file.filename}</div>
          {file.url ? (
            <a
              className="text-orange-600 transition-colors hover:text-orange-700"
              href={file.url}
              rel="noreferrer"
              target="_blank"
            >
              View
            </a>
          ) : null}
        </div>
      ))}
    </div>
  );
};

export const MessageActions = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => (
  <div
    className={cn(
      "mt-2 flex items-center gap-1 font-[family-name:var(--font-geist-sans)] text-xs",
      className
    )}
  >
    {children}
  </div>
);

export const MessageAction = ({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={cn(
      "border border-neutral-200 bg-white px-2 py-1 font-[family-name:var(--font-geist-sans)] text-neutral-600 transition-all hover:border-orange-500 hover:bg-orange-50 hover:text-orange-600 active:scale-95",
      className
    )}
    type="button"
    {...props}
  >
    {children}
  </button>
);
