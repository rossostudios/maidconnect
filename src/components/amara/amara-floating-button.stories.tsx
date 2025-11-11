// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { AmaraFloatingButton } from "./amara-floating-button";

const meta = {
  title: "Amara/AmaraFloatingButton",
  component: AmaraFloatingButton,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof AmaraFloatingButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
