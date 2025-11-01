/**
 * Admin Roadmap Dashboard
 *
 * Lists all roadmap items with filters and management actions
 */

import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { RoadmapAdminList } from "@/components/roadmap/roadmap-admin-list";

export default function AdminRoadmapPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#211f1a] mb-2">Roadmap Management</h1>
          <p className="text-[#6B7280]">Manage your product roadmap items</p>
        </div>

        <Link
          href="/admin/roadmap/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#ff5d46] text-white rounded-[12px] font-medium hover:bg-[#e54d36] transition-all"
        >
          <Plus size={20} />
          New Roadmap Item
        </Link>
      </div>

      {/* Roadmap list */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-[#ff5d46] border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <RoadmapAdminList />
      </Suspense>
    </div>
  );
}
