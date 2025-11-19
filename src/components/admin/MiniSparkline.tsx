/**
 * MiniSparkline - Recharts mini sparkline for KPI trend visualization
 *
 * Features:
 * - Clean line chart (no axes, no grid)
 * - Anthropic orange stroke color (#D97757 / orange-500)
 * - Smooth monotone interpolation
 * - Responsive container
 * - Fast animation (300ms)
 * - No dots (minimal design)
 */

"use client";

import { Area, AreaChart, ResponsiveContainer } from "recharts";

type DataPoint = {
  day: number;
  value: number;
};

type Props = {
  data: DataPoint[];
  color?: string;
  height?: number;
};

export function MiniSparkline({ data, color = "#FF5200", height = 40 }: Props) {
  // Return empty state if no data
  if (!data || data.length === 0) {
    return <div className="h-10 w-full bg-neutral-100" />;
  }

  const id = `gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <ResponsiveContainer height={height} width="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          animationDuration={1000}
          dataKey="value"
          fill={`url(#${id})`}
          stroke={color}
          strokeWidth={2}
          type="monotone"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
