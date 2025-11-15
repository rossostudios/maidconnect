/**
 * Roadmap Content Management
 *
 * Embedded Sanity Studio filtered to roadmap items
 */

import { requireUser } from "@/lib/auth";

export const metadata = {
  title: "Roadmap Content | Admin",
  description: "Manage upcoming features and improvements",
};

export default async function AdminRoadmapContentPage() {
  await requireUser({ allowedRoles: ["admin"] });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-[20px] border-2 border-neutral-200 bg-neutral-50 p-6">
        <h1 className="mb-2 font-bold text-2xl text-neutral-900">Roadmap Content</h1>
        <p className="text-neutral-500">
          Manage upcoming features, improvements, and product plans. Show users what's coming next.
        </p>
      </div>

      {/* Embedded Studio with deep link */}
      <div className="-[20px] overflow-hidden border-2 border-neutral-200 bg-neutral-50">
        <iframe
          className="h-[calc(100vh-280px)] min-h-[600px] w-full"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
          src="/studio/structure;roadmapItem"
          title="Roadmap Content"
        />
      </div>
    </div>
  );
}
