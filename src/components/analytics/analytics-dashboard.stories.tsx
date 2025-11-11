// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { AnalyticsDashboard } from "./analytics-dashboard";

const meta = {
  title: "Analytics/AnalyticsDashboard",
  component: AnalyticsDashboard,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof AnalyticsDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
