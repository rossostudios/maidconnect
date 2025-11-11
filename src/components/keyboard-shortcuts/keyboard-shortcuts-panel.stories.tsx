// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { KeyboardShortcutsPanel } from "./keyboard-shortcuts-panel";

const meta = {
  title: "Keyboard-shortcuts/KeyboardShortcutsPanel",
  component: KeyboardShortcutsPanel,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof KeyboardShortcutsPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
