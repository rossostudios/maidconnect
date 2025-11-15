#!/usr/bin/env bun
/**
 * PostHog Booking Funnel Setup Script
 * Creates the booking funnel insight in PostHog via REST API
 *
 * Usage: bun scripts/setup-posthog-funnel.ts
 */

const POSTHOG_API_KEY = "phx_E6zctH6YzEgcWu2z1vwFk9APhwp1hk33G2HiQz6pY30Q1YV";
const POSTHOG_HOST = "https://us.i.posthog.com";
const POSTHOG_PROJECT_ID = "247938"; // Retrieved from PostHog API

interface FunnelStep {
  event: string;
  name?: string;
}

interface InsightQuery {
  kind: "FunnelsQuery";
  series: Array<{
    kind: "EventsNode";
    event: string;
    name: string;
  }>;
  funnelsFilter: {
    funnelWindowInterval: number;
    funnelWindowIntervalUnit: "day" | "hour" | "week";
  };
  dateRange: {
    date_from: string;
    date_to: string | null;
  };
}

interface CreateInsightPayload {
  name: string;
  description?: string;
  query: InsightQuery;
  saved: boolean;
}

/**
 * Create a funnel insight in PostHog
 */
async function createBookingFunnel() {
  console.log("🚀 Creating Casaora Booking Funnel in PostHog...\n");

  // Define funnel steps
  const funnelSteps: FunnelStep[] = [
    { event: "$pageview", name: "Page View" },
    { event: "Booking Started", name: "Booking Started" },
    { event: "Professional Selected", name: "Professional Selected" },
    { event: "Checkout Started", name: "Checkout Started" },
    { event: "Booking Completed", name: "Booking Completed" },
  ];

  // Build funnel query
  const query: InsightQuery = {
    kind: "FunnelsQuery",
    series: funnelSteps.map((step) => ({
      kind: "EventsNode",
      event: step.event,
      name: step.name || step.event,
    })),
    funnelsFilter: {
      funnelWindowInterval: 7,
      funnelWindowIntervalUnit: "day",
    },
    dateRange: {
      date_from: "-30d",
      date_to: null,
    },
  };

  // Create insight payload
  const payload: CreateInsightPayload = {
    name: "Casaora Booking Funnel (PMF Analytics)",
    description:
      "Complete booking funnel: Page View → Booking Started → Professional Selected → Checkout Started → Booking Completed. 7-day conversion window.",
    query,
    saved: true,
  };

  try {
    const projectId = POSTHOG_PROJECT_ID;
    console.log(`✓ Using project ID: ${projectId}\n`);

    // Create the insight
    console.log("📊 Creating funnel insight...");
    console.log(`   Steps: ${funnelSteps.length}`);
    console.log("   Window: 7 days");
    console.log("   Date range: Last 30 days\n");

    const response = await fetch(`${POSTHOG_HOST}/api/projects/${projectId}/insights/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${POSTHOG_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create insight: ${response.statusText}\n${errorText}`);
    }

    const result = await response.json();

    console.log("✅ Booking funnel created successfully!\n");
    console.log("📈 Insight Details:");
    console.log(`   ID: ${result.id}`);
    console.log(`   Name: ${result.name}`);
    console.log(`   Short ID: ${result.short_id}`);
    console.log("\n🔗 View in PostHog:");
    console.log(`   https://us.posthog.com/project/${projectId}/insights/${result.short_id}`);

    console.log("\n📊 Funnel Steps:");
    funnelSteps.forEach((step, index) => {
      console.log(`   ${index + 1}. ${step.name || step.event}`);
    });

    console.log("\n🎯 Next Steps:");
    console.log("   1. Test the booking flow to generate events");
    console.log("   2. View the funnel in PostHog to see conversion rates");
    console.log("   3. Add breakdowns by service_type, location, or source");
    console.log("   4. Create alerts for drop-offs at specific steps");

    return result;
  } catch (error) {
    console.error("\n❌ Error creating funnel:");
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

/**
 * Create a dashboard and add the funnel to it
 */
async function createDashboardWithFunnel() {
  console.log("\n📊 Creating Booking Analytics Dashboard...\n");

  try {
    const projectId = POSTHOG_PROJECT_ID;

    // Create dashboard
    const dashboardPayload = {
      name: "📈 Casaora Booking Analytics",
      description: "Track booking funnel, conversion rates, and key PMF metrics",
      pinned: true,
    };

    const dashboardResponse = await fetch(`${POSTHOG_HOST}/api/projects/${projectId}/dashboards/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${POSTHOG_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dashboardPayload),
    });

    if (!dashboardResponse.ok) {
      throw new Error(`Failed to create dashboard: ${dashboardResponse.statusText}`);
    }

    const dashboard = await dashboardResponse.json();

    console.log("✅ Dashboard created successfully!");
    console.log(`   ID: ${dashboard.id}`);
    console.log(`   Name: ${dashboard.name}`);
    console.log("\n🔗 View Dashboard:");
    console.log(`   https://us.posthog.com/project/${projectId}/dashboard/${dashboard.id}`);

    return dashboard;
  } catch (error) {
    console.error("\n❌ Error creating dashboard:");
    console.error(error instanceof Error ? error.message : error);
  }
}

// Run the script
async function main() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║     PostHog Booking Funnel Setup for Casaora PMF          ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  // Create the funnel insight
  await createBookingFunnel();

  // Optionally create a dashboard
  const createDashboard = process.argv.includes("--with-dashboard");
  if (createDashboard) {
    await createDashboardWithFunnel();
  }

  console.log("\n✨ Setup complete!\n");
}

main();
