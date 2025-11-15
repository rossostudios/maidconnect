/**
 * Changelog Content Management
 *
 * Embedded Sanity Studio filtered to changelog entries
 */

import { requireUser } from "@/lib/auth";

export const metadata = {
  title: "Changelog Content | Admin",
  description: "Manage product updates and release notes",
};

export default async function AdminChangelogContentPage() {
  await requireUser({ allowedRoles: ["admin"] });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-2 border-neutral-200 bg-white p-6">
        <h1 className="mb-2 font-bold text-2xl text-neutral-900">Changelog Content</h1>
        <p className="text-neutral-600">
          Manage product updates, release notes, and version history. Keep users informed about new
          features and improvements.
        </p>
      </div>

      {/* Embedded Studio with deep link */}
      <div className="-[20px] overflow-hidden border-2 border-neutral-200 bg-white">
        <iframe
          className="h-[calc(100vh-280px)] min-h-[600px] w-full"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
          src="/studio/structure;changelog"
          title="Changelog Content"
        />
      </div>
    </div>
  );
}
