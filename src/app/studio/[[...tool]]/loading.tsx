/**
 * Sanity Studio Loading State
 */

import { LoadingCamper } from "@/components/ui/loading-camper";

export default function StudioLoading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <LoadingCamper size="lg" text="Loading Sanity Studio..." />
    </div>
  );
}
