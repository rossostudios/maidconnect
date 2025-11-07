"use client";

import { Delete02Icon, Edit02Icon, EyeIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "@/lib/toast";
import { deleteArticle } from "./article-actions";

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
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E5E5] text-[#737373] transition hover:border-[#E85D48] hover:text-[#E85D48]"
          href={`/help/${categorySlug}/${articleSlug}`}
          target="_blank"
          title="View article"
        >
          <HugeiconsIcon className="h-4 w-4" icon={EyeIcon} />
        </Link>

        {/* Edit */}
        <Link
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E5E5] text-[#737373] transition hover:border-[#E85D48] hover:text-[#E85D48]"
          href={`/admin/help-center/${articleId}`}
          title="Edit article"
        >
          <HugeiconsIcon className="h-4 w-4" icon={Edit02Icon} />
        </Link>

        {/* Delete */}
        <button
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E5E5] text-[#737373] transition hover:border-red-500 hover:text-red-500"
          onClick={() => setShowDeleteConfirm(true)}
          title="Delete article"
          type="button"
        >
          <HugeiconsIcon className="h-4 w-4" icon={Delete02Icon} />
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-w-md rounded-xl border border-[#E5E5E5] bg-white p-6 shadow-xl">
            <h3 className="mb-2 font-bold text-[#171717] text-xl">Delete Article</h3>
            <p className="mb-6 text-[#737373]">
              Are you sure you want to delete <strong>"{articleTitle}"</strong>? This action cannot
              be undone.
            </p>

            <div className="flex gap-3">
              <button
                className="flex-1 rounded-lg border border-[#E5E5E5] bg-white px-6 py-3 font-semibold text-[#171717] transition hover:bg-gray-50"
                onClick={() => setShowDeleteConfirm(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="flex-1 rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
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
