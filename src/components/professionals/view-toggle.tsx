"use client";

import { GridIcon, MapsIcon } from "hugeicons-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

/**
 * View Toggle Component
 *
 * Research insights applied:
 * - Marketplace UX: Users expect both list and map views
 * - State persistence: Save view preference in URL params
 * - Mobile: Default to list view on mobile for better UX
 * - Accessibility: Clear labels and keyboard navigation
 */

export type ViewMode = "list" | "map";

type ViewToggleProps = {
  currentView?: ViewMode;
  onViewChange?: (view: ViewMode) => void;
  className?: string;
};

export function ViewToggle({
  currentView = "list",
  onViewChange,
  className = "",
}: ViewToggleProps) {
  const t = useTranslations("professionals");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [view, setView] = useState<ViewMode>(currentView);

  // Sync with URL params
  useEffect(() => {
    const viewParam = searchParams.get("view") as ViewMode | null;
    if (viewParam === "list" || viewParam === "map") {
      setView(viewParam);
    }
  }, [searchParams]);

  const handleViewChange = (newView: ViewMode) => {
    setView(newView);

    // Update URL params
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", newView);
    router.push(`${pathname}?${params.toString()}`);

    // Notify parent component
    onViewChange?.(newView);
  };

  return (
    <div className={`inline-flex rounded-lg border border-gray-300 bg-white p-1 ${className}`}>
      <button
        aria-label={t("viewToggle.list")}
        aria-pressed={view === "list"}
        className={`flex items-center gap-2 rounded-md px-3 py-2 font-medium text-sm transition-colors ${
          view === "list"
            ? "bg-[var(--red)] text-white shadow-sm"
            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        }`}
        onClick={() => handleViewChange("list")}
        type="button"
      >
        <GridIcon className="h-4 w-4" />
        <span className="hidden sm:inline">{t("viewToggle.list")}</span>
      </button>

      <button
        aria-label={t("viewToggle.map")}
        aria-pressed={view === "map"}
        className={`flex items-center gap-2 rounded-md px-3 py-2 font-medium text-sm transition-colors ${
          view === "map"
            ? "bg-[var(--red)] text-white shadow-sm"
            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        }`}
        onClick={() => handleViewChange("map")}
        type="button"
      >
        <MapsIcon className="h-4 w-4" />
        <span className="hidden sm:inline">{t("viewToggle.map")}</span>
      </button>
    </div>
  );
}
