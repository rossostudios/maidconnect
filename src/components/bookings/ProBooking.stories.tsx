// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { ProBookingCalendar } from "./ProBooking";

const meta = {
  title: "Bookings/ProBookingCalendar",
  component: ProBookingCalendar,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ProBookingCalendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
