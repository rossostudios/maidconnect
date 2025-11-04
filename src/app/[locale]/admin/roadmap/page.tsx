/**
 * Admin Roadmap Dashboard
 *
 * Lists all roadmap items with filters and management actions
 */

import { Add01Icon } from "hugeicons-react";
import Link from "next/link";
import { Suspense } from "react";
import { RoadmapAdminList } from "@/components/roadmap/roadmap-admin-list";

export default function AdminRoadmapPage() {
  return (
    <>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 font-bold text-3xl text-[var(--foreground)]">Roadmap Management</h1>
          <p className="text-[#6B7280]">Manage your product roadmap items</p>
        </div>

        <Link
          className="inline-flex items-center gap-2 rounded-[12px] bg-[var(--red)] px-6 py-3 font-medium text-white transition-all hover:bg-[var(--red)]"
          href="/admin/roadmap/new"
        >
          <Add01Icon size={20} />
          New Roadmap Item
        </Link>
      </div>

      {/* Roadmap list */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--red)] border-t-transparent" />
          </div>
        }
      >
        <RoadmapAdminList />
      </Suspense>
    </>
  );
}
