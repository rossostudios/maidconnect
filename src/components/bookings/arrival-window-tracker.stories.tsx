// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { ArrivalWindowTracker } from "./arrival-window-tracker";

const meta = {
  title: "Bookings/ArrivalWindowTracker",
  component: ArrivalWindowTracker,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ArrivalWindowTracker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
