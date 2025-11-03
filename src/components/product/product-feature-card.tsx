import type { LucideIcon } from "lucide-react";

type ProductFeatureCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export function ProductFeatureCard({ icon: Icon, title, description }: ProductFeatureCardProps) {
  return (
    <div className="rounded-[28px] border border-[#ebe5d8] bg-white p-8 shadow-[0_10px_40px_rgba(18,17,15,0.04)] transition hover:shadow-[0_10px_40px_rgba(18,17,15,0.08)]">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#8B7355]/10">
        <Icon className="h-8 w-8 text-[#8B7355]" strokeWidth={2} />
      </div>

      <h3 className="mt-6 font-semibold text-2xl text-[#211f1a]">{title}</h3>

      <p className="mt-4 text-[#5d574b] text-base leading-relaxed">{description}</p>
    </div>
  );
}
