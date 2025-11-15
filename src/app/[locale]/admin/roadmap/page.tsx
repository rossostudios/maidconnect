/**
 * Admin Roadmap Dashboard
 *
 * Lists all roadmap items with filters and management actions
 */

import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { unstable_noStore } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import { RoadmapAdminList } from "@/components/roadmap/roadmap-admin-list";
import { requireUser } from "@/lib/auth";

export const metadata = {
  title: "Roadmap Management | Admin",
  description: "Manage your product roadmap items",
};

export default async function AdminRoadmapPage() {
  unstable_noStore(); // Opt out of caching for dynamic page

  await requireUser({ allowedRoles: ["admin"] });

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl text-neutral-900">Roadmap Management</h1>
          <p className="mt-2 text-neutral-600">Manage your product roadmap items</p>
        </div>

        <Link
          className="inline-flex items-center gap-2 bg-orange-500 px-6 py-3 font-medium text-white transition hover:bg-orange-600"
          href="/admin/roadmap/new"
        >
          <HugeiconsIcon icon={Add01Icon} size={20} />
          New Roadmap Item
        </Link>
      </div>

      {/* Roadmap list */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <div className="-full h-8 w-8 animate-spin border-4 border-neutral-900 border-t-transparent" />
          </div>
        }
      >
        <RoadmapAdminList />
      </Suspense>
    </section>
  );
}
