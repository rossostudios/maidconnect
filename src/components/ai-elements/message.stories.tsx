// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { Message } from "./message";

const meta = {
  title: "Ai-elements/Message",
  component: Message,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Message>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
