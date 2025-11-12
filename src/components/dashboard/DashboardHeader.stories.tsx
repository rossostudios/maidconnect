// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "../ui/Badge";
import { DashboardHeader } from "./DashboardHeader";

/**
 * MaidConnect Dashboard Header Component
 *
 * Design System: Personalized welcome header for dashboards
 * - Shows personalized greeting with user's name
 * - Displays quick stats/notifications
 * - Optional action buttons on the right
 */
const meta = {
  title: "Dashboard/DashboardHeader",
  component: DashboardHeader,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Welcome section for dashboards. Displays personalized greeting, quick stats, and optional action buttons. Perfect for admin, professional, and customer dashboards.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    userName: {
      control: "text",
      description: "User's name for personalized greeting",
    },
    greeting: {
      control: "text",
      description: "Custom greeting text (overrides default)",
    },
    stats: {
      control: "text",
      description: 'Statistics or quick info (e.g., "3 new leads, 2 follow-ups due")',
    },
  },
} satisfies Meta<typeof DashboardHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default dashboard header
 * Simple greeting without customization
 */
export const Default: Story = {
  args: {
    userName: "John",
    stats: "3 new leads, 2 follow-ups due",
  },
};

/**
 * With action buttons
 * Shows filter and download buttons on the right
 */
export const WithActions: Story = {
  args: {
    userName: "John",
    stats: "3 new leads, 2 follow-ups due",
    actions: (
      <>
        <button
          className="inline-flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-4 py-2 font-medium text-neutral-900 text-sm hover:bg-neutral-50"
          type="button"
        >
          <span>📅</span>
          <span>1 Oct - 30 Oct, 2025</span>
        </button>
        <button
          className="inline-flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-4 py-2 font-medium text-neutral-900 text-sm hover:bg-neutral-50"
          type="button"
        >
          <span>🔍</span>
          <span>Filter</span>
        </button>
        <button
          className="rounded-md bg-neutral-900 px-4 py-2 font-semibold text-sm text-white hover:bg-neutral-900/90"
          type="button"
        >
          Download
        </button>
      </>
    ),
  },
};

/**
 * Custom greeting
 * Override default greeting message
 */
export const CustomGreeting: Story = {
  args: {
    greeting: "Good Morning, Sarah!",
    stats: "8 pending bookings, 2 new messages",
  },
};

/**
 * Professional dashboard
 * Header for a professional's dashboard
 */
export const ProfessionalDashboard: Story = {
  args: {
    userName: "Maria",
    stats: "5 bookings today, 3 pending reviews",
    actions: (
      <div className="flex items-center gap-3">
        <Badge dot variant="warning">
          3 Pending
        </Badge>
        <button
          className="rounded-md bg-neutral-700 px-4 py-2 font-semibold text-sm text-white hover:bg-neutral-700/90"
          type="button"
        >
          View Schedule
        </button>
      </div>
    ),
  },
};

/**
 * Customer dashboard
 * Header for a customer's dashboard
 */
export const CustomerDashboard: Story = {
  args: {
    userName: "Carlos",
    stats: "2 upcoming bookings this week",
    actions: (
      <button
        className="rounded-md bg-neutral-700 px-4 py-2 font-semibold text-sm text-white hover:bg-neutral-700/90"
        type="button"
      >
        Book Now
      </button>
    ),
  },
};

/**
 * Admin dashboard
 * Header for an admin dashboard with multiple actions
 */
export const AdminDashboard: Story = {
  args: {
    userName: "Admin",
    stats: "12 new sign-ups, 8 pending verifications, 3 support tickets",
    actions: (
      <div className="flex items-center gap-3">
        <Badge variant="danger">3 Urgent</Badge>
        <button
          className="inline-flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-4 py-2 font-medium text-neutral-900 text-sm hover:bg-neutral-50"
          type="button"
        >
          <span>⚙️</span>
          <span>Settings</span>
        </button>
        <button
          className="rounded-md bg-neutral-700 px-4 py-2 font-semibold text-sm text-white hover:bg-neutral-700/90"
          type="button"
        >
          View All
        </button>
      </div>
    ),
  },
};

/**
 * No stats
 * Minimal header without statistics
 */
export const NoStats: Story = {
  args: {
    userName: "John",
  },
};

/**
 * No username
 * Generic greeting without personalization
 */
export const NoUsername: Story = {
  args: {
    stats: "3 new leads, 2 follow-ups due",
  },
};

/**
 * Mobile responsive example
 * Shows how header stacks on mobile devices
 */
export const MobileView: Story = {
  args: {
    userName: "John",
    stats: "3 new leads, 2 follow-ups due",
    actions: (
      <>
        <button
          className="inline-flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2 font-medium text-neutral-900 text-sm hover:bg-neutral-50"
          type="button"
        >
          <span>🔍</span>
        </button>
        <button
          className="rounded-md bg-neutral-900 px-4 py-2 font-semibold text-sm text-white hover:bg-neutral-900/90"
          type="button"
        >
          Download
        </button>
      </>
    ),
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};
