/**
 * Marketing Pages Content Management
 *
 * Embedded Sanity Studio filtered to marketing pages
 */

import { requireUser } from "@/lib/auth";

export const metadata = {
  title: "Marketing Pages Content | Admin",
  description: "Manage landing pages and custom content",
};

export default async function AdminPagesContentPage() {
  await requireUser({ allowedRoles: ["admin"] });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-[20px] border-2 border-[#EE44EE2E3] bg-[#FFEEFF8E8] p-6">
        <h1 className="mb-2 font-bold text-2xl text-[#116611616]">Marketing Pages</h1>
        <p className="text-[#AA88AAAAC]">
          Build and manage custom landing pages, about pages, pricing pages, and more using the page
          builder.
        </p>
      </div>

      {/* Embedded Studio with deep link */}
      <div className="overflow-hidden rounded-[20px] border-2 border-[#EE44EE2E3] bg-[#FFEEFF8E8]">
        <iframe
          className="h-[calc(100vh-280px)] min-h-[600px] w-full"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
          src="/studio/structure;page"
          title="Marketing Pages"
        />
      </div>
    </div>
  );
}
