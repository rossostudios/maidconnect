"use client";

import type { Table } from "@tanstack/react-table";
import { useCallback } from "react";

type ExportFormat = "csv" | "json";

type UseTableExportOptions<TData> = {
  filename?: string;
  table: Table<TData>;
};

/**
 * Handles data export functionality for tables
 *
 * Features:
 * - Export to CSV or JSON
 * - Respects column visibility and ordering
 * - Downloads file with timestamp
 */
export function useTableExport<TData>({ filename = "data", table }: UseTableExportOptions<TData>) {
  const exportToCSV = useCallback(() => {
    const visibleColumns = table
      .getAllColumns()
      .filter((col) => col.getIsVisible() && col.id !== "select" && col.id !== "actions");

    // Get headers
    const headers = visibleColumns
      .map((col) => {
        const header = col.columnDef.header;
        if (typeof header === "string") return header;
        return col.id;
      })
      .join(",");

    // Get rows
    const rows = table.getFilteredRowModel().rows.map((row) => {
      return visibleColumns
        .map((col) => {
          const value = row.getValue(col.id);

          // Handle various data types
          if (value === null || value === undefined) return "";
          if (typeof value === "object") return JSON.stringify(value);
          if (typeof value === "string") {
            // Escape commas and quotes
            const escaped = value.replace(/"/g, '""');
            return `"${escaped}"`;
          }
          return String(value);
        })
        .join(",");
    });

    const csv = [headers, ...rows].join("\n");

    // Create download
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().split("T")[0];

    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}-${timestamp}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [table, filename]);

  const exportToJSON = useCallback(() => {
    const visibleColumns = table
      .getAllColumns()
      .filter((col) => col.getIsVisible() && col.id !== "select" && col.id !== "actions");

    // Get rows as objects
    const data = table.getFilteredRowModel().rows.map((row) => {
      const obj: Record<string, unknown> = {};

      visibleColumns.forEach((col) => {
        const header = col.columnDef.header;
        const key = typeof header === "string" ? header : col.id;
        obj[key] = row.getValue(col.id);
      });

      return obj;
    });

    const json = JSON.stringify(data, null, 2);

    // Create download
    const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().split("T")[0];

    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}-${timestamp}.json`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [table, filename]);

  const exportData = useCallback(
    (format: ExportFormat) => {
      switch (format) {
        case "csv":
          exportToCSV();
          break;
        case "json":
          exportToJSON();
          break;
        default:
          console.warn(`Unsupported export format: ${format}`);
      }
    },
    [exportToCSV, exportToJSON]
  );

  return {
    exportToCSV,
    exportToJSON,
    exportData,
    canExport: table.getFilteredRowModel().rows.length > 0,
  };
}
