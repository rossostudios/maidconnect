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
    <div className="mt-1 size-8 shrink-0 rounded-full bg-[#f8fafc] text-[#64748b]">{avatar}</div>
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
      "max-w-full rounded-2xl px-4 py-3 text-sm shadow-sm ring-1 ring-[#0f172a]/5",
      from === "user" ? "bg-[#64748b] text-[#f8fafc]" : "bg-[#f8fafc] text-[#0f172a]",
      className
    )}
  >
    {children}
  </div>
);

export const MessageMarkdown = memo(function MessageMarkdown({ text }: { text: string }) {
  const compiled = useMemo(() => <Streamdown>{text}</Streamdown>, [text]);

  return (
    <div className="prose-sm prose text-current [&_code]:rounded [&_code]:bg-[#0f172a]/10 [&_code]:px-1 [&_code]:py-0.5">
      {compiled}
    </div>
  );
});

export const MessageAttachments = ({ files }: { files: FileUIPart[] }) => {
  if (!files?.length) {
    return null;
  }

  return (
    <div className="mt-3 space-y-2 text-[#94a3b8] text-xs">
      {files.map((file, index) => (
        <div
          className="flex items-center justify-between rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2"
          key={file.url ?? index}
        >
          <div className="truncate font-medium">{file.filename}</div>
          {file.url ? (
            <a
              className="text-[#64748b] underline"
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
      "rounded-full border border-[#e2e8f0] bg-[#f8fafc] px-2 py-1 text-[#94a3b8] transition hover:text-[#64748b]",
      className
    )}
    type="button"
    {...props}
  >
    {children}
  </button>
);
