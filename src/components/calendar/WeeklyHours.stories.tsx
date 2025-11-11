// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { WeeklyHoursEditor } from "./WeeklyHours";

const meta = {
  title: "Calendar/WeeklyHoursEditor",
  component: WeeklyHoursEditor,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof WeeklyHoursEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
