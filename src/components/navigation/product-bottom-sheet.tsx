"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
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
  const _t = useTranslations("product");

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
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Bottom Sheet - Optimized for landscape */}
      <div
        className={`landscape:-translate-x-1/2 fixed right-0 bottom-0 left-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white shadow-2xl transition-transform duration-300 ease-out landscape:right-auto landscape:left-1/2 landscape:max-w-2xl landscape:rounded-2xl ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-[#ebe5d8] border-b bg-white px-6 py-4">
          <h2 className="font-semibold text-[#211f1a] text-lg">Product Features</h2>
          <button
            aria-label="Close product menu"
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#524d43] transition hover:bg-[#ebe5d8] active:scale-95"
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
                className="group flex flex-col gap-2 rounded-2xl border border-[#ebe5d8] bg-white p-5 transition hover:border-[#ff5d46] hover:bg-[#fff5f2] active:scale-[0.98]"
                href={feature.href}
                key={feature.name}
                onClick={onClose}
              >
                <span className="font-semibold text-[#211f1a] text-base group-hover:text-[#ff5d46]">
                  {feature.name}
                </span>
                <span className="text-[#7a6d62] text-sm leading-relaxed">
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
