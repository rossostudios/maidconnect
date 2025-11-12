// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { KeyboardShortcutsButton } from "./KeyboardShortcuts";

const meta = {
  title: "Keyboard-shortcuts/KeyboardShortcutsButton",
  component: KeyboardShortcutsButton,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof KeyboardShortcutsButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
