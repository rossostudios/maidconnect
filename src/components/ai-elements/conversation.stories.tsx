// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { Conversation } from "./conversation";

const meta = {
  title: "Ai-elements/Conversation",
  component: Conversation,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Conversation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
