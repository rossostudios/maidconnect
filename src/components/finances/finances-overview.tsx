"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format, startOfMonth, eachMonthOfInterval, subMonths, isSameMonth, parseISO } from "date-fns";

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
};

const COLORS = ["#ff5d46", "#211f1a", "#7d7566", "#ebe5d8", "#5d574b"];

export function FinancesOverview({ bookings, payouts }: Props) {
  const t = useTranslations("dashboard.pro.financesOverview");

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalEarnings = bookings.reduce((sum, b) => sum + (b.amount_captured || 0), 0);
    const avgBookingValue = bookings.length > 0 ? totalEarnings / bookings.length : 0;

    const thisMonth = bookings.filter(b =>
      b.scheduled_start && isSameMonth(parseISO(b.scheduled_start), new Date())
    );
    const monthlyEarnings = thisMonth.reduce((sum, b) => sum + (b.amount_captured || 0), 0);

    const pendingPayouts = payouts
      .filter(p => p.status === "pending")
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

    return months.map(month => {
      const monthBookings = bookings.filter(b =>
        b.scheduled_start && isSameMonth(parseISO(b.scheduled_start), month)
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

    bookings.forEach(b => {
      const service = b.service_name || "Other";
      serviceMap.set(service, (serviceMap.get(service) || 0) + (b.amount_captured || 0));
    });

    return Array.from(serviceMap.entries())
      .map(([name, value]) => ({ name, value: value / 1000 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 services
  }, [bookings]);

  // Payout history
  const payoutHistory = useMemo(() => {
    return payouts
      .filter(p => p.status === "completed")
      .slice(0, 10)
      .map(p => ({
        date: format(parseISO(p.processed_at || p.created_at), "MMM dd"),
        amount: p.amount / 1000,
      }));
  }, [payouts]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(value * 1000);
  };

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label={t("metrics.totalEarnings.label")}
          value={formatCurrency(metrics.totalEarnings / 1000)}
          description={t("metrics.totalEarnings.description")}
        />
        <MetricCard
          label={t("metrics.thisMonth.label")}
          value={formatCurrency(metrics.monthlyEarnings / 1000)}
          description={`${bookings.filter(b => b.scheduled_start && isSameMonth(parseISO(b.scheduled_start), new Date())).length} ${t("metrics.thisMonth.label").toLowerCase()}`}
        />
        <MetricCard
          label={t("metrics.avgBookingValue.label")}
          value={formatCurrency(metrics.avgBookingValue / 1000)}
          description={`${metrics.totalBookings} ${t("metrics.avgBookingValue.description")}`}
        />
        <MetricCard
          label={t("metrics.pendingPayouts.label")}
          value={formatCurrency(metrics.pendingPayouts / 1000)}
          description={`${payouts.filter(p => p.status === "pending").length} ${t("metrics.pendingPayouts.descriptionSuffix")}`}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Earnings Over Time */}
        <div className="rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)] backdrop-blur-sm">
          <h2 className="mb-6 text-xl font-semibold text-[#211f1a]">{t("charts.earningsTrend")}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={earningsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ebe5d8" />
              <XAxis
                dataKey="month"
                stroke="#7d7566"
                style={{ fontSize: 12 }}
              />
              <YAxis
                stroke="#7d7566"
                style={{ fontSize: 12 }}
                tickFormatter={(value) => `${value}k`}
              />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #ebe5d8",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="earnings"
                stroke="#ff5d46"
                strokeWidth={3}
                dot={{ fill: "#ff5d46", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bookings Count Over Time */}
        <div className="rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)] backdrop-blur-sm">
          <h2 className="mb-6 text-xl font-semibold text-[#211f1a]">{t("charts.bookingsByMonth")}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={earningsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ebe5d8" />
              <XAxis
                dataKey="month"
                stroke="#7d7566"
                style={{ fontSize: 12 }}
              />
              <YAxis
                stroke="#7d7566"
                style={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #ebe5d8",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="bookings" fill="#ff5d46" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Service */}
        {serviceData.length > 0 && (
          <div className="rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)] backdrop-blur-sm">
            <h2 className="mb-6 text-xl font-semibold text-[#211f1a]">{t("charts.revenueByService")}</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={serviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: any) => `${props.name} (${(props.percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {serviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Payout History */}
        {payoutHistory.length > 0 && (
          <div className="rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)] backdrop-blur-sm">
            <h2 className="mb-6 text-xl font-semibold text-[#211f1a]">{t("charts.recentPayouts")}</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={payoutHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ebe5d8" />
                <XAxis
                  dataKey="date"
                  stroke="#7d7566"
                  style={{ fontSize: 12 }}
                />
                <YAxis
                  stroke="#7d7566"
                  style={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value}k`}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #ebe5d8",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="amount" fill="#211f1a" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value, description }: { label: string; value: string; description: string }) {
  return (
    <div className="rounded-[28px] bg-white p-6 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)] backdrop-blur-sm">
      <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7d7566]">{label}</dt>
      <dd className="mt-3 text-3xl font-semibold text-[#211f1a]">{value}</dd>
      <p className="mt-1 text-sm text-[#7d7566]">{description}</p>
    </div>
  );
}
