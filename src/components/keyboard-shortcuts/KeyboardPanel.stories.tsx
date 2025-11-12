// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { KeyboardPanel } from "./KeyboardPanel";

const meta = {
  title: "Keyboard/KeyboardPanel",
  component: KeyboardPanel,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof KeyboardPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    open: true,
  },
};
