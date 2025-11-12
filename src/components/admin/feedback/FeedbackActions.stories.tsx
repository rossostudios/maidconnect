// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { FeedbackActions } from "./FeedbackActions";

const meta = {
  title: "Admin/Feedback Actions",
  component: FeedbackActions,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof FeedbackActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
