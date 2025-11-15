/**
 * Admin Analytics Service
 *
 * Generates comprehensive, AI-powered analytics reports with actionable insights
 * for admin dashboard and business intelligence.
 *
 * Features:
 * - Structured weekly/monthly reports
 * - Trend analysis and predictions
 * - Automated insights and recommendations
 * - Performance benchmarking
 * - Risk alerts
 */

import { type AdminAnalytics, adminAnalyticsSchema } from "@/lib/integrations/amara/schemas";
import { getStructuredOutput } from "@/lib/integrations/amara/structured-outputs";
import { trackAnalyticsReport } from "@/lib/integrations/amara/tracking";
import { createSupabaseServerClient } from "@/lib/integrations/supabase/serverClient";

/**
 * Generate comprehensive analytics report for a time period
 *
 * @param startDate - Report period start (YYYY-MM-DD)
 * @param endDate - Report period end (YYYY-MM-DD)
 * @returns Structured analytics report with insights
 *
 * @example
 * ```typescript
 * // Weekly report
 * const report = await generateAnalyticsReport(
 *   "2025-01-08",
 *   "2025-01-15"
 * );
 *
 * // Display insights
 * for (const insight of report.insights) {
 *   console.log(`${insight.priority}: ${insight.observation}`);
 *   console.log(`Action: ${insight.recommendation}`);
 * }
 *
 * // Check for critical alerts
 * if (report.alerts) {
 *   const critical = report.alerts.filter(a => a.severity === 'critical');
 *   await notifyAdmins(critical);
 * }
 * ```
 */
export async function generateAnalyticsReport(
  startDate: string,
  endDate: string
): Promise<AdminAnalytics> {
  const startTime = Date.now();

  try {
    // Fetch raw data from database
    const rawData = await fetchAnalyticsData(startDate, endDate);

    // Convert to natural language summary for Claude to analyze
    const dataSummary = formatDataForAnalysis(rawData);

    // Use Claude to generate structured insights
    const systemPrompt = getAnalyticsSystemPrompt();

    const result = await getStructuredOutput({
      schema: adminAnalyticsSchema,
      systemPrompt,
      userMessage: dataSummary,
      model: "claude-sonnet-4-5",
      temperature: 0.4, // Slightly higher for creative insights
      maxTokens: 8192, // Larger response for comprehensive reports
    });

    // Calculate period days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const periodDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    // Track successful report generation
    trackAnalyticsReport({
      success: true,
      periodDays,
      insightCount: result.insights.length,
      criticalInsightCount: result.insights.filter((i) => i.priority === "critical").length,
      alertCount: result.alerts?.length || 0,
      format: "json",
      processingTimeMs: Date.now() - startTime,
    });

    return result;
  } catch (error) {
    // Track report generation errors
    trackAnalyticsReport({
      success: false,
      format: "json",
      processingTimeMs: Date.now() - startTime,
      error: error instanceof Error ? error.message : "unknown",
    });
    throw error;
  }
}

/**
 * Fetch raw analytics data from database
 */
async function fetchAnalyticsData(startDate: string, endDate: string) {
  const supabase = createSupabaseServerClient();

  // Fetch bookings data
  const { data: bookings } = await supabase
    .from("bookings")
    .select("*")
    .gte("created_at", startDate)
    .lte("created_at", endDate);

  // Fetch professionals data
  const { data: professionals } = await supabase
    .from("professional_profiles")
    .select("id, full_name, total_bookings, average_rating, created_at")
    .gte("created_at", startDate)
    .lte("created_at", endDate);

  // Fetch customers data
  const { data: customers } = await supabase
    .from("users")
    .select("id, created_at")
    .eq("role", "customer")
    .gte("created_at", startDate)
    .lte("created_at", endDate);

  // Fetch reviews data
  const { data: reviews } = await supabase
    .from("reviews")
    .select("rating, professional_id, created_at")
    .gte("created_at", startDate)
    .lte("created_at", endDate);

  // Calculate metrics
  const totalBookings = bookings?.length || 0;
  const completedBookings = bookings?.filter((b) => b.status === "completed").length || 0;
  const cancelledBookings = bookings?.filter((b) => b.status === "cancelled").length || 0;
  const disputedBookings = bookings?.filter((b) => b.status === "disputed").length || 0;

  const totalRevenue =
    bookings
      ?.filter((b) => b.status === "completed")
      .reduce((sum, b) => sum + (b.total_price_cop || 0), 0) || 0;

  const averageBookingValue = completedBookings > 0 ? totalRevenue / completedBookings : 0;

  const averageRating =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  // Get top performers
  const professionalBookingCounts = new Map();
  bookings?.forEach((b) => {
    if (b.professional_id) {
      const count = professionalBookingCounts.get(b.professional_id) || 0;
      professionalBookingCounts.set(b.professional_id, count + 1);
    }
  });

  const topPerformerIds = Array.from(professionalBookingCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id);

  const { data: topPerformers } = await supabase
    .from("professional_profiles")
    .select("id, full_name, total_bookings, average_rating")
    .in("id", topPerformerIds);

  return {
    period: { startDate, endDate },
    bookings: {
      total: totalBookings,
      completed: completedBookings,
      cancelled: cancelledBookings,
      disputed: disputedBookings,
      pendingPayment: bookings?.filter((b) => b.status === "pending_payment").length || 0,
    },
    revenue: {
      totalCop: totalRevenue,
      averageBookingValueCop: averageBookingValue,
    },
    professionals: {
      active: professionals?.filter((p) => p.total_bookings > 0).length || 0,
      newSignups: professionals?.length || 0,
      averageRating,
      topPerformers: (topPerformers || []).map((p) => ({
        id: p.id,
        name: p.full_name,
        bookings: professionalBookingCounts.get(p.id) || 0,
        revenue: 0, // Calculate if needed
        rating: p.average_rating || 0,
      })),
    },
    customers: {
      newSignups: customers?.length || 0,
      active: 0, // Calculate from bookings
    },
    rawBookings: bookings || [],
    rawReviews: reviews || [],
  };
}

/**
 * Format raw data into natural language for Claude to analyze
 */
function formatDataForAnalysis(data: any): string {
  return `# Analytics Report Data

**Period:** ${data.period.startDate} to ${data.period.endDate}

## Bookings Summary
- Total Bookings: ${data.bookings.total}
- Completed: ${data.bookings.completed} (${((data.bookings.completed / data.bookings.total) * 100).toFixed(1)}%)
- Cancelled: ${data.bookings.cancelled} (${((data.bookings.cancelled / data.bookings.total) * 100).toFixed(1)}%)
- Disputed: ${data.bookings.disputed}
- Pending Payment: ${data.bookings.pendingPayment}

## Revenue
- Total Revenue: ${data.revenue.totalCop.toLocaleString()} COP
- Average Booking Value: ${data.revenue.averageBookingValueCop.toLocaleString()} COP

## Professionals
- Active Professionals: ${data.professionals.active}
- New Signups: ${data.professionals.newSignups}
- Average Rating: ${data.professionals.averageRating.toFixed(2)}/5

### Top 5 Performers:
${data.professionals.topPerformers
  .map(
    (p: any, i: number) =>
      `${i + 1}. ${p.name} - ${p.bookings} bookings, ${p.rating.toFixed(2)} rating`
  )
  .join("\n")}

## Customers
- New Customer Signups: ${data.customers.newSignups}

## Service Performance
${analyzeServiceTrends(data.rawBookings)}

## Booking Patterns
${analyzeBookingPatterns(data.rawBookings)}

## Review Analysis
${analyzeReviews(data.rawReviews)}

Based on this data, provide:
1. Key insights about business performance
2. Trends (positive and negative)
3. Actionable recommendations
4. Any alerts or concerns`;
}

function analyzeServiceTrends(bookings: any[]): string {
  if (!bookings || bookings.length === 0) return "No booking data available";

  const serviceCount = new Map<string, number>();
  bookings.forEach((b) => {
    const service = b.service_type || "unknown";
    serviceCount.set(service, (serviceCount.get(service) || 0) + 1);
  });

  const sorted = Array.from(serviceCount.entries()).sort((a, b) => b[1] - a[1]);

  return sorted.map(([service, count]) => `- ${service}: ${count} bookings`).join("\n");
}

function analyzeBookingPatterns(bookings: any[]): string {
  if (!bookings || bookings.length === 0) return "No pattern data available";

  // Analyze by day of week
  const dayCount = new Map<string, number>();
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  bookings.forEach((b) => {
    const date = new Date(b.scheduled_start || b.created_at);
    const day = days[date.getDay()];
    dayCount.set(day, (dayCount.get(day) || 0) + 1);
  });

  const sorted = Array.from(dayCount.entries()).sort((a, b) => b[1] - a[1]);

  return `Most Popular Days:\n${sorted
    .map(([day, count]) => `- ${day}: ${count} bookings`)
    .join("\n")}`;
}

function analyzeReviews(reviews: any[]): string {
  if (!reviews || reviews.length === 0) return "No review data available";

  const avgRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length;

  const distribution = [1, 2, 3, 4, 5].map((stars) => {
    const count = reviews.filter((r) => r.rating === stars).length;
    const percentage = ((count / reviews.length) * 100).toFixed(1);
    return `${stars} stars: ${count} (${percentage}%)`;
  });

  return `Average Rating: ${avgRating.toFixed(2)}/5\n\nDistribution:\n${distribution.join("\n")}`;
}

/**
 * System prompt for analytics analysis
 */
function getAnalyticsSystemPrompt(): string {
  return `You are a business intelligence analyst for Casaora, a professional household services platform.

Your job is to analyze platform data and generate actionable insights for admin decision-making.

**Your Responsibilities:**
1. Identify key trends (growth, decline, patterns)
2. Calculate important metrics accurately
3. Provide specific, actionable recommendations
4. Flag critical issues that need immediate attention
5. Compare performance against industry benchmarks

**Insight Categories:**
- revenue: Revenue trends, pricing optimization
- growth: User acquisition, retention, expansion
- quality: Service quality, professional performance
- retention: Customer and professional retention
- operations: Operational efficiency, bottlenecks
- marketing: Marketing effectiveness, channel performance
- risk: Platform risks, fraud detection, safety concerns

**Insight Priorities:**
- critical: Requires immediate action (security, major revenue drop)
- high: Urgent attention needed within 24-48 hours
- medium: Important but not time-sensitive
- low: Nice to have, long-term improvements

**Recommendation Guidelines:**
- Be specific (avoid generic advice)
- Quantify impact when possible ("expected 15% increase in...")
- Provide clear next steps
- Consider implementation difficulty
- Balance short-term wins with long-term strategy

**Trend Detection:**
- "up": Increasing trend (good for revenue, concerning for cancellations)
- "down": Decreasing trend (concerning for revenue, good for disputes)
- "stable": No significant change

**Alert Severity:**
- critical: Immediate platform risk (payment failures, security breaches)
- warning: Negative trend requiring attention (rising cancellations)
- info: Informational (seasonal pattern detected)

Be data-driven, objective, and focus on actionable insights that drive business growth and customer satisfaction.`;
}

/**
 * Export report to different formats
 */
export function exportReport(report: AdminAnalytics, format: "json" | "markdown" | "csv") {
  if (format === "json") {
    return JSON.stringify(report, null, 2);
  }

  if (format === "markdown") {
    return generateMarkdownReport(report);
  }

  // CSV format
  return generateCSVReport(report);
}

function generateMarkdownReport(report: AdminAnalytics): string {
  return `# Casaora Analytics Report

**Period:** ${report.reportPeriod.startDate} to ${report.reportPeriod.endDate}

## 📊 Key Metrics

### Bookings
- Total: ${report.metrics.bookings.total}
- Completed: ${report.metrics.bookings.completed}
- Cancelled: ${report.metrics.bookings.cancelled}
- Disputed: ${report.metrics.bookings.disputed}

### Revenue
- Total: ${report.metrics.revenue.totalCop.toLocaleString()} COP
- Average Booking: ${report.metrics.revenue.averageBookingValueCop.toLocaleString()} COP
- Growth: ${report.metrics.revenue.growthPercentage > 0 ? "+" : ""}${report.metrics.revenue.growthPercentage}%

### Professionals
- Active: ${report.metrics.professionals.active}
- New Signups: ${report.metrics.professionals.newSignups}
- Average Rating: ${report.metrics.professionals.averageRating.toFixed(2)}/5

## 🎯 Top Insights

${report.insights
  .map(
    (insight, i) => `### ${i + 1}. ${insight.category.toUpperCase()} (${insight.priority})

**Observation:** ${insight.observation}

**Recommendation:** ${insight.recommendation}

${insight.expectedImpact ? `**Expected Impact:** ${insight.expectedImpact}` : ""}
`
  )
  .join("\n")}

${
  report.alerts && report.alerts.length > 0
    ? `## 🚨 Alerts

${report.alerts.map((alert) => `- **${alert.severity.toUpperCase()}**: ${alert.message}\n  - Affected: ${alert.affectedArea}\n  - Action: ${alert.suggestedAction}`).join("\n\n")}`
    : ""
}

---
*Generated by Casaora Analytics AI*
`;
}

function generateCSVReport(report: AdminAnalytics): string {
  // Simplified CSV for metrics
  const rows = [
    ["Metric", "Value"],
    ["Period Start", report.reportPeriod.startDate],
    ["Period End", report.reportPeriod.endDate],
    ["Total Bookings", report.metrics.bookings.total],
    ["Completed Bookings", report.metrics.bookings.completed],
    ["Cancelled Bookings", report.metrics.bookings.cancelled],
    ["Total Revenue (COP)", report.metrics.revenue.totalCop],
    ["Average Booking Value (COP)", report.metrics.revenue.averageBookingValueCop],
    ["Growth %", report.metrics.revenue.growthPercentage],
    ["Active Professionals", report.metrics.professionals.active],
    ["New Professional Signups", report.metrics.professionals.newSignups],
    ["Average Professional Rating", report.metrics.professionals.averageRating],
  ];

  return rows.map((row) => row.join(",")).join("\n");
}
