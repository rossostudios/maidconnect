"use client";

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
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold">Something went wrong</p>
          <p className="mt-1 text-red-600 text-xs">
            {message ??
              "Please try submitting again. If the issue continues, contact support so we can investigate."}
          </p>
        </div>
        <button
          className="font-semibold text-red-500 text-xs uppercase tracking-wide transition hover:text-red-600"
          onClick={() => setVisible(false)}
          type="button"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
