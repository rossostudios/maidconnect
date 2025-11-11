// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { BookingCard } from "./booking-card";

const meta = {
  title: "Bookings/BookingCard",
  component: BookingCard,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof BookingCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
