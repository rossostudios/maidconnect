/**
 * MiniSparkline - Recharts mini sparkline for KPI trend visualization
 *
 * Features:
 * - Clean line chart (no axes, no grid)
 * - Orange stroke color (#FF5200)
 * - Smooth monotone interpolation
 * - Responsive container
 * - Fast animation (300ms)
 * - No dots (minimal design)
 */

"use client";

import { Line, LineChart, ResponsiveContainer } from "recharts";

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

  return (
    <ResponsiveContainer height={height} width="100%">
      <LineChart data={data}>
        <Line
          animationDuration={300}
          dataKey="value"
          dot={false}
          stroke={color}
          strokeWidth={2}
          type="monotone"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
