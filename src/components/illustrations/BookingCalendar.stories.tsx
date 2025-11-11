// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { BookingCalendar } from "./BookingCalendar";

const meta = {
  title: "Illustrations/BookingCalendar",
  component: BookingCalendar,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof BookingCalendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
