// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { BlockedDatesCalendar } from "./BlockedDates";

const meta = {
  title: "Availability/BlockedDatesCalendar",
  component: BlockedDatesCalendar,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof BlockedDatesCalendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
