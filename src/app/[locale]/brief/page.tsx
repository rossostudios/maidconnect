import { BriefPageClient } from "@/components/brief/brief-page-client";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { SiteHeader } from "@/components/sections/SiteHeader";

/**
 * Brief Page - Server Component
 *
 * Allows users to submit a brief describing their household service needs.
 * We'll match them with 3-5 vetted professionals within 5 business days.
 */
export default function BriefPage() {
  return (
    <div className="relative min-h-screen bg-neutral-50 text-neutral-900">
      <SiteHeader />
      <BriefPageClient />
      <SiteFooter />
    </div>
  );
}
