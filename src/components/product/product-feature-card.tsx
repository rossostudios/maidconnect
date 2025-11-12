import { HugeiconsIcon } from "@hugeicons/react";
import type { HugeIcon } from "@/types/icons";

type ProductFeatureCardProps = {
  icon: HugeIcon;
  title: string;
  description: string;
};

export function ProductFeatureCard({ icon, title, description }: ProductFeatureCardProps) {
  return (
    <div className="rounded-[28px] border border-[neutral-200] bg-[neutral-50] p-8 shadow-[0_10px_40px_rgba(22,22,22,0.04)] transition hover:shadow-[0_10px_40px_rgba(22,22,22,0.08)]">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[neutral-500]/10">
        <HugeiconsIcon className="h-8 w-8 text-[neutral-500]" icon={icon} />
      </div>

      <h3 className="mt-6 font-semibold text-2xl text-[neutral-900]">{title}</h3>

      <p className="mt-4 text-[neutral-400] text-base leading-relaxed">{description}</p>
    </div>
  );
}
