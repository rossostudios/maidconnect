// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { DisputeResolutionDashboard } from "./dispute-resolution-dashboard";

const meta = {
  title: "Admin/Dispute Resolution Dashboard",
  component: DisputeResolutionDashboard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DisputeResolutionDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
