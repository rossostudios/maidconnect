// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { InterviewCalendar } from "./InterviewCalendar";

const meta = {
  title: "Admin/Interview Calendar",
  component: InterviewCalendar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof InterviewCalendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
