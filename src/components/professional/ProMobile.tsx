"use client";

import { MenuTwoLineIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";
import { Backdrop } from "@/components/ui/backdrop";
import { ProSidebar } from "./ProSidebar";

type OnboardingStatus =
  | "application_pending"
  | "application_in_review"
  | "approved"
  | "active"
  | "suspended";

type Props = {
  pendingLeadsCount?: number;
  onboardingStatus?: OnboardingStatus;
  onboardingCompletion?: number;
};

export function ProMobileSidebar({
  pendingLeadsCount = 0,
  onboardingStatus = "active",
  onboardingCompletion = 100,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        aria-label="Open menu"
        className="rounded-lg p-2 text-[#0f172a] transition-colors hover:bg-[#f8fafc] hover:text-[#0f172a] lg:hidden"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <HugeiconsIcon className="h-6 w-6" icon={MenuTwoLineIcon} />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <Backdrop
          aria-label="Close menu"
          className="z-40 bg-[#0f172a]/50 lg:hidden"
          onClose={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 z-50 h-full transform transition-transform duration-300 lg:hidden ${
          isOpen ? "transtone-x-0" : "-transtone-x-full"
        }`}
      >
        <ProSidebar
          onboardingCompletion={onboardingCompletion}
          onboardingStatus={onboardingStatus}
          onClose={() => setIsOpen(false)}
          pendingLeadsCount={pendingLeadsCount}
        />
      </div>
    </>
  );
}
