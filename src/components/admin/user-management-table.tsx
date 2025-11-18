"use client";

import { UserCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { geistSans } from "@/app/fonts";
import { LiaDataTable, LiaDataTableColumnHeader } from "@/components/admin/data-table";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

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

const getRoleBadgeColor = (role: UserRole) => {
  switch (role) {
    case "admin":
      return "bg-orange-500 text-white border border-orange-500";
    case "professional":
      return "bg-orange-50 text-orange-600 border border-orange-200";
    case "customer":
      return "bg-green-50 text-green-700 border border-green-200";
    default:
      return "bg-neutral-100 text-neutral-700 border border-neutral-200";
  }
};

const getSuspensionBadge = (suspension: UserSuspension | null) => {
  if (!suspension) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2.5 py-1 font-medium text-green-700 text-xs tracking-wider",
          geistSans.className
        )}
      >
        Active
      </span>
    );
  }

  const isBanned = suspension.type === "permanent";

  return (
    <div className="space-y-1">
      <span
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-1 font-medium text-xs tracking-wider",
          geistSans.className,
          isBanned
            ? "border border-red-200 bg-red-50 text-red-700"
            : "border border-yellow-200 bg-yellow-50 text-yellow-700"
        )}
      >
        {isBanned ? "Banned" : "Suspended"}
      </span>
      {suspension.expires_at && (
        <p
          className={cn(
            "font-normal text-neutral-700 text-xs tracking-tighter",
            geistSans.className
          )}
        >
          Until {new Date(suspension.expires_at).toLocaleDateString()}
        </p>
      )}
    </div>
  );
};

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "full_name",
    header: ({ column }) => <LiaDataTableColumnHeader column={column} title="User" />,
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            {user.avatar_url ? (
              <Image
                alt={user.full_name || "User"}
                className="h-10 w-10 rounded-full border-2 border-neutral-200 object-cover"
                height={40}
                src={user.avatar_url}
                width={40}
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-neutral-200 bg-orange-50">
                <HugeiconsIcon className="h-6 w-6 text-orange-500" icon={UserCircleIcon} />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className={cn("truncate font-medium text-neutral-900 text-sm", geistSans.className)}>
              {user.full_name || "Unnamed User"}
            </p>
            <p
              className={cn(
                "truncate font-normal text-neutral-700 text-xs tracking-tighter",
                geistSans.className
              )}
            >
              {user.email}
            </p>
          </div>
        </div>
      );
    },
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: "role",
    header: ({ column }) => <LiaDataTableColumnHeader column={column} title="Role" />,
    cell: ({ row }) => {
      const role = row.original.role;
      return (
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-1 font-medium text-xs tracking-wider",
            getRoleBadgeColor(role),
            geistSans.className
          )}
        >
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </span>
      );
    },
    enableSorting: true,
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "city",
    header: ({ column }) => <LiaDataTableColumnHeader column={column} title="City" />,
    cell: ({ row }) => (
      <p className={cn("font-normal text-neutral-900 text-sm", geistSans.className)}>
        {row.original.city || "—"}
      </p>
    ),
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: "suspension",
    header: ({ column }) => <LiaDataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => getSuspensionBadge(row.original.suspension),
    enableSorting: false,
    filterFn: (row, id, value) => {
      const suspension = row.getValue(id) as UserSuspension | null;
      if (value === "active") {
        return !suspension;
      }
      if (value === "suspended") {
        return suspension?.type === "temporary";
      }
      if (value === "banned") {
        return suspension?.type === "permanent";
      }
      return true;
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => <LiaDataTableColumnHeader column={column} title="Joined" />,
    cell: ({ row }) => (
      <p
        className={cn("font-normal text-neutral-700 text-sm tracking-tighter", geistSans.className)}
      >
        {new Date(row.original.created_at).toLocaleDateString()}
      </p>
    ),
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      const dateA = new Date(rowA.original.created_at).getTime();
      const dateB = new Date(rowB.original.created_at).getTime();
      return dateA - dateB;
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => (
      <div className="text-right">
        <Link
          className={cn(
            "inline-flex items-center rounded-lg border border-neutral-200 bg-white px-3 py-1.5 font-medium text-neutral-900 text-xs tracking-wider transition-all hover:border-orange-500 hover:bg-orange-500 hover:text-white",
            geistSans.className
          )}
          href={`/admin/users/${row.original.id}`}
        >
          View
        </Link>
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
];

type Props = {
  users: User[];
  isLoading: boolean;
};

/**
 * UserManagementTable - Advanced user management with Lia design
 *
 * Features:
 * - URL state synchronization for shareable links
 * - Multi-column sorting and filtering
 * - Global search across all user fields
 * - Export to CSV/JSON
 * - Column visibility control
 * - Keyboard navigation
 * - Loading skeletons and empty states
 */
export function UserManagementTable({ users, isLoading }: Props) {
  return (
    <LiaDataTable
      columns={columns}
      data={users}
      emptyStateDescription="Try adjusting your search or filter to find what you're looking for."
      emptyStateIcon={UserCircleIcon}
      emptyStateTitle="No users found"
      enableExport
      enableUrlSync
      exportFilename="casaora-users"
      isLoading={isLoading}
      pageSize={10}
    />
  );
}
