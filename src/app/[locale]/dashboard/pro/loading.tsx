import { LoadingCamper } from "@/components/ui/loading-camper";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <LoadingCamper size="lg" text="Loading your dashboard..." />
    </div>
  );
}
