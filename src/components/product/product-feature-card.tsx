import type { IconSvgObject } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

type ProductFeatureCardProps = {
  icon: IconSvgObject;
  title: string;
  description: string;
};

export function ProductFeatureCard({ icon, title, description }: ProductFeatureCardProps) {
  return (
    <div className="rounded-[28px] border border-[#ebe5d8] bg-white p-8 shadow-[0_10px_40px_rgba(18,17,15,0.04)] transition hover:shadow-[0_10px_40px_rgba(18,17,15,0.08)]">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--red)]/10">
        <HugeiconsIcon className="h-8 w-8 text-[var(--red)]" icon={icon} />
      </div>

      <h3 className="mt-6 font-semibold text-2xl text-[var(--foreground)]">{title}</h3>

      <p className="mt-4 text-[var(--muted-foreground)] text-base leading-relaxed">{description}</p>
    </div>
  );
}
