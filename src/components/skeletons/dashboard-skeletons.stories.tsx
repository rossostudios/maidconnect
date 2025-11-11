// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { DashboardSkeletons } from "./dashboard-skeletons";

const meta = {
  title: "Skeletons/DashboardSkeletons",
  component: DashboardSkeletons,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DashboardSkeletons>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
