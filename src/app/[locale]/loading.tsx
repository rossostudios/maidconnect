import { LoadingCamper } from "@/components/ui/loading-camper";

export default function MarketingLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-6 py-12">
      <LoadingCamper size="lg" text="Preparing Casaora" />
      <p className="mt-4 max-w-md text-center text-neutral-600 text-sm">
        Fetching the latest listings, professionals, and concierge inventory.
      </p>
    </div>
  );
}
