"use client";

import type { ToolUIPart } from "ai";
import { ChevronDownIcon, WrenchIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type ToolProps = {
  part: ToolUIPart;
  title?: string;
};

const STATE_LABEL: Record<ToolUIPart["state"], string> = {
  "input-streaming": "Pending",
  "input-available": "Running",
  "output-available": "Completed",
  "output-error": "Error",
};

export const ToolCall = ({ part, title }: ToolProps) => {
  const [open, setOpen] = useState(part.state !== "input-streaming");
  const header = title ?? part.type.replace("tool-", "");

  return (
    <div className="rounded-xl border border-[neutral-200] bg-[neutral-50] shadow-sm">
      <button
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left font-medium text-sm"
        onClick={() => setOpen((prev) => !prev)}
        type="button"
      >
        <div className="flex items-center gap-2">
          <WrenchIcon className="size-4 text-[neutral-400]/70" />
          <span>{header}</span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs",
              part.state === "output-error"
                ? "bg-[neutral-500]/10 text-[neutral-500]"
                : part.state === "output-available"
                  ? "bg-[neutral-500]/10 text-[neutral-500]"
                  : "bg-[neutral-500]/10 text-[neutral-500]"
            )}
          >
            {STATE_LABEL[part.state]}
          </span>
        </div>
        <ChevronDownIcon
          className={cn("size-4 text-[neutral-400]/70 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="space-y-4 border-[neutral-200]/40 border-t px-4 py-4 text-xs">
          {part.input !== undefined && part.input !== null && (
            <ToolSection title="Parameters">
              <pre className="max-h-48 overflow-auto rounded-lg bg-[neutral-900]/95 p-3 font-mono text-[neutral-50]">
                {JSON.stringify(part.input, null, 2)}
              </pre>
            </ToolSection>
          )}
          {(part.output !== undefined || part.errorText) && (
            <ToolSection title={part.errorText ? "Error" : "Result"}>
              {renderOutput(part)}
            </ToolSection>
          )}
        </div>
      )}
    </div>
  );
};

const ToolSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <p className="font-semibold text-[neutral-400] uppercase tracking-wide">{title}</p>
    {children}
  </div>
);

const renderOutput = (part: ToolUIPart): React.ReactNode => {
  if (part.errorText) {
    return (
      <div className="rounded-lg border border-[neutral-500]/30 bg-[neutral-50]/70 p-3 text-[neutral-500]">
        {part.errorText}
      </div>
    );
  }

  if (typeof part.output === "string") {
    return (
      <pre className="max-h-64 overflow-auto rounded-lg bg-[neutral-900]/95 p-3 font-mono text-[neutral-50]">
        {part.output}
      </pre>
    );
  }

  return (
    <pre className="max-h-64 overflow-auto rounded-lg bg-[neutral-900]/95 p-3 font-mono text-[neutral-50]">
      {JSON.stringify(part.output, null, 2)}
    </pre>
  );
};
