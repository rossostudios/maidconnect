/**
 * Embedded Sanity Studio
 *
 * Full Sanity Studio interface embedded in admin panel
 */

import { requireUser } from "@/lib/auth";

export const metadata = {
  title: "Sanity Studio | Admin",
  description: "Full content management interface",
};

export default async function AdminStudioPage() {
  await requireUser({ allowedRoles: ["admin"] });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-[20px] border-2 border-[#EE44EE2E3] bg-[#FFEEFF8E8] p-6">
        <h1 className="mb-2 font-bold text-2xl text-[#116611616]">Sanity Studio</h1>
        <p className="text-[#AA88AAAAC]">
          Full content management interface with all features and tools
        </p>
      </div>

      {/* Embedded Studio */}
      <div className="-[20px] overflow-hidden border-2 border-[#EE44EE2E3] bg-[#FFEEFF8E8]">
        <iframe
          className="h-[calc(100vh-280px)] min-h-[600px] w-full"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
          src="/studio"
          title="Sanity Studio"
        />
      </div>
    </div>
  );
}
