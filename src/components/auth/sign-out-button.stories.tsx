// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { SignOutButton } from "./sign-out-button";

const meta = {
  title: "Auth/SignOutButton",
  component: SignOutButton,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof SignOutButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
