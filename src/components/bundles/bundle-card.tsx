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
    <div className="group rounded-[24px] border-2 border-[neutral-200] bg-[neutral-50] p-6 shadow-sm transition hover:border-[neutral-500]/30 hover:shadow-md">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <h4 className="mb-1 font-semibold text-[neutral-900] text-lg">{bundle.name}</h4>
          {bundle.description && <p className="text-[neutral-400] text-sm">{bundle.description}</p>}
        </div>

        {/* Discount Badge */}
        {bundle.discountPercentage > 0 && (
          <div className="ml-4 rounded-full bg-[neutral-500] px-3 py-1 font-bold text-[neutral-50] text-sm">
            {bundle.discountPercentage}% {t("off")}
          </div>
        )}
      </div>

      {/* Services List */}
      <div className="mb-4 space-y-2">
        {bundle.services.map((service, index) => (
          <div className="flex items-center gap-2 rounded-lg bg-[neutral-50] px-3 py-2" key={index}>
            <div className="h-2 w-2 rounded-full bg-[neutral-500]" />
            <span className="flex-1 text-[neutral-900] text-sm">{service.name}</span>
            <span className="text-[neutral-400] text-xs">{service.durationMinutes} min</span>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="mb-4 grid grid-cols-2 gap-4 border-[neutral-200] border-t pt-4">
        <div className="flex items-center gap-2">
          <HugeiconsIcon className="h-5 w-5 text-[neutral-400]" icon={Clock01Icon} />
          <div>
            <p className="text-[neutral-400] text-xs">{t("totalDuration")}</p>
            <p className="font-semibold text-[neutral-900] text-sm">
              {bundle.totalDurationMinutes} min
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <HugeiconsIcon className="h-5 w-5 text-[neutral-400]" icon={FlashIcon} />
          <div>
            <p className="text-[neutral-400] text-xs">{t("usageCount")}</p>
            <p className="font-semibold text-[neutral-900] text-sm">
              {bundle.usageCount} {t("times")}
            </p>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="mb-4 rounded-xl bg-[neutral-50] p-4">
        <div className="flex items-center justify-between">
          <div>
            {bundle.discountPercentage > 0 && (
              <p className="mb-1 text-[neutral-400] text-sm line-through">
                ${(bundle.basePriceCop / 1000).toFixed(0)}k COP
              </p>
            )}
            <p className="font-bold text-2xl text-[neutral-500]">
              ${(bundle.finalPriceCop / 1000).toFixed(0)}k COP
            </p>
          </div>

          {savingsAmount > 0 && (
            <div className="text-right">
              <p className="text-[neutral-400] text-xs">{t("youSave")}</p>
              <p className="font-semibold text-[neutral-500] text-sm">
                ${(savingsAmount / 1000).toFixed(0)}k COP
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[neutral-500] px-4 py-2 font-medium text-[neutral-50] text-sm transition hover:bg-[neutral-500]"
          onClick={() => onQuickQuote(bundle.id)}
          type="button"
        >
          <HugeiconsIcon className="h-5 w-5" icon={DollarCircleIcon} />
          {t("quickQuote")}
        </button>

        <button
          aria-label="Edit bundle"
          className="rounded-xl border-2 border-[neutral-200] bg-[neutral-50] p-2 text-[neutral-900] transition hover:border-[neutral-500] hover:text-[neutral-500]"
          onClick={() => onEdit(bundle.id)}
          type="button"
        >
          <HugeiconsIcon className="h-5 w-5" icon={Edit02Icon} />
        </button>

        <button
          aria-label="Delete bundle"
          className="rounded-xl border-2 border-[neutral-200] bg-[neutral-50] p-2 text-[neutral-900] transition hover:border-[neutral-500]/100 hover:text-[neutral-500]/100"
          onClick={() => onDelete(bundle.id)}
          type="button"
        >
          <HugeiconsIcon className="h-5 w-5" icon={Delete02Icon} />
        </button>
      </div>

      {/* Inactive Badge */}
      {!bundle.isActive && (
        <div className="mt-3 rounded-lg bg-[neutral-500]/5 px-3 py-2 text-center text-[neutral-500] text-sm">
          {t("inactive")}
        </div>
      )}
    </div>
  );
}
