"use client";

/**
 * Rebook Button Component
 *
 * Displays a "Book Again" button that opens the rebook modal
 * for completed bookings. Used in customer dashboard and booking history.
 */

import { RefreshIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import type { CustomerBooking } from "./customer-booking-list";
import { RebookModal } from "./rebook-modal";

type RebookButtonProps = {
  booking: CustomerBooking;
  variant?: "default" | "compact";
};

export function RebookButton({ booking }: RebookButtonProps) {
  const [showRebookModal, setShowRebookModal] = useState(false);

  return (
    <>
      <button
        className="inline-flex w-full items-center justify-center gap-2 bg-orange-500 px-5 py-2.5 font-semibold text-sm text-white shadow-sm transition hover:bg-orange-600 active:bg-orange-700"
        onClick={() => setShowRebookModal(true)}
        type="button"
      >
        <HugeiconsIcon className="h-4 w-4" icon={RefreshIcon} />
        Book Again
      </button>

      <RebookModal
        booking={booking}
        isOpen={showRebookModal}
        onClose={() => setShowRebookModal(false)}
      />
    </>
  );
}
