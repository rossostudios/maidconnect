// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { EnhancedBookingForm } from "./EnhancedBooking";

const meta = {
  title: "Bookings/EnhancedBookingForm",
  component: EnhancedBookingForm,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof EnhancedBookingForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
