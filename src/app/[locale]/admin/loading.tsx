import { LoadingCamper } from "@/components/ui/loading-camper";

export default function AdminShellLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-12">
      <LoadingCamper size="lg" text="Syncing Admin Panel" />
      <p className="mt-4 max-w-sm text-center font-medium text-neutral-700 text-xs uppercase tracking-[0.3em]">
        Lia surface booting
      </p>
    </div>
  );
}
