// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { KeyboardBadge } from "./keyboard-badge";

const meta = {
  title: "Keyboard-shortcuts/KeyboardBadge",
  component: KeyboardBadge,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof KeyboardBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
