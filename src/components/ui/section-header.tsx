import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  category?: string;
  title: string;
  description?: string;
  className?: string;
};

export function SectionHeader({ category, title, description, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {category && (
        <p className="font-medium text-[10px] text-neutral-500 uppercase tracking-[0.08em]">
          {category}
        </p>
      )}
      <h2 className="font-bold text-lg text-neutral-900 tracking-tight">{title}</h2>
      {description && <p className="text-neutral-600 text-sm">{description}</p>}
    </div>
  );
}
