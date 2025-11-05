"use client";

import {
  Clock01Icon,
  Delete02Icon,
  DollarCircleIcon,
  Edit02Icon,
  FlashIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import type { ServiceBundle } from "@/types";

type BundleCardProps = {
  bundle: ServiceBundle;
  onEdit: (bundleId: string) => void;
  onDelete: (bundleId: string) => void;
  onQuickQuote: (bundleId: string) => void;
};

/**
 * Bundle Card Component
 *
 * Displays a service bundle with pricing, services, and quick actions.
 * Shows discount percentage and usage stats.
 */
export function BundleCard({ bundle, onEdit, onDelete, onQuickQuote }: BundleCardProps) {
  const t = useTranslations("components.bundleCard");

  const savingsAmount = bundle.basePriceCop - bundle.finalPriceCop;

  return (
    <div className="group rounded-[24px] border-2 border-[#e5e7eb] bg-white p-6 shadow-sm transition hover:border-[var(--red)]/30 hover:shadow-md">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <h4 className="mb-1 font-semibold text-[var(--foreground)] text-lg">{bundle.name}</h4>
          {bundle.description && <p className="text-[#6b7280] text-sm">{bundle.description}</p>}
        </div>

        {/* Discount Badge */}
        {bundle.discountPercentage > 0 && (
          <div className="ml-4 rounded-full bg-[var(--red)] px-3 py-1 font-bold text-sm text-white">
            {bundle.discountPercentage}% {t("off")}
          </div>
        )}
      </div>

      {/* Services List */}
      <div className="mb-4 space-y-2">
        {bundle.services.map((service, index) => (
          <div className="flex items-center gap-2 rounded-lg bg-[#f9fafb] px-3 py-2" key={index}>
            <div className="h-2 w-2 rounded-full bg-[var(--red)]" />
            <span className="flex-1 text-[var(--foreground)] text-sm">{service.name}</span>
            <span className="text-[#6b7280] text-xs">{service.durationMinutes} min</span>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="mb-4 grid grid-cols-2 gap-4 border-[#e5e7eb] border-t pt-4">
        <div className="flex items-center gap-2">
          <HugeiconsIcon className="h-5 w-5 text-[#6b7280]" icon={Clock01Icon} />
          <div>
            <p className="text-[#6b7280] text-xs">{t("totalDuration")}</p>
            <p className="font-semibold text-[var(--foreground)] text-sm">
              {bundle.totalDurationMinutes} min
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <HugeiconsIcon className="h-5 w-5 text-[#6b7280]" icon={FlashIcon} />
          <div>
            <p className="text-[#6b7280] text-xs">{t("usageCount")}</p>
            <p className="font-semibold text-[var(--foreground)] text-sm">
              {bundle.usageCount} {t("times")}
            </p>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="mb-4 rounded-xl bg-[#f9fafb] p-4">
        <div className="flex items-center justify-between">
          <div>
            {bundle.discountPercentage > 0 && (
              <p className="mb-1 text-[#9ca3af] text-sm line-through">
                ${(bundle.basePriceCop / 1000).toFixed(0)}k COP
              </p>
            )}
            <p className="font-bold text-2xl text-[var(--red)]">
              ${(bundle.finalPriceCop / 1000).toFixed(0)}k COP
            </p>
          </div>

          {savingsAmount > 0 && (
            <div className="text-right">
              <p className="text-[#6b7280] text-xs">{t("youSave")}</p>
              <p className="font-semibold text-green-600 text-sm">
                ${(savingsAmount / 1000).toFixed(0)}k COP
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--red)] px-4 py-2 font-medium text-sm text-white transition hover:bg-[#cc3333]"
          onClick={() => onQuickQuote(bundle.id)}
          type="button"
        >
          <HugeiconsIcon className="h-5 w-5" icon={DollarCircleIcon} />
          {t("quickQuote")}
        </button>

        <button
          aria-label="Edit bundle"
          className="rounded-xl border-2 border-[#e5e7eb] bg-white p-2 text-[var(--foreground)] transition hover:border-[var(--red)] hover:text-[var(--red)]"
          onClick={() => onEdit(bundle.id)}
          type="button"
        >
          <HugeiconsIcon className="h-5 w-5" icon={Edit02Icon} />
        </button>

        <button
          aria-label="Delete bundle"
          className="rounded-xl border-2 border-[#e5e7eb] bg-white p-2 text-[var(--foreground)] transition hover:border-red-500 hover:text-red-500"
          onClick={() => onDelete(bundle.id)}
          type="button"
        >
          <HugeiconsIcon className="h-5 w-5" icon={Delete02Icon} />
        </button>
      </div>

      {/* Inactive Badge */}
      {!bundle.isActive && (
        <div className="mt-3 rounded-lg bg-yellow-50 px-3 py-2 text-center text-sm text-yellow-800">
          {t("inactive")}
        </div>
      )}
    </div>
  );
}
