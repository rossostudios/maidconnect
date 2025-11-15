import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";
import type { HugeIcon } from "@/types/icons";

type StatCardProps = {
  label: string;
  value: number | string;
  trend?: {
    value: number;
    label?: string;
    isPositive?: boolean;
  };
  icon?: HugeIcon;
  color?: "blue" | "green" | "orange" | "pink" | "purple";
  className?: string;
};

const colorClasses = {
  blue: {
    icon: "bg-blue-50 text-blue-600",
    trend: "text-blue-600",
  },
  green: {
    icon: "bg-green-50 text-green-600",
    trend: "text-green-600",
  },
  orange: {
    icon: "bg-orange-50 text-orange-600",
    trend: "text-orange-600",
  },
  pink: {
    icon: "bg-pink-50 text-pink-600",
    trend: "text-pink-600",
  },
  purple: {
    icon: "bg-purple-50 text-purple-600",
    trend: "text-purple-600",
  },
};

export function StatCard({ label, value, trend, icon, color = "blue", className }: StatCardProps) {
  const colors = colorClasses[color];

  return (
    <div
      className={cn(
        "rounded-lg border border-neutral-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-neutral-600 text-xs">{label}</p>
          <p className="mt-1.5 font-bold text-2xl text-neutral-900 tracking-tight sm:text-3xl">
            {typeof value === "number" ? value.toLocaleString("en-US") : value}
          </p>

          {trend && (
            <div className="mt-2 flex items-center gap-1.5">
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium text-[10px]",
                  trend.isPositive !== false
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                )}
              >
                <span>{trend.isPositive !== false ? "↑" : "↓"}</span>
                <span>{Math.abs(trend.value)}%</span>
              </span>
              {trend.label && (
                <span className="truncate text-[10px] text-neutral-500">{trend.label}</span>
              )}
            </div>
          )}
        </div>

        {icon && (
          <div
            className={cn(
              "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg",
              colors.icon
            )}
          >
            <HugeiconsIcon className="h-5 w-5" icon={icon} />
          </div>
        )}
      </div>
    </div>
  );
}
