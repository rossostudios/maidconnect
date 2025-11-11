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
    <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] shadow-sm">
      <button
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left font-medium text-sm"
        onClick={() => setOpen((prev) => !prev)}
        type="button"
      >
        <div className="flex items-center gap-2">
          <WrenchIcon className="size-4 text-[#94a3b8]/70" />
          <span>{header}</span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs",
              part.state === "output-error"
                ? "bg-[#64748b]/10 text-[#64748b]"
                : part.state === "output-available"
                  ? "bg-[#64748b]/10 text-[#64748b]"
                  : "bg-[#64748b]/10 text-[#64748b]"
            )}
          >
            {STATE_LABEL[part.state]}
          </span>
        </div>
        <ChevronDownIcon
          className={cn("size-4 text-[#94a3b8]/70 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="space-y-4 border-[#e2e8f0]/40 border-t px-4 py-4 text-xs">
          {part.input !== undefined && part.input !== null && (
            <ToolSection title="Parameters">
              <pre className="max-h-48 overflow-auto rounded-lg bg-[#0f172a]/95 p-3 font-mono text-[#f8fafc]">
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
    <p className="font-semibold text-[#94a3b8] uppercase tracking-wide">{title}</p>
    {children}
  </div>
);

const renderOutput = (part: ToolUIPart): React.ReactNode => {
  if (part.errorText) {
    return (
      <div className="rounded-lg border border-[#64748b]/30 bg-[#f8fafc]/70 p-3 text-[#64748b]">
        {part.errorText}
      </div>
    );
  }

  if (typeof part.output === "string") {
    return (
      <pre className="max-h-64 overflow-auto rounded-lg bg-[#0f172a]/95 p-3 font-mono text-[#f8fafc]">
        {part.output}
      </pre>
    );
  }

  return (
    <pre className="max-h-64 overflow-auto rounded-lg bg-[#0f172a]/95 p-3 font-mono text-[#f8fafc]">
      {JSON.stringify(part.output, null, 2)}
    </pre>
  );
};
