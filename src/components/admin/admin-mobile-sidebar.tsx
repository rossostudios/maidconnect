"use client";

import { MenuTwoLineIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";
import { Backdrop } from "@/components/ui/backdrop";
import { AdminSidebar } from "./admin-sidebar";

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
        className="rounded-lg p-2 text-slate-900 transition-colors hover:bg-white hover:text-slate-900 lg:hidden dark:bg-slate-950 dark:text-slate-100 dark:text-slate-100"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <HugeiconsIcon className="h-6 w-6" icon={MenuTwoLineIcon} />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <Backdrop
          aria-label="Close menu"
          className="z-40 bg-slate-900/50 lg:hidden dark:bg-slate-100/50"
          onClose={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 z-50 h-full transform transition-transform duration-300 lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <AdminSidebar onClose={() => setIsOpen(false)} />
      </div>
    </>
  );
}
