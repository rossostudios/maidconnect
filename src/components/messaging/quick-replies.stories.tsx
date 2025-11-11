// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { QuickReplies } from "./quick-replies";

const meta = {
  title: "Communication/Messaging/QuickReplies",
  component: QuickReplies,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    onSelectReply: fn(),
  },
} satisfies Meta<typeof QuickReplies>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Expanded: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const button = canvasElement.querySelector("button");
    button?.click();
  },
};
