// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { CancelBookingModal } from "./CancelBooking";

const meta = {
  title: "Bookings/CancelBookingModal",
  component: CancelBookingModal,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof CancelBookingModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
