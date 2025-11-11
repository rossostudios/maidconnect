// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { AnalyticsDashboard } from "./analytics-dashboard";

const meta = {
  title: "Admin/Analytics Dashboard",
  component: AnalyticsDashboard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof AnalyticsDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
