// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { FeedbackButton } from "./FeedbackButton";

const meta = {
  title: "Communication/Feedback/FeedbackButton",
  component: FeedbackButton,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof FeedbackButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
