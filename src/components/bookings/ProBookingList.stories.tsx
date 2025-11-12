// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { ProBookingList } from "./ProBookingList";

const meta = {
  title: "Bookings/ProBookingList",
  component: ProBookingList,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ProBookingList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
