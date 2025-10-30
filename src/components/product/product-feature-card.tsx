import type { LucideIcon } from "lucide-react";

type ProductFeatureCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export function ProductFeatureCard({
  icon: Icon,
  title,
  description,
}: ProductFeatureCardProps) {
  return (
    <div className="rounded-[28px] border border-[#ebe5d8] bg-white p-8 shadow-[0_10px_40px_rgba(18,17,15,0.04)] transition hover:shadow-[0_10px_40px_rgba(18,17,15,0.08)]">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ff5d46]/10">
        <Icon className="h-8 w-8 text-[#ff5d46]" strokeWidth={2} />
      </div>

      <h3 className="mt-6 text-2xl font-semibold text-[#211f1a]">{title}</h3>

      <p className="mt-4 text-base leading-relaxed text-[#5d574b]">
        {description}
      </p>
    </div>
  );
}
