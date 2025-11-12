"use client";

import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

type Props = {
  message?: string;
};

export function UnexpectedError({ message }: Props) {
  const [visible, setVisible] = useState(true);

  if (!visible) {
    return null;
  }

  return (
    <div className="rounded-lg border border-neutral-300 bg-neutral-100 px-4 py-3 text-red-800 text-sm shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="font-semibold">Something went wrong</p>
          <p className="mt-1 text-neutral-800 text-xs">
            {message ??
              "Please try submitting again. If the issue continues, contact support so we can investigate."}
          </p>
        </div>
        <button
          aria-label="Dismiss error"
          className="flex-shrink-0 text-neutral-800 transition hover:text-red-800"
          onClick={() => setVisible(false)}
          type="button"
        >
          <HugeiconsIcon className="h-5 w-5" icon={Cancel01Icon} />
        </button>
      </div>
    </div>
  );
}
