// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { BackgroundCheckDashboard } from "./background-check-dashboard";

const meta = {
  title: "Admin/Background Check Dashboard",
  component: BackgroundCheckDashboard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof BackgroundCheckDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
