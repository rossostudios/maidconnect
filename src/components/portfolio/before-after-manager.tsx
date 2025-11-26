"use client";

/**
 * BeforeAfterManager - Manage Before/After Transformation Pairs
 *
 * Section component for viewing, reordering, and deleting before/after pairs.
 * Includes add new pair button and empty state.
 *
 * Following Lia Design System:
 * - rounded-lg containers
 * - rausch-500 primary accent
 * - neutral color palette
 */

import {
  Add01Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  Delete02Icon,
  Edit02Icon,
  Image01Icon,
} from "hugeicons-react";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { geistSans } from "@/app/fonts";
import { confirm } from "@/lib/toast";
import { cn } from "@/lib/utils/core";
import { BeforeAfterModalPreview, BeforeAfterThumbnail } from "./before-after-preview";
import { type BeforeAfterPair, BeforeAfterUploadCard } from "./before-after-upload-card";

// ============================================================================
// Types
// ============================================================================

type Props = {
  pairs: BeforeAfterPair[];
  onUpdate: (pairs: BeforeAfterPair[]) => void;
  maxPairs?: number;
  className?: string;
};

// ============================================================================
// Main Component
// ============================================================================

export function BeforeAfterManager({ pairs, onUpdate, maxPairs = 10, className }: Props) {
  const t = useTranslations("dashboard.pro.portfolio.beforeAfter");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [previewPair, setPreviewPair] = useState<BeforeAfterPair | null>(null);
  const [editingCaption, setEditingCaption] = useState<string | null>(null);

  const sortedPairs = [...pairs].sort((a, b) => a.order - b.order);

  const handlePairCreated = useCallback(
    (pair: BeforeAfterPair) => {
      onUpdate([...pairs, pair]);
    },
    [pairs, onUpdate]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      const confirmed = await confirm(t("deleteConfirm"), t("deleteTitle"));
      if (!confirmed) {
        return;
      }

      const newPairs = pairs.filter((p) => p.id !== id).map((p, index) => ({ ...p, order: index }));
      onUpdate(newPairs);
    },
    [pairs, onUpdate, t]
  );

  const handleMoveUp = useCallback(
    (id: string) => {
      const index = sortedPairs.findIndex((p) => p.id === id);
      if (index <= 0) {
        return;
      }

      const newPairs = [...sortedPairs];
      const current = newPairs[index];
      const previous = newPairs[index - 1];

      if (current && previous) {
        [newPairs[index], newPairs[index - 1]] = [previous, current];
        for (let i = 0; i < newPairs.length; i++) {
          const pair = newPairs[i];
          if (pair) {
            pair.order = i;
          }
        }
        onUpdate(newPairs);
      }
    },
    [sortedPairs, onUpdate]
  );

  const handleMoveDown = useCallback(
    (id: string) => {
      const index = sortedPairs.findIndex((p) => p.id === id);
      if (index < 0 || index >= sortedPairs.length - 1) {
        return;
      }

      const newPairs = [...sortedPairs];
      const current = newPairs[index];
      const next = newPairs[index + 1];

      if (current && next) {
        [newPairs[index], newPairs[index + 1]] = [next, current];
        for (let i = 0; i < newPairs.length; i++) {
          const pair = newPairs[i];
          if (pair) {
            pair.order = i;
          }
        }
        onUpdate(newPairs);
      }
    },
    [sortedPairs, onUpdate]
  );

  const handleUpdateCaption = useCallback(
    (id: string, caption: string) => {
      const newPairs = pairs.map((p) =>
        p.id === id ? { ...p, caption: caption.trim() || undefined } : p
      );
      onUpdate(newPairs);
      setEditingCaption(null);
    },
    [pairs, onUpdate]
  );

  const canAddMore = pairs.length < maxPairs;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className={cn("font-semibold text-foreground text-lg", geistSans.className)}>
            {t("sectionTitle")}
          </h3>
          <p className={cn("text-muted-foreground text-sm", geistSans.className)}>
            {t("sectionDescription")}
          </p>
        </div>
        {canAddMore && pairs.length > 0 && (
          <button
            className={cn(
              "flex items-center gap-2 rounded-lg border border-rausch-200 bg-rausch-50 px-4 py-2 font-semibold text-rausch-600 text-sm transition",
              "hover:bg-rausch-100 dark:border-rausch-500/30 dark:bg-rausch-500/10 dark:text-rausch-400 dark:hover:bg-rausch-500/20",
              geistSans.className
            )}
            onClick={() => setUploadModalOpen(true)}
            type="button"
          >
            <Add01Icon className="h-4 w-4" />
            {t("addNew")}
          </button>
        )}
      </div>

      {/* Pairs Grid */}
      {pairs.length > 0 ? (
        <div className="space-y-3">
          {sortedPairs.map((pair, index) => (
            <div className="flex gap-4 rounded-lg border border-border bg-card p-4" key={pair.id}>
              {/* Thumbnail */}
              <div className="w-32 flex-shrink-0">
                <BeforeAfterThumbnail onClick={() => setPreviewPair(pair)} pair={pair} />
              </div>

              {/* Details */}
              <div className="min-w-0 flex-1">
                {editingCaption === pair.id ? (
                  <input
                    autoFocus
                    className={cn(
                      "w-full rounded-lg border border-border bg-muted px-3 py-2 text-foreground text-sm",
                      "focus:border-rausch-500 focus:outline-none focus:ring-2 focus:ring-rausch-500/20",
                      geistSans.className
                    )}
                    defaultValue={pair.caption || ""}
                    maxLength={200}
                    onBlur={(e) => handleUpdateCaption(pair.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleUpdateCaption(pair.id, e.currentTarget.value);
                      } else if (e.key === "Escape") {
                        setEditingCaption(null);
                      }
                    }}
                    placeholder={t("captionPlaceholder")}
                    type="text"
                  />
                ) : (
                  <>
                    <p className={cn("font-semibold text-foreground text-sm", geistSans.className)}>
                      {pair.caption || t("noCaption")}
                    </p>
                    {pair.projectType && (
                      <p
                        className={cn("mt-0.5 text-muted-foreground text-xs", geistSans.className)}
                      >
                        {pair.projectType
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (c) => c.toUpperCase())}
                      </p>
                    )}
                    <p className={cn("mt-1 text-muted-foreground text-xs", geistSans.className)}>
                      {new Date(pair.createdAt).toLocaleDateString()}
                    </p>
                  </>
                )}

                {/* Actions */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    className={cn(
                      "flex items-center gap-1.5 text-muted-foreground text-xs transition",
                      "hover:text-foreground",
                      geistSans.className
                    )}
                    onClick={() => setEditingCaption(pair.id)}
                    type="button"
                  >
                    <Edit02Icon className="h-3.5 w-3.5" />
                    {t("editCaption")}
                  </button>
                  <span className="text-neutral-200 dark:text-neutral-700">•</span>
                  <button
                    className={cn(
                      "flex items-center gap-1.5 text-muted-foreground text-xs transition",
                      "hover:text-foreground",
                      "disabled:cursor-not-allowed disabled:opacity-50",
                      geistSans.className
                    )}
                    disabled={index === 0}
                    onClick={() => handleMoveUp(pair.id)}
                    type="button"
                  >
                    <ArrowUp01Icon className="h-3.5 w-3.5" />
                    {t("moveUp")}
                  </button>
                  <button
                    className={cn(
                      "flex items-center gap-1.5 text-muted-foreground text-xs transition",
                      "hover:text-foreground",
                      "disabled:cursor-not-allowed disabled:opacity-50",
                      geistSans.className
                    )}
                    disabled={index === sortedPairs.length - 1}
                    onClick={() => handleMoveDown(pair.id)}
                    type="button"
                  >
                    <ArrowDown01Icon className="h-3.5 w-3.5" />
                    {t("moveDown")}
                  </button>
                  <span className="text-neutral-200 dark:text-neutral-700">•</span>
                  <button
                    className={cn(
                      "flex items-center gap-1.5 text-red-500 text-xs transition",
                      "hover:text-red-600 dark:text-red-400 dark:hover:text-red-300",
                      geistSans.className
                    )}
                    onClick={() => handleDelete(pair.id)}
                    type="button"
                  >
                    <Delete02Icon className="h-3.5 w-3.5" />
                    {t("delete")}
                  </button>
                </div>
              </div>

              {/* Order Badge */}
              <div className="flex-shrink-0">
                <span
                  className={cn(
                    "inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted font-semibold text-muted-foreground text-xs",
                    geistSans.className
                  )}
                >
                  {index + 1}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-lg border-2 border-border border-dashed bg-muted/50 p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rausch-50 dark:bg-rausch-500/10">
            <Image01Icon className="h-8 w-8 text-rausch-500" />
          </div>
          <h4 className={cn("mt-4 font-semibold text-foreground text-lg", geistSans.className)}>
            {t("emptyTitle")}
          </h4>
          <p
            className={cn(
              "mx-auto mt-2 max-w-sm text-muted-foreground text-sm",
              geistSans.className
            )}
          >
            {t("emptyDescription")}
          </p>
          <button
            className={cn(
              "mt-6 inline-flex items-center gap-2 rounded-lg bg-rausch-500 px-6 py-3 font-semibold text-white transition",
              "hover:bg-rausch-600",
              geistSans.className
            )}
            onClick={() => setUploadModalOpen(true)}
            type="button"
          >
            <Add01Icon className="h-5 w-5" />
            {t("addFirstPair")}
          </button>
        </div>
      )}

      {/* Limit Info */}
      {pairs.length > 0 && (
        <p className={cn("text-center text-muted-foreground text-sm", geistSans.className)}>
          {t("pairCount", { count: pairs.length, max: maxPairs })}
        </p>
      )}

      {/* Upload Modal */}
      <BeforeAfterUploadCard
        existingPairsCount={pairs.length}
        onOpenChange={setUploadModalOpen}
        onPairCreated={handlePairCreated}
        open={uploadModalOpen}
      />

      {/* Preview Modal */}
      {previewPair && (
        <BeforeAfterModalPreview onClose={() => setPreviewPair(null)} pair={previewPair} />
      )}
    </div>
  );
}
