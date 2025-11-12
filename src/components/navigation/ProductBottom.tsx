"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import { Link } from "@/i18n/routing";

type ProductFeature = {
  name: string;
  href: string;
  description: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  features: ProductFeature[];
};

export function ProductBottomSheet({ isOpen, onClose, features }: Props) {
  // Prevent body scroll when bottom sheet is open
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

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
            e.preventDefault();
            onClose();
          }
        }}
        role="button"
        tabIndex={0}
      />

      {/* Bottom Sheet - Optimized for landscape */}
      <div
        className={`landscape:-transtone-x-1/2 fixed right-0 bottom-0 left-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white shadow-2xl transition-transform duration-300 ease-out landscape:right-auto landscape:left-1/2 landscape:max-w-2xl landscape:rounded-2xl ${
          isOpen ? "transtone-y-0" : "transtone-y-full"
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-stone-200 border-b bg-white px-6 py-4">
          <h2 className="font-semibold text-lg text-stone-900">Product Features</h2>
          <button
            aria-label="Close product menu"
            className="flex h-10 w-10 items-center justify-center rounded-full text-stone-900 transition hover:bg-stone-100 active:scale-95"
            onClick={onClose}
            type="button"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Features List - Grid in landscape */}
        <div className="p-6">
          <div className="space-y-3 landscape:grid landscape:grid-cols-2 landscape:gap-3 landscape:space-y-0">
            {features.map((feature) => (
              <Link
                className="group flex flex-col gap-2 rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-stone-300 hover:bg-stone-50 active:scale-[0.98]"
                href={feature.href}
                key={feature.name}
                onClick={onClose}
              >
                <span className="font-semibold text-base text-stone-900 group-hover:text-stone-700">
                  {feature.name}
                </span>
                <span className="text-sm text-stone-600 leading-relaxed">
                  {feature.description}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Padding for safe area */}
        <div className="h-8" />
      </div>
    </>
  );
}
