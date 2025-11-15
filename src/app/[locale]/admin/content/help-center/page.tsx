/**
 * Help Center Content Management
 *
 * Embedded Sanity Studio filtered to help center content
 */

import { requireUser } from "@/lib/auth";

export const metadata = {
  title: "Help Center Content | Admin",
  description: "Manage help articles, categories, and tags",
};

export default async function AdminHelpCenterContentPage() {
  await requireUser({ allowedRoles: ["admin"] });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-[20px] border-2 border-[#EE44EE2E3] bg-[#FFEEFF8E8] p-6">
        <h1 className="mb-2 font-bold text-2xl text-[#116611616]">Help Center Content</h1>
        <p className="text-[#AA88AAAAC]">
          Manage help articles, categories, and tags. Create new articles or edit existing ones.
        </p>
      </div>

      {/* Embedded Studio with deep link */}
      <div className="-[20px] overflow-hidden border-2 border-[#EE44EE2E3] bg-[#FFEEFF8E8]">
        <iframe
          className="h-[calc(100vh-280px)] min-h-[600px] w-full"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
          src="/studio/structure;helpArticle"
          title="Help Center Content"
        />
      </div>
    </div>
  );
}
