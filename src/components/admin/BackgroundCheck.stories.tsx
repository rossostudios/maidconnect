// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { CheckDashboard } from "./CheckDashboard";

const meta = {
  title: "Admin/Check Dashboard",
  component: CheckDashboard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof CheckDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
