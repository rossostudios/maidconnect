// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { BookingList } from "./booking-list";

const meta = {
  title: "Bookings/BookingList",
  component: BookingList,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof BookingList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
