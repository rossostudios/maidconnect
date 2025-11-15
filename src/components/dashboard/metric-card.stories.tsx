// @ts-nocheck

import {
  ArrowUp01Icon,
  DollarSquareIcon,
  ShoppingBasket01Icon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import type { Meta, StoryObj } from "@storybook/react";
import { MetricCard } from "./metric-card";

/**
 * MetricCard - Professional Dashboard Metrics
 *
 * Redesigned with:
 * - Pure shadcn/ui patterns
 * - Motion.dev smooth animations
 * - Tailwind CSS 4.1 best practices
 * - Clean white backgrounds (NO beige!)
 * - Proper spacing and layout
 * - Less rounded corners ()
 *
 * Color Variants: blue, green, orange, pink, purple, default
 */
const meta = {
  title: "Dashboard/MetricCard",
  component: MetricCard,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof MetricCard>;

export default meta;
type Story = StoryObj<typeof MetricCard>;

// ============================================================================
// INDIVIDUAL VARIANTS
// ============================================================================

export const DefaultVariant: Story = {
  args: {
    title: "Revenue Trend",
    value: "$28,450",
    description: "Today's revenue",
    icon: DollarSquareIcon,
    variant: "default",
  },
};

export const BlueVariant: Story = {
  args: {
    title: "Product Revenue",
    value: "$8,800",
    trend: "up",
    trendValue: "+3.1%",
    icon: DollarSquareIcon,
    variant: "blue",
  },
};

export const GreenVariant: Story = {
  args: {
    title: "Total Sales",
    value: "224",
    trend: "up",
    trendValue: "+20% (84)",
    icon: ShoppingBasket01Icon,
    variant: "green",
  },
};

export const OrangeVariant: Story = {
  args: {
    title: "Pending Bookings",
    value: "12",
    description: "Awaiting acceptance",
    icon: ShoppingBasket01Icon,
    variant: "orange",
  },
};

export const PinkVariant: Story = {
  args: {
    title: "Conversion Rate",
    value: "67%",
    trend: "down",
    trendValue: "-12%",
    icon: UserMultiple02Icon,
    variant: "pink",
  },
};

export const PurpleVariant: Story = {
  args: {
    title: "Active Users",
    value: "1,234",
    trend: "up",
    trendValue: "+8%",
    icon: UserMultiple02Icon,
    variant: "purple",
  },
};

// ============================================================================
// WITH TRENDS
// ============================================================================

export const WithUpTrend: Story = {
  args: {
    title: "Total Revenue",
    value: "$28,712",
    trend: "up",
    trendValue: "+12.5%",
    icon: ArrowUp01Icon,
    variant: "green",
  },
};

export const WithDownTrend: Story = {
  args: {
    title: "Total Deals",
    value: "3,612",
    trend: "down",
    trendValue: "-15% (134)",
    icon: ArrowUp01Icon,
    variant: "pink",
  },
};

export const WithNeutralTrend: Story = {
  args: {
    title: "Average Response",
    value: "2.4h",
    trend: "neutral",
    trendValue: "0%",
    icon: DollarSquareIcon,
    variant: "default",
  },
};

// ============================================================================
// LOADING STATES
// ============================================================================

export const LoadingState: Story = {
  args: {
    title: "Loading...",
    value: "...",
    isLoading: true,
  },
};

// ============================================================================
// INTERACTIVE
// ============================================================================

export const Clickable: Story = {
  args: {
    title: "Click Me",
    value: "$1,234",
    trend: "up",
    trendValue: "+12%",
    icon: DollarSquareIcon,
    variant: "blue",
    onClick: () => alert("Card clicked! This demonstrates the hover animation."),
  },
};

// ============================================================================
// SHOWCASE: ALL COLORS
// ============================================================================

export const AllColors: Story = {
  args: {} as any,
  render: () => (
    <div className="grid grid-cols-1 gap-6 bg-gray-50 p-8 sm:grid-cols-2 lg:grid-cols-3">
      <MetricCard
        description="Default variant"
        icon={DollarSquareIcon}
        title="Default"
        value="$1,234"
        variant="default"
      />
      <MetricCard
        icon={DollarSquareIcon}
        title="Blue"
        trend="up"
        trendValue="+12%"
        value="$1,234"
        variant="blue"
      />
      <MetricCard
        icon={DollarSquareIcon}
        title="Green"
        trend="up"
        trendValue="+12%"
        value="$1,234"
        variant="green"
      />
      <MetricCard
        description="Orange variant"
        icon={DollarSquareIcon}
        title="Orange"
        value="$1,234"
        variant="orange"
      />
      <MetricCard
        icon={DollarSquareIcon}
        title="Pink"
        trend="down"
        trendValue="-5%"
        value="$1,234"
        variant="pink"
      />
      <MetricCard
        icon={DollarSquareIcon}
        title="Purple"
        trend="up"
        trendValue="+12%"
        value="$1,234"
        variant="purple"
      />
    </div>
  ),
  parameters: {
    layout: "fullscreen",
  },
};

// ============================================================================
// SHOWCASE: DASHBOARD LAYOUT
// ============================================================================

export const DashboardLayout: Story = {
  args: {} as any,
  render: () => (
    <div className="grid grid-cols-1 gap-6 bg-white p-8 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        icon={DollarSquareIcon}
        title="Product Revenue"
        trend="up"
        trendValue="+3.1%"
        value="$8,800"
        variant="blue"
      />
      <MetricCard
        icon={ShoppingBasket01Icon}
        title="Total Sales"
        trend="up"
        trendValue="+20% (84)"
        value="224"
        variant="green"
      />
      <MetricCard
        icon={ArrowUp01Icon}
        title="Total Deals"
        trend="down"
        trendValue="-15% (134)"
        value="3,612"
        variant="orange"
      />
      <MetricCard
        icon={UserMultiple02Icon}
        title="Conversion Rate"
        trend="down"
        trendValue="-12%"
        value="67%"
        variant="pink"
      />
    </div>
  ),
  parameters: {
    layout: "fullscreen",
  },
};

// ============================================================================
// SHOWCASE: MIXED STATES
// ============================================================================

export const MixedStates: Story = {
  args: {} as any,
  render: () => (
    <div className="grid grid-cols-1 gap-6 bg-gray-50 p-8 sm:grid-cols-2 lg:grid-cols-3">
      <MetricCard
        icon={DollarSquareIcon}
        title="Revenue"
        trend="up"
        trendValue="+12.5%"
        value="$28,450"
        variant="green"
      />
      <MetricCard isLoading={true} title="Loading..." value="..." />
      <MetricCard
        description="Active today"
        icon={ShoppingBasket01Icon}
        title="Bookings"
        value="42"
        variant="orange"
      />
      <MetricCard
        icon={UserMultiple02Icon}
        title="Users"
        trend="neutral"
        trendValue="0%"
        value="1,234"
        variant="default"
      />
      <MetricCard
        icon={ArrowUp01Icon}
        onClick={() => alert("Clicked!")}
        title="Clickable"
        value="Click me!"
        variant="purple"
      />
      <MetricCard
        icon={DollarSquareIcon}
        title="Conversion"
        trend="down"
        trendValue="-5%"
        value="67%"
        variant="pink"
      />
    </div>
  ),
  parameters: {
    layout: "fullscreen",
  },
};
