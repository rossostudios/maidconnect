import { Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type CheckmarkListProps = {
  children: ReactNode;
  className?: string;
  variant?: "default" | "compact" | "large" | "savvycal";
};

type CheckmarkListItemProps = {
  children: ReactNode;
  className?: string;
  negative?: boolean;
  description?: string;
  /** SavvyCal-style: bold title text (when variant="savvycal") */
  title?: string;
};

export function CheckmarkList({ children, className, variant = "default" }: CheckmarkListProps) {
  const spacing = {
    default: "space-y-4",
    compact: "space-y-2",
    large: "space-y-6",
    savvycal: "divide-y divide-[#0f172a]/10",
  };

  return <ul className={cn(spacing[variant], className)}>{children}</ul>;
}

export function CheckmarkListItem({
  children,
  className,
  negative = false,
  description,
  title,
}: CheckmarkListItemProps) {
  // SavvyCal-style two-column layout
  if (title) {
    return (
      <li className={cn("py-8 md:py-10", className)}>
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-12">
          {/* Left: Checkmark + Title */}
          <div className="flex flex-1 items-start gap-4">
            <div
              className={cn(
                "mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                negative ? "bg-[#64748b]" : "bg-[#64748b]/100"
              )}
            >
              <HugeiconsIcon className="h-5 w-5 text-[#f8fafc]" icon={Tick02Icon} strokeWidth={3} />
            </div>
            <h3 className="serif-headline-md pt-0.5 text-[#0f172a]">{title}</h3>
          </div>

          {/* Right: Description */}
          <div className="flex-1 pl-12 md:pl-0">
            <p className="text-[#0f172a]/70 leading-relaxed">{children}</p>
          </div>
        </div>
      </li>
    );
  }

  // Default compact layout
  return (
    <li className={cn("flex items-start gap-3", className)}>
      <div
        className={cn(
          "mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full",
          negative ? "bg-[#64748b]/10" : "bg-[#64748b]/10"
        )}
      >
        <HugeiconsIcon
          className={cn("h-3.5 w-3.5", negative ? "text-[#64748b]" : "text-[#64748b]")}
          icon={Tick02Icon}
          strokeWidth={3}
        />
      </div>
      <div className="flex-1">
        <span className="text-[#0f172a] text-base leading-relaxed">{children}</span>
        {description && (
          <p className="mt-1 text-[#0f172a]/60 text-sm leading-relaxed">{description}</p>
        )}
      </div>
    </li>
  );
}
