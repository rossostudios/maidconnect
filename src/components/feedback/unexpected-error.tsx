"use client";

import { useState } from "react";

type Props = {
  message?: string;
};

export function UnexpectedError({ message }: Props) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold">Something went wrong</p>
          <p className="mt-1 text-xs text-red-600">
            {message ??
              "Please try submitting again. If the issue continues, contact support so we can investigate."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="text-xs font-semibold uppercase tracking-wide text-red-500 transition hover:text-red-600"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
