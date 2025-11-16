"use client";

import { LegalDocumentIcon } from "@hugeicons/core-free-icons";
import type { ColumnDef } from "@tanstack/react-table";
import { geistMono, geistSans } from "@/app/fonts";
import { LiaDataTable, LiaDataTableColumnHeader } from "@/components/admin/data-table";
import { cn } from "@/lib/utils";

export type AuditLog = {
  id: string;
  action_type: string;
  details: any;
  notes: string | null;
  created_at: string;
  admin: { full_name: string | null };
  target_user: { full_name: string | null; email: string } | null;
};

const getActionBadge = (action: string) => {
  // Lia design badge with semantic colors
  let baseStyle = "bg-blue-50 text-blue-700 border border-blue-200"; // default

  if (action.includes("approve")) {
    baseStyle = "bg-green-50 text-green-700 border border-green-200";
  } else if (action.includes("reject") || action.includes("ban")) {
    baseStyle = "bg-red-50 text-red-700 border border-red-200";
  } else if (action.includes("suspend")) {
    baseStyle = "bg-yellow-50 text-yellow-700 border border-yellow-200";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 font-semibold text-xs uppercase tracking-wider",
        baseStyle,
        geistSans.className
      )}
    >
      {action.replace(/_/g, " ")}
    </span>
  );
};

const columns: ColumnDef<AuditLog>[] = [
  {
    accessorKey: "created_at",
    header: ({ column }) => <LiaDataTableColumnHeader column={column} title="Date & Time" />,
    cell: ({ row }) => (
      <p
        className={cn("font-normal text-neutral-700 text-sm tracking-tighter", geistMono.className)}
      >
        {new Date(row.original.created_at).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
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
    accessorKey: "action_type",
    header: ({ column }) => <LiaDataTableColumnHeader column={column} title="Action" />,
    cell: ({ row }) => getActionBadge(row.original.action_type),
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: "admin.full_name",
    header: ({ column }) => <LiaDataTableColumnHeader column={column} title="Admin" />,
    cell: ({ row }) => (
      <p className={cn("font-semibold text-neutral-900 text-sm", geistSans.className)}>
        {row.original.admin.full_name || "Admin"}
      </p>
    ),
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: "target_user.full_name",
    header: ({ column }) => <LiaDataTableColumnHeader column={column} title="Target User" />,
    cell: ({ row }) => {
      const target = row.original.target_user;
      return (
        <div className="min-w-0">
          <p className={cn("truncate font-semibold text-neutral-900 text-sm", geistSans.className)}>
            {target ? target.full_name || "Unnamed User" : "—"}
          </p>
          {target && (
            <p
              className={cn(
                "truncate font-normal text-neutral-700 text-xs tracking-tighter",
                geistMono.className
              )}
            >
              {target.email}
            </p>
          )}
        </div>
      );
    },
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: "notes",
    header: ({ column }) => <LiaDataTableColumnHeader column={column} title="Notes" />,
    cell: ({ row }) => (
      <p
        className={cn(
          "max-w-md truncate font-normal text-neutral-700 text-sm",
          geistSans.className
        )}
      >
        {row.original.notes || "—"}
      </p>
    ),
    enableSorting: false,
    enableColumnFilter: true,
  },
];

type Props = {
  logs: AuditLog[];
  isLoading: boolean;
};

/**
 * AuditLogsTable - System audit log table with Lia design
 *
 * Features:
 * - Client-side filtering and sorting for instant UX
 * - URL state synchronization for shareable links
 * - Export to CSV/JSON for compliance audits
 * - Column visibility control
 * - Global search across all fields
 * - Timeline view with chronological sorting
 */
export function AuditLogsTable({ logs, isLoading }: Props) {
  return (
    <LiaDataTable
      columns={columns}
      data={logs}
      emptyStateDescription="Try adjusting your search or filter to find what you're looking for."
      emptyStateIcon={LegalDocumentIcon}
      emptyStateTitle="No audit logs found"
      enableExport
      enableUrlSync
      exportFilename="casaora-audit-logs"
      isLoading={isLoading}
      pageSize={50}
    />
  );
}
