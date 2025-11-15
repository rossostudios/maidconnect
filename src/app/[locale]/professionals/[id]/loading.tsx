import { LoadingCamper } from "@/components/ui/loading-camper";

export default function Loading() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <LoadingCamper size="lg" text="Loading professional profile..." />
    </div>
  );
}
