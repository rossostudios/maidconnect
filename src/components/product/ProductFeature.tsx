import { HugeiconsIcon } from "@hugeicons/react";
import type { HugeIcon } from "@/types/icons";

type ProductFeatureCardProps = {
  icon: HugeIcon;
  title: string;
  description: string;
};

export function ProductFeatureCard({ icon, title, description }: ProductFeatureCardProps) {
  return (
    <div className="rounded-[28px] border border-[#e2e8f0] bg-[#f8fafc] p-8 shadow-[0_10px_40px_rgba(22,22,22,0.04)] transition hover:shadow-[0_10px_40px_rgba(22,22,22,0.08)]">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#64748b]/10">
        <HugeiconsIcon className="h-8 w-8 text-[#64748b]" icon={icon} />
      </div>

      <h3 className="mt-6 font-semibold text-2xl text-[#0f172a]">{title}</h3>

      <p className="mt-4 text-[#94a3b8] text-base leading-relaxed">{description}</p>
    </div>
  );
}
