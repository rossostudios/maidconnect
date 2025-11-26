import { Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export default function AdminShellLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-12">
      <div className="flex flex-col items-center gap-4">
        <HugeiconsIcon className="h-12 w-12 animate-spin text-rausch-500" icon={Loading03Icon} />
        <p className="font-medium text-neutral-900">Syncing Admin Panel</p>
      </div>
      <p className="mt-4 max-w-sm text-center font-medium text-neutral-700 text-xs uppercase tracking-[0.3em]">
        Lia surface booting
      </p>
    </div>
  );
}
