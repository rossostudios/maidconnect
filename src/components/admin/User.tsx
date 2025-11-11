"use client";

import {
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import Image from "next/image";
import { useState } from "react";
import { Link } from "@/i18n/routing";

type UserRole = "customer" | "professional" | "admin";

type UserSuspension = {
  type: "temporary" | "permanent";
  reason: string;
  expires_at: string | null;
};

export type User = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: UserRole;
  avatar_url: string | null;
  city: string | null;
  created_at: string;
  suspension: UserSuspension | null;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const getRoleBadgeColor = (role: UserRole) => {
  switch (role) {
    case "admin":
      return "bg-[#E85D48] text-white";
    case "professional":
      return "bg-[#FFF4E6] text-[#FF8A00] border border-[#FFE0B2]";
    case "customer":
      return "bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getSuspensionBadge = (suspension: UserSuspension | null) => {
  if (!suspension) {
    return (
      <span className="inline-flex items-center rounded-lg border border-stone-200 bg-stone-100 px-2.5 py-1 font-medium text-stone-700 text-xs">
        Active
      </span>
    );
  }

  const isBanned = suspension.type === "permanent";

  return (
    <div className="space-y-1">
      <span
        className={`inline-flex items-center rounded-lg px-2.5 py-1 font-medium text-xs ${
          isBanned
            ? "border border-stone-300 bg-[#E85D48]/10 text-stone-800"
            : "border border-stone-300 bg-stone-100 text-stone-600"
        }`}
      >
        {isBanned ? "Banned" : "Suspended"}
      </span>
      {suspension.expires_at && (
        <p className="text-[#737373] text-xs">
          Until {new Date(suspension.expires_at).toLocaleDateString()}
        </p>
      )}
    </div>
  );
};

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "full_name",
    header: "User",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            {user.avatar_url ? (
              <Image
                alt={user.full_name || "User"}
                className="h-10 w-10 rounded-full border-2 border-[#E5E5E5] object-cover"
                height={40}
                src={user.avatar_url}
                width={40}
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#E5E5E5] bg-[#E85D48]/10">
                <HugeiconsIcon className="h-6 w-6 text-[#E85D48]" icon={UserCircleIcon} />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-[#171717] text-sm">
              {user.full_name || "Unnamed User"}
            </p>
            <p className="truncate text-[#737373] text-xs">{user.email}</p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.original.role;
      return (
        <span
          className={`inline-flex items-center rounded-lg px-2.5 py-1 font-medium text-xs ${getRoleBadgeColor(role)}`}
        >
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </span>
      );
    },
  },
  {
    accessorKey: "city",
    header: "City",
    cell: ({ row }) => <p className="text-[#171717] text-sm">{row.original.city || "—"}</p>,
  },
  {
    accessorKey: "suspension",
    header: "Status",
    cell: ({ row }) => getSuspensionBadge(row.original.suspension),
  },
  {
    accessorKey: "created_at",
    header: "Joined",
    cell: ({ row }) => (
      <p className="text-[#737373] text-sm">
        {new Date(row.original.created_at).toLocaleDateString()}
      </p>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => (
      <div className="text-right">
        <Link
          className="inline-flex items-center rounded-lg bg-[#171717] px-3 py-1.5 font-medium text-sm text-white transition-colors hover:bg-[#404040]"
          href={`/admin/users/${row.original.id}`}
        >
          View
        </Link>
      </div>
    ),
  },
];

type Props = {
  users: User[];
  isLoading: boolean;
  pagination: Pagination;
  onPageChange: (page: number) => void;
};

export function UserManagementTable({ users, isLoading, pagination, onPageChange }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: users,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) {
    return (
      <div className="rounded-lg border border-[#E5E5E5] bg-white">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="space-y-3 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#E5E5E5] border-t-[#E85D48]" />
            <p className="text-[#737373] text-sm">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="rounded-lg border border-[#E5E5E5] bg-white">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="space-y-2 text-center">
            <HugeiconsIcon className="mx-auto h-12 w-12 text-[#A3A3A3]" icon={UserCircleIcon} />
            <p className="font-medium text-[#171717] text-sm">No users found</p>
            <p className="text-[#737373] text-xs">Try adjusting your filters</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-[#E5E5E5] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-[#E5E5E5] border-b bg-[#F5F5F5]">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      className="px-6 py-3 text-left font-semibold text-[#171717] text-xs uppercase tracking-wider"
                      key={header.id}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={
                            header.column.getCanSort()
                              ? "flex cursor-pointer select-none items-center gap-2 transition-colors hover:text-[#E85D48]"
                              : ""
                          }
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <span className="text-[#A3A3A3]">
                              {header.column.getIsSorted() === "asc" ? (
                                <HugeiconsIcon className="h-3 w-3" icon={ArrowUp01Icon} />
                              ) : header.column.getIsSorted() === "desc" ? (
                                <HugeiconsIcon className="h-3 w-3" icon={ArrowDown01Icon} />
                              ) : (
                                <div className="h-3 w-3" />
                              )}
                            </span>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-[#E5E5E5] bg-white">
              {table.getRowModel().rows.map((row) => (
                <tr className="transition-colors hover:bg-[#F5F5F5]" key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td className="whitespace-nowrap px-6 py-4" key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between rounded-lg border border-[#E5E5E5] bg-white px-6 py-4">
          <div className="text-[#737373] text-sm">
            Showing{" "}
            <span className="font-medium text-[#171717]">
              {(pagination.page - 1) * pagination.limit + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium text-[#171717]">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{" "}
            of <span className="font-medium text-[#171717]">{pagination.total}</span> users
          </div>
          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-[#E5E5E5] bg-white px-4 py-2 font-medium text-[#171717] text-sm transition-colors hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={pagination.page === 1}
              onClick={() => onPageChange(pagination.page - 1)}
            >
              <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft01Icon} />
              Previous
            </button>
            <span className="px-3 font-medium text-[#171717] text-sm">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-[#E5E5E5] bg-white px-4 py-2 font-medium text-[#171717] text-sm transition-colors hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
            >
              Next
              <HugeiconsIcon className="h-4 w-4" icon={ArrowRight01Icon} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
