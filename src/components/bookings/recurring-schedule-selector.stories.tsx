// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { RecurringScheduleSelector } from "./recurring-schedule-selector";

const meta = {
  title: "Bookings/RecurringScheduleSelector",
  component: RecurringScheduleSelector,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof RecurringScheduleSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
