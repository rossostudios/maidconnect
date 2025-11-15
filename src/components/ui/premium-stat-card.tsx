"use client";

import { ArrowDownIcon, ArrowUpIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";
import type { HugeIcon } from "@/types/icons";

interface PremiumStatCardProps {
  icon: HugeIcon;
  label: string;
  value: number | string;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  color?: "orange" | "green" | "pink" | "blue" | "purple";
  delay?: number;
}

const colorVariants = {
  orange: {
    gradient: "from-orange-50/80 to-orange-100/40",
    icon: "text-orange-600",
    iconBg: "bg-orange-500/10",
    border: "border-orange-200/50",
    trendPositive: "text-orange-600",
    trendNegative: "text-orange-400",
  },
  green: {
    gradient: "from-emerald-50/80 to-emerald-100/40",
    icon: "text-emerald-600",
    iconBg: "bg-emerald-500/10",
    border: "border-emerald-200/50",
    trendPositive: "text-emerald-600",
    trendNegative: "text-emerald-400",
  },
  pink: {
    gradient: "from-pink-50/80 to-pink-100/40",
    icon: "text-pink-600",
    iconBg: "bg-pink-500/10",
    border: "border-pink-200/50",
    trendPositive: "text-pink-600",
    trendNegative: "text-pink-400",
  },
  blue: {
    gradient: "from-blue-50/80 to-blue-100/40",
    icon: "text-blue-600",
    iconBg: "bg-blue-500/10",
    border: "border-blue-200/50",
    trendPositive: "text-blue-600",
    trendNegative: "text-blue-400",
  },
  purple: {
    gradient: "from-purple-50/80 to-purple-100/40",
    icon: "text-purple-600",
    iconBg: "bg-purple-500/10",
    border: "border-purple-200/50",
    trendPositive: "text-purple-600",
    trendNegative: "text-purple-400",
  },
};

export function PremiumStatCard({
  icon,
  label,
  value,
  trend,
  color = "orange",
  delay = 0,
}: PremiumStatCardProps) {
  const colors = colorVariants[color];
  const isPositiveTrend = trend?.isPositive !== false;

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="group relative"
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Card Container */}
      <div className="hover:-translate-y-0.5 relative overflow-hidden rounded-2xl border border-neutral-200/60 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
        {/* Gradient Overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
        />

        {/* Content */}
        <div className="relative p-6">
          {/* Icon & Label */}
          <div className="mb-4 flex items-start justify-between">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors.iconBg} transition-transform duration-300 group-hover:scale-110`}
            >
              <HugeiconsIcon className={`h-6 w-6 ${colors.icon}`} icon={icon} />
            </div>

            {trend && (
              <motion.div
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-1"
                initial={{ opacity: 0, x: -10 }}
                transition={{ delay: delay + 0.3 }}
              >
                {isPositiveTrend ? (
                  <HugeiconsIcon className={`h-4 w-4 ${colors.trendPositive}`} icon={ArrowUpIcon} />
                ) : (
                  <HugeiconsIcon
                    className={`h-4 w-4 ${colors.trendNegative}`}
                    icon={ArrowDownIcon}
                  />
                )}
                <span
                  className={`font-semibold text-sm ${isPositiveTrend ? colors.trendPositive : colors.trendNegative}`}
                >
                  {trend.value > 0 ? "+" : ""}
                  {trend.value}%
                </span>
              </motion.div>
            )}
          </div>

          {/* Value */}
          <motion.div
            animate={{ opacity: 1 }}
            className="mb-2"
            initial={{ opacity: 0 }}
            transition={{ delay: delay + 0.2 }}
          >
            <h3 className="font-[family-name:var(--font-family-satoshi)] font-bold text-3xl text-neutral-900 tracking-tight">
              {value}
            </h3>
          </motion.div>

          {/* Label */}
          <p className="font-medium text-neutral-600 text-sm">{label}</p>

          {/* Trend Label */}
          {trend && <p className="mt-1 text-neutral-500 text-xs">{trend.label}</p>}
        </div>

        {/* Bottom Accent Line */}
        <div className={`h-1 w-full bg-gradient-to-r ${colors.gradient}`} />
      </div>
    </motion.div>
  );
}
