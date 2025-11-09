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
import { useMemo, useState } from "react";
import { deleteHelpArticle, toggleArticlePublished } from "@/app/actions/help-articles-actions";
import { toast } from "@/lib/toast";

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

export function ArticleListClient({ articles, locale }: ArticleListClientProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const handleDelete = async (article: Article) => {
    const confirmed = confirm(
      locale === "es"
        ? `¿Eliminar "${article.title}"? Esta acción no se puede deshacer.`
        : `Delete "${article.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(article.id);

    try {
      const result = await deleteHelpArticle(article.id);

      if (result.success) {
        toast.success(locale === "es" ? "Artículo eliminado" : "Article deleted");
        router.refresh();
      } else {
        toast.error(result.error ?? (locale === "es" ? "Error al eliminar" : "Failed to delete"));
      }
    } catch (error) {
      console.error("[Delete Error]", error);
      toast.error(locale === "es" ? "Error al eliminar artículo" : "Failed to delete article");
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePublished = async (article: Article) => {
    setTogglingId(article.id);

    try {
      const result = await toggleArticlePublished(article.id, !article.is_published);

      if (result.success) {
        toast.success(
          article.is_published
            ? locale === "es"
              ? "Artículo despublicado"
              : "Article unpublished"
            : locale === "es"
              ? "Artículo publicado"
              : "Article published"
        );
        router.refresh();
      } else {
        toast.error(result.error ?? (locale === "es" ? "Error al actualizar" : "Failed to update"));
      }
    } catch (error) {
      console.error("[Toggle Published Error]", error);
      toast.error(locale === "es" ? "Error al actualizar estado" : "Failed to update status");
    } finally {
      setTogglingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const columns = useMemo<ColumnDef<Article>[]>(
    () => [
      {
        accessorKey: "title",
        header: locale === "es" ? "Título" : "Title",
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-gray-900">{row.original.title}</div>
            <div className="font-mono text-gray-500 text-xs">/{row.original.slug}</div>
          </div>
        ),
      },
      {
        accessorKey: "category.name",
        header: locale === "es" ? "Categoría" : "Category",
        cell: ({ row }) => (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 font-medium text-gray-700 text-xs">
            {row.original.category.name}
          </span>
        ),
      },
      {
        accessorKey: "is_published",
        header: locale === "es" ? "Estado" : "Status",
        cell: ({ row }) => (
          <button
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium text-xs transition ${
              row.original.is_published
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
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
              : row.original.is_published
                ? locale === "es"
                  ? "Publicado"
                  : "Published"
                : locale === "es"
                  ? "Borrador"
                  : "Draft"}
          </button>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "view_count",
        header: locale === "es" ? "Vistas" : "Views",
        cell: ({ row }) => (
          <div className="text-center text-gray-700 text-sm">{row.original.view_count}</div>
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
                    percentage >= 70 ? "text-green-600" : "text-gray-600"
                  }`}
                >
                  {percentage}%
                </span>
              ) : (
                <span className="text-gray-400 text-sm">-</span>
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
          <div className="text-gray-600 text-sm">{formatDate(row.original.updated_at)}</div>
        ),
        enableSorting: true,
      },
      {
        id: "actions",
        header: locale === "es" ? "Acciones" : "Actions",
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <Link
              className="rounded p-2 text-gray-600 transition hover:bg-gray-100"
              href={`/${locale}/help/${row.original.category.slug}/${row.original.slug}`}
              target="_blank"
              title={locale === "es" ? "Ver artículo" : "View article"}
            >
              <HugeiconsIcon className="h-4 w-4" icon={ViewIcon} />
            </Link>
            <Link
              className="rounded p-2 text-blue-600 transition hover:bg-blue-50"
              href={`/${locale}/admin/help/articles/${row.original.id}/edit`}
              title={locale === "es" ? "Editar" : "Edit"}
            >
              <HugeiconsIcon className="h-4 w-4" icon={Edit02Icon} />
            </Link>
            <button
              className="rounded p-2 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
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
    [locale, deletingId, togglingId]
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
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
        <p className="text-gray-600">
          {locale === "es" ? "No hay artículos todavía" : "No articles yet"}
        </p>
        <Link
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
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
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder={
            locale === "es"
              ? "Buscar artículos por título, categoría..."
              : "Search articles by title, category..."
          }
          type="text"
          value={globalFilter}
        />
        <div className="text-gray-600 text-sm">
          {locale === "es" ? "Total:" : "Total:"} {table.getFilteredRowModel().rows.length}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full">
          <thead className="border-gray-200 border-b bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    className="px-6 py-3 text-left font-semibold text-gray-700 text-sm"
                    key={header.id}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? "flex cursor-pointer select-none items-center gap-2 hover:text-gray-900"
                            : ""
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <span className="text-gray-400">
                            {{
                              asc: "↑",
                              desc: "↓",
                            }[header.column.getIsSorted() as string] ?? "↕"}
                          </span>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr className="transition hover:bg-gray-50" key={row.id}>
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
