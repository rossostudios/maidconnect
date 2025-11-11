// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { CalendarHealthDashboard } from "./calendar-health-dashboard";

const meta = {
  title: "Calendar/CalendarHealthDashboard",
  component: CalendarHealthDashboard,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof CalendarHealthDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
