// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { RescheduleBookingModal } from "./RescheduleBooking";

const meta = {
  title: "Bookings/RescheduleBookingModal",
  component: RescheduleBookingModal,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof RescheduleBookingModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
