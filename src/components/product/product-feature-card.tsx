import { HugeiconsIcon } from "@hugeicons/react";
import type { HugeIcon } from "@/types/icons";

type ProductFeatureCardProps = {
  icon: HugeIcon;
  title: string;
  description: string;
};

export function ProductFeatureCard({ icon, title, description }: ProductFeatureCardProps) {
  return (
    <div className="rounded-[28px] border border-[#ebe5d8] bg-white p-8 shadow-[0_10px_40px_rgba(18,17,15,0.04)] transition hover:shadow-[0_10px_40px_rgba(18,17,15,0.08)]">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E85D48]/10">
        <HugeiconsIcon className="h-8 w-8 text-[#E85D48]" icon={icon} />
      </div>

      <h3 className="mt-6 font-semibold text-2xl text-gray-900">{title}</h3>

      <p className="mt-4 text-base text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}
