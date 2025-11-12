// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { CustomerBookingList } from "./CustomerBooking";

const meta = {
  title: "Bookings/CustomerBookingList",
  component: CustomerBookingList,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof CustomerBookingList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
