"use client";

import { eachMonthOfInterval, format, isSameMonth, parseISO, subMonths } from "date-fns";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { geistSans } from "@/app/fonts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils/core";
import type { Currency } from "@/lib/utils/format";

type Booking = {
  id: string;
  status: string;
  scheduled_start: string | null;
  amount_captured: number | null;
  amount_authorized: number | null;
  currency: string | null;
  service_name: string | null;
  created_at: string;
};

type Payout = {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  processed_at: string | null;
};

type Props = {
  bookings: Booking[];
  payouts: Payout[];
  currencyCode: Currency;
};

const COLORS = ["#57534E", "#1C1917", "#78716C", "#A8A29E", "#D6D3D1"]; // neutral-600, neutral-900, neutral-500, neutral-400, neutral-300

// Dynamically import Recharts components (150-200KB library)
const LineChartComponent = dynamic(
  () =>
    import("recharts").then((mod) => ({
      default: ({ data, formatCurrency }: any) => {
        const { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } = mod;
        return (
          <ResponsiveContainer height={300} width="100%">
            <LineChart data={data}>
              <CartesianGrid stroke="#E7E5E4" strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke="#78716C" style={{ fontSize: 12 }} />
              <YAxis
                stroke="#78716C"
                style={{ fontSize: 12 }}
                tickFormatter={(value) => `${value}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #E7E5E4",
                  borderRadius: "0px",
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Line
                activeDot={{ r: 6 }}
                dataKey="earnings"
                dot={{ fill: "#1C1917", r: 4 }}
                stroke="#1C1917"
                strokeWidth={3}
                type="monotone"
              />
            </LineChart>
          </ResponsiveContainer>
        );
      },
    })),
  {
    ssr: false,
    loading: () => <ChartSkeleton />,
  }
);

const BarChartComponent = dynamic(
  () =>
    import("recharts").then((mod) => ({
      default: ({ data, dataKey = "bookings", fill = "#78716C", formatter }: any) => {
        const { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } = mod;
        return (
          <ResponsiveContainer height={300} width="100%">
            <BarChart data={data}>
              <CartesianGrid stroke="#E7E5E4" strokeDasharray="3 3" />
              <XAxis
                dataKey={dataKey === "bookings" ? "month" : "date"}
                stroke="#A8A29E"
                style={{ fontSize: 12 }}
              />
              <YAxis
                stroke="#A8A29E"
                style={{ fontSize: 12 }}
                tickFormatter={formatter ? (value: number) => `${value}k` : undefined}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #E7E5E4",
                  borderRadius: "0px",
                }}
                formatter={formatter}
              />
              <Bar dataKey={dataKey} fill={fill} radius={[0, 0, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      },
    })),
  {
    ssr: false,
    loading: () => <ChartSkeleton />,
  }
);

const PieChartComponent = dynamic(
  () =>
    import("recharts").then((mod) => ({
      default: ({ data, formatCurrency }: any) => {
        const { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } = mod;
        return (
          <ResponsiveContainer height={300} width="100%">
            <PieChart>
              <Pie
                cx="50%"
                cy="50%"
                data={data}
                dataKey="value"
                fill="#78716C"
                label={(props: any) => `${props.name} (${(props.percent * 100).toFixed(0)}%)`}
                labelLine={false}
                outerRadius={100}
              >
                {data.map((_entry: any, index: number) => (
                  <Cell fill={COLORS[index % COLORS.length]} key={`cell-${index}`} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        );
      },
    })),
  {
    ssr: false,
    loading: () => <ChartSkeleton />,
  }
);

// Loading skeleton for charts
function ChartSkeleton() {
  return (
    <div className="h-[300px] w-full animate-pulse bg-gradient-to-br from-neutral-100 to-neutral-50" />
  );
}

export function FinancesOverview({ bookings, payouts, currencyCode }: Props) {
  const t = useTranslations("dashboard.pro.financesOverview");

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalEarnings = bookings.reduce((sum, b) => sum + (b.amount_captured || 0), 0);
    const avgBookingValue = bookings.length > 0 ? totalEarnings / bookings.length : 0;

    const thisMonth = bookings.filter(
      (b) => b.scheduled_start && isSameMonth(parseISO(b.scheduled_start), new Date())
    );
    const monthlyEarnings = thisMonth.reduce((sum, b) => sum + (b.amount_captured || 0), 0);

    const pendingPayouts = payouts
      .filter((p) => p.status === "pending")
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      totalEarnings,
      avgBookingValue,
      monthlyEarnings,
      totalBookings: bookings.length,
      pendingPayouts,
    };
  }, [bookings, payouts]);

  // Earnings over time (last 6 months)
  const earningsData = useMemo(() => {
    const months = eachMonthOfInterval({
      start: subMonths(new Date(), 5),
      end: new Date(),
    });

    return months.map((month) => {
      const monthBookings = bookings.filter(
        (b) => b.scheduled_start && isSameMonth(parseISO(b.scheduled_start), month)
      );
      const earnings = monthBookings.reduce((sum, b) => sum + (b.amount_captured || 0), 0);

      return {
        month: format(month, "MMM yyyy"),
        earnings: earnings / 1000, // Convert to thousands for readability
        bookings: monthBookings.length,
      };
    });
  }, [bookings]);

  // Revenue by service
  const serviceData = useMemo(() => {
    const serviceMap = new Map<string, number>();

    for (const b of bookings) {
      const service = b.service_name || "Other";
      serviceMap.set(service, (serviceMap.get(service) || 0) + (b.amount_captured || 0));
    }

    return Array.from(serviceMap.entries())
      .map(([name, value]) => ({ name, value: value / 1000 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 services
  }, [bookings]);

  // Payout history
  const payoutHistory = useMemo(
    () =>
      payouts
        .filter((p) => p.status === "completed")
        .slice(0, 10)
        .map((p) => ({
          date: format(parseISO(p.processed_at || p.created_at), "MMM dd"),
          amount: p.amount / 1000,
        })),
    [payouts]
  );

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(value * 1000);

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          description={t("metrics.totalEarnings.description")}
          label={t("metrics.totalEarnings.label")}
          value={formatCurrency(metrics.totalEarnings / 1000)}
        />
        <MetricCard
          description={`${bookings.filter((b) => b.scheduled_start && isSameMonth(parseISO(b.scheduled_start), new Date())).length} ${t("metrics.thisMonth.label").toLowerCase()}`}
          label={t("metrics.thisMonth.label")}
          value={formatCurrency(metrics.monthlyEarnings / 1000)}
        />
        <MetricCard
          description={`${metrics.totalBookings} ${t("metrics.avgBookingValue.description")}`}
          label={t("metrics.avgBookingValue.label")}
          value={formatCurrency(metrics.avgBookingValue / 1000)}
        />
        <MetricCard
          description={`${payouts.filter((p) => p.status === "pending").length} ${t("metrics.pendingPayouts.descriptionSuffix")}`}
          label={t("metrics.pendingPayouts.label")}
          value={formatCurrency(metrics.pendingPayouts / 1000)}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Earnings Over Time */}
        <Card className="border-neutral-200 bg-white shadow-sm">
          <CardHeader className="p-8 pb-6">
            <h2 className={cn("font-semibold text-neutral-900 text-xl", geistSans.className)}>
              {t("charts.earningsTrend")}
            </h2>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <LineChartComponent data={earningsData} formatCurrency={formatCurrency} />
          </CardContent>
        </Card>

        {/* Bookings Count Over Time */}
        <Card className="border-neutral-200 bg-white shadow-sm">
          <CardHeader className="p-8 pb-6">
            <h2 className={cn("font-semibold text-neutral-900 text-xl", geistSans.className)}>
              {t("charts.bookingsByMonth")}
            </h2>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <BarChartComponent data={earningsData} dataKey="bookings" fill="#57534E" />
          </CardContent>
        </Card>

        {/* Revenue by Service */}
        {serviceData.length > 0 && (
          <Card className="border-neutral-200 bg-white shadow-sm">
            <CardHeader className="p-8 pb-6">
              <h2 className={cn("font-semibold text-neutral-900 text-xl", geistSans.className)}>
                {t("charts.revenueByService")}
              </h2>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <PieChartComponent data={serviceData} formatCurrency={formatCurrency} />
            </CardContent>
          </Card>
        )}

        {/* Payout History */}
        {payoutHistory.length > 0 && (
          <Card className="border-neutral-200 bg-white shadow-sm">
            <CardHeader className="p-8 pb-6">
              <h2 className={cn("font-semibold text-neutral-900 text-xl", geistSans.className)}>
                {t("charts.recentPayouts")}
              </h2>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <BarChartComponent
                data={payoutHistory}
                dataKey="amount"
                fill="#1C1917"
                formatter={formatCurrency}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <Card className="border-neutral-200 bg-white shadow-sm">
      <CardContent className="p-6">
        <dt
          className={cn(
            "font-semibold text-neutral-700 text-xs uppercase tracking-wider",
            geistSans.className
          )}
        >
          {label}
        </dt>
        <dd
          className={cn(
            "mt-3 font-semibold text-3xl text-neutral-900 tracking-tighter",
            geistSans.className
          )}
        >
          {value}
        </dd>
        <p className={cn("mt-1 text-neutral-700 text-sm", geistSans.className)}>{description}</p>
      </CardContent>
    </Card>
  );
}
