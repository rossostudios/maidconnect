/**
 * PrecisionDataTable - Universal data table components
 *
 * A comprehensive data table system built on TanStack Table v8 with Precision design.
 *
 * @example
 * ```tsx
 * import { PrecisionDataTable, PrecisionDataTableColumnHeader } from '@/components/admin/data-table';
 * import type { ColumnDef } from '@tanstack/react-table';
 *
 * const columns: ColumnDef<User>[] = [
 *   {
 *     accessorKey: 'name',
 *     header: ({ column }) => (
 *       <PrecisionDataTableColumnHeader column={column} title="Name" />
 *     ),
 *   },
 * ];
 *
 * function UsersTable() {
 *   return (
 *     <PrecisionDataTable
 *       columns={columns}
 *       data={users}
 *       enableExport
 *       enableRowSelection
 *     />
 *   );
 * }
 * ```
 */

// Sub-components
export { PrecisionDataTableColumnHeader } from "./column-header";
export { PrecisionDataTableExportMenu } from "./export-menu";
export { useTableExport } from "./hooks/use-table-export";
// Hooks
export { useTableState } from "./hooks/use-table-state";
export { PrecisionDataTablePagination } from "./pagination";
// Main component
export { PrecisionDataTable } from "./precision-data-table";
export { PrecisionDataTableEmptyState } from "./table-empty-state";
export { PrecisionDataTableSkeleton } from "./table-skeleton";
