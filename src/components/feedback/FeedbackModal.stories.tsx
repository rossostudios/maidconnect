// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { FeedbackModal } from "./FeedbackModal";

const meta = {
  title: "Feedback/FeedbackModal",
  component: FeedbackModal,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof FeedbackModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
