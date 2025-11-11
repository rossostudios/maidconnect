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
    <div className="group rounded-[24px] border-2 border-[#e2e8f0] bg-[#f8fafc] p-6 shadow-sm transition hover:border-[#64748b]/30 hover:shadow-md">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <h4 className="mb-1 font-semibold text-[#0f172a] text-lg">{bundle.name}</h4>
          {bundle.description && <p className="text-[#94a3b8] text-sm">{bundle.description}</p>}
        </div>

        {/* Discount Badge */}
        {bundle.discountPercentage > 0 && (
          <div className="ml-4 rounded-full bg-[#64748b] px-3 py-1 font-bold text-[#f8fafc] text-sm">
            {bundle.discountPercentage}% {t("off")}
          </div>
        )}
      </div>

      {/* Services List */}
      <div className="mb-4 space-y-2">
        {bundle.services.map((service, index) => (
          <div className="flex items-center gap-2 rounded-lg bg-[#f8fafc] px-3 py-2" key={index}>
            <div className="h-2 w-2 rounded-full bg-[#64748b]" />
            <span className="flex-1 text-[#0f172a] text-sm">{service.name}</span>
            <span className="text-[#94a3b8] text-xs">{service.durationMinutes} min</span>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="mb-4 grid grid-cols-2 gap-4 border-[#e2e8f0] border-t pt-4">
        <div className="flex items-center gap-2">
          <HugeiconsIcon className="h-5 w-5 text-[#94a3b8]" icon={Clock01Icon} />
          <div>
            <p className="text-[#94a3b8] text-xs">{t("totalDuration")}</p>
            <p className="font-semibold text-[#0f172a] text-sm">
              {bundle.totalDurationMinutes} min
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <HugeiconsIcon className="h-5 w-5 text-[#94a3b8]" icon={FlashIcon} />
          <div>
            <p className="text-[#94a3b8] text-xs">{t("usageCount")}</p>
            <p className="font-semibold text-[#0f172a] text-sm">
              {bundle.usageCount} {t("times")}
            </p>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="mb-4 rounded-xl bg-[#f8fafc] p-4">
        <div className="flex items-center justify-between">
          <div>
            {bundle.discountPercentage > 0 && (
              <p className="mb-1 text-[#94a3b8] text-sm line-through">
                ${(bundle.basePriceCop / 1000).toFixed(0)}k COP
              </p>
            )}
            <p className="font-bold text-2xl text-[#64748b]">
              ${(bundle.finalPriceCop / 1000).toFixed(0)}k COP
            </p>
          </div>

          {savingsAmount > 0 && (
            <div className="text-right">
              <p className="text-[#94a3b8] text-xs">{t("youSave")}</p>
              <p className="font-semibold text-[#64748b] text-sm">
                ${(savingsAmount / 1000).toFixed(0)}k COP
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#64748b] px-4 py-2 font-medium text-[#f8fafc] text-sm transition hover:bg-[#64748b]"
          onClick={() => onQuickQuote(bundle.id)}
          type="button"
        >
          <HugeiconsIcon className="h-5 w-5" icon={DollarCircleIcon} />
          {t("quickQuote")}
        </button>

        <button
          aria-label="Edit bundle"
          className="rounded-xl border-2 border-[#e2e8f0] bg-[#f8fafc] p-2 text-[#0f172a] transition hover:border-[#64748b] hover:text-[#64748b]"
          onClick={() => onEdit(bundle.id)}
          type="button"
        >
          <HugeiconsIcon className="h-5 w-5" icon={Edit02Icon} />
        </button>

        <button
          aria-label="Delete bundle"
          className="rounded-xl border-2 border-[#e2e8f0] bg-[#f8fafc] p-2 text-[#0f172a] transition hover:border-[#64748b]/100 hover:text-[#64748b]/100"
          onClick={() => onDelete(bundle.id)}
          type="button"
        >
          <HugeiconsIcon className="h-5 w-5" icon={Delete02Icon} />
        </button>
      </div>

      {/* Inactive Badge */}
      {!bundle.isActive && (
        <div className="mt-3 rounded-lg bg-[#64748b]/5 px-3 py-2 text-center text-[#64748b] text-sm">
          {t("inactive")}
        </div>
      )}
    </div>
  );
}
