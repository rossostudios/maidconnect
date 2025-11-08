"use client";

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
    <div className="mt-1 size-8 shrink-0 rounded-full bg-[#FFE7E2] text-[#E85D48]">{avatar}</div>
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
      "max-w-full rounded-2xl px-4 py-3 text-sm shadow-sm ring-1 ring-black/5",
      from === "user" ? "bg-[#E85D48] text-white" : "bg-white text-gray-900",
      className
    )}
  >
    {children}
  </div>
);

export const MessageMarkdown = memo(function MessageMarkdown({ text }: { text: string }) {
  const compiled = useMemo(() => <Streamdown>{text}</Streamdown>, [text]);

  return (
    <div className="prose-sm prose text-current [&_code]:rounded [&_code]:bg-black/10 [&_code]:px-1 [&_code]:py-0.5">
      {compiled}
    </div>
  );
});

export const MessageAttachments = ({ files }: { files: FileUIPart[] }) => {
  if (!files?.length) return null;

  return (
    <div className="mt-3 space-y-2 text-gray-600 text-xs">
      {files.map((file, index) => (
        <div
          className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
          key={file.url ?? index}
        >
          <div className="truncate font-medium">{file.filename}</div>
          {file.url ? (
            <a
              className="text-[#E85D48] underline"
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
}) => <div className={cn("mt-2 flex items-center gap-1 text-xs", className)}>{children}</div>;

export const MessageAction = ({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={cn(
      "rounded-full border border-gray-200 bg-white px-2 py-1 text-gray-500 transition hover:text-[#E85D48]",
      className
    )}
    type="button"
    {...props}
  >
    {children}
  </button>
);
