import { unstable_noStore } from "next/cache";
import { EnhancedAnalyticsDashboard } from "@/components/admin/enhanced-analytics-dashboard";
import { requireUser } from "@/lib/auth";

export const metadata = {
  title: "Analytics | Admin",
  description: "Platform metrics and liquidity insights",
};

export default async function AdminAnalyticsPage() {
  unstable_noStore(); // Opt out of caching for dynamic page

  await requireUser({ allowedRoles: ["admin"] });

  return (
    <section className="space-y-8">
      <div>
        <h1 className="font-bold text-3xl text-[#171717]">Platform Analytics</h1>
        <p className="mt-2 text-[#737373]">
          Liquidity metrics, supply utilization, and conversion insights
        </p>
      </div>

      <EnhancedAnalyticsDashboard />
    </section>
  );
}
