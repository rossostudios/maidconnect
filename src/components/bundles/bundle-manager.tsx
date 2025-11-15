"use client";

import { Add01Icon, PackageIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { ServiceBundle } from "@/types";
import { BundleCard } from "./bundle-card";

type BundleManagerProps = {
  bundles: ServiceBundle[];
  onCreateBundle: () => void;
  onEditBundle: (bundleId: string) => void;
  onDeleteBundle: (bundleId: string) => void;
  onQuickQuote: (bundleId: string) => void;
};

/**
 * Bundle Manager Component
 *
 * Displays and manages service bundles for professionals.
 * Allows creating, editing, and deleting bundles.
 * Generates quick quotes from saved bundles.
 */
export function BundleManager({
  bundles,
  onCreateBundle,
  onEditBundle,
  onDeleteBundle,
  onQuickQuote,
}: BundleManagerProps) {
  const t = useTranslations("components.bundleManager");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  const filteredBundles = bundles.filter((bundle) => {
    if (filter === "active") {
      return bundle.isActive;
    }
    if (filter === "inactive") {
      return !bundle.isActive;
    }
    return true;
  });

  return (
    <div className="border-2 border-[neutral-200] bg-[neutral-50] p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HugeiconsIcon className="h-6 w-6 text-[neutral-500]" icon={PackageIcon} />
          <h3 className="font-semibold text-[neutral-900] text-lg">{t("title")}</h3>
        </div>

        <button
          className="flex items-center gap-2 bg-[neutral-500] px-4 py-2 font-medium text-[neutral-50] text-sm transition hover:bg-[neutral-500]"
          onClick={onCreateBundle}
          type="button"
        >
          <HugeiconsIcon className="h-5 w-5" icon={Add01Icon} />
          {t("createBundle")}
        </button>
      </div>

      {/* Description */}
      <p className="mb-6 text-[neutral-400] text-sm">{t("description")}</p>

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        <button
          className={`px-4 py-2 text-sm transition ${
            filter === "all"
              ? "bg-[neutral-500] font-semibold text-[neutral-50]"
              : "bg-[neutral-50] text-[neutral-400] hover:bg-[neutral-50]"
          }`}
          onClick={() => setFilter("all")}
          type="button"
        >
          {t("all")} ({bundles.length})
        </button>
        <button
          className={`px-4 py-2 text-sm transition ${
            filter === "active"
              ? "bg-[neutral-500] font-semibold text-[neutral-50]"
              : "bg-[neutral-50] text-[neutral-400] hover:bg-[neutral-50]"
          }`}
          onClick={() => setFilter("active")}
          type="button"
        >
          {t("active")} ({bundles.filter((b) => b.isActive).length})
        </button>
        <button
          className={`px-4 py-2 text-sm transition ${
            filter === "inactive"
              ? "bg-[neutral-500] font-semibold text-[neutral-50]"
              : "bg-[neutral-50] text-[neutral-400] hover:bg-[neutral-50]"
          }`}
          onClick={() => setFilter("inactive")}
          type="button"
        >
          {t("inactive")} ({bundles.filter((b) => !b.isActive).length})
        </button>
      </div>

      {/* Bundles Grid */}
      {filteredBundles.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredBundles.map((bundle) => (
            <BundleCard
              bundle={bundle}
              key={bundle.id}
              onDelete={onDeleteBundle}
              onEdit={onEditBundle}
              onQuickQuote={onQuickQuote}
            />
          ))}
        </div>
      ) : (
        <div className="bg-[neutral-50] py-12 text-center">
          <HugeiconsIcon className="mx-auto mb-3 h-12 w-12 text-[neutral-200]" icon={PackageIcon} />
          <p className="mb-2 font-semibold text-[neutral-900] text-lg">{t("noBundles")}</p>
          <p className="mb-4 text-[neutral-400] text-sm">{t("noBundlesDescription")}</p>
          <button
            className="bg-[neutral-500] px-6 py-3 font-medium text-[neutral-50] text-sm transition hover:bg-[neutral-500]"
            onClick={onCreateBundle}
            type="button"
          >
            {t("createFirstBundle")}
          </button>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-6 bg-[neutral-50] p-4 text-[neutral-500] text-sm">
        <p className="font-semibold">{t("helpTitle")}</p>
        <p className="mt-1 text-[neutral-500]">{t("helpDescription")}</p>
      </div>
    </div>
  );
}
