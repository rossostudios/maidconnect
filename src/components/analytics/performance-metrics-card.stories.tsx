// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { PerformanceMetricsCard } from "./performance-metrics-card";

const meta = {
  title: "Analytics/PerformanceMetricsCard",
  component: PerformanceMetricsCard,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof PerformanceMetricsCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
