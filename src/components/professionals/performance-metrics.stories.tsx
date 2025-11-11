// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { PerformanceMetrics } from "./performance-metrics";

const meta = {
  title: "Professionals/PerformanceMetrics",
  component: PerformanceMetrics,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof PerformanceMetrics>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
