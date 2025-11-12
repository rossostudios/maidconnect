// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { DashboardButton } from "./DashboardButton";

const meta = {
  title: "Navigation/DashboardButton",
  component: DashboardButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    href: {
      control: "text",
      description: "The destination URL for the dashboard",
    },
    label: {
      control: "text",
      description: "The button label text",
    },
  },
} satisfies Meta<typeof DashboardButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    href: "/dashboard/customer",
    label: "Dashboard",
  },
};

export const WithUnreadBadge: Story = {
  args: {
    href: "/dashboard/customer",
    label: "Dashboard",
  },
  parameters: {
    // Mock the useUnreadCount hook to show badge
    mockData: {
      unreadCount: 5,
    },
  },
};

export const CustomLabel: Story = {
  args: {
    href: "/dashboard/pro",
    label: "Pro Dashboard",
  },
};

export const LongLabel: Story = {
  args: {
    href: "/dashboard",
    label: "Professional Dashboard",
  },
};
