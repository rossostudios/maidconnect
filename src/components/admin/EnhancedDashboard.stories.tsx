// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { EnhancedAnalyticsDashboard } from "./EnhancedDashboard";

const meta = {
  title: "Admin/Enhanced Analytics Dashboard",
  component: EnhancedAnalyticsDashboard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof EnhancedAnalyticsDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
