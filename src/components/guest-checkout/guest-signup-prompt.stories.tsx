// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { GuestSignupPrompt } from "./guest-signup-prompt";

const meta = {
  title: "Guest-checkout/GuestSignupPrompt",
  component: GuestSignupPrompt,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof GuestSignupPrompt>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
