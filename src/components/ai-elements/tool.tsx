"use client";

/**
 * Tool Components - Lia Design System
 *
 * AI tool call displays with Geist Sans/Mono typography, sharp borders, and state indicators.
 */

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
  "approval-requested": "Approval Needed",
  "approval-responded": "Approved",
  "output-denied": "Denied",
};

export const ToolCall = ({ part, title }: ToolProps) => {
  const [open, setOpen] = useState(part.state !== "input-streaming");
  const header = title ?? part.type.replace("tool-", "");

  return (
    <div className="border border-neutral-200 bg-white shadow-sm">
      <button
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left font-[family-name:var(--font-geist-sans)] font-medium text-sm transition-colors hover:bg-neutral-50"
        onClick={() => setOpen((prev) => !prev)}
        type="button"
      >
        <div className="flex items-center gap-2">
          <WrenchIcon className="size-4 text-neutral-600" />
          <span className="text-neutral-900">{header}</span>
          <span
            className={cn(
              "px-2 py-0.5 text-xs",
              part.state === "output-error" || part.state === "output-denied"
                ? "bg-red-50 text-red-600"
                : part.state === "output-available" || part.state === "approval-responded"
                  ? "bg-green-50 text-green-600"
                  : "bg-orange-50 text-orange-600"
            )}
          >
            {STATE_LABEL[part.state]}
          </span>
        </div>
        <ChevronDownIcon
          className={cn("size-4 text-neutral-600 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="space-y-4 border-neutral-200 border-t px-4 py-4 font-[family-name:var(--font-geist-sans)] text-xs">
          {part.input !== undefined && part.input !== null && (
            <ToolSection title="Parameters">
              <pre className="max-h-48 overflow-auto border border-neutral-200 bg-neutral-900 p-3 font-[family-name:var(--font-geist-mono)] text-neutral-50">
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
    <p className="font-[family-name:var(--font-geist-sans)] font-semibold text-neutral-600 uppercase tracking-wide">
      {title}
    </p>
    {children}
  </div>
);

const renderOutput = (part: ToolUIPart): React.ReactNode => {
  if (part.errorText) {
    return (
      <div className="border border-red-300 bg-red-50 p-3 font-[family-name:var(--font-geist-sans)] text-red-700">
        {part.errorText}
      </div>
    );
  }

  if (typeof part.output === "string") {
    return (
      <pre className="max-h-64 overflow-auto border border-neutral-200 bg-neutral-900 p-3 font-[family-name:var(--font-geist-mono)] text-neutral-50">
        {part.output}
      </pre>
    );
  }

  return (
    <pre className="max-h-64 overflow-auto border border-neutral-200 bg-neutral-900 p-3 font-[family-name:var(--font-geist-mono)] text-neutral-50">
      {JSON.stringify(part.output, null, 2)}
    </pre>
  );
};
