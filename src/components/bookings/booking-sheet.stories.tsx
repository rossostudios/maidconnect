// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { BookingSheet } from "./booking-sheet";

const meta = {
  title: "Bookings/BookingSheet",
  component: BookingSheet,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof BookingSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
