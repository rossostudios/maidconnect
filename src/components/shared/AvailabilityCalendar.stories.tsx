// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { AvailabilityCalendar } from "./AvailabilityCalendar";

const meta = {
  title: "Shared/AvailabilityCalendar",
  component: AvailabilityCalendar,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof AvailabilityCalendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
