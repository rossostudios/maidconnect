"use client";

import { Cancel01Icon, MenuTwoLineIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";
import { Backdrop } from "@/components/ui/backdrop";
import { LiaAdminSidebar } from "./lia-admin-sidebar";

type Props = {
  userEmail?: string;
  userName?: string;
  userAvatarUrl?: string;
};

export function AdminMobileSidebar({ userEmail, userName, userAvatarUrl }: Props) {
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
        className="p-2 text-neutral-900 transition-colors hover:bg-neutral-100 lg:hidden"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <HugeiconsIcon className="h-6 w-6" icon={MenuTwoLineIcon} />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <Backdrop
          aria-label="Close menu"
          className="z-40 bg-neutral-900/50 lg:hidden"
          onClose={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="relative h-full">
          {/* Close Button */}
          <button
            aria-label="Close menu"
            className="absolute top-4 right-4 z-10 p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
            onClick={() => setIsOpen(false)}
            type="button"
          >
            <HugeiconsIcon className="h-5 w-5" icon={Cancel01Icon} />
          </button>

          {/* Sidebar Content */}
          <LiaAdminSidebar
            userAvatarUrl={userAvatarUrl}
            userEmail={userEmail}
            userName={userName}
          />
        </div>
      </div>
    </>
  );
}
