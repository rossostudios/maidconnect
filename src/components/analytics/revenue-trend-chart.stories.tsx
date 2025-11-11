// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { RevenueTrendChart } from "./revenue-trend-chart";

const meta = {
  title: "Analytics/RevenueTrendChart",
  component: RevenueTrendChart,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof RevenueTrendChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
