"use client";

import { useEffect, useState } from "react";
import { type AuditLog, AuditLogsTable } from "./audit-logs-table";

/**
 * AuditLogsDashboard - Main audit log interface with Precision design
 *
 * Features:
 * - Fetches all audit logs once for instant client-side filtering
 * - PrecisionDataTable handles search, filtering, sorting, pagination
 * - URL state synchronization for shareable links
 * - Export to CSV/JSON for compliance reporting
 * - Column visibility control
 * - Timeline view with chronological sorting
 *
 * Performance: Client-side filtering is optimal for audit logs with <10k records.
 * For larger datasets, consider implementing server-side pagination.
 */
export function AuditLogsDashboard() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      setIsLoading(true);
      try {
        // Fetch all audit logs (no pagination - client-side filtering is faster for admin UX)
        const response = await fetch("/api/admin/audit-logs?limit=10000");
        if (!response.ok) {
          throw new Error("Failed to fetch audit logs");
        }

        const data = await response.json();
        setLogs(data.logs || []);
      } catch (error) {
        console.error("Error loading audit logs:", error);
        setLogs([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadLogs();
  }, []);

  return <AuditLogsTable isLoading={isLoading} logs={logs} />;
}
