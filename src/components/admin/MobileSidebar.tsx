"use client";

import { MenuTwoLineIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";
import { Backdrop } from "@/components/ui/backdrop";
import { AdminSidebar } from "./AdminSidebar";

export function AdminMobileSidebar() {
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
        className="rounded-lg p-2 text-neutral-900 transition-colors hover:bg-white hover:text-neutral-900 lg:hidden dark:bg-neutral-950 dark:text-neutral-100 dark:text-neutral-100"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <HugeiconsIcon className="h-6 w-6" icon={MenuTwoLineIcon} />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <Backdrop
          aria-label="Close menu"
          className="z-40 bg-neutral-900/50 lg:hidden dark:bg-neutral-100/50"
          onClose={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 z-50 h-full transform transition-transform duration-300 lg:hidden ${
          isOpen ? "tranneutral-x-0" : "-tranneutral-x-full"
        }`}
      >
        <AdminSidebar onClose={() => setIsOpen(false)} />
      </div>
    </>
  );
}
