// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { ExecutiveDashboard } from "./ExecutiveDashboard";

const meta = {
  title: "Dashboard/ExecutiveDashboard",
  component: ExecutiveDashboard,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ExecutiveDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
