/**
 * LiaDataTable - Universal data table components
 *
 * A comprehensive data table system built on TanStack Table v8 with Lia design.
 *
 * @example
 * ```tsx
 * import { LiaDataTable, LiaDataTableColumnHeader } from '@/components/admin/data-table';
 * import type { ColumnDef } from '@tanstack/react-table';
 *
 * const columns: ColumnDef<User>[] = [
 *   {
 *     accessorKey: 'name',
 *     header: ({ column }) => (
 *       <LiaDataTableColumnHeader column={column} title="Name" />
 *     ),
 *   },
 * ];
 *
 * function UsersTable() {
 *   return (
 *     <LiaDataTable
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
export { LiaDataTableColumnHeader } from "./column-header";
export { LiaDataTableExportMenu } from "./export-menu";
export { useTableExport } from "./hooks/use-table-export";
// Hooks
export { useTableState } from "./hooks/use-table-state";
// Main component
export { LiaDataTable } from "./lia-data-table";
export { LiaDataTablePagination } from "./pagination";
export { LiaDataTableEmptyState } from "./table-empty-state";
export { LiaDataTableSkeleton } from "./table-skeleton";
