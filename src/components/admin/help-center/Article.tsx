"use client";

import { Delete02Icon, Edit02Icon, EyeIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { deleteArticle } from "./articleActions";

type ArticleRowActionsProps = {
  articleId: string;
  articleTitle: string;
  categorySlug: string;
  articleSlug: string;
};

export function ArticleRowActions({
  articleId,
  articleTitle,
  categorySlug,
  articleSlug,
}: ArticleRowActionsProps) {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);

    try {
      await deleteArticle(articleId);
      toast.success("Article deleted successfully");
      router.refresh();
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete article");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        {/* View */}
        <Link
          className="inline-flex h-9 w-9 items-center justify-center border border-neutral-200 text-neutral-600 transition hover:border-neutral-900 hover:text-neutral-900 dark:border-neutral-100 dark:border-neutral-800 dark:text-neutral-100 dark:text-neutral-300"
          href={`/help/${categorySlug}/${articleSlug}`}
          target="_blank"
          title="View article"
        >
          <HugeiconsIcon className="h-4 w-4" icon={EyeIcon} />
        </Link>

        {/* Edit */}
        <Link
          className="inline-flex h-9 w-9 items-center justify-center border border-neutral-200 text-neutral-600 transition hover:border-neutral-900 hover:text-neutral-900 dark:border-neutral-100 dark:border-neutral-800 dark:text-neutral-100 dark:text-neutral-300"
          href={`/admin/help-center/${articleId}`}
          title="Edit article"
        >
          <HugeiconsIcon className="h-4 w-4" icon={Edit02Icon} />
        </Link>

        {/* Delete */}
        <button
          className="inline-flex h-9 w-9 items-center justify-center border border-neutral-200 text-neutral-600 transition hover:border-neutral-900 hover:text-neutral-900 dark:border-neutral-100 dark:border-neutral-800 dark:text-neutral-100 dark:text-neutral-300"
          onClick={() => setShowDeleteConfirm(true)}
          title="Delete article"
          type="button"
        >
          <HugeiconsIcon className="h-4 w-4" icon={Delete02Icon} />
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 p-4 dark:bg-neutral-100/50">
          <div className="max-w-md border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-950">
            <h3 className="mb-2 font-bold text-neutral-900 text-xl dark:text-neutral-100">
              Delete Article
            </h3>
            <p className="mb-6 text-neutral-600 dark:text-neutral-300">
              Are you sure you want to delete <strong>"{articleTitle}"</strong>? This action cannot
              be undone.
            </p>

            <div className="flex gap-3">
              <button
                className="flex-1 border border-neutral-200 bg-white px-6 py-3 font-semibold text-neutral-900 transition hover:bg-white dark:border-neutral-800 dark:bg-neutral-950 dark:bg-neutral-950 dark:text-neutral-100"
                onClick={() => setShowDeleteConfirm(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="flex-1 bg-neutral-900 px-6 py-3 font-semibold text-white transition hover:bg-neutral-900 disabled:opacity-50 dark:bg-neutral-100 dark:bg-neutral-100 dark:text-neutral-950"
                disabled={deleting}
                onClick={handleDelete}
                type="button"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
