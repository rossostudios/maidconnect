// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { PayoutDashboard } from "./PayoutDashboard";

const meta = {
  title: "Payouts/PayoutDashboard",
  component: PayoutDashboard,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Comprehensive payout dashboard showing current period earnings, pending payouts, and payout history for professionals.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof PayoutDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  parameters: {
    mockData: {
      loading: true,
    },
  },
};
