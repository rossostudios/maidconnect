"use client";

import { Delete02Icon, Edit02Icon, EyeIcon, ViewIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { deleteHelpArticle, toggleArticlePublished } from "@/app/actions/help-articles-actions";
import { confirm as showConfirm } from "@/lib/toast";

type Article = {
  id: string;
  slug: string;
  title: string;
  is_published: boolean;
  view_count: number;
  helpful_count: number;
  not_helpful_count: number;
  created_at: string;
  updated_at: string;
  category: {
    slug: string;
    name: string;
  };
};

type ArticleListClientProps = {
  articles: Article[];
  locale: "en" | "es";
};

type DeleteArticleArgs = {
  articleId: string;
  locale: "en" | "es";
  router: ReturnType<typeof useRouter>;
};

type ToggleArticleArgs = {
  articleId: string;
  isPublished: boolean;
  locale: "en" | "es";
  router: ReturnType<typeof useRouter>;
};

const deleteArticleWithToast = async ({ articleId, locale, router }: DeleteArticleArgs) => {
  try {
    const result = await deleteHelpArticle(articleId);

    if (result.success) {
      toast.success(locale === "es" ? "Artículo eliminado" : "Article deleted");
      router.refresh();
      return;
    }

    toast.error(result.error ?? (locale === "es" ? "Error al eliminar" : "Failed to delete"));
  } catch (error) {
    console.error("[Delete Error]", error);
    toast.error(locale === "es" ? "Error al eliminar artículo" : "Failed to delete article");
  }
};

const toggleArticleWithToast = async ({
  articleId,
  isPublished,
  locale,
  router,
}: ToggleArticleArgs) => {
  try {
    const result = await toggleArticlePublished(articleId, !isPublished);

    if (result.success) {
      toast.success(getToggleToastMessage(locale, isPublished));
      router.refresh();
      return;
    }

    toast.error(result.error ?? (locale === "es" ? "Error al actualizar" : "Failed to update"));
  } catch (error) {
    console.error("[Toggle Published Error]", error);
    toast.error(locale === "es" ? "Error al actualizar estado" : "Failed to update status");
  }
};

const getDeleteConfirmMessage = (locale: "en" | "es", title: string) =>
  locale === "es"
    ? `¿Eliminar "${title}"? Esta acción no se puede deshacer.`
    : `Delete "${title}"? This action cannot be undone.`;

const getToggleToastMessage = (locale: "en" | "es", wasPublished: boolean) => {
  if (wasPublished) {
    return locale === "es" ? "Artículo despublicado" : "Article unpublished";
  }
  return locale === "es" ? "Artículo publicado" : "Article published";
};

const getStatusLabel = (locale: "en" | "es", isPublished: boolean) => {
  if (isPublished) {
    return locale === "es" ? "Publicado" : "Published";
  }
  return locale === "es" ? "Borrador" : "Draft";
};

const getStatusButtonClasses = (isPublished: boolean) =>
  isPublished
    ? "bg-neutral-100 text-neutral-900 hover:bg-neutral-900 dark:bg-neutral-100/10 dark:bg-neutral-800 dark:text-neutral-100"
    : "bg-[neutral-200]/30 text-neutral-600 hover:bg-[neutral-200] dark:text-neutral-400";

export function ArticleListClient({ articles, locale }: ArticleListClientProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const formatDate = useCallback(
    (dateString: string) => {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date);
    },
    [locale]
  );

  const handleDelete = useCallback(
    async (article: Article) => {
      const confirmed = await showConfirm(
        getDeleteConfirmMessage(locale, article.title),
        locale === "es" ? "Confirmar" : "Confirm"
      );

      if (!confirmed) {
        return;
      }

      setDeletingId(article.id);
      await deleteArticleWithToast({ articleId: article.id, locale, router });
      setDeletingId(null);
    },
    [locale, router]
  );

  const handleTogglePublished = useCallback(
    async (article: Article) => {
      setTogglingId(article.id);
      await toggleArticleWithToast({
        articleId: article.id,
        isPublished: article.is_published,
        locale,
        router,
      });
      setTogglingId(null);
    },
    [locale, router]
  );

  const columns = useMemo<ColumnDef<Article>[]>(
    () => [
      {
        accessorKey: "title",
        header: locale === "es" ? "Título" : "Title",
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-neutral-900 dark:text-neutral-100">
              {row.original.title}
            </div>
            <div className="font-mono text-neutral-600 text-xs dark:text-neutral-400">
              /{row.original.slug}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "category.name",
        header: locale === "es" ? "Categoría" : "Category",
        cell: ({ row }) => (
          <span className="inline-flex items-center rounded-full bg-[neutral-200]/30 px-2.5 py-0.5 font-medium text-neutral-600 text-xs dark:text-neutral-400">
            {row.original.category.name}
          </span>
        ),
      },
      {
        accessorKey: "is_published",
        header: locale === "es" ? "Estado" : "Status",
        cell: ({ row }) => (
          <button
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium text-xs transition ${getStatusButtonClasses(row.original.is_published)}`}
            disabled={togglingId === row.original.id}
            onClick={() => handleTogglePublished(row.original)}
            type="button"
          >
            <HugeiconsIcon
              className="h-3.5 w-3.5"
              icon={row.original.is_published ? EyeIcon : ViewIcon}
            />
            {togglingId === row.original.id
              ? "..."
              : getStatusLabel(locale, row.original.is_published)}
          </button>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "view_count",
        header: locale === "es" ? "Vistas" : "Views",
        cell: ({ row }) => (
          <div className="text-center text-neutral-600 text-sm dark:text-neutral-400">
            {row.original.view_count}
          </div>
        ),
        enableSorting: true,
      },
      {
        id: "helpful_percentage",
        header: locale === "es" ? "Útil" : "Helpful",
        accessorFn: (row) => {
          const total = row.helpful_count + row.not_helpful_count;
          return total > 0 ? Math.round((row.helpful_count / total) * 100) : null;
        },
        cell: ({ getValue }) => {
          const percentage = getValue<number | null>();
          return (
            <div className="text-center">
              {percentage !== null ? (
                <span
                  className={`font-medium text-sm ${
                    percentage >= 70
                      ? "text-neutral-900 dark:text-neutral-100"
                      : "text-neutral-600 dark:text-neutral-400"
                  }`}
                >
                  {percentage}%
                </span>
              ) : (
                <span className="text-neutral-600 text-sm dark:text-neutral-400/70">-</span>
              )}
            </div>
          );
        },
        enableSorting: true,
      },
      {
        accessorKey: "updated_at",
        header: locale === "es" ? "Actualizado" : "Updated",
        cell: ({ row }) => (
          <div className="text-neutral-600 text-sm dark:text-neutral-400">
            {formatDate(row.original.updated_at)}
          </div>
        ),
        enableSorting: true,
      },
      {
        id: "actions",
        header: locale === "es" ? "Acciones" : "Actions",
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <Link
              className="p-2 text-neutral-600 transition hover:bg-[neutral-200]/30 dark:text-neutral-400"
              href={`/${locale}/help/${row.original.category.slug}/${row.original.slug}`}
              target="_blank"
              title={locale === "es" ? "Ver artículo" : "View article"}
            >
              <HugeiconsIcon className="h-4 w-4" icon={ViewIcon} />
            </Link>
            <Link
              className="p-2 text-neutral-900 transition hover:bg-white dark:bg-neutral-950 dark:text-neutral-100"
              href={`/${locale}/admin/help/articles/${row.original.id}/edit`}
              title={locale === "es" ? "Editar" : "Edit"}
            >
              <HugeiconsIcon className="h-4 w-4" icon={Edit02Icon} />
            </Link>
            <button
              className="p-2 text-neutral-900 transition hover:bg-white disabled:opacity-50 dark:bg-neutral-950 dark:text-neutral-100"
              disabled={deletingId === row.original.id}
              onClick={() => handleDelete(row.original)}
              title={locale === "es" ? "Eliminar" : "Delete"}
              type="button"
            >
              <HugeiconsIcon className="h-4 w-4" icon={Delete02Icon} />
            </button>
          </div>
        ),
      },
    ],
    [locale, deletingId, togglingId, formatDate, handleDelete, handleTogglePublished]
  );

  const table = useReactTable({
    data: articles,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (articles.length === 0) {
    return (
      <div className="border border-neutral-200 bg-white p-12 text-center dark:border-neutral-800 dark:bg-neutral-950">
        <p className="text-neutral-600 dark:text-neutral-400">
          {locale === "es" ? "No hay artículos todavía" : "No articles yet"}
        </p>
        <Link
          className="mt-4 inline-flex items-center gap-2 bg-neutral-900 px-6 py-3 font-semibold text-white transition hover:bg-neutral-900 dark:bg-neutral-100 dark:bg-neutral-100 dark:text-neutral-950"
          href={`/${locale}/admin/help/articles/new`}
        >
          {locale === "es" ? "Crear Primer Artículo" : "Create First Article"}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Filter */}
      <div className="flex items-center gap-4">
        <input
          className="flex-1 border border-neutral-400/40 px-4 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-500/20 dark:border-neutral-100 dark:border-neutral-500/40 dark:focus:ring-neutral-400/20"
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder={
            locale === "es"
              ? "Buscar artículos por título, categoría..."
              : "Search articles by title, category..."
          }
          type="text"
          value={globalFilter}
        />
        <div className="text-neutral-600 text-sm dark:text-neutral-400">
          {locale === "es" ? "Total:" : "Total:"} {table.getFilteredRowModel().rows.length}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <table className="w-full">
          <thead className="border-neutral-200 border-b bg-white dark:border-neutral-800 dark:bg-neutral-950">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    className="px-6 py-3 text-left font-semibold text-neutral-600 text-sm dark:text-neutral-400"
                    key={header.id}
                  >
                    {header.isPlaceholder ? null : (
                      <button
                        className={
                          header.column.getCanSort()
                            ? "flex cursor-pointer select-none items-center gap-2 hover:text-neutral-900 dark:text-neutral-100"
                            : ""
                        }
                        disabled={!header.column.getCanSort()}
                        onClick={header.column.getToggleSortingHandler()}
                        type="button"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <span className="text-neutral-600 dark:text-neutral-400/70">
                            {{
                              asc: "↑",
                              desc: "↓",
                            }[header.column.getIsSorted() as string] ?? "↕"}
                          </span>
                        )}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-[neutral-50]">
            {table.getRowModel().rows.map((row) => (
              <tr className="transition hover:bg-white dark:bg-neutral-950" key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td className="px-6 py-4" key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
