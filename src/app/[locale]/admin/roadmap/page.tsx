/**
 * Admin Roadmap Dashboard
 *
 * Lists all roadmap items with filters and management actions
 */

import { Add01Icon, Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { unstable_noStore } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import { geistSans } from "@/app/fonts";
import { RoadmapAdminList } from "@/components/roadmap/roadmap-admin-list";
import { requireUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

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
          <h1
            className={cn(
              "font-semibold text-3xl text-neutral-900 uppercase tracking-tight",
              geistSans.className
            )}
          >
            Roadmap Management
          </h1>
          <p className={cn("mt-1.5 text-neutral-700 text-sm tracking-wide", geistSans.className)}>
            Manage your product roadmap items
          </p>
        </div>

        <Link
          className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-3 font-medium text-white transition hover:bg-orange-600"
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
            <HugeiconsIcon className="h-8 w-8 animate-spin text-orange-500" icon={Loading03Icon} />
          </div>
        }
      >
        <RoadmapAdminList />
      </Suspense>
    </section>
  );
}
